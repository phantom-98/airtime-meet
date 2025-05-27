'use client';
import Lobby from "@/components/lobby";
import Room from "@/components/room";
import { useAppContext } from "@/context/app-context";


const RoomPage = () => {
    const { name } = useAppContext()!;

    return (
        name
        ? <Room />
        : <Lobby isCreate={false}/>
    )
}

export default RoomPage;