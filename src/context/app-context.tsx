'use client';
import Peer from "peerjs";
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 } from "uuid";

type AppContextType = {
    name: string,                                                       // User name
    setName: Dispatch<SetStateAction<string>>,
    mic: boolean | undefined,                                           // Microphone status - true(on), false(off), undefined(permission not granted)
    setMic: Dispatch<SetStateAction<boolean | undefined>>,
    cam: boolean | undefined,                                           // Camera status - true(on), false(off), undefined(permission not granted)
    setCam: Dispatch<SetStateAction<boolean | undefined>>,
    audioDevice: string,                                                // Active audio device id
    setAudioDevice: Dispatch<SetStateAction<string>>,
    videoDevice: string,                                                // Active video device id
    setVideoDevice: Dispatch<SetStateAction<string>>,
    streamRef: RefObject<MediaStream | null>,                           // Local video and audio stream
    socketRef: RefObject<Socket | null>,                                // Socket.io client instance
    peerRef: RefObject<Peer | null>,                                    // PeerJs client instance
    getEmptyTrack: (videoOrAudio: string) => MediaStreamTrack,          // Return an empty media stream track
    getFullStream: () => MediaStream                                    // Return local video and audio tracks
}

const AppContext = createContext<AppContextType | null>(null);

const socket_host = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:8000';
const peer_host = process.env.NEXT_PUBLIC_PEER_HOST || 'localhost';
const peer_port = process.env.NEXT_PUBLIC_PEER_PORT || '9000';
const peer_secure = process.env.NEXT_PUBLIC_PEER_SECURE || 'false';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState('');
    const [mic, setMic] = useState<boolean>();
    const [cam, setCam] = useState<boolean>();
    const streamRef = useRef<MediaStream>(null);
    const socketRef = useRef<Socket>(null)
    const peerRef = useRef<Peer>(null);
    const [audioDevice, setAudioDevice] = useState<string>('default');
    const [videoDevice, setVideoDevice] = useState<string>('default');
    const dummyStream = useRef<MediaStream | null>(null);

    /* 
        peerjs doesn't support addtrack event on webrtc.
        it means that once the connection established, we can't add new media stream tracks.
        local stream may have not video or audio track at first. then the peer connection
        is established, we need to add new tracks but peerjs doesn't support it. it support
        only replacing track function. That's why the loadDummyStream comes in. When the 
        peer connection is establishing, we need to have both video and audio track 
        even they are empty. Then we can replace the tracks with what we add to local stream.
    */
    const loadDummyStream = async () => {
        let video = document.createElement("video");
        video.src = '/media.mp4';
        video.controls = true;
        video.oncanplaythrough = (e) => {
            try {
                dummyStream.current = (video as any).captureStream() as MediaStream;            // for chrome
            } catch (e) {
                try {
                    dummyStream.current = (video as any).mozCaptureStream() as MediaStream;     // for firefox
                } catch (e) {
                    let canvas = document.createElement('canvas');                              // for safari
                    canvas.width=200;
                    canvas.height=200;
                    const canvasStream = canvas.captureStream();
                    const audio = new Audio('/media.mp4');
                    const ctx = new AudioContext();
                    const dest = ctx.createMediaStreamDestination();
                    const src = ctx.createMediaElementSource(audio);
                    src.connect(dest);
                    
                    dummyStream.current = new MediaStream([
                        canvasStream.getVideoTracks()[0],
                        dest.stream.getAudioTracks()[0]
                    ])
                }
            }
            dummyStream.current.getTracks().map((track) => track.stop())
        }
    }

    // return empty video or audio track from dummy stream
    const getEmptyTrack = (videoOrAudio: string) => {
        if (videoOrAudio === "video") {
            return dummyStream.current!.getVideoTracks()[0].clone()
        } else {
            return dummyStream.current!.getAudioTracks()[0].clone()
        }
    }

    // return mediastream which has both video and audio tracks
    const getFullStream = () => {
        return new MediaStream([
            streamRef.current?.getVideoTracks()[0] || getEmptyTrack('video'),
            streamRef.current?.getAudioTracks()[0] || getEmptyTrack('audio')
        ]);
    }

    useEffect(() => {
        loadDummyStream();
        if (!socketRef.current || socketRef.current.disconnected) {
            socketRef.current = io(socket_host)                             // connect socket.io server
        }
        if (!peerRef.current || peerRef.current.disconnected) {
            peerRef.current = new Peer(
                v4(), {
                    host: peer_host, 
                    port: parseInt(peer_port), 
                    secure: Boolean(peer_secure)
                }
            )                                                               // connect peerjs server
        }
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