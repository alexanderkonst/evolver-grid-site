import GameShellV2 from "@/components/game/GameShellV2";
import CourseStore from "@/components/game/CourseStore";
import ErrorBoundary from "@/components/ErrorBoundary";

/**
 * CourseStorePage — route /game/learn/courses (public, like /game/learn). The Learn space's
 * educational app store in panel 3; panel 2 lists the same courses. Issue #524.
 */
const CourseStorePage = () => (
    <GameShellV2>
        <ErrorBoundary>
            <CourseStore />
        </ErrorBoundary>
    </GameShellV2>
);

export default CourseStorePage;
