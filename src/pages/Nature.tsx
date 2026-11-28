/**
 * Nature: free mini-training in the GROW space.
 * Route: /grow/nature (public, no auth).
 * Content: src/data/courses/nature.ts; player: CoursePage.
 */
import CoursePage from "@/pages/CoursePage";
import { NATURE } from "@/data/courses/nature";

const Nature = () => <CoursePage course={NATURE} />;

export default Nature;
