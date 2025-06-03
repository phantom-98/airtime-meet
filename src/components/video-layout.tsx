'use client'

import { useMemo } from "react";
import VideoPlayer from "./video-player";
import { calculateGrid } from "@/utils/utils";
import { MediaConnection } from "peerjs";

export type UserType = {
    name: string,
    call: MediaConnection | null,
    isCam: boolean,
    isMic: boolean,
}

// grid layout for the meeting room
const VideoLayout = ({users}: {users: {[key: string]: UserType}}) => {
    const grid = useMemo(() => {
        return calculateGrid(Object.keys(users).length);
    }, [users])
    
    return (
        <div className={`w-full h-full gap-1 px-4 pb-4 grid`} style={{
            gridTemplateColumns: `repeat(${grid.col}, minmax(0,1fr))`,
            gridTemplateRows: `repeat(${grid.row}, minmax(0,1fr))`
        }}>
            {Object.entries(users).map(([key, user], i) => {
                return <div key={'userlist_' + i + key} className={`object-cover overflow-hidden`}>
                    <VideoPlayer peerId={key} name={user.name} call={user.call} isCam={user.isCam} isMic={user.isMic} isLocal={key === 'local'}/>
                </div>
            })}
        </div>
    )
}

export default VideoLayout;