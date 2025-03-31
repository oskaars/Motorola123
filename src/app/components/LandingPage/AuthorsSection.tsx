interface Author {
  name: string;
  description: string;
  avatar?: string;
  position?: "left" | "right";
}

const AuthorsSection = ({ authors }: { authors?: Author[] }) => {
  const defaultAuthors: Author[] = [
    {
      name: "Marcin",
      description: "Main UI/UX Developer",
      avatar: "/avatars/marcin.png",
      position: "left",
    },
    {
      name: "Oskar",
      description: "LOREM",
      avatar: "/avatars/oskar.png",
      position: "right",
    },
    {
      name: "Mateusz",
      description: "LOREM",
      avatar: "/avatars/mateusz.png",
    },
    {
      name: "Dawid",
      description: "LOREM",
      avatar: "/avatars/placeholder.jpg",
      position: "right",
    },
    {
      name: "Jakub",
      description: "Lorem",
      avatar: "/avatars/placeholder.jpg",
    },
  ];

  const displayAuthors = authors || defaultAuthors;

  return (
    <div
      id="authors"
      className="min-h-screen py-[10vh] md:px-[4vw] bg-gray-900/60 flex flex-col justify-center items-center w-full"
    >
      <h2 className="relative z-[11] text-[10vh] md:text-[6vh] font-bold text-center mb-[10vh] bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent scale-0 intersect-once intersect:scale-100 intersect:opacity-100  transition duration-[2s]">
        AUTHORS
      </h2>

      <div className="md:w-[80vw] lg:w-[60vw] w-full relative z-[11]">
        {displayAuthors.map((author, index) => {
          const position =
            author.position || (index % 2 === 0 ? "left" : "right");
          const isLeft = position === "left";

          return (
            <div
              key={author.name}
              className="w-full flex py-[2vh]"
              style={{ justifyContent: isLeft ? "flex-start " : "flex-end" }}
            >
              <div
                className={`group flex flex-col md:flex-row items-center md:gap-[1vh] w-[100%] md:w-[100%] lg:w-[50%] transition-all duration-300 hover:scale-[1.01] pt-[5vh] md:pt-[0] grayscale hover:grayscale-0 ${
                  isLeft
                    ? "md:flex-row intersect-once intersect:motion-preset-slide-right-lg"
                    : "md:flex-row-reverse intersect-once intersect:motion-preset-slide-left-lg"
                }`}
              >
                {/* Avatar Container */}
                <div
                  className={`relative w-[15vh] h-[15vh]  rounded-full overflow-hidden border-[0.5vh] border-purple-500/30 transition-all duration-500 group-hover:border-pink-500 ${
                    isLeft ? "md:mr-[2vw]" : "md:ml-[2vw]"
                  }`}
                >
                  <img
                    src={author.avatar || "/avatars/placeholder.png"}
                    alt={author.name}
                    className="w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-500"
                  />
                </div>

                {/* Text Content */}
                <div
                  className={`flex-1 transition-all duration-500 text-center px-[2vw] p-0 ld:p-0 ${
                    isLeft ? "md:text-left " : "md:text-right"
                  } ${
                    isLeft
                      ? "md:group-hover:translate-x-[1vw] "
                      : "md:group-hover:-translate-x-[1vw]"
                  }`}
                >
                  <h3 className="text-[4vh] md:text-[4vh] font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent md:mb-[1vh] mb-0">
                    {author.name}
                  </h3>
                  <p className="text-gray-300 text-[1.7vh] md:text-[2vh] leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                    {author.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuthorsSection;
