'use client';
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import UpIcon from '@/assets/icons/up.svg'
import CheckIcon from '@/assets/icons/check.svg'
import MicOnIcon from '@/assets/icons/mic-on.svg'
import MicOffIcon from '@/assets/icons/mic-off.svg'
import CamOnIcon from '@/assets/icons/cam-on.svg'
import CamOffIcon from '@/assets/icons/cam-off.svg'
import Image from 'next/image';
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/app-context";
import { checkPermission, getDeviceList, mergeStream, requestAudio, requestVideo, splitStream } from "@/utils/utils";

type OptionType = {
    value: string,
    label: string
}

type ControlProps = {
    contextMenu?: OptionType[],
    defaultDevice?: string,
    enable?: boolean,
    icon: {
        enabled: string | StaticImport,
        disabled: string | StaticImport
    },
    size: 'small' | 'large',
    onChoose?: (value: string) => void,
    onClick: (value: boolean) => void
}

const Control = ({contextMenu, defaultDevice, enable, icon, onChoose, onClick, size}: ControlProps) => {
    const [open, setOpen] = useState(false);

    return (
        <div className='control relative shadow-xl' data-disabled={!enable}>
            {contextMenu && (
                <div onClick={() => setOpen(!open)} className='up' data-size={size}>
                    <Image src={UpIcon} alt='^' className='cursor-pointer aspect-square'/>
                </div>
            )}
            <div onClick={() => onClick(!enable)} className='action-button' data-disabled={!enable} data-size={size}>
                <Image src={enable ? icon.enabled : icon.disabled} alt='m' className='aspect-square'/>
                {enable === undefined && <i>!</i>}
            </div>
            {open && contextMenu && <div className="absolute bottom-full mb-2 flex flex-col rounded-lg bg-(--context-menu-background) shadow-xl w-fit text-white text-sm overflow-hidden">
                {contextMenu.map((menu, i) => (
                    <div key={'menu_' + i} onClick={() => {
                        onChoose && onChoose(menu.value);
                        setOpen(false);
                    }} className="flex gap-2 px-4 py-2 cursor-pointer hover:bg-(--control-background-light)">
                        <div className="w-5">{menu.value === defaultDevice && <Image src={CheckIcon} alt="c" className="w-4 aspect-square"/>}</div>
                        <div className="text-nowrap">{menu.label}</div>
                    </div>
                ))}
            </div>}
        </div>
    )
}

export default Control;

export const MicControl = () => {
    const {streamRef, mic, setMic, audioDevice, setAudioDevice} = useAppContext()!;
    const [micList, setMicList] = useState<{value: string, label: string}[]>();
    
    useEffect(() => {
        checkPermission('microphone', setMic);
    }, [])
    useEffect(() => {
        if (mic && !micList) {
            getDeviceList('audio')
                .then(list => {
                    if (list && list.length > 0 && !list?.find(d => d.deviceId === 'default')) {
                        setAudioDevice(list[0].deviceId)
                    }
                    setMicList(list?.map(info => ({value: info.deviceId, label: info.label})) || undefined)
                })
        }
    }, [mic])
    return (
        <>
        <Control
            contextMenu={micList}
            defaultDevice={audioDevice}
            icon={{
            enabled: MicOnIcon,
            disabled: MicOffIcon
        }} onClick={async (on) => {
            if (on) {
                    const stream = await requestAudio(audioDevice);
                    if (stream) {
                        setMic(true);
                        mergeStream(streamRef, stream, 'audio')
                        return;
                    }
                }
                splitStream(streamRef, 'audio'),
                setMic(false);
        }} onChoose={(id) => {
                setAudioDevice(id);
            }} enable={mic} size='small'/>
        </>
    )
}



export const CamControl = () => {
    const {streamRef, cam, setCam, videoDevice, setVideoDevice} = useAppContext()!;
    const [camList, setCamList] = useState<{value: string, label: string}[]>();
    
    useEffect(() => {
        checkPermission('camera', setCam);
    }, [])
    useEffect(() => {
        if (cam && !camList) {
            getDeviceList('video')
                .then(list => {
                    if (list && list.length > 0 && !list?.find(d => d.deviceId === 'default')) {
                        setVideoDevice(list[0].deviceId)
                    }
                    setCamList(list?.map(info => ({value: info.deviceId, label: info.label})) || undefined)
                })
        }
    }, [cam])

    return (
        <>
        <Control
            contextMenu={camList}
            defaultDevice={videoDevice}
            icon={{
                enabled: CamOnIcon,
                disabled: CamOffIcon
            }} onClick={async (on) => {
                if (on) {
                    const stream = await requestVideo(videoDevice);
                    if (stream) {
                        setCam(true);
                        mergeStream(streamRef, stream, 'video')
                        return;
                    }
                }
                splitStream(streamRef, 'video'),
                setCam(false);
            }} onChoose={(id) => {
                setVideoDevice(id);
            }} enable={cam} size="small"/>
        </>
    )
}