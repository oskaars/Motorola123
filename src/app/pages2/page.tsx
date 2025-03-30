"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import LandingPageContent from "../components/LandingPageContent";
import CursorTrail from "../components/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import LandingPage from "../components/LandingPage";
import ObserverProvider from "../components/ObserverProvider";
import GradientLoader from "../components/GradientLoader";
import CustomFooter from "../components/CustomFooter";

export default function Home() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Scroll to top on initial render/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const updateCursor = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateCursor);
    return () => window.removeEventListener("mousemove", updateCursor);
  }, []);

  return (
    <>
      <Head>
        <title>Gambit.pl - Antique Chess Experience</title>
      </Head>
      <ObserverProvider>
        <GradientLoader />
        <div
          onMouseEnter={() => setIsHoveringNavbar(true)}
          onMouseLeave={() => setIsHoveringNavbar(false)}
        >
          <NavBar />
        </div>
        <LandingPage />
        <div
          className="cursor-trail"
          style={{
            opacity: isHoveringNavbar ? "0%" : "100%",
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: 10,
            transition: "transform 0.5s, opacity 0.5s",
          }}
        >
          <CursorTrail />
        </div>
        <CustomFooter />
      </ObserverProvider>
    </>
  );
}
