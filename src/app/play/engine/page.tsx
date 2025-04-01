"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import CursorTrail from "@/app/components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import ServerGameWindow from "@/app/components/ServerGameWindow";
import ObserverProvider from "@/app/components/Global/ObserverProvider";

type EngineType = "Minimax" | "MCTS";
type TimeControlType = "blitz" | "rapid" | "classical" | "custom";

interface EngineSettings {
  type: EngineType;
  useBook: boolean;
  depth: number;
  timeControl?: {
    type: TimeControlType;
    baseTime: number;
    increment: number;
  };
}

export default function EnginePage() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);
  const [engineSettings, setEngineSettings] = useState<EngineSettings | null>(null);

  useEffect(() => {
    // Load engine settings from localStorage
    const savedSettings = localStorage.getItem('engineSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setEngineSettings(parsedSettings);
      } catch (e) {
        console.error("Failed to parse engine settings", e);
        setDefaultSettings();
      }
    } else {
      setDefaultSettings();
    }
  }, []);

  const setDefaultSettings = () => {
    const defaultSettings = {
      type: "Minimax" as EngineType,
      useBook: false,
      depth: 5,
      timeControl: {
        type: "rapid" as TimeControlType,
        baseTime: 600,
        increment: 5
      }
    };
    
    setEngineSettings(defaultSettings);
    // Also save to localStorage for consistency
    localStorage.setItem('engineSettings', JSON.stringify(defaultSettings));
  };

  return (
    <>
      <Head>
        <title>Gambit+ | Play against Engine</title>
      </Head>
      <ObserverProvider>
        <div className="min-h-screen flex flex-col">
          <div
            onMouseEnter={() => setIsHoveringNavbar(true)}
            onMouseLeave={() => setIsHoveringNavbar(false)}
          ></div>

          <main className="flex-grow">
            {engineSettings && <ServerGameWindow initialSettings={engineSettings} />}
          </main>

          {!isHoveringNavbar && <CursorTrail />}
        </div>
      </ObserverProvider>
    </>
  );
}
