import { useState, useCallback, useRef, useEffect } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';

const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on the client side
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current || isPlaying) return;

    setIsPlaying(true);

    try {
      if(sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }

      const decodedData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedData, audioContextRef.current, SAMPLE_RATE, NUM_CHANNELS);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      source.start();
      sourceNodeRef.current = source;
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { playAudio, isPlaying };
};
