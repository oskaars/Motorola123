"use client";
import React from "react";

const CustomFooter = () => {
  return (
    <footer className="w-full bg-gray-800 relative overflow-hidden mt-auto">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 w-full h-[0.4vh] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-shift" />

      <div className="bg-black/40 w-full py-[5vh] px-[4vw] relative z-[50]">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-[2vh] md:space-y-0 w-full">
          {/* Copyright text with gradient animation */}
          <div className="group relative">
            <span className="relative z-[50] text-[2vh] font-light bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-shift">
              Copyrights 2025 ©<a 
                href="https://github.com/oskaars/Motorola123" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium hover:text-white-400 transition-colors duration-300"
              > The Gambit+ Project </a>
            </span>
            <div className="absolute left-0 w-0 group-hover:w-full h-[0.2vh] bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300" />
          </div>
          {/* Contest text with hover effect */}
          <p className="relative z-[50] text-[1.5vh] font-light text-gray-300 text-center hover:text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300 cursor-default">
            Project made for Motorola Science Cup 2025
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </footer>
  );
};

export default CustomFooter;
