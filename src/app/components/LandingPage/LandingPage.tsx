"use client";
import ScrollIndicator from "./ScrollIndicator";
import LandingPageButtons from "./LandingPageButtons";
import CurvedSeparator from "./CurvedSeparator";
import FeatureCards from "./FeatureCards";
import AuthorsSection from "./AuthorsSection";
import GradientDivider from "./GradientDivider";

const LandingPage: React.FC = () => {
  return (
    <>
      <ScrollIndicator />
      <LandingPageButtons />
      <CurvedSeparator />

      <FeatureCards />
      <GradientDivider />
      <AuthorsSection />
    </>
  );
};

export default LandingPage;
