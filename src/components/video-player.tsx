'use client';

import React, { useEffect, useRef } from "react";
import MutedIcon from '@/assets/icons/mic-off-red.svg';
import Image from "next/image";
import VoiceDetector from "./voice-detect";
import { useAppContext } from "@/context/app-context";
import { MediaConnection } from "peerjs";

type VideoPlayerProps = {
    isLocal?: boolean,
    name: string,
    peerId: string,
    call: MediaConnection | null,
    isCam: boolean,
    isMic: boolean,
}

const VideoPlayer = React.memo(({name, call, isLocal = true, isCam, isMic}: VideoPlayerProps) => {
    const { streamRef: localRef, getFullStream } = useAppContext()!;
    const stream = useRef<MediaStream | null>(null)
    useEffect(() => {
        call?.answer(getFullStream())
        call?.on('stream', remoteStream => {
            console.log('Remote stream received for', call.peer);
            stream.current = remoteStream
        })
    }, [call])

    return (
        <div className="relative aspect-video w-full h-full">
            {isCam ? (
                <Video stream={isLocal ? localRef.current : stream.current} isLocal={isLocal}/>
            ) : (
                <div className="w-full h-full bg-(--video-background) relative">
                    {name && <span className="absolute top-1/2 left-1/2 -translate-1/2 size-16 text-white text-3xl text-center leading-16 rounded-full bg-(--secondary-color) z-10">{name.at(0)?.toUpperCase()}</span>}
                </div>
            )}
            {!isMic ? (
                // isLocal ? null : (
                    <div className="absolute top-4 right-4 size-8 rounded-full muted flex items-center justify-center">
                        <Image src={MutedIcon} alt="M" className="size-5"/>
                    </div>
                // )
            ) : <div className={`absolute ${(isCam) ? 'top-4 right-4' : 'top-1/2 left-1/2 -translate-1/2'} size-fit rounded-full`}>
                <VoiceDetector stream={isLocal ? localRef.current : stream.current} size={(isCam) ? 'small' : 'large'}/>
                {!isLocal && <Audio stream={stream.current} />}
            </div>}
            <span className="absolute bottom-4 left-4 text-xl text-white font-semibold">{name}{isLocal ? ' (You)':''}</span>
        </div>
    )
});

export default VideoPlayer;

export const VideoPreview = () => {
    const { streamRef, cam, mic } = useAppContext()!;
    return (
        <div className="relative aspect-video w-full h-full">
            {cam ? (
                <Video stream={streamRef.current} isLocal={true}/>
            ) : (
                <div className="w-full h-full bg-(--video-background) relative"></div>
            )}
            {mic && <div className={`absolute top-4 right-4 size-fit rounded-full`}><VoiceDetector stream={streamRef.current} size='small'/></div>}
        </div>
    )
}

const Video = React.memo(({stream, isLocal = true}: {stream: MediaStream | null, isLocal?: boolean}) => {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream
        }
    }, [stream])
    
    return <video ref={ref} className={`w-full h-full object-cover ${isLocal ? 'rotate-y-180':''}`} muted autoPlay/>
})

const Audio = React.memo(({stream}: {stream: MediaStream | null}) => {
    const ref = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.srcObject = stream
        }
    }, [stream])
    return <audio ref={ref} className="hidden" autoPlay />
})