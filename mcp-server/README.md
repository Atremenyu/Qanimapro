# VectorMotion MCP Server (Model Context Protocol)

Servidor oficial de **Model Context Protocol (MCP)** para VectorMotion. Permite a modelos de inteligencia artificial (en **OpenCode**, **Claude Desktop**, **Cursor**, **Windsurf**, etc.) interactuar directamente con el editor de gráficos en movimiento y banners animados en tiempo real.

---

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor MCP
Desde la raíz del repositorio, ejecuta:
```bash
npm run mcp
```
O directamente con `tsx`:
```bash
npx tsx mcp-server/index.ts
```

Esto iniciará:
1. El protocolo MCP estándar mediante **stdio** para que tu cliente de IA (OpenCode, Claude, etc.) se comunique.
2. Un puente WebSocket local en el puerto **49222** (`ws://localhost:49222`) que sincroniza en vivo los cambios directamente con el lienzo de tu navegador web.

---

## 🛠️ Configuración en OpenCode

Crea o edita el archivo `opencode.json` en la raíz de tu proyecto o en tu configuración global de OpenCode:

```json
{
  "mcpServers": {
    "vectormotion": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp-server/index.ts"],
      "env": {
        "MCP_BRIDGE_PORT": "49222"
      }
    }
  }
}
```

---

## 💻 Configuración en Claude Desktop

Agrega lo siguiente a tu archivo de configuración de Claude Desktop:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vectormotion": {
      "command": "npx",
      "args": ["-y", "tsx", "/RUTA/ABSOLUTA/A/TU/PROYECTO/mcp-server/index.ts"],
      "env": {
        "MCP_BRIDGE_PORT": "49222"
      }
    }
  }
}
```

---

## 🎯 Instrucciones y Prompts que puedes pedirle a la IA

Una vez configurado en OpenCode, puedes hablarle a la IA en español con comandos naturales como:

### 🍽️ Restaurantes y Gastronomía
* *"Carga la plantilla de restaurante bistró gourmet en VectorMotion y cambia el titular a 'Asador Don Pedro · Cortes Prime' con descuento del 20%."*
* *"Crea un anuncio de hamburguesas para 'Burger Lab' en formato 1080x1080 con fondo oscuro, titular llamativo y animación pop_bounce."*
* *"Diseña un anuncio para una cafetería de especialidad con paleta en tonos crema y café."*

### 🧁 Pastelerías y Reposterías
* *"Aplica la plantilla 'Dulce Encanto Pastelería' y cambia el nombre a 'Pastelería Violeta · Repostería Artesanal y Macarons'."*
* *"Crea un anuncio para cotizaciones de mesas de postres para bodas con fondo pastel y botón de WhatsApp."*

### 🔧 Talleres Mecánicos y Oficios
* *"Carga la plantilla de taller mecánico en formato vertical 9:16 para Instagram Reels y cambia los textos a 'Taller Mecánico El Águila · Frenos y Suspensión'."*
* *"Carga la plantilla de taller de carpintería y adapta el titular a 'Muebles Finos de Madera a Medida'."*
* *"Carga la plantilla de taller de cerámica artesanal 'Manos de Barro'."*

### 📐 Reframe y Adaptación de Formatos
* *"Adapta el diseño actual a formato vertical 9:16 (Instagram Reels / TikTok / Stories) reorganizando los elementos para que queden legibles y centrados."*
* *"Reorganiza la composición a formato panorámico 16:9 para pantallas de restaurantes."*
* *"Haz un reframe de la composición a formato cuadrado 1:1."*

### ⚡ Animaciones y Keyframes
* *"Aplica la animación pop_bounce al titular principal con duración de 0.6 segundos."*
* *"Haz que la tarjeta de producto entre con una animación slide_up desde abajo."*
* *"Agrega una animación de pulso (pulse) al botón de compra para que llame la atención."*
* *"Reproduce la composición para ver cómo se ven las animaciones."*

---

## 🧰 Herramientas MCP Disponibles

| Herramienta | Descripción |
| :--- | :--- |
| `get_composition` | Devuelve dimensiones, duración, fps, fondo y lista de capas. |
| `list_layers` | Lista todas las capas con sus posiciones, colores, textos y keyframes. |
| `get_layer` | Detalles de una capa específica por su ID o nombre. |
| `create_layer` | Crea capas de texto, rectángulos, círculos, estrellas o polígonos. |
| `update_layer` | Modifica texto, color de relleno, posición (X, Y), rotación, escala y opacidad. |
| `animate_layer` | Agrega keyframes con presets: `pop_bounce`, `slide_up`, `slide_down`, `fade_in`, `fade_out`, `pulse`, `spin`. |
| `delete_layer` | Elimina una capa por ID o nombre. |
| `reframe_composition` | Adapta y reorganiza a formatos `1:1`, `9:16`, `16:9`, `600x500`, `728x90` o `custom`. |
| `apply_template` | Carga plantillas preestablecidas (`restaurante`, `pasteleria`, `taller_mecanico`, `carpinteria`, `ceramica`, etc.). |
| `set_canvas_background` | Modifica el color de fondo del lienzo en tiempo real. |
| `control_playback` | Controla la reproducción (`play`, `pause`, `toggle`, `seek`). |
| `export_project_json` | Exporta la composición en JSON compatible con VectorMotion. |
| `huashu_design_directions` | **Huashu-Design (花叔):** Genera 3 direcciones estéticas divergentes (Minimalista, Cinético, Artesanal) con paletas y tipografías antes de diseñar. |
| `huashu_design_review` | **Huashu-Design (花叔):** Auditoría experta de diseño, anti-clichés de IA, jerarquía visual y ritmo de animación. |

---

## 🎨 Integración con el Skill Huashu-Design (花叔)

El skill oficial de [huashu-design](https://github.com/alchaincyf/huashu-design) ha sido instalado en:
* `skills/huashu-design/` (proyecto local)
* `.claude/skills/huashu-design/` (para Claude Code)
* `.opencode/skills/huashu-design/` (para OpenCode)
* `~/.claude/skills/huashu-design/` (global de sistema)

### Instrucciones Huashu para pedirle a tu IA:
* *"Actúa como Director de Arte con Huashu-Design: antes de tocar el lienzo, genera 3 direcciones creativas para mi marca con `huashu_design_directions` y pregúntame cuál prefiero."*
* *"Ejecuta `huashu_design_review` sobre mi banner para auditar clichés de IA (fondos warm cream genéricos, falta de jerarquía) y mejorar el diseño."*
* *"Aplica curvas de animación cinematográfica según las guías de Huashu-Design con entradas escalonadas y resortes elásticos en el botón."*
