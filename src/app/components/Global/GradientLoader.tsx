import { useState, useEffect } from "react";
import GradientBackground from "./Global/GradientBackground";

const GradientLoader = () => {
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(false);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isMounted ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-black/60 bg-[length:400%_400%]" />
      <GradientBackground />

      {/* Spinner element */}
      <div className="relative z-10">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-white border-r-white" />
      </div>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GradientLoader;
