"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import CursorTrail from "../components/CursorTrail";
import "/src/globals.css";
import "/public/fonts/fonts.css";
import GamePage from "../components/GamePage";
import ObserverProvider from "../components/ObserverProvider";
import CustomFooter from "../components/CustomFooter";
import Link from "next/link";

export default function Home() {
  const [isHoveringNavbar, setIsHoveringNavbar] = useState(false);

  return (
    <>
      <Head>
        <title>Gambit.pl - Antique Chess Experience</title>
      </Head>
      <ObserverProvider>
        <div className="min-h-screen flex flex-col">
          <div
            onMouseEnter={() => setIsHoveringNavbar(true)}
            onMouseLeave={() => setIsHoveringNavbar(false)}
          >
            <NavBar />
          </div>

          <main className="flex-grow">
            <GamePage />
          </main>

          {!isHoveringNavbar && <CursorTrail />}

          <CustomFooter />
        </div>
      </ObserverProvider>
    </>
  );
}
