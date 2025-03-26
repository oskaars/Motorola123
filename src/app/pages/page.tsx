import React from "react";
import Multiplayer from "../components/Multiplayer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Multiplayer App</h1>
      <Multiplayer />
    </div>
  );
};

export default LandingPage;
