import { useRef, useCallback, useEffect, useState } from "react";

export function useWebSocket(onMessage) {
  const ws    = useRef(null);
  const retry = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url   = import.meta.env.DEV
      ? "ws://localhost:8080/ws/workout"
      : `${proto}://${window.location.host}/ws/workout`;

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen    = () => { setConnected(true); clearTimeout(retry.current); };
    socket.onclose   = () => { setConnected(false); retry.current = setTimeout(connect, 2500); };
    socket.onerror   = () => socket.close();
    socket.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => { clearTimeout(retry.current); ws.current?.close(); };
  }, [connect]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify(data));
  }, []);

  return { send, connected };
}
