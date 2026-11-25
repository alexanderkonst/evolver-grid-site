import { useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { buildHouseSince, type SinceArtifactKind, type SinceLine } from "@/lib/houseSince";
import { loadHouseVisit, loadSinceFacts, markHouseVisit } from "@/lib/houseSinceApi";
import { houseRooms, type HouseRoomId } from "@/lib/houseRooms";
import { openPlaceKeys, type PlaceSave } from "@/lib/placeState";

/**
 * useHouseSince — «Since you were here: …» for Your House (issue #451).
 *
 * The last visit lives on the server, per player (`house_visits`), so a module finished on one
 * device is told on another. The first visit ever has no «before»: it sets the baseline and says
 * nothing. A guest, a failed read or a missing table says nothing either (no filler).
 *
 * The lines are computed once, against the marker as it was when the player arrived, and stay for
 * the whole visit. The marker moves after the block has been on screen DWELL_MS (or the page is
 * hidden), so a refresh in the first moments does not eat the news. Moving it with nothing to
 * show is immediate.
 *
 * Does not touch the village's own reveal (`useVillageChanges`): that is a separate memory.
 */

export const DWELL_MS = 4000;

/** Which House room holds each artifact; its button («again») is where the line taps through to. */
const ARTIFACT_ROOM: Record<SinceArtifactKind, HouseRoomId> = {
  talent: "talent",
  mission: "mission",
  uniqueness: "offer",
  stall: "offer",
};

/** The Quest Board feed (`VillageFeed`), where the doer reads who tapped «I see you». */
const SEEN_TO = "/game/journey";

export function useHouseSince(
  userId: string | null,
  profileId: string | null,
  save: PlaceSave,
  t: TFunction,
): SinceLine[] {
  const [lines, setLines] = useState<SinceLine[]>([]);
  // The latest save and translator, read inside the one-shot effect without re-running it.
  const latest = useRef({ save, t });
  latest.current = { save, t };

  useEffect(() => {
    if (!userId) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let marked = false;
    const open = openPlaceKeys(VILLAGE_PLACES, latest.current.save);

    const mark = () => {
      if (marked) return;
      marked = true;
      void markHouseVisit(open);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") mark();
    };

    (async () => {
      const visit = await loadHouseVisit(userId);
      if (!live || visit.status === "error") return;
      if (visit.status === "none") {
        mark();
        return;
      }

      const facts = await loadSinceFacts(userId, profileId, visit.lastVisitAt);
      if (!live) return;
      const seen = new Set(visit.seenOpen);
      const rooms = houseRooms(latest.current.save);
      const artifacts = facts.artifacts.flatMap((kind) => {
        const to = rooms.find((r) => r.id === ARTIFACT_ROOM[kind])?.to?.again;
        return to ? [{ kind, to }] : [];
      });
      const built = buildHouseSince(
        {
          freshPlaces: VILLAGE_PLACES.filter((p) => open.includes(p.key) && !seen.has(p.key)),
          artifacts,
          seers: facts.seers,
          circle: facts.circle,
          seenTo: SEEN_TO,
        },
        latest.current.t,
      );

      if (built.length === 0) {
        mark();
        return;
      }
      setLines(built);
      timer = setTimeout(mark, DWELL_MS);
      document.addEventListener("visibilitychange", onHide);
    })().catch(() => {});

    return () => {
      live = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [userId, profileId]);

  return lines;
}
