
interface Props {
    number: number;
}

export default function Tile({ number }: Props) {
    if(number % 2 === 0) {
        return <div className="w-[100px] h-[100px] bg-[#a16f5a]"></div>
    }
    else {
        return <div className="w-[100px] h-[100px] bg-[#ecd3b8]"></div>
    }   
}