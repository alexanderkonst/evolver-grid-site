/**
 * The five faces of the instrument, one slot per element (architecture §6). A face is a lens that
 * hands the player back to a place; it is never a second map.
 *
 * Shared registry, append-only: each work package fills its own slot and never edits another's.
 * A slot is empty until its component is registered, and an empty slot is not offered to the player
 * (the arc shows the body, not a door to nothing). The air slot is the Your AI content (#458); it
 * lives in `YourAiInstrument.tsx` and registers itself there.
 *
 * Later faces import their component here and set it in `FACES` (or call `registerFace`). A face
 * imports only the `FaceProps` type from this file, so there is no runtime import cycle.
 */
import type { ComponentType } from "react";
import { VILLAGE_ELEMENTS, type ElementKey } from "@/data/villagePlaces";
import EarthFace from "@/components/game/faces/EarthFace";
import FireFace from "@/components/game/faces/FireFace";

export type FaceProps = {
  /** Signed-in player id, or null for a guest. */
  ownerId: string | null;
  /** prefers-reduced-motion. */
  reduced: boolean;
  /** Duration of the open/close transition, ms. */
  closeMs: number;
  /** The face is the one turned forward and fully shown. */
  active: boolean;
  /** Back to the arc. */
  onBack: () => void;
  /** Close the whole instrument; the player is where they were. */
  onClose: () => void;
  /** Close the instrument and go to a place in the village. */
  onNavigate: (to: string) => void;
};

export type FaceSlot = {
  element: ElementKey;
  /** The face's component, or null while the slot is empty. */
  component: ComponentType<FaceProps> | null;
};

export const FACES: Record<ElementKey, FaceSlot> = Object.fromEntries(
  VILLAGE_ELEMENTS.map((e) => [e.key, { element: e.key, component: null }]),
) as Record<ElementKey, FaceSlot>;

/** Fill one slot. Registering the same component again is a no-op; a different one replaces it. */
export const registerFace = (element: ElementKey, component: ComponentType<FaceProps>): void => {
  FACES[element].component = component;
};

export const getFace = (element: ElementKey): ComponentType<FaceProps> | null => FACES[element].component;

export const hasFace = (element: ElementKey): boolean => FACES[element].component !== null;

// WP4: the fire and earth lenses fill their slots.
registerFace("fire", FireFace);
registerFace("earth", EarthFace);
