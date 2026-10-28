/**
 * ActivateYourDormantPotential — free mini-course in the GROW space.
 * Route: /grow/activate-your-dormant-potential (public, no auth).
 * Content: src/data/courses/activateYourDormantPotential.ts; player: CoursePage.
 */
import CoursePage from "@/pages/CoursePage";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";

const ActivateYourDormantPotential = () => <CoursePage course={ACTIVATE_YOUR_DORMANT_POTENTIAL} />;

export default ActivateYourDormantPotential;
