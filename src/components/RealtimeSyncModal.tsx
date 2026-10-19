import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Wifi,
  WifiOff,
  Users,
  Copy,
  Check,
  Send,
  Zap,
  Activity,
  Globe,
  Monitor,
  Info,
  RefreshCw,
} from 'lucide-react';
import { realtimeSync, ConnectionStatus, SyncMessage } from '../utils/realtimeSync';

interface RealtimeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealtimeSyncModal: React.FC<RealtimeSyncModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeSync.status);
  const [serverUrlInput, setServerUrlInput] = useState<string>(realtimeSync.serverUrl || '');
  const [clientNameInput, setClientNameInput] = useState<string>(realtimeSync.clientName);
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(realtimeSync.isSyncEnabled);
  const [logs, setLogs] = useState<{ id: string; text: string; time: string; type: 'in' | 'out' | 'info' }[]>([]);
  const [peerCount, setPeerCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setStatus(realtimeSync.status);
    setServerUrlInput(realtimeSync.serverUrl || '');
    setClientNameInput(realtimeSync.clientName);
    setIsSyncEnabled(realtimeSync.isSyncEnabled);

    const unsubStatus = realtimeSync.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubMsg = realtimeSync.subscribe((msg: SyncMessage) => {
      const timeStr = new Date().toLocaleTimeString();
      setLogs((prev) => [
        {
          id: 'log_' + Date.now() + Math.random(),
          text: `[${msg.senderName}] ${msg.type}`,
          time: timeStr,
          type: 'in',
        },
        ...prev.slice(0, 30),
      ]);
      setPeerCount(realtimeSync.activePeers.size);
    });

    return () => {
      unsubStatus();
      unsubMsg();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverUrlInput.trim()) {
      realtimeSync.connectWebSocket(serverUrlInput.trim());
      addLog(`Conectando a WebSocket: ${serverUrlInput.trim()}`, 'info');
    } else {
      realtimeSync.disconnectWebSocket();
      addLog('Modo WebSocket desactivado (Usando Local Broadcast)', 'info');
    }
  };

  const handleDisconnectWs = () => {
    realtimeSync.disconnectWebSocket();
    setServerUrlInput('');
    addLog('Desconectado de WebSocket', 'info');
  };

  const handleNameChange = (name: string) => {
    setClientNameInput(name);
    realtimeSync.clientName = name;
  };

  const handleToggleSync = () => {
    const next = !isSyncEnabled;
    setIsSyncEnabled(next);
    realtimeSync.isSyncEnabled = next;
    addLog(`Sincronización en tiempo real: ${next ? 'ACTIVADA' : 'PAUSADA'}`, 'info');
  };

  const handleSendPing = () => {
    realtimeSync.broadcast({
      type: 'PING',
      payload: { time: Date.now() },
    });
    addLog('Ping enviado a todos los peers conectados', 'out');
  };

  const addLog = (text: string, type: 'in' | 'out' | 'info') => {
    setLogs((prev) => [
      {
        id: 'log_' + Date.now() + Math.random(),
        text,
        time: new Date().toLocaleTimeString(),
        type,
      },
      ...prev.slice(0, 30),
    ]);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>Comunicaciones Instantáneas & WebSockets</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    status === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : status === 'connecting'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {status === 'connected'
                    ? '● WebSocket Conectado'
                    : status === 'connecting'
                    ? 'Conectando...'
                    : '● Sincronización Local Activa'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Sincronización en vivo entre pestañas, ventanas y servidores remotos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Status Info Box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-zinc-300">Sincronización de Pestañas</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-mono font-medium">
                ✓ Activo (BroadcastChannel)
              </p>
              <p className="text-[10px] text-zinc-500">
                Funciona instantáneamente en Netlify sin necesidad de servidor externo.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-zinc-300">WebSocket Remoto</span>
              </div>
              <p
                className={`text-[11px] font-mono font-medium ${
                  status === 'connected'
                    ? 'text-emerald-400'
                    : status === 'connecting'
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {status === 'connected'
                  ? '✓ Conectado a Servidor'
                  : status === 'connecting'
                  ? '⏳ Conectando...'
                  : 'Desconectado (Opcional)'}
              </p>
              <p className="text-[10px] text-zinc-500">
                Para sincronizar dispositivos remotos en tiempo real.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-zinc-200 text-xs flex items-center justify-between">
              <span>Configuración del Nodo</span>
              <button
                onClick={handleToggleSync}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  isSyncEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {isSyncEnabled ? 'Sincronización: ON' : 'Sincronización: PAUSADA'}
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                  Tu Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={clientNameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="Tu nombre..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                  ID de Cliente
                </label>
                <input
                  type="text"
                  value={realtimeSync.clientId}
                  disabled
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-500 font-mono select-all"
                />
              </div>
            </div>

            {/* WebSocket Server Connection Form */}
            <form onSubmit={handleConnectWs} className="space-y-2 pt-2 border-t border-zinc-800/80">
              <label className="block text-[10px] uppercase font-mono text-zinc-400">
                Servidor WebSocket (URL wss:// o ws://)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="ej. wss://echo.websocket.events o ws://localhost:3000"
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
                {status === 'connected' && (
                  <button
                    type="button"
                    onClick={handleDisconnectWs}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick Actions & Live Telemetry */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Registro de Mensajes Instantáneos</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendPing}
                  className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors font-mono cursor-pointer"
                >
                  <Send className="w-2.5 h-2.5" />
                  <span>Enviar Ping</span>
                </button>
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors font-mono cursor-pointer"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 h-28 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1">
              {logs.length === 0 ? (
                <div className="text-zinc-400 text-center py-6">
                  Esperando eventos de comunicación en tiempo real...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between py-0.5 px-1.5 rounded ${
                      log.type === 'out'
                        ? 'bg-blue-950/40 text-blue-300'
                        : log.type === 'in'
                        ? 'bg-emerald-950/40 text-emerald-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    <span>{log.text}</span>
                    <span className="text-[9px] text-zinc-400">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-850 bg-zinc-900/50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Los cambios de capas y keyframes se propagan instantáneamente.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
