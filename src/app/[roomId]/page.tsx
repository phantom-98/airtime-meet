'use client';
import Lobby from "@/components/lobby";
import { useAppContext } from "@/context/app-context";


const Room = () => {
    const { name, setName } = useAppContext()!;

    return (
        name
        ? (
            <div></div>
        )
        : <div className="w-full h-screen flex items-center justify-center gap-8">
            <Lobby isCreate={false}/>
        </div>
    )
}

export default Room;