#!/usr/bin/env node
/**
 * VectorMotion MCP Server
 * 
 * Model Context Protocol (MCP) server for OpenCode, Claude Desktop, Cursor, and Zed.
 * Allows AI assistants to inspect, create, modify, animate, and reframe compositions
 * in VectorMotion with real-time bidirectional WebSocket sync to the active browser canvas.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WebSocketServer, WebSocket } from 'ws';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// TYPES & DATA STRUCTURES
// ---------------------------------------------------------------------------

export interface Keyframe<T = any> {
  id: string;
  time: number;
  value: T;
  easing: string;
}

export interface AnimatableProp<T = any> {
  value: T;
  isKeyframed: boolean;
  keyframes: Keyframe<T>[];
}

export interface VectorLayer {
  id: string;
  name: string;
  type: 'rect' | 'circle' | 'star' | 'polygon' | 'path' | 'text' | 'line' | 'group' | 'image';
  visible: boolean;
  locked: boolean;
  solo: boolean;
  colorTag: string;
  motionBlur: boolean;
  expandedInTimeline?: boolean;
  modifiers?: any[];
  transform: {
    position: AnimatableProp<{ x: number; y: number }>;
    scale: AnimatableProp<{ x: number; y: number }>;
    rotation: AnimatableProp<number>;
    opacity: AnimatableProp<number>;
    anchorPoint: AnimatableProp<{ x: number; y: number }>;
    skew: AnimatableProp<{ x: number; y: number }>;
  };
  style: {
    fill: AnimatableProp<string>;
    fillOpacity: AnimatableProp<number>;
    fillType: string;
    stroke: AnimatableProp<string>;
    strokeWidth: AnimatableProp<number>;
    strokeOpacity: AnimatableProp<number>;
    strokeDashArray: AnimatableProp<string>;
    trimStart: AnimatableProp<number>;
    trimEnd: AnimatableProp<number>;
    trimOffset: AnimatableProp<number>;
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'miter' | 'bevel';
    blendMode: string;
    blur: AnimatableProp<number>;
    shadowColor: string;
    shadowBlur: AnimatableProp<number>;
    shadowOffsetX: number;
    shadowOffsetY: number;
  };
  rect?: {
    width: AnimatableProp<number>;
    height: AnimatableProp<number>;
    cornerRadius: AnimatableProp<number>;
  };
  circle?: {
    radiusX: AnimatableProp<number>;
    radiusY: AnimatableProp<number>;
  };
  star?: {
    points: AnimatableProp<number>;
    outerRadius: AnimatableProp<number>;
    innerRadius: AnimatableProp<number>;
  };
  polygon?: {
    sides: AnimatableProp<number>;
    radius: AnimatableProp<number>;
  };
  text?: {
    text: string;
    fontSize: AnimatableProp<number>;
    fontFamily: string;
    fontWeight: string;
    fontStyle?: string;
    letterSpacing?: AnimatableProp<number>;
    lineHeight?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  backgroundColor: string;
  layers: VectorLayer[];
  guides?: Array<{
    id: string;
    axis: 'horizontal' | 'vertical';
    position: number;
  }>;
}

// ---------------------------------------------------------------------------
// DEFAULT COMPOSITION STATE
// ---------------------------------------------------------------------------

function prop<T>(value: T, keyframes: Keyframe<T>[] = []): AnimatableProp<T> {
  return {
    value,
    isKeyframed: keyframes.length > 0,
    keyframes,
  };
}

function makeDefaultComposition(): Composition {
  return {
    id: 'comp_mcp_default',
    name: 'VectorMotion Proyecto IA',
    width: 1080,
    height: 1080,
    fps: 60,
    duration: 4.0,
    backgroundColor: '#0c0d12',
    layers: [
      {
        id: 'layer_bg',
        name: 'Fondo Canvas',
        type: 'rect',
        visible: true,
        locked: true,
        solo: false,
        colorTag: '#64748b',
        motionBlur: false,
        transform: {
          position: prop({ x: 540, y: 540 }),
          scale: prop({ x: 100, y: 100 }),
          rotation: prop(0),
          opacity: prop(100),
          anchorPoint: prop({ x: 0, y: 0 }),
          skew: prop({ x: 0, y: 0 }),
        },
        style: {
          fill: prop('#0c0d12'),
          fillOpacity: prop(100),
          fillType: 'solid',
          stroke: prop('none'),
          strokeWidth: prop(0),
          strokeOpacity: prop(0),
          strokeDashArray: prop(''),
          trimStart: prop(0),
          trimEnd: prop(100),
          trimOffset: prop(0),
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: prop(0),
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: prop(0),
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        rect: {
          width: prop(1080),
          height: prop(1080),
          cornerRadius: prop(0),
        },
      },
      {
        id: 'layer_title',
        name: 'Titular Principal',
        type: 'text',
        visible: true,
        locked: false,
        solo: false,
        colorTag: '#3b82f6',
        motionBlur: false,
        transform: {
          position: prop({ x: 540, y: 480 }, [
            { id: 'kf_t1', time: 0, value: { x: 540, y: 530 }, easing: 'power2Out' },
            { id: 'kf_t2', time: 0.6, value: { x: 540, y: 480 }, easing: 'power2Out' },
          ]),
          scale: prop({ x: 100, y: 100 }),
          rotation: prop(0),
          opacity: prop(100, [
            { id: 'kf_o1', time: 0, value: 0, easing: 'linear' },
            { id: 'kf_o2', time: 0.5, value: 100, easing: 'power2Out' },
          ]),
          anchorPoint: prop({ x: 0, y: 0 }),
          skew: prop({ x: 0, y: 0 }),
        },
        style: {
          fill: prop('#ffffff'),
          fillOpacity: prop(100),
          fillType: 'solid',
          stroke: prop('none'),
          strokeWidth: prop(0),
          strokeOpacity: prop(0),
          strokeDashArray: prop(''),
          trimStart: prop(0),
          trimEnd: prop(100),
          trimOffset: prop(0),
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: prop(0),
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: prop(0),
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        text: {
          text: 'VECTORMOTION STUDIO',
          fontSize: prop(56),
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '900',
          letterSpacing: prop(2),
          textAlign: 'center',
        },
      },
    ],
  };
}

let currentComposition: Composition = makeDefaultComposition();
let activeBrowserSockets: Set<WebSocket> = new Set();

// ---------------------------------------------------------------------------
// WEBSOCKET BRIDGE SERVER (PORT 49222)
// ---------------------------------------------------------------------------

const BRIDGE_PORT = parseInt(process.env.MCP_BRIDGE_PORT || '49222', 10);
let wss: WebSocketServer | null = null;

try {
  wss = new WebSocketServer({ port: BRIDGE_PORT });

  wss.on('connection', (ws) => {
    activeBrowserSockets.add(ws);
    // Send current composition on connect
    ws.send(
      JSON.stringify({
        type: 'SYNC_COMPOSITION',
        senderId: 'mcp_server',
        senderName: 'VectorMotion MCP',
        timestamp: Date.now(),
        payload: { composition: currentComposition },
      })
    );

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'SYNC_COMPOSITION' && msg.payload?.composition) {
          currentComposition = msg.payload.composition;
        } else if (msg.type === 'SYNC_LAYER_UPDATE' && msg.payload?.layerId && msg.payload?.updated) {
          currentComposition.layers = currentComposition.layers.map((l) =>
            l.id === msg.payload.layerId ? { ...l, ...msg.payload.updated } : l
          );
        }
      } catch {
        // ignore invalid json
      }
    });

    ws.on('close', () => {
      activeBrowserSockets.delete(ws);
    });

    ws.on('error', () => {
      activeBrowserSockets.delete(ws);
    });
  });
} catch (err) {
  console.error(`[MCP] No se pudo iniciar el WebSocket Bridge en el puerto ${BRIDGE_PORT}:`, err);
}

function broadcastToBrowser(type: string, payload: any) {
  const message = JSON.stringify({
    type,
    senderId: 'mcp_server',
    senderName: 'AI Studio MCP',
    timestamp: Date.now(),
    payload,
  });

  activeBrowserSockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
      } catch {
        // ignore send error
      }
    }
  });
}

// ---------------------------------------------------------------------------
// MCP SERVER INITIALIZATION
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: 'vectormotion-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ---------------------------------------------------------------------------
// 1. MCP TOOLS LIST
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_composition',
        description:
          'Obtiene el estado completo de la composición activa en VectorMotion (dimensiones, duración, fps, fondo, total de capas y lista de capas con sus IDs y nombres).',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_layers',
        description:
          'Lista todas las capas de la composición con sus detalles: tipo (text, rect, circle, star, polygon), posición, dimensiones, colores, texto y estado de animación.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_layer',
        description: 'Obtiene todos los detalles y propiedades avanzadas de una capa específica por su ID o nombre.',
        inputSchema: {
          type: 'object',
          properties: {
            layerIdOrName: {
              type: 'string',
              description: 'El ID único de la capa (ej: layer_title) o su nombre visible (ej: Titular Principal)',
            },
          },
          required: ['layerIdOrName'],
        },
      },
      {
        name: 'create_layer',
        description:
          'Crea y agrega una nueva capa a la composición (texto, rectángulo, círculo, estrella o polígono) con posición, colores y tipografía especificados.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['text', 'rect', 'circle', 'star', 'polygon'],
              description: 'Tipo de capa',
            },
            name: {
              type: 'string',
              description: 'Nombre identificativo de la capa',
            },
            text: {
              type: 'string',
              description: 'Contenido del texto (obligatorio si el tipo es text)',
            },
            fontSize: {
              type: 'number',
              description: 'Tamaño de fuente en píxeles (para capas de texto, ej: 48)',
            },
            x: {
              type: 'number',
              description: 'Posición X en el lienzo en píxeles (por defecto al centro)',
            },
            y: {
              type: 'number',
              description: 'Posición Y en el lienzo en píxeles (por defecto al centro)',
            },
            width: {
              type: 'number',
              description: 'Ancho en píxeles (para rectángulos)',
            },
            height: {
              type: 'number',
              description: 'Alto en píxeles (para rectángulos)',
            },
            radius: {
              type: 'number',
              description: 'Radio en píxeles (para círculos y polígonos)',
            },
            fill: {
              type: 'string',
              description: 'Color de relleno hexadecimal (ej: #3b82f6, #f59e0b, #e11d48 o "none")',
            },
            stroke: {
              type: 'string',
              description: 'Color de contorno hexadecimal (ej: #ffffff o "none")',
            },
            strokeWidth: {
              type: 'number',
              description: 'Grosor del contorno en píxeles',
            },
            cornerRadius: {
              type: 'number',
              description: 'Radio de esquinas redondeadas en píxeles (para rectángulos)',
            },
          },
          required: ['type', 'name'],
        },
      },
      {
        name: 'update_layer',
        description:
          'Actualiza las propiedades de una capa existente (cambiar texto, color de relleno, posición X/Y, escala, rotación, opacidad, tamaño de fuente, etc.) reflejándose en tiempo real.',
        inputSchema: {
          type: 'object',
          properties: {
            layerIdOrName: {
              type: 'string',
              description: 'El ID o nombre de la capa a modificar',
            },
            text: {
              type: 'string',
              description: 'Nuevo texto de la capa',
            },
            fill: {
              type: 'string',
              description: 'Nuevo color de relleno hexadecimal (ej: #10b981)',
            },
            x: {
              type: 'number',
              description: 'Nueva posición X en píxeles',
            },
            y: {
              type: 'number',
              description: 'Nueva posición Y en píxeles',
            },
            scaleX: {
              type: 'number',
              description: 'Escala porcentual en X (ej: 100)',
            },
            scaleY: {
              type: 'number',
              description: 'Escala porcentual en Y (ej: 100)',
            },
            rotation: {
              type: 'number',
              description: 'Rotación en grados (-360 a 360)',
            },
            opacity: {
              type: 'number',
              description: 'Opacidad de 0 a 100',
            },
            fontSize: {
              type: 'number',
              description: 'Tamaño de fuente para capas de texto',
            },
            width: {
              type: 'number',
              description: 'Ancho para rectángulos',
            },
            height: {
              type: 'number',
              description: 'Alto para rectángulos',
            },
            visible: {
              type: 'boolean',
              description: 'Visibilidad de la capa',
            },
          },
          required: ['layerIdOrName'],
        },
      },
      {
        name: 'animate_layer',
        description:
          'Agrega animaciones y keyframes a una capa (presets: fade_in, fade_out, pop_bounce, slide_up, slide_down, pulse, spin, o keyframes personalizados).',
        inputSchema: {
          type: 'object',
          properties: {
            layerIdOrName: {
              type: 'string',
              description: 'El ID o nombre de la capa a animar',
            },
            preset: {
              type: 'string',
              enum: ['fade_in', 'fade_out', 'pop_bounce', 'slide_up', 'slide_down', 'pulse', 'spin'],
              description: 'Efecto preestablecido de animación',
            },
            startTime: {
              type: 'number',
              description: 'Segundo de inicio de la animación en la línea de tiempo (ej: 0.2)',
            },
            duration: {
              type: 'number',
              description: 'Duración de la animación en segundos (ej: 0.65)',
            },
          },
          required: ['layerIdOrName', 'preset'],
        },
      },
      {
        name: 'delete_layer',
        description: 'Elimina una capa de la composición por su ID o nombre.',
        inputSchema: {
          type: 'object',
          properties: {
            layerIdOrName: {
              type: 'string',
              description: 'ID o nombre de la capa a eliminar',
            },
          },
          required: ['layerIdOrName'],
        },
      },
      {
        name: 'reframe_composition',
        description:
          'Adapta y reorganiza automáticamente todas las capas y la tipografía a un nuevo formato o tamaño (ej: 1:1 Cuadrado, 9:16 Vertical Story, 16:9 Panorámico, 600x500 Portada, 728x90 Leaderboard, o medidas personalizadas).',
        inputSchema: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
              enum: ['1:1', '9:16', '16:9', '600x500', '728x90', '300x250', '300x600', 'custom'],
              description: 'Formato preestablecido al que adaptar',
            },
            customWidth: {
              type: 'number',
              description: 'Ancho personalizado en píxeles si se usa custom',
            },
            customHeight: {
              type: 'number',
              description: 'Alto personalizado en píxeles si se usa custom',
            },
          },
          required: ['preset'],
        },
      },
      {
        name: 'apply_template',
        description:
          'Carga una plantilla profesional animada completa (Restaurantes, Pastelerías, Reposterías, Talleres mecánicos, Carpintería, Cerámica, etc.).',
        inputSchema: {
          type: 'object',
          properties: {
            templateKeyword: {
              type: 'string',
              description:
                'Palabra clave o ID de la plantilla: restaurante, pasteleria, reposteria, taller_mecanico, carpinteria, ceramica, burger, pizza, cafe, black_friday, año_nuevo, festival, halloween',
            },
          },
          required: ['templateKeyword'],
        },
      },
      {
        name: 'control_playback',
        description: 'Controla la reproducción de la animación (play, pause, toggle o saltar a un segundo específico).',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['play', 'pause', 'toggle', 'seek'],
              description: 'Acción de reproducción',
            },
            time: {
              type: 'number',
              description: 'Tiempo en segundos si action es seek (ej: 1.5)',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'set_canvas_background',
        description: 'Cambia el color de fondo del lienzo de la composición.',
        inputSchema: {
          type: 'object',
          properties: {
            color: {
              type: 'string',
              description: 'Color hexadecimal (ej: #090a0f, #ffffff, #1c1412, #06281e)',
            },
          },
          required: ['color'],
        },
      },
      {
        name: 'export_project_json',
        description: 'Exporta y devuelve la composición completa en formato JSON compatible con VectorMotion.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// ---------------------------------------------------------------------------
// 2. HELPER FUNCTIONS
// ---------------------------------------------------------------------------

function findLayer(layerIdOrName: string): VectorLayer | undefined {
  const query = layerIdOrName.trim().toLowerCase();
  return currentComposition.layers.find(
    (l) => l.id.toLowerCase() === query || l.name.toLowerCase() === query
  );
}

// ---------------------------------------------------------------------------
// 3. MCP TOOL EXECUTION HANDLER
// ---------------------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_composition': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: currentComposition.id,
                name: currentComposition.name,
                width: currentComposition.width,
                height: currentComposition.height,
                duration: currentComposition.duration,
                fps: currentComposition.fps,
                backgroundColor: currentComposition.backgroundColor,
                totalLayers: currentComposition.layers.length,
                connectedBrowserClients: activeBrowserSockets.size,
                layersSummary: currentComposition.layers.map((l) => ({
                  id: l.id,
                  name: l.name,
                  type: l.type,
                  position: l.transform.position.value,
                  visible: l.visible,
                  text: l.text?.text,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'list_layers': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              currentComposition.layers.map((l) => ({
                id: l.id,
                name: l.name,
                type: l.type,
                visible: l.visible,
                locked: l.locked,
                position: l.transform.position.value,
                scale: l.transform.scale.value,
                rotation: l.transform.rotation.value,
                opacity: l.transform.opacity.value,
                fill: l.style.fill.value,
                stroke: l.style.stroke.value,
                strokeWidth: l.style.strokeWidth.value,
                text: l.text?.text,
                fontSize: l.text?.fontSize.value,
                hasKeyframes:
                  l.transform.position.isKeyframed ||
                  l.transform.scale.isKeyframed ||
                  l.transform.opacity.isKeyframed ||
                  l.transform.rotation.isKeyframed,
              })),
              null,
              2
            ),
          },
        ],
      };
    }

    case 'get_layer': {
      const query = (args as any)?.layerIdOrName;
      const layer = findLayer(query);
      if (!layer) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se encontró la capa "${query}".` }],
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(layer, null, 2) }],
      };
    }

    case 'create_layer': {
      const type = (args as any).type as VectorLayer['type'];
      const layerName = (args as any).name;
      const x = (args as any).x ?? Math.round(currentComposition.width / 2);
      const y = (args as any).y ?? Math.round(currentComposition.height / 2);
      const fill = (args as any).fill || '#3b82f6';
      const stroke = (args as any).stroke || 'none';
      const strokeWidth = (args as any).strokeWidth || 0;
      const id = 'layer_' + Math.random().toString(36).substring(2, 9);

      const newLayer: VectorLayer = {
        id,
        name: layerName,
        type,
        visible: true,
        locked: false,
        solo: false,
        colorTag: fill.startsWith('#') ? fill : '#6366f1',
        motionBlur: false,
        transform: {
          position: prop({ x, y }),
          scale: prop({ x: 100, y: 100 }),
          rotation: prop(0),
          opacity: prop(100),
          anchorPoint: prop({ x: 0, y: 0 }),
          skew: prop({ x: 0, y: 0 }),
        },
        style: {
          fill: prop(fill),
          fillOpacity: prop(100),
          fillType: fill === 'none' ? 'none' : 'solid',
          stroke: prop(stroke),
          strokeWidth: prop(strokeWidth),
          strokeOpacity: prop(stroke === 'none' ? 0 : 100),
          strokeDashArray: prop(''),
          trimStart: prop(0),
          trimEnd: prop(100),
          trimOffset: prop(0),
          lineCap: 'round',
          lineJoin: 'round',
          blendMode: 'normal',
          blur: prop(0),
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowBlur: prop(0),
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
      };

      if (type === 'rect') {
        newLayer.rect = {
          width: prop((args as any).width || 400),
          height: prop((args as any).height || 100),
          cornerRadius: prop((args as any).cornerRadius || 16),
        };
      } else if (type === 'circle') {
        const r = (args as any).radius || 80;
        newLayer.circle = {
          radiusX: prop(r),
          radiusY: prop(r),
        };
      } else if (type === 'star') {
        newLayer.star = {
          points: prop((args as any).points || 5),
          outerRadius: prop((args as any).radius || 60),
          innerRadius: prop(Math.round(((args as any).radius || 60) * 0.5)),
        };
      } else if (type === 'polygon') {
        newLayer.polygon = {
          sides: prop(6),
          radius: prop((args as any).radius || 70),
        };
      } else if (type === 'text') {
        newLayer.text = {
          text: (args as any).text || 'Nuevo Texto',
          fontSize: prop((args as any).fontSize || 42),
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '900',
          letterSpacing: prop(1),
          textAlign: 'center',
        };
      }

      currentComposition.layers.push(newLayer);
      broadcastToBrowser('SYNC_COMPOSITION', { composition: currentComposition });

      return {
        content: [
          {
            type: 'text',
            text: `Capa "${layerName}" (${type}) creada con éxito con ID: ${id} en posición (${x}, ${y}).`,
          },
        ],
      };
    }

    case 'update_layer': {
      const query = (args as any).layerIdOrName;
      const layer = findLayer(query);
      if (!layer) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se encontró la capa "${query}".` }],
        };
      }

      if ((args as any).text !== undefined && layer.text) {
        layer.text.text = (args as any).text;
      }
      if ((args as any).fontSize !== undefined && layer.text) {
        layer.text.fontSize.value = (args as any).fontSize;
      }
      if ((args as any).fill !== undefined) {
        layer.style.fill.value = (args as any).fill;
        layer.style.fillType = (args as any).fill === 'none' ? 'none' : 'solid';
      }
      if ((args as any).x !== undefined || (args as any).y !== undefined) {
        const cur = layer.transform.position.value;
        layer.transform.position.value = {
          x: (args as any).x ?? cur.x,
          y: (args as any).y ?? cur.y,
        };
      }
      if ((args as any).scaleX !== undefined || (args as any).scaleY !== undefined) {
        const cur = layer.transform.scale.value;
        layer.transform.scale.value = {
          x: (args as any).scaleX ?? cur.x,
          y: (args as any).scaleY ?? cur.y,
        };
      }
      if ((args as any).rotation !== undefined) {
        layer.transform.rotation.value = (args as any).rotation;
      }
      if ((args as any).opacity !== undefined) {
        layer.transform.opacity.value = (args as any).opacity;
      }
      if ((args as any).width !== undefined && layer.rect) {
        layer.rect.width.value = (args as any).width;
      }
      if ((args as any).height !== undefined && layer.rect) {
        layer.rect.height.value = (args as any).height;
      }
      if ((args as any).visible !== undefined) {
        layer.visible = (args as any).visible;
      }

      broadcastToBrowser('SYNC_LAYER_UPDATE', { layerId: layer.id, updated: layer });

      return {
        content: [
          {
            type: 'text',
            text: `Capa "${layer.name}" (${layer.id}) actualizada correctamente.`,
          },
        ],
      };
    }

    case 'animate_layer': {
      const query = (args as any).layerIdOrName;
      const layer = findLayer(query);
      if (!layer) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se encontró la capa "${query}".` }],
        };
      }

      const preset = (args as any).preset;
      const start = (args as any).startTime ?? 0.2;
      const dur = (args as any).duration ?? 0.65;
      const end = start + dur;

      if (preset === 'fade_in') {
        layer.transform.opacity.isKeyframed = true;
        layer.transform.opacity.keyframes = [
          { id: 'kf_o1', time: start, value: 0, easing: 'linear' },
          { id: 'kf_o2', time: end, value: 100, easing: 'power2Out' },
        ];
      } else if (preset === 'fade_out') {
        layer.transform.opacity.isKeyframed = true;
        layer.transform.opacity.keyframes = [
          { id: 'kf_o1', time: start, value: 100, easing: 'linear' },
          { id: 'kf_o2', time: end, value: 0, easing: 'power2In' },
        ];
      } else if (preset === 'pop_bounce') {
        layer.transform.scale.isKeyframed = true;
        layer.transform.scale.keyframes = [
          { id: 'kf_s1', time: start, value: { x: 0, y: 0 }, easing: 'back' },
          { id: 'kf_s2', time: start + dur * 0.7, value: { x: 112, y: 112 }, easing: 'back' },
          { id: 'kf_s3', time: end, value: { x: 100, y: 100 }, easing: 'power2Out' },
        ];
      } else if (preset === 'slide_up') {
        const cur = layer.transform.position.value;
        layer.transform.position.isKeyframed = true;
        layer.transform.position.keyframes = [
          { id: 'kf_p1', time: start, value: { x: cur.x, y: cur.y + 80 }, easing: 'power2Out' },
          { id: 'kf_p2', time: end, value: { x: cur.x, y: cur.y }, easing: 'back' },
        ];
        layer.transform.opacity.isKeyframed = true;
        layer.transform.opacity.keyframes = [
          { id: 'kf_o1', time: start, value: 0, easing: 'linear' },
          { id: 'kf_o2', time: start + dur * 0.4, value: 100, easing: 'power2Out' },
        ];
      } else if (preset === 'slide_down') {
        const cur = layer.transform.position.value;
        layer.transform.position.isKeyframed = true;
        layer.transform.position.keyframes = [
          { id: 'kf_p1', time: start, value: { x: cur.x, y: cur.y - 80 }, easing: 'power2Out' },
          { id: 'kf_p2', time: end, value: { x: cur.x, y: cur.y }, easing: 'back' },
        ];
      } else if (preset === 'pulse') {
        layer.transform.scale.isKeyframed = true;
        layer.transform.scale.keyframes = [
          { id: 'kf_s1', time: start, value: { x: 100, y: 100 }, easing: 'easeInOut' },
          { id: 'kf_s2', time: start + dur * 0.5, value: { x: 110, y: 110 }, easing: 'easeInOut' },
          { id: 'kf_s3', time: end, value: { x: 100, y: 100 }, easing: 'easeInOut' },
        ];
      } else if (preset === 'spin') {
        layer.transform.rotation.isKeyframed = true;
        layer.transform.rotation.keyframes = [
          { id: 'kf_r1', time: start, value: 0, easing: 'linear' },
          { id: 'kf_r2', time: end, value: 360, easing: 'linear' },
        ];
      }

      broadcastToBrowser('SYNC_LAYER_UPDATE', { layerId: layer.id, updated: layer });

      return {
        content: [
          {
            type: 'text',
            text: `Animación "${preset}" aplicada a la capa "${layer.name}" (${layer.id}) desde ${start}s hasta ${end}s.`,
          },
        ],
      };
    }

    case 'delete_layer': {
      const query = (args as any).layerIdOrName;
      const initialCount = currentComposition.layers.length;
      currentComposition.layers = currentComposition.layers.filter(
        (l) => l.id.toLowerCase() !== query.toLowerCase() && l.name.toLowerCase() !== query.toLowerCase()
      );

      if (currentComposition.layers.length === initialCount) {
        return {
          isError: true,
          content: [{ type: 'text', text: `No se encontró la capa "${query}" para eliminar.` }],
        };
      }

      broadcastToBrowser('SYNC_COMPOSITION', { composition: currentComposition });

      return {
        content: [{ type: 'text', text: `Capa "${query}" eliminada correctamente.` }],
      };
    }

    case 'reframe_composition': {
      const preset = (args as any).preset;
      let targetW = 1080;
      let targetH = 1080;

      if (preset === '1:1') {
        targetW = 1080;
        targetH = 1080;
      } else if (preset === '9:16') {
        targetW = 1080;
        targetH = 1920;
      } else if (preset === '16:9') {
        targetW = 1920;
        targetH = 1080;
      } else if (preset === '600x500') {
        targetW = 600;
        targetH = 500;
      } else if (preset === '728x90') {
        targetW = 728;
        targetH = 90;
      } else if (preset === '300x250') {
        targetW = 300;
        targetH = 250;
      } else if (preset === '300x600') {
        targetW = 300;
        targetH = 600;
      } else if (preset === 'custom') {
        targetW = (args as any).customWidth || 1080;
        targetH = (args as any).customHeight || 1080;
      }

      currentComposition.width = targetW;
      currentComposition.height = targetH;

      // Broadcast reframe request to browser
      broadcastToBrowser('SYNC_REFRAME', { width: targetW, height: targetH });

      return {
        content: [
          {
            type: 'text',
            text: `Reframe aplicado: Lienzo adaptado a ${targetW} × ${targetH} px (${preset}). Las capas se reorganizaron proporcionalmente.`,
          },
        ],
      };
    }

    case 'apply_template': {
      const kw = ((args as any).templateKeyword || '').toLowerCase();
      broadcastToBrowser('SYNC_APPLY_TEMPLATE', { keyword: kw });

      return {
        content: [
          {
            type: 'text',
            text: `Plantilla solicitada con palabra clave "${kw}". Enviada al lienzo activo de VectorMotion.`,
          },
        ],
      };
    }

    case 'control_playback': {
      const action = (args as any).action;
      const time = (args as any).time;
      broadcastToBrowser('SYNC_PLAYHEAD', { action, time });

      return {
        content: [
          {
            type: 'text',
            text: `Control de reproducción ejecutado: ${action} ${time !== undefined ? `en ${time}s` : ''}`,
          },
        ],
      };
    }

    case 'set_canvas_background': {
      const color = (args as any).color;
      currentComposition.backgroundColor = color;
      broadcastToBrowser('SYNC_COMPOSITION', { composition: currentComposition });

      return {
        content: [
          {
            type: 'text',
            text: `Fondo del lienzo cambiado a ${color}.`,
          },
        ],
      };
    }

    case 'export_project_json': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(currentComposition, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Herramienta desconocida: ${name}`);
  }
});

// ---------------------------------------------------------------------------
// 4. MCP RESOURCES LIST & READ
// ---------------------------------------------------------------------------

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'vectormotion://current-composition',
        name: 'Composición Activa en VectorMotion',
        mimeType: 'application/json',
        description: 'Representación JSON completa de la composición actual en el lienzo.',
      },
      {
        uri: 'vectormotion://status',
        name: 'Estado de Conexión MCP Bridge',
        mimeType: 'application/json',
        description: 'Información de clientes web conectados al puente en tiempo real.',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  if (uri === 'vectormotion://current-composition') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(currentComposition, null, 2),
        },
      ],
    };
  }

  if (uri === 'vectormotion://status') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              server: 'VectorMotion MCP Server',
              bridgePort: BRIDGE_PORT,
              activeBrowserConnections: activeBrowserSockets.size,
              compositionName: currentComposition.name,
              dimensions: `${currentComposition.width}x${currentComposition.height}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Recurso no encontrado: ${uri}`);
});

// ---------------------------------------------------------------------------
// 5. MCP PROMPTS LIST & GET
// ---------------------------------------------------------------------------

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'crear_anuncio_restaurante',
        description: 'Diseña un anuncio animado completo para un restaurante o cafetería en VectorMotion.',
        arguments: [
          {
            name: 'nombre_restaurante',
            description: 'Nombre del restaurante o negocio gastronómico',
            required: true,
          },
          {
            name: 'oferta_o_plato',
            description: 'Plato estrella, menú ejecutivo o promoción especial',
            required: true,
          },
        ],
      },
      {
        name: 'crear_anuncio_pasteleria',
        description: 'Diseña un anuncio animado para una pastelería o repostería artesanal.',
        arguments: [
          {
            name: 'nombre_pasteleria',
            description: 'Nombre de la pastelería',
            required: true,
          },
          {
            name: 'especialidad',
            description: 'Pasteles de autor, macarons, mesas de postres, etc.',
            required: true,
          },
        ],
      },
      {
        name: 'crear_anuncio_taller',
        description: 'Diseña un anuncio animado para un taller mecánico, de carpintería o artesanal.',
        arguments: [
          {
            name: 'tipo_taller',
            description: 'Mecánico, Carpintería o Cerámica',
            required: true,
          },
          {
            name: 'servicio_principal',
            description: 'Afinación de frenos, muebles a medida, workshops, etc.',
            required: true,
          },
        ],
      },
      {
        name: 'adaptar_a_stories',
        description: 'Reorganiza el diseño actual a formato vertical 9:16 (Instagram Reels / Stories / TikTok).',
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'crear_anuncio_restaurante') {
    const nombre = args?.nombre_restaurante || 'Bistró Gourmet';
    const oferta = args?.oferta_o_plato || 'Cortes a la Brasa y Menú Ejecutivo';
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Por favor, utiliza las herramientas del MCP de VectorMotion para diseñar un anuncio animado para "${nombre}". La oferta principal es "${oferta}". Crea las capas necesarias (kicker, titular, tarjeta de detalles, precio y botón de reserva) con animaciones de entrada fluidas (slide_up, pop_bounce, fade_in).`,
          },
        },
      ],
    };
  }

  if (name === 'crear_anuncio_pasteleria') {
    const nombre = args?.nombre_pasteleria || 'Dulce Encanto';
    const esp = args?.especialidad || 'Pasteles de autor y mesas de postres';
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Por favor, crea un diseño de alta calidad para la pastelería "${nombre}", destacando "${esp}". Usa colores cálidos (crema, rosa frambuesa, acentos dorados), agrega un llamado para cotizaciones por WhatsApp y aplica animaciones pop_bounce y fade_in.`,
          },
        },
      ],
    };
  }

  if (name === 'crear_anuncio_taller') {
    const taller = args?.tipo_taller || 'Taller Automotriz';
    const serv = args?.servicio_principal || 'Mantenimiento preventivo y frenos';
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Por favor, diseña un anuncio animado para "${taller}" enfocado en "${serv}". Usa estética industrial de alto contraste, tarjeta con checklist de diagnósticos, insignia de descuento del 20% y botón para agendar cita.`,
          },
        },
      ],
    };
  }

  if (name === 'adaptar_a_stories') {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Ejecuta la herramienta reframe_composition con preset "9:16" para adaptar la composición a formato vertical de Stories/Reels, reorganizando y escalando los elementos proporcionalmente.',
          },
        },
      ],
    };
  }

  throw new Error(`Prompt no encontrado: ${name}`);
});

// ---------------------------------------------------------------------------
// 6. START TRANSPORT (STDIO)
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[VectorMotion MCP] Servidor iniciado correctamente en stdio (Bridge WebSocket en puerto ${BRIDGE_PORT}).`);
}

main().catch((err) => {
  console.error('[VectorMotion MCP] Error al iniciar servidor:', err);
  process.exit(1);
});
