
"use client";
import Multiplayer from '../components/Multiplayer';
import { NextPage } from 'next';
import Chessboard from '../../Chessboard';
import { useRef, useEffect, useState } from 'react';

const Board: NextPage = () => {
  const chessboardRef = useRef<any>(null);
  const [joined, setJoined] = useState(false);
  const handleJoinStatus = (status: boolean) => {
    setJoined(status);
  };

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
    <div>
      <Multiplayer onJoinStatusChange={handleJoinStatus} />
      {joined && <Chessboard ref={chessboardRef} />}
    </div>
  );
};


export default Board;
