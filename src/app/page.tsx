"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "./components/Global/NavBar";
import CursorTrail from "./components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import LandingPage from "./components/LandingPage/LandingPage";
import ObserverProvider from "./components/Global/ObserverProvider";
import CustomFooter from "./components/Global/CustomFooter";

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
