import { useEffect, useRef, useState } from "react";

interface CircleElement extends HTMLDivElement {
  x: number;
  y: number;
}

const CursorTrail = () => {
  const [isMobile, setIsMobile] = useState(false);
  const circleRefs = useRef<(CircleElement | null)[]>([]);
  const coords = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(0);
  const firstMoveTime = useRef<number | null>(null);
  const currentOpacity = useRef(0);
  const currentScale = useRef(0.5);
  const colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];
  const circleCount = 20;

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        "ontouchstart" in window ||
<<<<<<< HEAD
        navigator.maxTouchPoints > 0 ||
=======
>>>>>>> 2b5bc01 (/components/Globals fully fixed)
        navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    if (isMobile) return;

<<<<<<< HEAD
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
=======
    const handleMouseMove = (e: MouseEvent) => {
>>>>>>> 2b5bc01 (/components/Globals fully fixed)
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
        (circle as CircleElement).x = 0;
        (circle as CircleElement).y = 0;
      }
    });

    const animateCircles = () => {
      if (isMobile) return;

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
        (circle as CircleElement).style.left = `${x - 16}px`;
        (circle as CircleElement).style.top = `${y - 16}px`;
        const baseScale =
          (circleRefs.current.length - index) / circleRefs.current.length;
<<<<<<< HEAD
        circle.style.transform = `scale(${baseScale * currentScale.current})`;
        circle.style.opacity = currentOpacity.current.toString();
        circle.x = x;
        circle.y = y;
=======
        (circle as CircleElement).style.transform = `scale(${baseScale * currentScale.current})`;
        (circle as CircleElement).style.opacity = String(currentOpacity.current);
        (circle as CircleElement).x = x;
        (circle as CircleElement).y = y;
>>>>>>> 2b5bc01 (/components/Globals fully fixed)

        const nextCircle =
          circleRefs.current[index + 1] || circleRefs.current[0];
        if (nextCircle) {
          x += ((nextCircle as CircleElement).x - x) * 0.3;
          y += ((nextCircle as CircleElement).y - y) * 0.3;
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

  if (isMobile) return null;

  return (
    <>
      {Array.from({ length: circleCount }).map((_, i) => (
        <div
          key={i}
<<<<<<< HEAD
          ref={(el) => { circleRefs.current[i] = el as CircleElement }}
=======
          ref={(el) => {
            circleRefs.current[i] = el as CircleElement;
          }}
>>>>>>> 2b5bc01 (/components/Globals fully fixed)
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
