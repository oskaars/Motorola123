"use client";
import React from "react";
import TypewriterText from "./TypewriterText";
import { useRouter } from "next/navigation";

const LandingPageButtons = () => {
  const router = useRouter();

  return (
    <div
      id="play"
      className="flex flex-col items-center justify-center h-screen w-full gap-[3vh] relative z-[11] mt-[-10vh]"
    >
      <div className="text-center space-y-[2vh]">
        <h1
          className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-pink-600 animate-gradient-shift leading-tight"
          style={{
            fontSize: "8vh",
            animation: "floatAnimation 6s ease-in-out infinite",
          }}
        >
          Gambit.pl
        </h1>
        <TypewriterText />
      </div>

      <div className="flex flex-col gap-[2vh] mt-[2vh]">
        <button
          onClick={() => router.push("/play")}
          className="group relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-[7vh] w-[70vw] lg:w-[20vw]"
          style={{
            padding: "2vh 4vw",
            borderRadius: "50vh",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center items-center ">
            <span
              className="relative font-semibold text-white"
              style={{ fontSize: "2.5vh" }}
            >
              PLAY NOW
            </span>
          </div>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 z-[99] transition-opacity duration-300 flex justify-center items-center">
            <span
              className="relative font-semibold text-pink-600"
              style={{ fontSize: "2.5vh" }}
            >
              PLAY NOW
            </span>
          </div>
        </button>

        <button
          onClick={() => router.push("/documentation")}
          className="rounded-full bg-gray-800/20 backdrop-blur-sm border-[0.2vh] border-gray-700/50 transition-all duration-300 hover:bg-gray-800/60 text-white py-[1.5vh] w-[70vw] lg:w-[20vw]"
          style={{
            fontSize: "2vh",
            borderRadius: "50vh",
          }}
        >
          Read documentation
        </button>
      </div>

      <style jsx>{`
        @keyframes floatAnimation {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

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
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPageButtons;
