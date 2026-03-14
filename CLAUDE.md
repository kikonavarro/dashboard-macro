# Macro Risk Dashboard — CLAUDE.md

## Descripción del proyecto

Dashboard interactivo de riesgo de recesión global que combina 10 indicadores macro con datos en tiempo real obtenidos via Anthropic API + web search. Diseñado con estética dark, orientado a value investing y análisis macro estilo hedge fund.

El proyecto vive en: `https://github.com/kikonavarro/macro-dashboard`
URL pública (GitHub Pages): `https://kikonavarro.github.io/macro-dashboard/`

---

## Arquitectura

Un único archivo `index.html` standalone. Sin dependencias externas, sin build step, sin framework. Todo el JS está inline.

```
macro-dashboard/
├── index.html        ← dashboard completo (HTML + CSS + JS)
└── README.md
```

---

## Indicadores implementados (10 total)

### Numéricos con slider (8)

| ID | Nombre | Umbrales | Inversión |
|----|--------|----------|-----------|
| `oil` | Petróleo Brent | $90 / $110 / $130 | No |
| `vix` | VIX | 18 / 25 / 35 | No |
| `move` | MOVE Index | 100 / 150 / 200 | No |
| `crv` | Curva tipos 10Y–2Y | 0% / -0.5% | Sí (invertido = peor) |
| `inf` | Inflación 5y5y | 2.3% / 2.7% | No |
| `bdt` | Baltic Dirty Tanker | +20% / +50% | No |
| `hy` | HY Credit Spreads | 350 / 500 bps | No |
| `xccy` | EUR/USD Cross-Currency Basis | -10 / -25 / -50 bps | Sí (más negativo = peor) |

### Cualitativos con botones (2)

| ID | Nombre | Opciones |
|----|--------|----------|
| `fci` | Financial Conditions Index | laxo / neutro / restrictivo |
| `liq` | Liquidez global (Fed+ECB+PBOC+BOJ) | creciendo / estable / cayendo |

---

## Lógica de señales

Cada indicador devuelve un nivel de señal `0–3` (verde → rojo):

```javascript
// Para indicadores normales (mayor = peor):
for (let i = 0; i < th.length; i++) if (val < th[i]) return i;
return th.length;

// Para indicadores invertidos (menor = peor, e.g. curva de tipos, xccy):
for (let i = 0; i < th.length; i++) if (val >= th[i]) return i;
return th.length;
```

La evaluación global es la media aritmética de todos los niveles:
- `< 0.35` → 🟢 Riesgo bajo
- `< 0.9` → 🟡 Riesgo moderado  
- `< 1.7` → 🟠 Riesgo elevado
- `≥ 1.7` → 🔴 Riesgo de recesión

---

## Sistema de datos en tiempo real

### Cómo funciona

Al cargar la página, el dashboard llama a `https://api.anthropic.com/v1/messages` con:
- Modelo: `claude-sonnet-4-20250514`
- Tool: `web_search_20250305`
- La API key se lee de `localStorage` (clave: `macro_dash_apikey`)

El prompt pide un JSON estructurado con todos los valores y las tendencias semanales.

### Headers requeridos para llamada desde browser

```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true'  // ← CRÍTICO para CORS
}
```

### Estructura del JSON esperado

```json
{
  "brent": 88,
  "vix": 17.5,
  "move": 112,
  "yield_curve": -0.20,
  "inflation_5y5y": 2.45,
  "hy_spreads": 340,
  "tanker_chg": 10,
  "xccy_basis": -12,
  "fci": 1,
  "global_liquidity": 1,
  "trends": {
    "brent": "up",
    "vix": "down",
    "move": "flat",
    "yield_curve": "up",
    "hy_spreads": "flat",
    "xccy_basis": "down"
  },
  "timestamp": "14 mar 2026",
  "sources": "Bloomberg, Reuters, FRED"
}
```

### Parsing defensivo

```javascript
try { parsed = JSON.parse(clean); }
catch(e) {
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) parsed = JSON.parse(m[0]);
  else throw new Error('JSON inválido');
}
```

---

## Features de UX

- **Auto-fetch al cargar** + **botón ↻ Actualizar** manual
- **Badge LIVE** en cada card cuando el dato viene de búsqueda real
- **Flechas de tendencia** ↑↓→ vs semana anterior (verde si mejora, rojo si empeora — con lógica invertida para indicadores donde menos = peor)
- **Contador de señales** en el header: `X / 10 señales en alerta`
- **Botón ⎘ Copiar resumen** — genera texto con emojis semáforo para compartir
- **Campo de API key** con guardado en `localStorage`, validación del prefijo `sk-ant-`
- **Sliders manuales** como fallback si la API falla

---

## Colores y diseño

```css
/* Fondo general */
background: #0f0f0f;

/* Cards */
background: #1a1a1a;
border: 0.5px solid rgba(255,255,255,0.1);

/* Semáforo de zonas */
const ZC = ['#639922', '#BA7517', '#D85A30', '#A32D2D'];  // verde→rojo fill
const TC = ['#8bc34a', '#f5a623', '#D85A30', '#e57373'];  // verde→rojo text
```

El indicador `verdict` del pie usa `border-left: 3px solid {color}` para mostrar el nivel global.

---

## Cómo actualizar umbrales

Los umbrales están en el array `INDS` al inicio del script. Para modificar un indicador:

```javascript
{
  id: 'vix',
  th: [18, 25, 35],   // ← cambiar aquí los umbrales
  min: 10,            // ← mínimo del slider
  max: 60,            // ← máximo del slider
  step: 0.5,
  inv: false          // ← true si valores bajos = más peligroso
}
```

---

## Cómo añadir un nuevo indicador

1. Añadir objeto al array `INDS` con todos los campos
2. Añadir la clave al prompt de búsqueda (string `prompt` en `fetchData()`)
3. Añadir la key al JSON esperado del prompt
4. Si es cualitativo (botones en vez de slider), añadirlo a `QUALS` en lugar de `INDS`

---

## Cómo desplegarlo en GitHub Pages

1. Subir `index.html` al repo `kikonavarro/macro-dashboard` en la rama `main`
2. Ir a **Settings → Pages → Branch: main → Save**
3. Esperar ~1 minuto
4. Acceder a `https://kikonavarro.github.io/macro-dashboard/`

Para actualizar el dashboard: commit de un nuevo `index.html` a `main`, GitHub Pages se actualiza automáticamente.

---

## Contexto de desarrollo

Este proyecto nació como un widget interactivo en claude.ai y fue evolucionando en esta conversación:

- **v1** — Dashboard estático con sliders manuales (8 indicadores)
- **v2** — Añadida llamada a Anthropic API con web search para datos en tiempo real
- **v3** — Añadidos MOVE Index y EUR/USD Cross-Currency Basis, flechas de tendencia, contador de alertas, botón copiar resumen, campo de API key para uso externo a claude.ai

El campo de API key permite que cualquier persona con una cuenta de Anthropic use el dashboard con datos en tiempo real. Cada actualización consume ~$0.01 de crédito.
