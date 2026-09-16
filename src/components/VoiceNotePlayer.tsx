import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface VoiceNotePlayerProps {
  audioData: string;
  duration?: number;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({ audioData, duration }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioData]);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        setCurrentSec(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentSec(0);
      };

      audio.onerror = () => {
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error(e);
          setIsPlaying(false);
        });
    }
  };

  return (
    <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 ${
            isPlaying ? 'bg-amber-500 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
          title={isPlaying ? 'વિરામ (Pause)' : 'સાંભળો (Play)'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>રેકોર્ડ કરેલી વોઇસ નોટ</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isPlaying
              ? `${formatSecs(currentSec)} / ${formatSecs(duration || 0)}`
              : duration
              ? `સમયગાળો: ${formatSecs(duration)}`
              : 'ઑડિયો સાંભળવા ક્લિક કરો'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0">
        <Volume2 className="w-4 h-4 text-rose-500" />
        <span>{isPlaying ? 'વાગી રહ્યું છે' : 'સાંભળો'}</span>
      </div>
    </div>
  );
};
