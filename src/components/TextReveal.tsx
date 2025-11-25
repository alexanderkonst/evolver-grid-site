import { useEffect, useRef, useState } from "react";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

const TextReveal = ({ text, className = "", delay = 0, speed = 50 }: TextRevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      let currentIndex = 0;
      const words = text.split(" ");
      
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          if (currentIndex < words.length) {
            setDisplayedText(words.slice(0, currentIndex + 1).join(" "));
            currentIndex++;
          } else {
            clearInterval(interval);
          }
        }, speed);
        
        return () => clearInterval(interval);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, text, delay, speed]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {isVisible && displayedText !== text && (
        <span className="inline-block w-1 h-5 bg-accent ml-1 animate-pulse" />
      )}
    </span>
  );
};

export default TextReveal;
