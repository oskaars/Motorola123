"use client";
import { useState } from "react";
import Head from "next/head";
import CursorTrail from "./components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import LandingPage from "./components/LandingPage/LandingPage";
import ObserverProvider from "./components/Global/ObserverProvider";

export default function Home() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);

  return (
    <>
      <Head>
        <title>Gambit+</title>
      </Head>
      <ObserverProvider>
        <div
          onMouseEnter={() => setIsHoveringNavbar(true)}
          onMouseLeave={() => setIsHoveringNavbar(false)}
        ></div>
        <LandingPage />
        {!isHoveringNavbar && <CursorTrail />}
      </ObserverProvider>
    </>
  );
}
