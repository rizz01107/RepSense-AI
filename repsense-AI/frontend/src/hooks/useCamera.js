import { useRef, useState, useCallback } from "react";

export function useCamera({ onFrame, frameRate = 20 }) {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef   = useRef(document.createElement("canvas"));
  const [active, setActive] = useState(false);
  const [error,  setError]  = useState(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width:640, height:480, facingMode:"user", frameRate:{ ideal:30 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true); setError(null);

      intervalRef.current = setInterval(() => {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        const c = canvasRef.current;
        c.width = 640; c.height = 480;
        c.getContext("2d").drawImage(v, 0, 0, 640, 480);
        onFrame(c.toDataURL("image/jpeg", 0.75).split(",")[1]);
      }, 1000 / frameRate);

    } catch(e) {
      setError(e.message || "Camera access denied");
    }
  }, [onFrame, frameRate]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setActive(false);
  }, []);

  return { videoRef, active, error, start, stop };
}
