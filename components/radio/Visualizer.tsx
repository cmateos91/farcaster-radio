'use client';

import { useEffect, useRef, useState } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

const BAR_COUNT = 20;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 56;

export function AudioVisualizer() {
    const tracks = useTracks([Track.Source.Microphone]);
    const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(MIN_HEIGHT));
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const audioTrack = tracks.find(t => t.publication?.track?.mediaStream);

        if (!audioTrack?.publication?.track?.mediaStream) {
            return;
        }

        const mediaStream = audioTrack.publication.track.mediaStream;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const animate = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            const newBars = [];
            const step = Math.floor(bufferLength / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                const start = i * step;
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArray[start + j] || 0;
                }
                const avg = sum / step;
                const height = MIN_HEIGHT + (avg / 255) * (MAX_HEIGHT - MIN_HEIGHT);
                newBars.push(height);
            }

            setBars(newBars);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [tracks]);

    const hasAudio = tracks.length > 0;

    return (
        <div className="flex items-end justify-center gap-[3px] h-14">
            {bars.map((height, i) => (
                <div
                    key={i}
                    className={`w-[6px] rounded-full ${hasAudio ? 'transition-all duration-75' : 'animate-music-bar'}`}
                    style={{
                        height: hasAudio ? `${height}px` : '100%',
                        background: hasAudio
                            ? 'linear-gradient(to top, #a855f7, #ec4899)'
                            : 'rgba(168, 85, 247, 0.3)',
                        opacity: hasAudio ? 1 : 0.5,
                        animationDelay: hasAudio ? undefined : `${i * 0.05}s`,
                    }}
                />
            ))}
        </div>
    );
}
