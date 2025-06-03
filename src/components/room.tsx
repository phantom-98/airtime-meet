'use client'
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ControlBar } from "./control";
import Image from "next/image";
import Brand from '@/assets/icons/brand.svg'
import { useAppContext } from "@/context/app-context";
import VideoLayout, { UserType } from "./video-layout";
import ChatBox from "./chatbox";

// meeting room
const Room = () => {
    const link = usePathname().slice(1);                                        // meeting link
    const [time, setTime] = useState('');
    const { cam, mic, name, streamRef, socketRef, peerRef, getEmptyTrack, getFullStream } = useAppContext()!;
    const mediaState = useRef({cam, mic});                                      // local media status
    const [users, setUsers] = useState<{[key: string]: UserType}>({
        'local': {
            name,
            call: null,
            isCam: !!cam,
            isMic: !!mic
        },
    });                                                                         // store the peer user list
    
    // get the user list in the room when a user just join the meeting
    const onJoin = (list: {name: string, peerId: string}[]) => {
        setUsers(prev => {
            list.map(user => {
                const call = peerRef.current!.call(user.peerId, getFullStream())    // calling to all users with the local stream
                prev[user.peerId] = {name: user.name, call, isCam: false, isMic: false}
            })
            return {...prev};
        })
        
        setTimeout(() => {
            socketRef.current!.emit('cam', peerRef.current!.id, !!mediaState.current.cam);
            socketRef.current!.emit('mic', peerRef.current!.id, !!mediaState.current.mic);
        }, 1000)                                                                // broadcast local media status - delay is needed because it takes some time to establish peer connection
    }

    // get a new user info who just join the meeting
    const onAdd = (name: string, peerId: string) => {
        setUsers(prev => {
            prev[peerId] = {name, call: null, isCam: false, isMic: false};
            return {...prev};
        })
        
        setTimeout(() => {
            socketRef.current!.emit('cam', peerRef.current!.id, !!mediaState.current.cam);
            socketRef.current!.emit('mic', peerRef.current!.id, !!mediaState.current.mic);
        }, 1000)
    }

    // remove a user who left meeting
    const onLeft = (peerId: string) => {
        setUsers(prev => {
            delete prev[peerId];
            return {...prev};
        })
    }

    // update remote camera status
    const onCam = (peerId: string, value: boolean) => {
        setUsers(prev => {
            prev[peerId].isCam = value;
            return {...prev}
        })
    }

    // update remote microphone status
    const onMic = (peerId: string, value: boolean) => {
        setUsers(prev => {
            prev[peerId].isMic = value;
            return {...prev}
        })
    }

    // send new tracks through peer connection list
    const startTracks = (tracks: {[key: string]: MediaStreamTrack}, videoOrAudio: ('video' | 'audio')[]) => {
        setUsers(prev => {
            Object.keys(prev).filter(key => key !== 'local').forEach(peerId => {
                if (prev[peerId].call) {
                    videoOrAudio.forEach(media => {
                        const sender = prev[peerId].call!.peerConnection.getSenders().find((s: any) => s.track?.kind === media);
                        if (sender) {
                            sender.replaceTrack(tracks[media]);                         // replace the track
                        }
                    })
                } else {
                    prev[peerId].call = peerRef.current!.call(
                        peerId, 
                        new MediaStream(["audio", "video"].map(key => {
                            if (tracks[key]) {
                                return tracks[key];
                            } else {
                                return getEmptyTrack(key);
                            }
                        }))
                    );
                }
            })
            return {...prev};
        })
    }
    // stop track through peer connection list
    const stopTracks = (videoOrAudio: ('video' | 'audio')[]) => {
        setUsers(prev => {
            Object.keys(prev).filter(key => key !== 'local').forEach(peerId => {
                videoOrAudio.forEach(media => {
                    const sender = prev[peerId].call?.peerConnection.getSenders().find((s: any) => s.track?.kind === media);
                    if (sender) {
                        sender.track?.stop();
                    }
                })
            })
            return {...prev};
        })
    }

    // update camera status
    useEffect(() => {
        if (cam === true) {
            streamRef.current && startTracks({
                video: streamRef.current.getVideoTracks()[0]
            }, ['video']);
        } else if (cam === false) {
            stopTracks(['video']);
        }
        setUsers(prev => {
            prev['local'].isCam = !!cam;
            return {...prev}
        })
        socketRef.current!.emit('cam', peerRef.current!.id, !!cam);
        mediaState.current.cam = cam;
    }, [cam])

    // update microphone status
    useEffect(() => {
        if (mic === true) {
            startTracks({
                audio: streamRef.current!.getAudioTracks()[0]
            }, ['audio']);
        } else if (mic === false) {
            stopTracks(['audio']);
        }
        setUsers(prev => {
            prev['local'].isMic = !!mic;
            return {...prev}
        })
        socketRef.current!.emit('mic', peerRef.current!.id, !!mic);
        mediaState.current.mic = mic;
    }, [mic])

    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.onaddtrack = (ev) => {
                const track = ev.track;
                startTracks({[track.kind === 'videoinput' ? 'video' : 'audio']: track}, [track.kind === 'videoinput' ? 'video' : 'audio'])
            }
        }
    }, [streamRef.current])

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase());
        }, 1000);

        socketRef.current!.on('onJoin', (userList) => onJoin(userList));
        socketRef.current!.on('onAdd', (name, peerId) => onAdd(name, peerId));
        socketRef.current!.on('left', (peerId) => onLeft(peerId));
        socketRef.current!.on('onCam', (peerId, value) => onCam(peerId, value));
        socketRef.current!.on('onMic', (peerId, value) => onMic(peerId, value));
        socketRef.current!.emit('join', link, name, peerRef.current!.id);
        peerRef.current!.on('call', (call) => {
            setUsers(prev => {
                prev[call.peer].call = call;
                return {...prev};
            })
        });

        return () => {
            clearInterval(timer);
        }
    }, [])

    
    if (socketRef.current === null || peerRef.current === null) {
        return null
    }

    return (
        <div className="w-screen h-screen bg-(--room-background) flex justify-between">
            <div className="flex-1 h-full flex flex-col justify-between">
                <Image src={Brand} alt="Airtime" className="w-52 my-2 mx-4"/>
                <div className="w-full h-[calc(100vh-9rem)]">
                    <VideoLayout users={users}/>
                </div>
                <div className="relative w-full flex justify-end">
                    <div className="text-white text-lg font-medium px-8 py-4">
                        <span>{link}</span> <span className={time ? 'inline-block' : 'hidden'}> | {time}</span>
                    </div>

                    <div className="absolute left-0 right-0 bottom-4 flex justify-center">
                        <ControlBar />
                    </div>
                </div>
            </div>
            <ChatBox />
        </div>
    )
}

export default Room;