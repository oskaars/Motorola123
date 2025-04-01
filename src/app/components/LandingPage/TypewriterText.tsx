"use client";
import React, { useState, useEffect } from "react";

const TEXTS = [
  "Immersive chess experience",
  "Customizable board themes",
  "Play anywhere, anytime",
  "Elegant, intuitive interface",
];

const TypewriterText = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timeout = setTimeout(
      () => {
        const currentString = TEXTS[textIndex];

        if (!isDeleting) {
          setCurrentText(currentString.substring(0, currentText.length + 1));
          if (currentText === currentString) {
            // Pause at full text before deleting
            setIsPaused(true);
            setTimeout(() => {
              setIsDeleting(true);
              setIsPaused(false);
            }, 1000);
          }
        } else {
          setCurrentText(currentString.substring(0, currentText.length - 1));
          if (currentText === "") {
            // Pause after deleting before next phrase
            setIsPaused(true);
            setTimeout(() => {
              setIsDeleting(false);
              setTextIndex((prev) => (prev + 1) % TEXTS.length);
              setIsPaused(false);
            }, 1000);
          }
        }
      },
      isDeleting ? 100 : 150
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, textIndex, isPaused]);

  return (
    <p className="text-[2vh] text-gray-300/90 font-light tracking-[0.2vw] transform transition-all duration-500 hover:scale-105">
      {currentText}
      <span className="ml-[0.5vw] border-r-[0.2vh] border-gray-300/90 animate-pulse"></span>
    </p>
  );
};

export default TypewriterText;
