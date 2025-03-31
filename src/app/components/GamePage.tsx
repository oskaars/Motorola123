"use client";
import ScrollIndicator from "./LandingPage/ScrollIndicator";
import GameModeButtons from "./ChooseMode/GameModeButtons";
import GradientBackground from "./Global/GradientBackground";
import ScrollToTop from "./LandingPage/ScrollToTop";
import CurvedSeparator from "./LandingPage/CurvedSeparator";
import FeatureCards from "./LandingPage/FeatureCards";
import AuthorsSection from "./LandingPage/AuthorsSection";
import GradientDivider from "./LandingPage/GradientDivider";

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
