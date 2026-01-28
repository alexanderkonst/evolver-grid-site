import { useEffect, useState, type ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

/**
 * Wrapper component that applies enter animation to page content
 * Use this to wrap the main content of pages for smooth transitions
 */
export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Small delay to ensure the animation triggers after mount
        const timer = requestAnimationFrame(() => {
            setIsVisible(true);
        });
        return () => cancelAnimationFrame(timer);
    }, []);

    return (
        <div
            className={`page-transition-enter ${className}`}
            style={{
                animationPlayState: isVisible ? "running" : "paused",
            }}
        >
            {children}
        </div>
    );
};

export default PageTransition;
