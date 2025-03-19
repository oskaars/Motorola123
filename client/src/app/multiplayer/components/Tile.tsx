interface Props {
    image?: string;
    number: number;
}

export default function Tile({ number, image }: Props) {
    return (
        <div className={`relative w-full aspect-square ${number % 2 === 0 ? 'bg-[#a16f5a]' : 'bg-[#ecd3b8]'}`}>
            {image && <img
                src={image}
                alt="chess piece"
                className="absolute inset-0 w-full h-full object-contain cursor-grab active:cursor-grabbing chess-piece"
                draggable={false} 
            />}
        </div>
    );
}