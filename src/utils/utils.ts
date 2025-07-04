import { SettingType } from "@/components/control";
import { RefObject } from "react";

// check if the media device is granted or not
export const checkPermission = (name: PermissionName, setState: (value: boolean | undefined) => void) => {
  navigator.permissions
    .query({name})
    .then(status => {
        switch (status.state) {
            case `granted`:
                setState(false);
                break;
            case `denied`:
            case `prompt`:
                setState(undefined);
            default:
                break;
        }
    })
}


// get the available device list
export const getDeviceList = async (videoOrAudio: "video" | "audio") => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const list = devices.filter(device => videoOrAudio === 'audio' ? device.kind === 'audioinput' : device.kind === 'videoinput');
        const deviceList: MediaDeviceInfo[] = [];
        list.forEach((info) => {
            if (!deviceList.find(d => d.groupId === info.groupId)) {
                deviceList.push(info);
            } else {
                if (info.deviceId === 'default') {
                    const index = deviceList.findIndex(d => d.groupId === info.groupId);
                    deviceList[index] = info;
                }
            }
        })
        return deviceList;
    } catch (e) {
        return null
    }
}

// request camera permission
export const requestVideo = async (deviceId?: string) => {
    return navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            deviceId
        },
        audio: false
    }).then(stream => stream).catch(err => null)
}

// request audio permission
export const requestAudio = async (constraint: SettingType, deviceId?: string) => {
    return navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
            ...constraint,
            deviceId
        }
    }).then(stream => stream).catch(err => null)
}

// merge two streams
export const mergeStream = (ref: RefObject<MediaStream | null>, stream: MediaStream, videoOrAudio: 'video' | 'audio' | 'both') => {
  if (ref.current) {
    if (videoOrAudio === "video") {
      ref.current.getVideoTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
      });
      ref.current.addTrack(stream.getVideoTracks()[0]);
      ref.current.dispatchEvent(new MediaStreamTrackEvent('addtrack', {track: stream.getVideoTracks()[0]}));
    } else if (videoOrAudio === "audio") {
      ref.current.getAudioTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
      });
      ref.current.addTrack(stream.getAudioTracks()[0]);
      ref.current.dispatchEvent(new MediaStreamTrackEvent('addtrack', {track: stream.getAudioTracks()[0]}));
    } else {
      ref.current.getTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
      });
      stream.getTracks().forEach(track => {
        ref.current!.addTrack(track);
        ref.current!.dispatchEvent(new MediaStreamTrackEvent('addtrack', {track}));
      });
    }
  } else {
    ref.current = stream;
  }
}

// remove a track from the stream
export const splitStream = (ref: RefObject<MediaStream | null>, videoOrAudio: 'video' | 'audio' | 'both') => {
  if (ref.current) {
    if (videoOrAudio === "video") {
      ref.current.getVideoTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
        ref.current!.dispatchEvent(new MediaStreamTrackEvent('removetrack', {track}));
      });
    } else if (videoOrAudio === "audio") {
      ref.current.getAudioTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
        ref.current!.dispatchEvent(new MediaStreamTrackEvent('removetrack', {track}));
      });
    } else {
      ref.current.getTracks().forEach(track => {
        track.stop();
        ref.current!.removeTrack(track);
        ref.current!.dispatchEvent(new MediaStreamTrackEvent('removetrack', {track}));
      });
    }
  }
}

// calculate the grid layout of the meeting room according to the user number
export const calculateGrid = (length: number) => {
  const row = Math.floor(Math.sqrt(length));
  const col = Math.ceil(length / row);
  return {row, col};
}