"use client";
import ScrollIndicator from "./ScrollIndicator";
import GameModeButtons from "./GameModeButtons";
import GradientBackground from "./GradientBackground";
import ScrollToTop from "./ScrollToTop";
import CurvedSeparator from "./CurvedSeparator";
import FeatureCards from "./FeatureCards";
import AuthorsSection from "./AuthorsSection";
import GradientDivider from "./GradientDivider";

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
