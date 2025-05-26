'use client';

import React, { useEffect, useRef } from "react";
import MutedIcon from '@/assets/icons/mic-off-red.svg';
import Image from "next/image";
import VoiceDetector from "./voice-detect";
import { useAppContext } from "@/context/app-context";

type VideoPlayerProps = {
    stream?: MediaStream | null,
    muted?: boolean,
    name?: string,
    showMutedIcon?: boolean,
    isAudio?: boolean
}

const VideoPlayer = ({stream = null, showMutedIcon = true, isAudio = true, muted = false, name = ''}: VideoPlayerProps) => {
    return (
        <div className="relative aspect-video w-full bg-(--video-background)">
            <Video stream={stream} audio={isAudio}/>
            {muted ? (
                showMutedIcon ? (
                    <div className="absolute top-4 right-4 size-8 rounded-full muted flex items-center justify-center">
                        <Image src={MutedIcon} alt="M" className="size-5"/>
                    </div>
                ) : null
            ) : <div className="absolute top-4 right-4 size-fit rounded-full"><VoiceDetector /></div>}
            <span className="absolute bottom-4 left-4">{name}</span>
        </div>
    )
}

export default VideoPlayer

const Video = React.memo(({stream, audio = true}: {stream: MediaStream | null, audio?: boolean}) => {
    const ref = useRef<HTMLVideoElement>(null);
    const {streamRef} = useAppContext()!;
    useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream
        }
    }, [streamRef.current])
    
    return <video ref={ref} className="w-full h-full object-cover" muted={!audio} autoPlay/>
})