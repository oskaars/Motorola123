"use client";
import React, { useState, useEffect } from "react";

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // Check if scroll position is less than 1vh (1% of viewport height)
    setIsVisible(scrollTop < window.innerHeight * 0.01);
  };

  const scrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: "smooth",
    });
    setIsVisible(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[39] transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ bottom: "5vh" }}
    >
      <div
        onClick={scrollDown}
        className="flex flex-col items-center group cursor-pointer hover:opacity-80 transition-opacity"
        role="button"
        aria-label="Scroll down"
      >
        <span
          className="text-gray-300/80 tracking-[0.3em] transition-all group-hover:tracking-[0.4em] mb-[1.5vh]"
          style={{ fontSize: "1.5vh" }}
        >
          SCROLL DOWN
        </span>
        <svg
          className="text-gray-300/80 animate-bounce cursor-pointer"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "3vh", height: "3vh" }}
        >
          <path d="M12 5L12 19" className="opacity-0" />
          <path
            d="M8 13L12 17L16 13"
            className="transition-all group-hover:translate-y-[0.5vh]"
          />
        </svg>
      </div>
    </div>
  );
};

export default ScrollIndicator;
