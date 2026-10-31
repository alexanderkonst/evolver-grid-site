/**
 * CourseSales — route /academy/:slug (public). Looks the course up in
 * src/data/courseSales.ts and renders the shared CourseSalesPage template;
 * an unknown slug goes back to the Academy.
 */
import { Navigate, useParams } from "react-router-dom";
import CourseSalesPage from "@/components/CourseSalesPage";
import { getCourseSales } from "@/data/courseSales";

const CourseSales = () => {
    const { slug } = useParams<{ slug: string }>();
    const course = getCourseSales(slug);
    if (!course) return <Navigate to="/game/learn" replace />;
    return <CourseSalesPage course={course} />;
};

export default CourseSales;
