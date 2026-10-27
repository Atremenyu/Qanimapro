import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Copy,
  Check,
  Radio,
  Terminal,
  Sparkles,
  Zap,
  Layers,
  Maximize2,
  Play,
  RotateCw,
  HelpCircle,
  ExternalLink,
  Cpu,
  ChevronRight,
  Code2,
  FileJson,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { realtimeSync, ConnectionStatus } from '../utils/realtimeSync';

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ClientTab = 'opencode' | 'claude' | 'cursor' | 'manual';

export const McpModal: React.FC<McpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('opencode');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<ConnectionStatus>(realtimeSync.status);
  const [bridgeUrl, setBridgeUrl] = useState<string>(realtimeSync.serverUrl || 'ws://localhost:49222');
  const [activePromptCategory, setActivePromptCategory] = useState<
    'huashu' | 'restaurantes' | 'pastelerias' | 'talleres' | 'reframe' | 'animaciones'
  >('huashu');

  useEffect(() => {
    if (!isOpen) return;
    setSyncStatus(realtimeSync.status);
    return realtimeSync.onStatusChange((status) => {
      setSyncStatus(status);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleConnectBridge = () => {
    if (syncStatus === 'connected') {
      realtimeSync.disconnectWebSocket();
    } else {
      realtimeSync.connectWebSocket(bridgeUrl);
    }
  };

  const opencodeConfig = `{
  "mcpServers": {
    "vectormotion": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp-server/index.ts"],
      "env": {
        "MCP_BRIDGE_PORT": "49222"
      }
    }
  }
}`;

  const claudeDesktopConfig = `{
  "mcpServers": {
    "vectormotion": {
      "command": "npx",
      "args": ["-y", "tsx", "/RUTA/ABSOLUTA/A/Qanimapro/mcp-server/index.ts"],
      "env": {
        "MCP_BRIDGE_PORT": "49222"
      }
    }
  }
}`;

  const cursorMcpConfig = `{
  "mcpServers": {
    "vectormotion": {
      "command": "node",
      "args": ["./node_modules/tsx/dist/cli.mjs", "mcp-server/index.ts"]
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="bg-zinc-900 border border-zinc-750 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-925">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Integración MCP con IA (OpenCode, Claude, Cursor)
                </h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                  Model Context Protocol
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Controla, diseña, anima y adapta composiciones en tiempo real desde tu asistente de IA preferido.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar / Bridge Connect */}
        <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              Puente WebSocket (Lienzo en Vivo):
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
                    : syncStatus === 'connecting'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-zinc-500'
                }`}
              />
              <span
                className={`font-semibold ${
                  syncStatus === 'connected'
                    ? 'text-emerald-400'
                    : syncStatus === 'connecting'
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}
              >
                {syncStatus === 'connected'
                  ? 'Conectado a VectorMotion'
                  : syncStatus === 'connecting'
                  ? 'Conectando...'
                  : 'Desconectado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={bridgeUrl}
              onChange={(e) => setBridgeUrl(e.target.value)}
              placeholder="ws://localhost:49222"
              className="bg-zinc-900 border border-zinc-750 text-zinc-200 text-xs px-2.5 py-1 rounded-lg w-48 font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleConnectBridge}
              className={`px-3 py-1 rounded-lg font-medium transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                syncStatus === 'connected'
                  ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              }`}
            >
              {syncStatus === 'connected' ? 'Desconectar' : 'Conectar Lienzo'}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Start Card */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-zinc-900 border border-purple-800/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>¿Cómo funciona el MCP de VectorMotion?</span>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                El servidor MCP traduce instrucciones en lenguaje natural de la IA en comandos directos para crear capas, aplicar animaciones fluidas con keyframes, cargar plantillas (restaurantes, pastelerías, talleres) y adaptar formatos (1:1, 9:16, 16:9) reflejándose en vivo en tu pantalla.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <code className="text-[11px] bg-black/60 text-purple-200 border border-purple-500/30 px-2.5 py-1.5 rounded-lg font-mono">
                npm run mcp
              </code>
              <button
                onClick={() => copyToClipboard('npm run mcp', 'cmd_npm')}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                {copiedKey === 'cmd_npm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar comando</span>
              </button>
            </div>
          </div>

          {/* Huashu-Design (花叔) Skill Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-600/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold px-2 py-0.5 rounded-full">
                  Skill Instalado
                </span>
                <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  花叔Design · Huashu-Design (v3.0)
                </h4>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                Skill de dirección de arte y diseño HTML nativo para agentes de IA: <strong>100% obligatorio proponer 3 direcciones divergentes</strong> antes de diseñar, con auditoría anti-clichés de IA y ritmo cinemático de animación. Instalado en <code className="text-amber-300 font-mono text-[11px] bg-black/50 px-1 py-0.5 rounded">skills/huashu-design</code> y activo para OpenCode y Claude Code.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActivePromptCategory('huashu')}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ver Prompts Huashu</span>
              </button>
            </div>
          </div>

          {/* Config Tabs Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-400" />
                Configuración según tu Cliente MCP
              </h3>
              <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('opencode')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'opencode'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  OpenCode
                </button>
                <button
                  onClick={() => setActiveTab('claude')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'claude'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  onClick={() => setActiveTab('cursor')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'cursor'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Cursor / Windsurf
                </button>
              </div>
            </div>

            {/* Config Box */}
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300">
              <button
                onClick={() => {
                  const text =
                    activeTab === 'opencode'
                      ? opencodeConfig
                      : activeTab === 'claude'
                      ? claudeDesktopConfig
                      : cursorMcpConfig;
                  copyToClipboard(text, 'config_copy');
                }}
                className="absolute top-3 right-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-750 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                {copiedKey === 'config_copy' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-medium">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-sans font-medium">Copiar JSON</span>
                  </>
                )}
              </button>

              {activeTab === 'opencode' && (
                <div className="space-y-3">
                  <div className="text-zinc-400 text-xs font-sans">
                    <strong>Paso 1:</strong> En la raíz de tu proyecto o en tu configuración de OpenCode (
                    <code className="text-indigo-400 bg-zinc-900 px-1 py-0.5 rounded">opencode.json</code>), pega el
                    siguiente bloque:
                  </div>
                  <pre className="text-emerald-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                    {opencodeConfig}
                  </pre>
                  <div className="text-zinc-400 text-xs font-sans">
                    <strong>Paso 2:</strong> En tu terminal, arranca el servidor con{' '}
                    <code className="text-indigo-400 bg-zinc-900 px-1 py-0.5 rounded">npm run mcp</code> (o déjalo
                    correr en segundo plano).
                  </div>
                </div>
              )}

              {activeTab === 'claude' && (
                <div className="space-y-3">
                  <div className="text-zinc-400 text-xs font-sans">
                    Agrega esto a tu archivo{' '}
                    <code className="text-indigo-400 bg-zinc-900 px-1 py-0.5 rounded">
                      ~/Library/Application Support/Claude/claude_desktop_config.json
                    </code>{' '}
                    (en Mac) o{' '}
                    <code className="text-indigo-400 bg-zinc-900 px-1 py-0.5 rounded">
                      %APPDATA%\Claude\claude_desktop_config.json
                    </code>{' '}
                    (en Windows):
                  </div>
                  <pre className="text-emerald-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                    {claudeDesktopConfig}
                  </pre>
                </div>
              )}

              {activeTab === 'cursor' && (
                <div className="space-y-3">
                  <div className="text-zinc-400 text-xs font-sans">
                    En Cursor o Windsurf, crea el archivo{' '}
                    <code className="text-indigo-400 bg-zinc-900 px-1 py-0.5 rounded">.cursor/mcp.json</code>:
                  </div>
                  <pre className="text-emerald-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                    {cursorMcpConfig}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Instruction & Prompt Cheat Sheet */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Instrucciones y Prompts que puedes pedirle a la IA
                </h3>
                <p className="text-xs text-zinc-400">
                  Haz clic en cualquier instrucción para copiarla y pegarla directamente en el chat con tu IA en OpenCode:
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setActivePromptCategory('huashu')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    activePromptCategory === 'huashu'
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'bg-zinc-800 text-amber-300 hover:text-white hover:bg-zinc-750'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>花叔 Huashu-Design</span>
                </button>
                <button
                  onClick={() => setActivePromptCategory('restaurantes')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    activePromptCategory === 'restaurantes'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Restaurantes
                </button>
                <button
                  onClick={() => setActivePromptCategory('pastelerias')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    activePromptCategory === 'pastelerias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Pastelerías
                </button>
                <button
                  onClick={() => setActivePromptCategory('talleres')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    activePromptCategory === 'talleres'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Talleres
                </button>
                <button
                  onClick={() => setActivePromptCategory('reframe')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    activePromptCategory === 'reframe'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Reframe &amp; Formatos
                </button>
                <button
                  onClick={() => setActivePromptCategory('animaciones')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    activePromptCategory === 'animaciones'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Animaciones
                </button>
              </div>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePromptCategory === 'huashu' && (
                <>
                  <PromptItem
                    title="Regla de Oro Huashu: 3 Direcciones Creativas Primero"
                    prompt='Actúa como Director de Arte con la metodología Huashu-Design (花叔). Para mi marca [Nombre], ejecuta primero huashu_design_directions. Preséntame 3 direcciones estéticas divergentes (Minimalista Editorial, Cinético Vibrante y Artesanal Cálido) con sus paletas de color y tipografías. Pregúntame cuál prefiero antes de construir el banner en VectorMotion.'
                    tool="huashu_design_directions"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_huashu_1"
                  />
                  <PromptItem
                    title="Auditoría Anti-Cliché de IA y Crítica de Diseño"
                    prompt="Ejecuta huashu_design_review sobre la composición activa de VectorMotion. Analiza si tiene clichés de IA (fondos warm cream genéricos, falta de jerarquía, tipografías débiles) y dime qué corregir para alcanzar nivel de estudio profesional."
                    tool="huashu_design_review"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_huashu_2"
                  />
                  <PromptItem
                    title="Ritmo Cinemático y Easing Profesional"
                    prompt="Aplica las mejores prácticas de animación de Huashu-Design en el banner actual: haz que los elementos entren de forma escalonada (staggered) usando curvas suaves de aceleración (power2Out y resorte suave en el CTA), evitando movimientos lineales o robóticos."
                    tool="animate_layer + gsap"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_huashu_3"
                  />
                  <PromptItem
                    title="Composición con Tipografía Monumental y Kicker"
                    prompt='Siguiendo las reglas de tipografía de Huashu-Design, añade un kicker en mayúsculas pequeñas espaciadas, ajusta el titular principal con peso 900 y añade una tarjeta de información modular estilo bento con colores de alto contraste.'
                    tool="create_layer + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_huashu_4"
                  />
                </>
              )}

              {activePromptCategory === 'restaurantes' && (
                <>
                  <PromptItem
                    title="Cargar Anuncio de Restaurante Bistró"
                    prompt='Carga la plantilla de restaurante bistró gourmet en VectorMotion y cambia el titular a "Asador Don Pedro · Cortes Prime"'
                    tool="apply_template + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_rest_1"
                  />
                  <PromptItem
                    title="Crear Promoción de Hamburguesas"
                    prompt='Crea un anuncio cuadrado 1080x1080 para "Burger Lab". Agrega un fondo oscuro #0f0d13, un titular "SMASH BURGER FEST 2X1", una insignia con precio "$189 MXN" y un botón "Pide por WhatsApp". Anima el titular con pop_bounce.'
                    tool="create_layer + animate_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_rest_2"
                  />
                  <PromptItem
                    title="Anuncio de Cafetería y Brunch"
                    prompt='Diseña un anuncio para "Café Central" con fondo crema #fdfaf6, textos en marrón oscuro #2d1810, y resalta "Cappuccinos de Especialidad & Repostería Francesa".'
                    tool="create_layer + set_canvas_background"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_rest_3"
                  />
                  <PromptItem
                    title="Actualizar Precios o Descuentos"
                    prompt='Busca la capa de precio o botón de compra y cambia el texto a "30% OFF de Lunes a Miércoles" con color amarillo #f59e0b.'
                    tool="update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_rest_4"
                  />
                </>
              )}

              {activePromptCategory === 'pastelerias' && (
                <>
                  <PromptItem
                    title="Cargar Plantilla Pastelería de Autor"
                    prompt='Aplica la plantilla "Dulce Encanto Pastelería" y cambia el nombre a "Pastelería Violeta · Repostería Artesanal y Macarons".'
                    tool="apply_template + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_past_1"
                  />
                  <PromptItem
                    title="Anuncio para Mesas de Postres y Bodas"
                    prompt='Crea un anuncio elegante para "Maison Patisserie" enfocado en mesas de postres para bodas y XV años. Fondo rosa pastel #fff1f2, detalles dorados y botón para agendar degustación.'
                    tool="create_layer + animate_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_past_2"
                  />
                  <PromptItem
                    title="Destacar Catálogo de Temporada"
                    prompt='Agrega una capa de texto que diga "Catálogo Navideño Disponible · Pedidos con Anticipación" en la parte inferior con animación slide_up.'
                    tool="create_layer + animate_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_past_3"
                  />
                  <PromptItem
                    title="Cambiar Paleta a Colores Cálidos"
                    prompt='Cambia el color de fondo a #1c1412 y actualiza los textos secundarios a color rosa fresa #f43f5e.'
                    tool="set_canvas_background + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_past_4"
                  />
                </>
              )}

              {activePromptCategory === 'talleres' && (
                <>
                  <PromptItem
                    title="Cargar Taller Mecánico Master Auto"
                    prompt='Carga la plantilla de taller mecánico en formato 9:16 y cambia el titular a "Taller Mecánico El Águila · Frenos y Afinación".'
                    tool="apply_template + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_tal_1"
                  />
                  <PromptItem
                    title="Taller de Carpintería y Muebles"
                    prompt='Carga la plantilla de carpintería y cambia la promoción a "Muebles a Medida de Parota y Roble · 15% de Descuento".'
                    tool="apply_template + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_tal_2"
                  />
                  <PromptItem
                    title="Workshop de Cerámica Artesanal"
                    prompt='Carga la plantilla de cerámica "Manos de Barro" y adapta la fecha a "Sábado 25 de Octubre · Cupo Limitado".'
                    tool="apply_template + update_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_tal_3"
                  />
                  <PromptItem
                    title="Insignia de Garantía y Confianza"
                    prompt='Crea una tarjeta rectangular con contorno verde esmeralda y el texto "Garantía de 12 meses por escrito en todas las reparaciones".'
                    tool="create_layer"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_tal_4"
                  />
                </>
              )}

              {activePromptCategory === 'reframe' && (
                <>
                  <PromptItem
                    title="Adaptar a Stories / Reels / TikTok (9:16)"
                    prompt="Adapta la composición actual a formato vertical 9:16 (1080x1920) reorganizando todos los elementos para que queden centrados y legibles."
                    tool="reframe_composition (preset: 9:16)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_ref_1"
                  />
                  <PromptItem
                    title="Adaptar a Formato Cuadrado (1:1)"
                    prompt="Haz un reframe del proyecto a formato cuadrado 1:1 (1080x1080) para Instagram Feed."
                    tool="reframe_composition (preset: 1:1)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_ref_2"
                  />
                  <PromptItem
                    title="Adaptar a Pantalla Panorámica (16:9)"
                    prompt="Reorganiza la composición a formato horizontal 16:9 (1920x1080) para pantallas de menú de restaurante o YouTube."
                    tool="reframe_composition (preset: 16:9)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_ref_3"
                  />
                  <PromptItem
                    title="Reframe a Medida Personalizada"
                    prompt="Adapta el lienzo a un banner de 600 de ancho por 500 de alto reorganizando las capas."
                    tool="reframe_composition (preset: custom)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_ref_4"
                  />
                </>
              )}

              {activePromptCategory === 'animaciones' && (
                <>
                  <PromptItem
                    title="Efecto Pop Bounce en el Titular"
                    prompt='Aplica la animación pop_bounce a la capa del titular principal desde el segundo 0.2 con duración de 0.7 segundos.'
                    tool="animate_layer (pop_bounce)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_anim_1"
                  />
                  <PromptItem
                    title="Entrada Deslizante (Slide Up)"
                    prompt='Aplica animación slide_up a la tarjeta de oferta para que suba suavemente al entrar en escena.'
                    tool="animate_layer (slide_up)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_anim_2"
                  />
                  <PromptItem
                    title="Pulsación Continua en el Botón CTA"
                    prompt='Haz que el botón de llamada a la acción tenga una animación pulse para llamar la atención del espectador.'
                    tool="animate_layer (pulse)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_anim_3"
                  />
                  <PromptItem
                    title="Reproducir y Probar Animación"
                    prompt="Inicia la reproducción de la composición desde el segundo 0 para evaluar el ritmo de las animaciones."
                    tool="control_playback (play / seek)"
                    copiedKey={copiedKey}
                    onCopy={copyToClipboard}
                    id="p_anim_4"
                  />
                </>
              )}
            </div>
          </div>

          {/* Tools Reference Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Catálogo de Herramientas (MCP Tools) Registradas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">get_composition</div>
                <div className="text-[11px] text-zinc-400">Obtiene dimensiones, duración, fps, fondo y lista de capas.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">list_layers</div>
                <div className="text-[11px] text-zinc-400">Lista capas con tipo, posición, estilo, textos y keyframes.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">create_layer</div>
                <div className="text-[11px] text-zinc-400">Crea textos, rectángulos, círculos, estrellas o polígonos.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">update_layer</div>
                <div className="text-[11px] text-zinc-400">Actualiza textos, tipografía, colores, posiciones y escala.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">animate_layer</div>
                <div className="text-[11px] text-zinc-400">Agrega presets: pop_bounce, slide_up, fade_in, pulse, spin.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">reframe_composition</div>
                <div className="text-[11px] text-zinc-400">Adapta y reorganiza a 1:1, 9:16, 16:9, banners o personalizado.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">apply_template</div>
                <div className="text-[11px] text-zinc-400">Carga plantillas profesionales animadas por palabra clave.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">set_canvas_background</div>
                <div className="text-[11px] text-zinc-400">Cambia el color de fondo del lienzo en tiempo real.</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-indigo-400">control_playback</div>
                <div className="text-[11px] text-zinc-400">Controla reproducción: play, pause, toggle y saltar en la línea.</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-600/40 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-amber-300">huashu_design_directions</div>
                <div className="text-[11px] text-zinc-300">Genera 3 direcciones divergentes (estilos, paletas, layout) para cualquier tema.</div>
              </div>
              <div className="bg-amber-950/30 border border-amber-600/40 p-2.5 rounded-lg space-y-1">
                <div className="font-mono font-semibold text-amber-300">huashu_design_review</div>
                <div className="text-[11px] text-zinc-300">Auditoría experta de diseño, anti-clichés de IA, ritmo de animación y contraste.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Listo para usar con OpenCode, Claude Desktop, Cursor y agentes compatibles con MCP.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

interface PromptItemProps {
  title: string;
  prompt: string;
  tool: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  id: string;
}

const PromptItem: React.FC<PromptItemProps> = ({ title, prompt, tool, copiedKey, onCopy, id }) => {
  const isCopied = copiedKey === id;
  return (
    <div
      onClick={() => onCopy(prompt, id)}
      className="p-3 bg-zinc-950/80 hover:bg-zinc-850/80 border border-zinc-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
            {title}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
            {tool}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 italic line-clamp-3">
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      <div className="flex items-center justify-end text-[10px] text-zinc-500 group-hover:text-indigo-400 font-medium gap-1">
        {isCopied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">¡Prompt Copiado!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Clic para copiar prompt</span>
          </>
        )}
      </div>
    </div>
  );
};
