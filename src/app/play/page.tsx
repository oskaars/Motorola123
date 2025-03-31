"use client";
import { useState } from "react";
import Head from "next/head";
import CursorTrail from "../components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import GamePage from "../components/GamePage";
import ObserverProvider from "../components/Global/ObserverProvider";


export default function Home() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);

  return (
    <>
      <Head>
        <title>Gambit+</title>
      </Head>
      <ObserverProvider>
        <div className="min-h-screen flex flex-col">
          <div
            onMouseEnter={() => setIsHoveringNavbar(true)}
            onMouseLeave={() => setIsHoveringNavbar(false)}
          ></div>

          <main className="flex-grow">
            <GamePage />
          </main>

          {!isHoveringNavbar && <CursorTrail />}
        </div>
      </ObserverProvider>
    </>
  );
}
