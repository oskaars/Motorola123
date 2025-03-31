"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "./components/NavBar";
import CursorTrail from "./components/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import LandingPage from "./components/LandingPage";
import ObserverProvider from "./components/ObserverProvider";
import CustomFooter from "./components/CustomFooter";

export default function Home() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);

  return (
    <>
      <Head>
        <title>Gambit.pl - Antique Chess Experience</title>
      </Head>
      <ObserverProvider>
        <div
          onMouseEnter={() => setIsHoveringNavbar(true)}
          onMouseLeave={() => setIsHoveringNavbar(false)}
        >
          <NavBar />
        </div>
        <LandingPage />
        {!isHoveringNavbar && <CursorTrail />}
        <CustomFooter />
      </ObserverProvider>
    </>
  );
}
