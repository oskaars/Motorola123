import { useEffect, useRef, useState } from "react";

const CursorTrail = () => {
  const [isMobile, setIsMobile] = useState(false);
  const circleRefs = useRef([]);
  const coords = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);
  const firstMoveTime = useRef(null);
  const currentOpacity = useRef(0);
  const currentScale = useRef(0.5);
  const colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];
  const circleCount = 20;

  useEffect(() => {
    // Check if mobile device
    const checkIfMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      setIsMobile(isMobileDevice);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    if (isMobile) return; // Don't set up cursor trail if mobile

    const handleMouseMove = (e) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
      lastMoveTime.current = Date.now();
      if (currentOpacity.current === 0 && !firstMoveTime.current) {
        firstMoveTime.current = Date.now();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    circleRefs.current.forEach((circle) => {
      if (circle) {
        circle.x = 0;
        circle.y = 0;
      }
    });

    const animateCircles = () => {
      if (isMobile) return; // Stop animation if mobile

      const now = Date.now();
      const elapsedSinceLastMove =
        lastMoveTime.current > 0 ? now - lastMoveTime.current : Infinity;
      let targetOpacity = 0;

      if (elapsedSinceLastMove < 100) {
        if (firstMoveTime.current) {
          const fadeInElapsed = now - firstMoveTime.current;
          const effectiveElapsed = Math.max(fadeInElapsed - 300, 0);
          targetOpacity = Math.min(effectiveElapsed / 500, 1);
        } else {
          targetOpacity = 1;
        }
      } else {
        targetOpacity = Math.max(0, 1 - (elapsedSinceLastMove - 500) / 1000);
        if (targetOpacity === 0) {
          firstMoveTime.current = null;
        }
      }

      currentOpacity.current += (targetOpacity - currentOpacity.current) * 0.1;
      const targetScale = 0.5 + 0.5 * targetOpacity;
      currentScale.current += (targetScale - currentScale.current) * 0.1;

      let x = coords.current.x;
      let y = coords.current.y;

      circleRefs.current.forEach((circle, index) => {
        if (!circle) return;
        circle.style.left = `${x - 16}px`;
        circle.style.top = `${y - 16}px`;
        const baseScale =
          (circleRefs.current.length - index) / circleRefs.current.length;
        circle.style.transform = `scale(${baseScale * currentScale.current})`;
        circle.style.opacity = currentOpacity.current;
        circle.x = x;
        circle.y = y;

        const nextCircle =
          circleRefs.current[index + 1] || circleRefs.current[0];
        if (nextCircle) {
          x += (nextCircle.x - x) * 0.3;
          y += (nextCircle.y - y) * 0.3;
        }
      });

      requestAnimationFrame(animateCircles);
    };

    animateCircles();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [isMobile]);

  if (isMobile) return null; // Don't render anything on mobile

  return (
    <>
      {Array.from({ length: circleCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (circleRefs.current[i] = el)}
          className={`fixed pointer-events-none h-8 w-8 rounded-full hidden lg:block ${
            i === 0 ? "z-[10]" : "z-[10]"
          }`}
          style={{
            background: `radial-gradient(circle at center, 
              ${colors[i % colors.length]} 0%, 
              ${colors[(i + 1) % colors.length]}80 30%, 
              ${colors[(i + 2) % colors.length]}40 70%, 
              transparent 100%)`,
            opacity: 0,
            transform: "translateZ(0)",
            filter: "blur(12px)",
            mixBlendMode: "screen",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </>
  );
};

export default CursorTrail;
