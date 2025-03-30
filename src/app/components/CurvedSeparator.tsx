"use client";
import React from "react";
import Marquee from "react-fast-marquee";

const CurvedSeparator = () => {
  const logos = [
    {
      name: "CSS3",
      file: "CSS3_logo_and_wordmark.svg",
      url: "https://www.w3.org/Style/CSS/",
      color: "#264de4",
    },
    {
      name: "HTML5",
      file: "HTML5_logo_and_wordmark.svg",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/HTML5",
      color: "#e34c26",
    },
    {
      name: "Next.js",
      file: "nextjs-icon-svgrepo-com.svg",
      url: "https://nextjs.org/",
      color: "#ffffff",
    },
    {
      name: "React",
      file: "React-icon.svg",
      url: "https://react.dev/",
      color: "#61dafb",
    },
  ];

  return (
    <div className="relative w-full flex flex-col items-center ">
      {/* Top curved separator */}
      <div className="w-full z-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "10vh" }}
        >
          <path
            d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
            fill="#141414"
          />
        </svg>
      </div>

      {/* Content section */}
      <div
        className="w-full bg-[#141414] flex flex-col items-center justify-center z-50"
        style={{ height: "30vh", padding: "5vh 0" }}
      >
        <p
          className="font-bold text-transparent bg-clip-text text-white  leading-tight    scale-0 intersect-once intersect:scale-100 intersect:opacity-100  transition-all duration-1000 ease-[cubic-bezier(0.68,0.6,0.32,1.6)]  "
          style={{ fontSize: "3vh", marginBottom: "5vh" }}
        >
          Tools we used:
        </p>

        <div className="relative mx-auto overflow-hidden py-[2vh] w-[90vw] md:w-[60vw]  ">
          <div
            className="absolute inset-y-0 left-0 z-[9]"
            style={{
              width: "5vw",
              background:
                "linear-gradient(to right, #141414, rgba(20, 20, 20, 0.8), transparent)",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 z-[9]"
            style={{
              width: "5vw",
              background:
                "linear-gradient(to left, #141414, rgba(20, 20, 20, 0.8), transparent)",
            }}
          />

          <Marquee
            speed={30}
            gradient={false}
            autoFill={true}
            className="py-[2vh] "
          >
            {logos.map((logo, index) => (
              <a
                key={index}
                href={logo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center flex-shrink-0 cursor-pointer group mx-8 "
                style={{
                  filter: "grayscale(100%)",
                }}
              >
                <img
                  src={`/logos/${logo.file}`}
                  alt={logo.name}
                  className="object-contain transition-all duration-300 group-hover:scale-110"
                  style={{ height: "6vh", width: "6vh" }}
                />
                <span
                  className="font-medium ml-4 transition-all duration-300"
                  style={{
                    color: logo.color,
                    fontSize: "2.5vh",
                  }}
                >
                  {logo.name}
                </span>
              </a>
            ))}
          </Marquee>
        </div>
      </div>

      {/* Bottom curved separator */}
      <div className="w-full z-50 " style={{ transform: "rotate(180deg)" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full "
          style={{ height: "10vh" }}
        >
          <path
            d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
            fill="#141414"
          />
        </svg>
      </div>

      <style jsx>{`
        .group:hover {
          filter: grayscale(0%) !important;
        }
      `}</style>
    </div>
  );
};

export default CurvedSeparator;
