'use client'
import { useRouter } from "next/navigation"
import Button from "./button"
import Input from "./input"
import { useEffect, useRef, useState } from "react"
import VideoPlayer from "./video-player"
import { CamControl, MicControl } from "./control"
import { useAppContext } from "@/context/app-context"
import Image from "next/image"
import Brand from '@/assets/icons/brand.svg';

type LobbyProps = {
    isCreate?: boolean
}

const Lobby = ({isCreate = true}: LobbyProps) => {
    const router = useRouter();
    const [spinner, setSpinner] = useState(false)
    const {name, setName, streamRef, socketRef, mic} = useAppContext()!
    const text = useRef<string>('')

    useEffect(() => {
        socketRef.current.on('onCreate', (link: string) => {
            setName(text.current);
            setSpinner(false);
            router.push('/' + link);
        })
    }, [])

    const createRoom = () => {
        setSpinner(true);
        socketRef.current.emit('create');
    }
    const joinRoom = () => {
        setName(text.current);
    }

    return (
        <div className="flex items-center justify-center gap-24 relative">
            <div className="w-[46rem] max-w-5/6 aspect-video rounded-xl overflow-hidden object-cover relative">
                <VideoPlayer stream={streamRef.current} muted={!mic} isAudio={false}/>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
                    <MicControl />
                    <CamControl />
                </div>
            </div>
            <div className="flex flex-col items-center gap-8">
                <h2 className="text-2xl">What's your name?</h2>
                <Input text={text.current} onChange={(value) => text.current = value}/>
                <Button text={isCreate ? "Create Room" : "Join Room"} spinner={spinner} disabled={!name || spinner} onClick={isCreate ? createRoom : joinRoom}/>
            </div>
            <Image src={Brand} alt="airtime" className="w-md absolute left-1/2 -translate-x-1/2 bottom-full mb-10"/>
        </div>
    )
}

export default Lobby;