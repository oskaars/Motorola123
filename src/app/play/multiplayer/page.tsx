"use client";
import { useState } from "react";
import Head from "next/head";
import CursorTrail from "@/app/components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import Multiplayer from "@/app/components/LanGame";
import ObserverProvider from "@/app/components/Global/ObserverProvider";


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
            <Multiplayer />
          </main>

          {!isHoveringNavbar && <CursorTrail />}
        </div>
      </ObserverProvider>
    </>
  );
}
