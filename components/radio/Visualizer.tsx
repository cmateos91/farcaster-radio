'use client';

import { useEffect, useRef, useState } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

const BAR_COUNT = 16;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 48;

export function AudioVisualizer() {
    const tracks = useTracks([Track.Source.Microphone]);
    const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(MIN_HEIGHT));
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        // Buscar un track de audio activo
        const audioTrack = tracks.find(t =>
            t.publication?.track?.mediaStream
        );

        if (!audioTrack?.publication?.track?.mediaStream) {
            // Sin audio, mostrar animacion CSS fallback
            return;
        }

        const mediaStream = audioTrack.publication.track.mediaStream;

        // Crear AudioContext y Analyser
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Funcion de animacion
        const animate = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            // Mapear frecuencias a barras
            const newBars = [];
            const step = Math.floor(bufferLength / BAR_COUNT);

            for (let i = 0; i < BAR_COUNT; i++) {
                const start = i * step;
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArray[start + j] || 0;
                }
                const avg = sum / step;
                // Normalizar a altura de barra
                const height = MIN_HEIGHT + (avg / 255) * (MAX_HEIGHT - MIN_HEIGHT);
                newBars.push(height);
            }

            setBars(newBars);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [tracks]);

    // Si no hay tracks, mostrar animacion CSS
    const hasAudio = tracks.length > 0;

    return (
        <div className="flex items-end justify-center gap-1 h-12">
            {bars.map((height, i) => (
                <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-75 ${
                        hasAudio
                            ? 'bg-gradient-to-t from-purple-600 to-pink-500'
                            : 'bg-gray-600 animate-music-bar'
                    }`}
                    style={{
                        height: hasAudio ? `${height}px` : '100%',
                        animationDelay: hasAudio ? undefined : `${i * 0.1}s`,
                        animationDuration: hasAudio ? undefined : '0.8s',
                    }}
                />
            ))}
        </div>
    );
}

// Visualizador simple con animacion CSS (para cuando no hay audio)
export function SimpleVisualizer() {
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(BAR_COUNT)].map((_, i) => (
                <div
                    key={i}
                    className="w-2 bg-purple-500 rounded-full animate-music-bar"
                    style={{
                        height: '100%',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                    }}
                />
            ))}
        </div>
    );
}
