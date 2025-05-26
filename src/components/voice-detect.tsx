'use client';

import { useMicVAD } from "@ricky0123/vad-react";
import { useState } from "react";

type VoiceDetectorProps = {
    dotCount?: number,
    size?: 'small' | 'large',
    startOnLoad?: boolean,
    onSpeechStart?: () => void,
    onSpeechEnd?: () => void
}

const VoiceDetector = ({dotCount = 3, size = 'small', startOnLoad = true, onSpeechEnd, onSpeechStart}: VoiceDetectorProps) => {
    const [loading, setLoading] = useState(false);
    useMicVAD({
        model: "v5",
        startOnLoad,
        // baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.24/dist/",
        // onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
        userSpeakingThreshold: 0.1,
        minSpeechFrames: 0.1,
        onSpeechStart: () => {
        setLoading(true);
        onSpeechStart && onSpeechStart();
        },
        onSpeechEnd: () => {
        setLoading(false);
        onSpeechEnd && onSpeechEnd();
        },
    });
    return (
        size  === 'large'
            ? <span className="relative flex size-16">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-(--secondary-color) opacity-75 ${loading && 'animate-ping'}`}></span>
                <span className="relative inline-flex size-16 rounded-full bg-(--secondary-color)"></span>
            </span>
            : <div className='voice-detector' data-loading={loading}>
                {new Array(dotCount)
                    .fill(1).map((_, index) => (
                        <i key={'vd_' + index} style={{animationDelay: `${index * 0.2}s`}}></i>
                    ))}
            </div>
    )
}

export default VoiceDetector;