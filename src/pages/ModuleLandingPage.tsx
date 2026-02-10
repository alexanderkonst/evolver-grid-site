import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { getModuleBySlug } from "@/data/modules";
import { getModuleLandingData } from "@/data/moduleLandings";
import ModuleLandingTemplate from "@/components/ModuleLandingTemplate";
import ModuleDetail from "@/pages/ModuleDetail";

/**
 * Route handler for /modules/:slug
 * If the module has landing data → render ModuleLandingTemplate
 * Otherwise → fall back to existing ModuleDetail page
 */
const ModuleLandingPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const module = getModuleBySlug(slug || "");
    const landingData = getModuleLandingData(slug || "");

    useEffect(() => {
        if (module) {
            document.title = `${module.title} — Evolver`;
        }
    }, [module]);

    // If we have marketing landing data, use the premium template
    if (landingData && module) {
        return (
            <ModuleLandingTemplate
                data={landingData}
                moduleTitle={module.title}
                moduleSpace={module.space}
            />
        );
    }

    // Fall back to the existing generic module detail page
    return <ModuleDetail />;
};

export default ModuleLandingPage;
