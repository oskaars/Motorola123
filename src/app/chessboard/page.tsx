"use client"
import React from 'react';
import dynamic from 'next/dynamic';
import Multiplayer from "@/app/components/Multiplayer";

// Dynamiczny import bez SSR
const ChessPiece3DClient = dynamic(
  () => import('../components/threeDChessPiece'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Ładowanie komponentu 3D...</span>
      </div>
    )
  }
);

const LandingPage: React.FC = () => {
  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Multiplayer />
      <h1 className="text-4xl font-bold mb-8">
        Welcome to the Chess App
      </h1>
      <div className="w-full max-w-lg">
        <ChessPiece3DClient />
      </div>
    </div>
  );
};

export default LandingPage;
