"use client";
import React, { useState, useEffect } from "react";
import TypewriterText from "./TypewriterText";

const LandingPageButtons = () => {
  const [step, setStep] = useState<number>(1);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (window.location.hash === "#play") {
      setStep(2);
    }
  }, []);

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <button
              onClick={() => setStep(2)}
              className="group relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-[6vh]  w-[70vw] lg:w-[20vw]"
              style={{
                padding: "2vh 4vw",
                borderRadius: "50vh",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center items-center">
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
              className="rounded-full bg-gray-800/20 backdrop-blur-sm border-[0.2vh] border-gray-700/50 transition-all duration-300 hover:bg-gray-800/60 text-white py-2 w-[70vw] lg:w-[20vw]"
              style={{
                fontSize: "2vh",
                borderRadius: "50vh",
              }}
            >
              Read documentation
            </button>
          </>
        );

      case 2:
        return (
          <div className="flex flex-col gap-[3vh] w-[70vw] lg:w-[25vw]">
            <div
              className="p-[1vh] rounded-2xl border-2 border-purple-500/30 hover:border-pink-500 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => setStep(3)}
            >
              <div className="p-[2vh] text-center">
                <h3 className="text-[3vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Create Room
                </h3>
                <p className="text-gray-300 mt-[1vh] text-[1.5vh]">
                  Start a new game session
                </p>
              </div>
            </div>

            <div
              className="p-[1vh] rounded-2xl border-2 border-purple-500/30 hover:border-pink-500 bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => setStep(4)}
            >
              <div className="p-[2vh] text-center">
                <h3 className="text-[3vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Join Room
                </h3>
                <p className="text-gray-300 mt-[1vh] text-[1.5vh]">
                  Enter existing room ID
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-[2vh] text-gray-300 hover:text-white text-[1.8vh] transition-all"
            >
              ← Back to Main
            </button>
          </div>
        );

      case 3:
      case 4:
        return (
          <div className="flex flex-col gap-[2vh] w-[70vw] lg:w-[25vw]">
            {step === 3 && (
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 lg:py-2 py-[3vh] text-[2.5vh] bg-gray-900/50 backdrop-blur-sm rounded-full border-2 border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all text-center"
              />
            )}
            {step === 4 && (
              <input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="px-4 lg:py-2 py-[3vh] text-[2.5vh]  bg-gray-900/50 backdrop-blur-sm rounded-full border-2 border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-all text-center"
              />
            )}

            <button className="py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full transition-all text-white font-semibold text-[2.2vh]">
              {step === 3 ? "Create Room" : "Join Room"}
            </button>

            <button
              onClick={() => setStep(2)}
              className="text-gray-300 hover:text-white text-[1.8vh] transition-all"
            >
              ← Back to LAN Options
            </button>
          </div>
        );

      default:
        return null;
    }
  };

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
        {step === 1 && <TypewriterText />}
      </div>

      <div className="flex flex-col gap-[2vh] mt-[2vh]">{renderContent()}</div>

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
      `}</style>
    </div>
  );
};

export default LandingPageButtons;
