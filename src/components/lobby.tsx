'use client'
import { useRouter } from "next/navigation"
import Button from "./button"
import Input from "./input"
import { useEffect, useState } from "react"
import { VideoPreview } from "./video-player"
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
    const {setName, socketRef} = useAppContext()!
    const [text, setText] = useState('')

    useEffect(() => {
        socketRef.current.on('onCreate', (link: string) => {
            onCreate(link);
        })
    }, [])

    const onCreate = (link: string) => {
        setSpinner(false);
        router.push('/' + link);
    }

    const createRoom = () => {
        setName(text);
        setSpinner(true);
        socketRef.current.emit('create');
    }
    const joinRoom = () => {
        setName(text);
    }

    return (
        <div className="w-screen h-screen flex items-start pt-40 lg:pt-0 lg:items-center justify-center">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative">
                <div className="w-[46rem] max-w-[80vw] aspect-video rounded-xl overflow-hidden object-cover relative">
                    <VideoPreview />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4">
                        <MicControl />
                        <CamControl />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-8">
                    <h2 className="text-2xl">What's your name?</h2>
                    <Input text={text} onChange={setText}/>
                    <Button text={isCreate ? "Create Room" : "Join Room"} spinner={spinner} disabled={!text || spinner} onClick={isCreate ? createRoom : joinRoom}/>
                </div>
                <Image src={Brand} alt="airtime" className="w-md max-w-3/5 absolute left-1/2 -translate-x-1/2 bottom-full mb-2 lg:mb-10"/>
            </div>
        </div>
    )
}

export default Lobby;