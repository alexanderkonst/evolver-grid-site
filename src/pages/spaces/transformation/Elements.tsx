import { Link } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import ElementsExplorer from "@/components/game/elements/ElementsExplorer";

/**
 * Elements — /game/learn/elements (C1, docs/02-strategy/game_launch_spec.md).
 *
 * The five elements as a playable 3D model: Body = cube = Earth, Emotions = icosahedron =
 * Water, Mind = octahedron = Air, Spirit = tetrahedron = Fire; Uniqueness = dodecahedron =
 * Aether in the center, the four orbiting it (docs/02-strategy/game_of_being_you.md §2, §11).
 *
 * Public, like /game/learn: no auth. The paths it links to are the existing
 * /game/learn/path/:pathId pages.
 */
const Elements = () => (
  <GameShellV2>
    <div className="p-4 pb-24 sm:p-6 lg:p-10 lg:pb-12 max-w-3xl mx-auto">
      <div className="text-center mb-5">
        <Link
          to="/game/learn"
          className="text-sm italic underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted, rgba(26, 30, 58, 0.78))" }}
        >
          ← Academy
        </Link>
        <h1
          className="text-4xl sm:text-5xl font-semibold mt-2 mb-2 tracking-tight leading-[1.05]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary, #0a1628)" }}
        >
          The five elements
        </h1>
        <p className="text-base italic" style={{ color: "var(--text-muted, rgba(26, 30, 58, 0.78))" }}>
          Drag to turn the model. Tap a solid to open it.
        </p>
      </div>
      <ErrorBoundary>
        <ElementsExplorer />
      </ErrorBoundary>
    </div>
  </GameShellV2>
);

export default Elements;
