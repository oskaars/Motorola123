const GradientDivider = () => {
  return (
    <div className="relative w-full h-[0.5vh]  overflow-hidden">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-red-500/20" />

      {/* Animated shine layer */}
      <div className="absolute inset-0 animate-shine">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      </div>

      {/* Pulse effect */}
      <div className="absolute inset-0 animate-pulse-opacity bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-red-500/10" />

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes pulse-opacity {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.3;
          }
        }

        .animate-shine {
          animation: shine 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-opacity {
          animation: pulse-opacity 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GradientDivider;
