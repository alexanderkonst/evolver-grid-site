/**
 * ConsciousnessMeetsScience — free mini-course in the GROW space.
 * Route: /grow/consciousness-meets-science (public, no auth).
 * Content: src/data/courses/consciousnessMeetsScience.ts; player: CoursePage.
 */
import CoursePage from "@/pages/CoursePage";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";

const ConsciousnessMeetsScience = () => <CoursePage course={CONSCIOUSNESS_MEETS_SCIENCE} />;

export default ConsciousnessMeetsScience;
