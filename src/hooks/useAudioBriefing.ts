import { useState, useEffect, useCallback, useRef } from 'react';

export interface AudioBriefingState {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/**
 * Hook for playing audio briefings using the browser's native Web Speech API.
 * 
 * Provides playback controls (play, pause, resume, stop) and tracks audio state.
 */
export function useAudioBriefing(): AudioBriefingState {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  const play = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    isSupported,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
  };
}
