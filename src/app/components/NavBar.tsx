"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

const NavBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = (8 * window.innerHeight) / 100;
      const shouldShow =
        currentScrollY < lastScrollY.current ||
        currentScrollY < scrollThreshold;

      setIsVisible(shouldShow);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMounted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !burgerRef.current?.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const nav = document.querySelector(".mouse-cursor-gradient-tracking");

    const handleMouseMove = (e: MouseEvent) => {
      const rect = (nav as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (nav as HTMLElement).style.setProperty("--x", `${x}px`);
      (nav as HTMLElement).style.setProperty("--y", `${y}px`);
    };

    if (nav) {
      nav.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (nav) {
        nav.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav
        className={`mouse-cursor-gradient-tracking overflow-hidden fixed h-[8vh] top-0 left-0 w-full bg-black/80 lg:bg-black/10 flex items-center pt-3 pb-3 z-[9999] shadow-[0_1vh_2vh_rgba(0,0,0,0.5)] transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full h-full flex flex-row items-center justify-between pl-[5vw] pr-[5vw]">
          <Link
            href="/"
            className="text-[3vh] font-bold motion-duration-[4s] motion-opacity-in-0 hover:scale-105 ease-in-out transition"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "white",
            }}
          >
            Gambit.pl
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-row items-center gap-[4vw]">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[2vh] hover:cursor-pointer underline-animation motion-delay-[200ms] motion-opacity-in-0 motion-translate-y-in-[4vh] motion-duration-1000"
            >
              Home
            </Link>
            <Link
              href="/play"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[2vh] hover:cursor-pointer motion-delay-[200ms] motion-opacity-in-0 motion-translate-y-in-[4vh] motion-duration-1000"
            >
              <div
                className="group relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl "
                style={{
                  padding: "2.5vh 9vh",
                  borderRadius: "50vh",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center items-center ">
                  <span className="relative font-semibold text-white">
                    PLAY NOW
                  </span>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 z-[99] transition-opacity duration-300 flex justify-center items-center">
                  <span className="relative font-semibold text-pink-600">
                    PLAY NOW
                  </span>
                </div>
              </div>
            </Link>
            <Link
              href="/#authors"
              className="text-[2vh] hover:cursor-pointer underline-animation motion-delay-[250ms] motion-opacity-in-0 motion-translate-y-in-[4vh] motion-duration-1000"
            >
              Authors
            </Link>
            <p className="text-[2vh] hover:cursor-pointer underline-animation motion-delay-[300ms] motion-opacity-in-0 motion-translate-y-in-[4vh] motion-duration-1000">
              Documentation
            </p>
          </div>

          {/* Mobile Burger Button */}
          <button
            ref={burgerRef}
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-[6vh] h-[6vh] relative z-50"
            aria-label="Toggle menu"
          >
            <span
              className={`bg-white h-[0.4vh] w-[4vh] rounded-full transition-all duration-300 ${
                isMenuOpen
                  ? "rotate-45 translate-y-[0.3vh]"
                  : "-translate-y-[0.5vh]"
              }`}
            />
            <span
              className={`bg-white h-[0.4vh] w-[4vh] rounded-full transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100 my-[0.5vh]"
              }`}
            />
            <span
              className={`bg-white h-[0.4vh] w-[4vh] rounded-full transition-all duration-300 ${
                isMenuOpen
                  ? "-rotate-45 -translate-y-[0.3vh]"
                  : "translate-y-[0.5vh]"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className={`fixed pt-[8vh] left-0 w-full bg-black/90 backdrop-blur-lg z-40 transition-all duration-300 md:hidden ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ height: "50vh" }}
      >
        <div className="flex flex-col items-center gap-[4vh] pt-[4vh] px-[5vw]">
          <Link
            href="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
            }}
            className="text-[2.5vh] text-white hover:cursor-pointer underline-animation"
          >
            Home
          </Link>

          <Link
            href="/play"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsMenuOpen(false);
            }}
            className="text-[2.5vh] text-white hover:cursor-pointer "
          >
            <div
              className="group relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl "
              style={{
                padding: "3vh 20vh",
                borderRadius: "50vh",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-100 group-hover:opacity-0 transition-opacity duration-300 flex justify-center items-center ">
                <span className="relative font-semibold text-white">
                  PLAY NOW
                </span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 z-[99] transition-opacity duration-300 flex justify-center items-center">
                <span className="relative font-semibold text-pink-600">
                  PLAY NOW
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/#authors"
            onClick={() => setIsMenuOpen(false)}
            className="text-[2.5vh] text-white hover:cursor-pointer underline-animation"
          >
            Authors
          </Link>

          <p className="text-[2.5vh] text-white hover:cursor-pointer underline-animation">
            Documentation
          </p>
        </div>
      </div>

      <div className="h-[8vh]"></div>
    </>
  );
};

export default NavBar;
