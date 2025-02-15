
"use client";
import Multiplayer from '../components/Multiplayer';
import { NextPage } from 'next';
import Chessboard from '../components/Chessboard';
import { useRef, useEffect } from 'react';

const Board: NextPage = () => {
  const chessboardRef = useRef<any>(null);

  useEffect(() => {
    (window as any).chess = {
      move: (notation: string) => {
        if (chessboardRef.current) {
          return chessboardRef.current.executeNotationMove(notation);
        }
        return false;
      }
    };
  }, []);

  return (
    <div className="grid place-content-center  bg-[#1a1a1a] pt-[5vh]">
      <Chessboard ref={chessboardRef} />
      <Multiplayer />
    </div>
  );
};

export default Board;
