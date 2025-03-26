"use client";
import React, { useEffect, useRef, useState } from "react";

interface ChessboardProps {
  maxSize?: number;
  minSize?: number;
  className?: string;
}

const Chessboard: React.FC<ChessboardProps> = ({ 
  maxSize = 800,
  minSize = 280,
  className = ""
}) => {
  const [boardSize, setBoardSize] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const container = boardRef.current.parentElement;
        const containerWidth = container ? container.clientWidth : 0;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const smallerViewportDimension = Math.min(viewportWidth, viewportHeight);
        
        let idealSize;
        
        if (viewportWidth < 640) { // Mobile
          idealSize = Math.min(containerWidth * 0.95, smallerViewportDimension * 0.8, maxSize);
        } else if (viewportWidth < 1024) { // Tablet
          idealSize = Math.min(containerWidth * 0.85, smallerViewportDimension * 0.7, maxSize);
        } else { // Desktop
          idealSize = Math.min(containerWidth * 0.75, smallerViewportDimension * 0.6, maxSize);
        }
        
        const finalSize = Math.max(Math.min(idealSize, maxSize), minSize);
        
        setBoardSize(finalSize);
      }
    };

    updateSize();
    
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      if (boardRef.current?.parentElement) {
        observer.observe(boardRef.current.parentElement);
      }
      
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSize);
        window.removeEventListener("orientationchange", updateSize);
      };
    }
    
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, [minSize, maxSize]);

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className={`flex flex-col items-center p-4 w-full mx-auto ${className}`}>
      <div
        ref={boardRef}
        className="relative w-full"
        style={{ maxWidth: `${boardSize}px` }}
      >
        <div className="relative w-full pb-[100%]">
          <div className="absolute top-0 left-0 w-full h-full flex flex-col">
            <div className="flex flex-1">
              <div className="flex flex-col justify-around pr-2 text-gray-600 font-medium">
                {ranks.map((rank) => (
                  <div 
                    key={rank} 
                    className="flex items-center justify-center h-[12.5%] w-5 sm:w-6 md:w-8 text-sm sm:text-base md:text-lg"
                  >
                    {rank}
                  </div>
                ))}
              </div>

              <div className="flex-1 relative">
                <div className="w-full h-full border-2 border-gray-700 shadow-lg rounded-sm overflow-hidden">
                  <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {ranks.map((rank, rankIndex) =>
                      files.map((file, fileIndex) =>  (
                        <div
                          key={`${file}${rank}`}
                          className={`w-full h-full ${
                            (rankIndex + fileIndex) % 2 === 0
                              ? "bg-[#f0d9b5]"
                              : "bg-[#b58863]" 
                          }`}
                          data-square={`${file}${rank}`}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex pl-7 mt-1">
              <div className="flex-1 grid grid-cols-8 text-gray-600 font-medium">
                {files.map((file) => (
                  <div 
                    key={file} 
                    className="flex items-center justify-center text-sm sm:text-base md:text-lg"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chessboard;