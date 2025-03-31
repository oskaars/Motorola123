const FeatureCards = () => {
  const cards = [
    { id: 1, title: "Rust Engine", desc: "The chess engine, powering the game's move validation. " },
    { id: 2, title: "Mini-max Algorithm", desc: "Used to calculate the best possible moves for the chess engine by evaluating future game states." },
    { id: 3, title: "Monte Carlo Tree Search", desc: "Sophisticated algorithm that simulates thousands of potential game outcomes to determine the most promising moves, adapting to any playing style." },
    { id: 4, title: "Websocket", desc: "Secure, low-latency multiplayer connections allowing for seamless gameplay with opponents worldwide, with move synchronization in milliseconds." },
    { id: 5, title: "Opening book Integration", desc: "Comprehensive database of chess openings and variations, allowing the engine to play strategic early-game positions based on centuries of chess theory." },
    { id: 6, title: "Our own chess module", desc: "A custom chess module that handles all the game logic, including move validation, checkmate detection, and game state management." } 
  ];

  return (
    <>
      <div className="w-full bg-gray-900 h-[25vh] my-[-10vh]" />
      <div className="w-full flex justify-center py-[2vh] pb-[4vh] bg-gray-900">
        <p
          className="font-bold text-transparent bg-clip-text text-white animate-gradient-shift 
          leading-tight tracking-[0.6vw] relative z-[11] scale-0 intersect-once intersect:scale-100 
          intersect:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.68,0.6,0.32,1.6)] 
          hover:tracking-[0.8vw] text-[3vh] mb-[5vh]"
        >
          OUR FEATURES
        </p>
      </div>

      <div className="p-[1vw] min-h-[90vh] bg-gray-900 relative overflow-hidden">
        <style jsx>{`
          .card-container {
            position: relative;
            border-radius: 17px;
            overflow: hidden;
            opacity: 0;
            animation: fadeIn 0.5s forwards;
            contain: strict;
            min-width: 0;
          }

          .card-container::before {ż
            content: "";
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #ec4899, #8b5cf6, #ec4899);
            background-size: 200% 200%;
            border-radius: inherit;
            z-index: 0;
            opacity: 0;
            transition: opacity 0.3s;
            animation: gradient-animation 3s ease infinite;
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
          }

          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }
          @keyframes gradient-animation {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes breathe {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
          }

          .card-container:hover::before {
            animation: breathe 5s ease-in-out infinite,
              gradient-animation 5s ease infinite;
            opacity: 1;
          }

          .card-container:nth-child(1) {
            animation-delay: 0.2s;
          }
          .card-container:nth-child(2) {
            animation-delay: 0.4s;
          }
          .card-container:nth-child(3) {
            animation-delay: 0.6s;
          }
          .card-container:nth-child(4) {
            animation-delay: 0.8s;
          }
          .card-container:nth-child(5) {
            animation-delay: 1s;
          }
          .card-container:nth-child(6) {
            animation-delay: 1.2s;
          }
        `}</style>

        <div className="w-full px-[15vw] grid grid-cols-1 md:grid-cols-3 gap-[2vw] min-h-[70vh] relative z-10">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card-container h-[30vh] transition-all duration-300 hover:scale-105 translate-z-0 will-change-transform"
            >
              <div className="absolute inset-1 bg-gray-900 rounded-[15px] p-[2vh] flex flex-col justify-center will-change-transform opacity-0 intersect:opacity-100 intersect:transition-opacity intersect:duration-[2s] intersect:ease-out intersect-once">
                <span className="text-[2.5vh] font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                  #{card.id}
                </span>
                <h3 className="mt-[1.5vh] text-[2.5vh] font-semibold text-white truncate">
                  {card.title}
                </h3>
                <p className="mt-[1.5vh] flex-grow text-gray-400 line-clamp-3">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeatureCards;
