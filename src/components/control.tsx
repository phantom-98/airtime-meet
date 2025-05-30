'use client';
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import UpIcon from '@/assets/icons/up.svg'
import CheckIcon from '@/assets/icons/check.svg'
import MicOnIcon from '@/assets/icons/mic-on.svg'
import MicOffIcon from '@/assets/icons/mic-off.svg'
import CamOnIcon from '@/assets/icons/cam-on.svg'
import CamOffIcon from '@/assets/icons/cam-off.svg'
import ShareIcon from '@/assets/icons/share.svg'
import MessageIcon from '@/assets/icons/msg.svg'
import EndIcon from '@/assets/icons/end.svg'
import SettingIcon from '@/assets/icons/setting.svg'
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAppContext } from "@/context/app-context";
import { checkPermission, getDeviceList, mergeStream, requestAudio, requestVideo, splitStream } from "@/utils/utils";
import Switch from "./switch";

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
    setting?: string,
    onSetting?: () => void,
    onChoose?: (value: string) => void,
    onClick: (value: boolean) => void
}

const Control = React.memo(({contextMenu, defaultDevice, enable, icon, onChoose, onClick, size, setting, onSetting}: ControlProps) => {
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
                        <div className="w-4">{menu.value === defaultDevice && <Image src={CheckIcon} alt="c" className="w-4 aspect-square"/>}</div>
                        <div className="text-nowrap">{menu.label}</div>
                    </div>
                ))}
                {setting && onSetting && (
                    <div onClick={() => {
                        onSetting();
                        setOpen(false);
                    }} className="flex gap-2 px-4 py-2 cursor-pointer hover:bg-(--control-background-light) border-t border-gray-500">
                        <Image src={SettingIcon} alt="c" className="w-4 aspect-square"/>
                        <div className="text-nowrap">{setting}</div>
                    </div>
                )}
            </div>}
        </div>
    )
})

export default Control;

const ControlButton = ({icon, onClick, className = ''}: {icon: string | StaticImport, onClick: () => void, className?: string}) => {
    return <div onClick={onClick} className={`flex items-center justify-center size-12 cursor-pointer rounded-full bg-(--control-background-light) ${className}`}>
            <Image src={icon} alt='m' className='aspect-square w-6'/>
        </div>
}

type MediaControlType = {
    size?: 'small' | 'large'
}

export const MicControl = ({size = 'small'}: MediaControlType) => {
    const {streamRef, mic, setMic, audioDevice, setAudioDevice} = useAppContext()!;
    const [micList, setMicList] = useState<{value: string, label: string}[]>();
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<SettingType>({
        autoGainControl: false,
        noiseSuppression: true,
        echoCancellation: true
    })
    
    const updateSetting = async () => {
        if (mic) {
            const stream = await requestAudio(settings, audioDevice);
            if (stream) {
                setMic(true);
                mergeStream(streamRef, stream, 'audio')
                return;
            }
        }
    }
    useEffect(() => {
        mic === undefined && checkPermission('microphone', setMic);
        const local = localStorage.getItem('audio')
        local && setSettings(prev => ({...prev, ...JSON.parse(local)}))
    }, [])
    useEffect(() => {
        localStorage.setItem('audio', JSON.stringify(settings));
        updateSetting();
    }, [settings])
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
                    const stream = await requestAudio(settings, audioDevice);
                    if (stream) {
                        setMic(true);
                        mergeStream(streamRef, stream, 'audio')
                        return;
                    }
                }
                splitStream(streamRef, 'audio'),
                setMic(false);
            }} onChoose={async (id) => {
                setAudioDevice(id);
                if (mic) {
                    const stream = await requestAudio(settings, id);
                    if (stream) {
                        mergeStream(streamRef, stream, 'audio');
                    }
                }
            }} onSetting={() => {
                setOpen(true);
            }} setting={size === 'small' ? '':"Audio Settings"} enable={mic} size={size}/>
            {open && (
                <SettingDialog isOpen={open} setOpen={setOpen} settings={settings} setSettings={setSettings}/>
            )}
        </>
    )
}

export const CamControl = ({size = 'small'}: MediaControlType) => {
    const {streamRef, cam, setCam, videoDevice, setVideoDevice} = useAppContext()!;
    const [camList, setCamList] = useState<{value: string, label: string}[]>();
    
    useEffect(() => {
        cam === undefined && checkPermission('camera', setCam);
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
            }} onChoose={async (id) => {
                setVideoDevice(id);
                if (cam) {
                    const stream = await requestVideo(id);
                    if (stream) {
                        mergeStream(streamRef, stream, 'video');
                    }
                }
            }} enable={cam} size={size}/>
        </>
    )
}

export const ControlBar = () => {
    return (
        <div className="flex items-center gap-4">
            <MicControl size="large"/>
            <CamControl size="large" />

            <ControlButton icon={ShareIcon} onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                }} />
            
            <ControlButton icon={EndIcon} onClick={() => {
                    window.location.href = '/';
                    // window.location.reload();
                }} className='w-16 !bg-(--control-background-disabled-light)'/>
        </div>
    )
}

type SettingProps = {
    isOpen: boolean,
    setOpen: (value: boolean) => void,
    settings: SettingType,
    setSettings: Dispatch<SetStateAction<SettingType>>
}


export type SettingType = {
    autoGainControl: boolean,
    noiseSuppression: boolean,
    echoCancellation: boolean
}

export const SettingDialog = ({setSettings, settings, isOpen, setOpen}: SettingProps) => {
    return <>
        <div onClick={() => setOpen(false)} className="z-20 fixed top-0 left-0 bottom-0 right-0 flex items-center justify-center">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg flex flex-col gap-4 p-12 shadow-2xl">
                {Object.entries(settings).map(([key, value]) => {
                    return <div key={'setting_' + key} className="flex items-center justify-between gap-8">
                            <span className="text-xl">{key}</span>
                            <Switch value={value} onToggle={(value) => {
                                setSettings(prev => {
                                    prev[key as keyof SettingType] = value;
                                    return {...prev};
                                })
                            }}/>
                        </div>
                })}

            </div>
        </div>
    </>
}