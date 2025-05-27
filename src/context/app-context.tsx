'use client';
import Peer from "peerjs";
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 } from "uuid";

type AppContextType = {
    name: string,
    setName: Dispatch<SetStateAction<string>>,
    mic: boolean | undefined,
    setMic: Dispatch<SetStateAction<boolean | undefined>>,
    cam: boolean | undefined,
    setCam: Dispatch<SetStateAction<boolean | undefined>>,
    audioDevice: string,
    setAudioDevice: Dispatch<SetStateAction<string>>,
    videoDevice: string,
    setVideoDevice: Dispatch<SetStateAction<string>>,
    streamRef: RefObject<MediaStream | null>,
    socketRef: RefObject<Socket>,
    peerRef: RefObject<Peer>,
    getEmptyTrack: (videoOrAudio: string) => MediaStreamTrack,
    getFullStream: () => MediaStream
}

const AppContext = createContext<AppContextType | null>(null);

const socket_host = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:8000';
const peer_host = process.env.NEXT_PUBLIC_PEER_HOST || 'localhost';
const peer_port = process.env.NEXT_PUBLIC_PEER_PORT || '9000'

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('');
    const [mic, setMic] = useState<boolean>();
    const [cam, setCam] = useState<boolean>();
    const streamRef = useRef<MediaStream>(null);
    const socketRef = useRef<Socket>(io(socket_host))
    const peerRef = useRef<Peer>(new Peer(v4(), { host: peer_host, port: parseInt(peer_port), secure: peer_host.startsWith('https') }));
    const [audioDevice, setAudioDevice] = useState<string>('default');
    const [videoDevice, setVideoDevice] = useState<string>('default');
    const dummyStream = useRef<MediaStream | null>(null);
    const genDummyStream = async () => {
        let video = document.createElement("video");
        video.src = '/media.mp4';
        video.controls = true;
        video.oncanplaythrough = (e) => {
            try {
                dummyStream.current = (video as any).captureStream() as MediaStream;
            } catch (e) {
                dummyStream.current = (video as any).mozCaptureStream() as MediaStream;
            }
            dummyStream.current.getTracks().map((track) => track.stop())
        }
    }

    const getEmptyTrack = (videoOrAudio: string) => {
        if (videoOrAudio === "video") {
            return dummyStream.current!.getVideoTracks()[0]
        } else {
            return dummyStream.current!.getAudioTracks()[0]
        }
    }

    const getFullStream = () => {
        return new MediaStream([
            streamRef.current?.getVideoTracks()[0] || getEmptyTrack('video'),
            streamRef.current?.getAudioTracks()[0] || getEmptyTrack('audio')
        ]);
    }

    useEffect(() => {
        genDummyStream();
    }, [])

    return <AppContext.Provider value={{
        name, setName, 
        mic, setMic, 
        cam, setCam, 
        audioDevice, setAudioDevice, 
        videoDevice, setVideoDevice, 
        streamRef,
        socketRef,
        peerRef,
        getEmptyTrack,
        getFullStream
    }}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    const context = useContext(AppContext)

    if (context === undefined) {
        throw new Error("useAppContext must be used within a AppProvider");
    }

    return context
}