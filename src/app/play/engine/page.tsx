"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import CursorTrail from "@/app/components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import ObserverProvider from "@/app/components/Global/ObserverProvider";
import ServerGameWindow from "@/app/components/ServerGameWindow";

export default function EnginePage() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);
  const [engineSettings, setEngineSettings] = useState({
    type: "Minimax",
    useBook: false,
    depth: 5
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('engineSettings');
      if (savedSettings) {
        setEngineSettings(JSON.parse(savedSettings));
        localStorage.removeItem('engineSettings');
      }
    } catch (error) {
      console.error("Error loading engine settings:", error);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Gambit.pl - Playing Against Engine</title>
      </Head>
      <ObserverProvider>
        <div className="min-h-screen flex flex-col">
          <div
            onMouseEnter={() => setIsHoveringNavbar(true)}
            onMouseLeave={() => setIsHoveringNavbar(false)}
          ></div>

          <main className="flex-grow">
            <ServerGameWindow initialSettings={engineSettings} />
          </main>

          {!isHoveringNavbar && <CursorTrail />}
        </div>
      </ObserverProvider>
    </>
  );
}
