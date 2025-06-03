'use client';

import Image from "next/image";
import SendIcon from '@/assets/icons/send.svg'
import { useAppContext } from "@/context/app-context";
import { useEffect, useRef, useState } from "react";

type MessageType = {
    name: string, 
    peerId: string, 
    text: string
}

// chat box
const ChatBox = () => {
    const { showChat, setShowChat, setMsg, socketRef, peerRef, name } = useAppContext()!;
    const [text, setText] = useState('')
    const [msgs, setMsgs] = useState<MessageType[]>([])
    const chat = useRef<boolean>(showChat);

    useEffect(() => {
        chat.current = showChat;
    }, [showChat])

    // when new message arrived
    const onMsg = (message: MessageType) => {
        setMsgs(prev => [...prev, {...message}]);
        setMsg(chat.current === false);
    }

    // load messages right after a user join the room
    const loadMsg = (messages: MessageType[]) => {
        setMsgs(messages);
    }

    // send message to the room
    const sendMsg = () => {
        socketRef.current?.emit('msg', name, peerRef.current!.id, text);
        setMsgs(prev => [...prev, {name, peerId: peerRef.current!.id, text}]);
        setText('');
    }

    useEffect(() => {
        socketRef.current!.on('loadMsg', (messages: MessageType[]) => loadMsg(messages))
        socketRef.current!.on('onMsg', (message: MessageType) => onMsg(message))
    }, [])
    return (
        <>
        <div className={`h-full text-black w-sm bg-white rounded-xl flex-col p-4 ${showChat ? 'flex' : 'hidden'}`}>
            <div className="flex justify-end mb-2"><span onClick={() => setShowChat(false)} className="font-semibold cursor-pointer text-2xl text-gray-400">✕</span></div>
            <div className="flex-1 overflow-auto">
                <div className="flex flex-col gap-2">
                    {msgs.map((msg, i) => {

                        return (
                            <div key={'msg_' + i} className={`w-full flex flex-col ${msg.peerId === peerRef.current!.id ? 'items-end' : 'items-start'}`}>
                                {msg.peerId !== peerRef.current!.id && <span className="font-semibold">{msg.name}</span>}
                                <p className={`rounded-lg max-w-4/5 px-2 py-1 ${msg.peerId !== peerRef.current!.id ? 'bg-gray-300' : 'bg-gray-200'}`}>{msg.text}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="w-full p-1 flex items-center gap-2 border rounded-full border-gray-400">
                <textarea
                    value={text} 
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            if (!e.shiftKey) {
                                sendMsg();
                                e.preventDefault();
                            }
                        }
                    }}
                    placeholder="Type your message here" 
                    className="flex-1 pl-4 outline-none resize-none overflow-hidden h-4 leading-4" />
                <button onClick={sendMsg} className="size-11 cursor-pointer rounded-full border border-gray-400 flex items-center justify-center active:border-green-400"><Image src={SendIcon} alt="/" /></button>
            </div>
        </div>
        </>
    )
}
export default ChatBox;