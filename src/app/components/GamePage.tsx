"use client";
import GameModeButtons from "./ChooseMode/GameModeButtons";
import GradientBackground from "./Global/GradientBackground";
import ScrollToTop from "./LandingPage/ScrollToTop";

const GamePage: React.FC = () => {
  return (
    <>
      <GameModeButtons />
      <GradientBackground />
      <ScrollToTop />
    </>
  );
};

export default GamePage;
