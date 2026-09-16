import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Trash2, Volume2, AlertCircle } from 'lucide-react';

interface VoiceNoteRecorderProps {
  audioData: string | undefined;
  duration: number | undefined;
  onChange: (audioData: string | undefined, duration: number | undefined) => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  audioData,
  duration,
  onChange
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio element and stream when unmounting
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startRecording = async () => {
    setMicError(null);
    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('આ બ્રાઉઝરમાં માઇક્રોફોન સપોર્ટ નથી.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onChange(base64Audio, recordSeconds);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('માઇક્રોફોન પરવાનગી (Permission) નકારી છે. સેટિંગ્સમાંથી માઇક મંજૂર કરો.');
      } else {
        setMicError('માઇક્રોફોન શરૂ કરવામાં સમસ્યા આવી.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioData) return;

    if (isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (!audioElementRef.current) {
        const audio = new Audio(audioData);
        audioElementRef.current = audio;

        audio.ontimeupdate = () => {
          setPlaybackSeconds(Math.floor(audio.currentTime));
        };

        audio.onended = () => {
          setIsPlaying(false);
          setPlaybackSeconds(0);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setMicError('ઑડિયો વગાડવામાં ક્ષતિ થઈ.');
        };
      } else {
        audioElementRef.current.currentTime = 0;
      }

      audioElementRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error(e);
          setIsPlaying(false);
        });
    }
  };

  const deleteRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackSeconds(0);
    setRecordSeconds(0);
    onChange(undefined, undefined);
  };

  return (
    <div className="bg-rose-50/50 border border-rose-200/70 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-rose-600" />
          <span>વોઇસ નોટ (માઇક વડે બોલીને નોંધ કરો)</span>
        </span>
        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
          ટાઇપ કર્યા વગર
        </span>
      </div>

      <p className="text-[11px] text-slate-500">
        ગુજરાતીમાં લખવામાં વાર લાગતી હોય તો બોલીને ઓડિયો સેવ કરો, શૂટ વખતે સાંભળી શકાશે.
      </p>

      {/* Mic Error Notification */}
      {micError && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording in Progress UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-600 text-white p-3 rounded-xl shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span className="text-xs font-bold">ઓડિયો રેકોર્ડિંગ ચાલુ છે...</span>
            <span className="text-xs font-black bg-rose-700/80 px-2 py-0.5 rounded-md">
              {formatSecs(recordSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 text-xs font-black flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-rose-700" />
            <span>પૂરું કરો (Stop)</span>
          </button>
        </div>
      ) : audioData ? (
        /* Audio Recorded Preview UI */
        <div className="bg-white border border-emerald-300/80 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={togglePlayback}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white shadow-sm'
              }`}
              title={isPlaying ? 'વિરામ (Pause)' : 'સાંભળો (Play)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>વોઇસ નોટ રેકોર્ડ થઈ ગઈ</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isPlaying
                  ? `${formatSecs(playbackSeconds)} / ${formatSecs(duration || recordSeconds)} વાગી રહ્યું છે`
                  : `સમયગાળો: ${formatSecs(duration || recordSeconds)}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={startRecording}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95"
              title="ફરીથી રેકોર્ડ કરો"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={deleteRecording}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-95"
              title="વોઇસ નોટ રદ કરો"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Start Recording Button */
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-rose-300 bg-white hover:bg-rose-50/50 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span>રેકોર્ડ વોઇસ નોટ (Record Voice Note)</span>
        </button>
      )}
    </div>
  );
};
