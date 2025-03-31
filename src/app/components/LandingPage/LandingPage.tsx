"use client";
import ScrollIndicator from "./ScrollIndicator";
import LandingPageButtons from "./LandingPageButtons";
import GradientBackground from "../Global/GradientBackground";
import ScrollToTop from "./ScrollToTop";
import CurvedSeparator from "./CurvedSeparator";
import FeatureCards from "./FeatureCards";
import AuthorsSection from "./AuthorsSection";
import GradientLoader from "../Global/GradientLoader";
import GradientDivider from "./GradientDivider";

const LandingPage: React.FC = () => {
  return (
    <>
      <ScrollIndicator />
      <LandingPageButtons />
      <CurvedSeparator />
      <GradientBackground />
      <ScrollToTop />
      <FeatureCards />
      <GradientDivider />
      <AuthorsSection />
    </>
  );
};

export default LandingPage;
