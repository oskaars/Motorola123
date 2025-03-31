"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "@/app/components/Global/NavBar";
import CursorTrail from "@/app/components/Global/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import Multiplayer from "@/app/components/LanGame";
import ObserverProvider from "@/app/components/Global/ObserverProvider";
import CustomFooter from "@/app/components/Global/CustomFooter";
import Link from "next/link";
import ScrollToTop from "@/app/components/LandingPage/ScrollToTop";
import GradientBackground from "@/app/components/Global/GradientBackground";

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
