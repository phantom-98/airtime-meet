'use client';
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useContext, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

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
    socketRef: RefObject<Socket>
}

const AppContext = createContext<AppContextType | null>(null);

const socket_host = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:8000'

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('');
    const [mic, setMic] = useState<boolean>();
    const [cam, setCam] = useState<boolean>();
    const streamRef = useRef<MediaStream>(null);
    const socketRef = useRef<Socket>(io(socket_host))
    const [audioDevice, setAudioDevice] = useState<string>('default');
    const [videoDevice, setVideoDevice] = useState<string>('default');

    return <AppContext.Provider value={{
        name, setName, 
        mic, setMic, 
        cam, setCam, 
        audioDevice, setAudioDevice, 
        videoDevice, setVideoDevice, 
        streamRef,
        socketRef
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