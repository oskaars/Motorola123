"use client";

import React from "react";

const GradientBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden z-[-1]">
      {/* SVG filter for the gooey effect */}
      <svg className="hidden">
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="60" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 100 -40"
          />
        </filter>
      </svg>

      {/* Gradient container */}
      <div className="absolute inset-0">
        {/* Dark background */}
        <div className="absolute inset-0" />

        <div
          className="absolute inset-0 opacity-90"
          style={{
            filter: "url(#goo) blur(60px)",
            background: "linear-gradient(40deg, #1e0033, #0a011a)",
          }}
        >
          {/* Gradient 1 - Vertical Movement */}
          <div
            className="absolute h-[150%] w-[150%] rounded-full mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgba(167, 139, 250, 0.4) 0, rgba(167, 139, 250, 0) 70%)",
              top: "10%",
              left: "10%",
              animation: "moveVertical 28s ease infinite alternate",
            }}
          />

          {/* Gradient 2 - Circle Movement Reverse */}
          <div
            className="absolute h-[80%] w-[80%] rounded-full mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgba(192, 132, 252, 0.5) 0, rgba(192, 132, 252, 0) 70%)",
              top: "30%",
              left: "30%",
              transformOrigin: "calc(50% - 600px)",
              animation:
                "moveCircleReverse 32s ease-in-out infinite alternate-reverse",
            }}
          />

          {/* Gradient 3 - Circle Movement */}
          <div
            className="absolute h-[70%] w-[70%] rounded-full mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgba(216, 180, 254, 0.4) 0, rgba(216, 180, 254, 0) 70%)",
              top: "calc(50% - 20% + 300px)",
              left: "calc(50% - 20% - 700px)",
              transformOrigin: "calc(50% + 500px)",
              animation: "moveCircle 38s linear infinite alternate",
            }}
          />

          {/* Gradient 4 - Horizontal Movement */}
          <div
            className="absolute h-[100%] w-[100%] rounded-full mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgba(147, 51, 234, 0.5) 0, rgba(147, 51, 234, 0) 70%)",
              top: "-30%",
              left: "-30%",
              animation: "moveHorizontal 45s ease infinite alternate-reverse",
            }}
          />

          {/* Additional Gradient 5 - Diagonal Movement */}
          <div
            className="absolute h-[60%] w-[60%] rounded-full mix-blend-hard-light"
            style={{
              background:
                "radial-gradient(circle at center, rgba(139, 92, 246, 0.6) 0, rgba(139, 92, 246, 0) 70%)",
              top: "40%",
              left: "60%",
              animation: "moveDiagonal 33s ease-in infinite alternate",
            }}
          />
        </div>
      </div>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes moveCircle {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes moveCircleReverse {
          0% {
            transform: rotate(0deg) scale(1.1);
          }
          50% {
            transform: rotate(-180deg) scale(0.9);
          }
          100% {
            transform: rotate(-360deg) scale(1.1);
          }
        }

        @keyframes moveVertical {
          0% {
            transform: translateY(-30%) scale(1);
          }
          50% {
            transform: translateY(30%) scale(1.3);
          }
          100% {
            transform: translateY(-30%) scale(1);
          }
        }

        @keyframes moveHorizontal {
          0% {
            transform: translateX(-40%) translateY(-20%) scale(1);
          }
          50% {
            transform: translateX(40%) translateY(20%) scale(1.2);
          }
          100% {
            transform: translateX(-40%) translateY(-20%) scale(1);
          }
        }

        @keyframes moveDiagonal {
          0% {
            transform: translateX(-30%) translateY(-30%) scale(1);
          }
          33% {
            transform: translateX(30%) translateY(0%) scale(1.1);
          }
          66% {
            transform: translateX(0%) translateY(30%) scale(0.9);
          }
          100% {
            transform: translateX(-30%) translateY(-30%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default GradientBackground;
