import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateCursorType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") !== null ||
        target.closest("button") !== null
      );
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateCursorType);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateCursorType);
    };
  }, []);

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-150"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`,
        }}
      >
        <div className="w-4 h-4 rounded-full bg-accent/60" />
      </div>

      {/* Trailing glow */}
      <div
        className="fixed pointer-events-none z-[9998] transition-all duration-500 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isPointer ? 2 : 1})`,
        }}
      >
        <div className="w-12 h-12 rounded-full bg-accent/20 blur-xl" />
      </div>
    </>
  );
};

export default CustomCursor;
