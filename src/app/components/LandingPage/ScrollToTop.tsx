"use client";
import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.pageYOffset > window.innerHeight);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div
      className="fixed z-[9999] transition-opacity duration-500 hidden lg:block"
      style={{
        right: "5vw",
        top: "50%",
        transform: "translateY(-50%)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <button
        onClick={scrollToTop}
        className="rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/70 hover:scale-110 flex items-center text-white"
        style={{
          padding: "1vh",
          gap: "1vw",
          paddingLeft: "1vw",
          paddingRight: "1vw",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: "2.5vh",
            height: "2.5vh",
            color: "rgba(209, 213, 219, 0.9)",
          }}
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>

        <p style={{ fontSize: "1.8vh" }}>Scroll to top</p>
      </button>
    </div>
  );
};

export default ScrollToTop;
