interface Props {
    image?: string;
    number: number;
}

export default function Tile({ number, image }: Props) {
    if(number % 2 === 0) {
        return (
            <div className="w-[100px] h-[100px] bg-[#a16f5a] grid place-content-center">
            <img className="w-[80px]" src={image}/>
            </div>
        );
    } else {
        return (
        <div className="w-[100px] h-[100px] bg-[#ecd3b8] grid place-content-center">
        <img className="w-[80px]" src={image}/>
        </div>
        );
    }   
}
