# Macro Risk Dashboard — CLAUDE.md

## Descripción del proyecto

Dashboard interactivo de riesgo de recesión global que combina 10 indicadores macro. Los datos se actualizan manualmente via `data.json` (commit + push) o, opcionalmente, en tiempo real via Anthropic API + web search. Diseñado con estética dark, orientado a value investing y análisis macro estilo hedge fund. Disponible en español e inglés.

El proyecto vive en: `https://github.com/kikonavarro/macro-dashboard`
URL pública (GitHub Pages): `https://kikonavarro.github.io/macro-dashboard/`

**Ruta local en el Mac:** `/Users/franciscojaviernavarro/Documents/Claude_Projects/Dashboard Macro`
**Remote git:** `https://[token]@github.com/kikonavarro/dashboard-macro.git` (HTTPS con token, configurado — git push funciona directamente desde Cowork)

---

## Arquitectura

Un único archivo `index.html` standalone + un `data.json` con los datos precargados. Sin dependencias externas, sin build step, sin framework. Todo el JS está inline.

```
macro-dashboard/
├── index.html        ← dashboard completo (HTML + CSS + JS)
├── data.json         ← datos de mercado precargados
└── README.md
```

---

## Sistema de datos

### Flujo principal: data.json (sin coste)

Los datos se actualizan manualmente editando `data.json` y haciendo commit + push. GitHub Pages sirve el archivo y el dashboard lo carga automáticamente al abrir la página. Este es el flujo recomendado — Claude Code puede buscar los datos y actualizar el JSON.

### Flujo opcional: Anthropic API (con coste ~$0.10/actualización)

Si el usuario introduce una API key de Anthropic, puede pulsar "Actualizar" para obtener datos en tiempo real. El dashboard llama a `https://api.anthropic.com/v1/messages` con modelo `claude-sonnet-4-20250514` y tool `web_search_20250305`. La API key se guarda en `localStorage` (clave: `macro_dash_apikey`).

Para visitantes sin API key y con `data.json` disponible, el banner de API key se colapsa y muestra un link sutil para configurarla.

### Estructura del JSON (data.json y respuesta API)

```json
{
  "brent": 103,
  "vix": 25,
  "move": 91,
  "yield_curve": 0.56,
  "inflation_5y5y": 2.19,
  "hy_spreads": 309,
  "bdti": 2835,
  "xccy_basis": -12,
  "nfci": -0.51,
  "global_liquidity": 1,
  "trends": {
    "brent": "up",
    "vix": "up",
    "move": "down",
    "yield_curve": "up",
    "hy_spreads": "up",
    "xccy_basis": "flat",
    "bdti": "up",
    "nfci": "flat"
  },
  "timestamp": "2026-03-15T12:00:00.000Z",
  "sources": "Bloomberg, Reuters, FRED, Chicago Fed"
}
```

---

## Indicadores implementados (10 total)

### Numéricos con slider (9)

| ID | Nombre | Umbrales | Inversión |
|----|--------|----------|-----------|
| `oil` | Petróleo Brent | $90 / $110 / $130 | No |
| `vix` | VIX | 20 / 30 / 40 | No |
| `move` | MOVE Index | 90 / 130 / 175 | No |
| `crv` | Curva tipos 10Y–2Y | 0% / -0.5% | Sí (invertido = peor) |
| `inf` | Inflación 5y5y | 2.3% / 2.7% | No |
| `bdt` | Baltic Dirty Tanker (BDTI) | 1200 / 1600 / 2000 pts | No |
| `hy` | HY Credit Spreads | 350 / 500 / 800 bps | No |
| `xccy` | EUR/USD Cross-Currency Basis | -15 / -25 / -50 bps | Sí (más negativo = peor) |
| `fci` | Chicago Fed NFCI | -0.25 / +0.25 / +0.70 | No |

### Cualitativos con botones (1)

| ID | Nombre | Opciones |
|----|--------|----------|
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

## Internacionalización (i18n)

El dashboard soporta español e inglés. El idioma por defecto es **inglés**. El usuario puede cambiar con el botón ES/EN en la barra de pestañas. La preferencia se guarda en `localStorage` (clave: `macro_dash_lang`).

Toda la traducción está en el objeto `UI` del script con claves `es` y `en`. Para añadir traducciones de un indicador nuevo, hay que actualizar `UI.es.ind`, `UI.en.ind` (y `UI.*.qual` si es cualitativo).

---

## Features de UX

- **Datos precargados** via `data.json` + opción de **API key** para datos en tiempo real
- **Banner colapsable** de API key — oculto para visitantes, expandible con un link
- **Badge LIVE** en cada card cuando el dato viene de búsqueda real
- **Flechas de tendencia** ↑↓→ vs semana anterior (verde si mejora, rojo si empeora — con lógica invertida para indicadores donde menos = peor)
- **Contador de señales** en el header: `X / 10 señales en alerta`
- **Botón ⎘ Copiar resumen** — genera texto con emojis semáforo para compartir
- **Sliders manuales** como fallback si la API falla
- **Pestaña Guía** — explicación detallada de cada indicador, umbrales y fuentes
- **Toggle ES/EN** — interfaz bilingüe con preferencia persistente
- **Exportar data.json** — descarga los datos actuales para compartir

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

---

## Cómo actualizar datos

### Opción 1: Pedir a Claude Code (recomendado)

Pedir a Claude Code que busque los valores actuales de los 10 indicadores, actualice `data.json`, y haga commit + push. Coste cero.

### Opción 2: API key de Anthropic

Introducir una API key en el dashboard y pulsar "Actualizar". Coste ~$0.10 por actualización.

---

## Cómo actualizar umbrales

Los umbrales están en el array `INDS` al inicio del script. Para modificar un indicador:

```javascript
{
  id: 'vix',
  th: [20, 30, 40],   // ← cambiar aquí los umbrales
  min: 10,            // ← mínimo del slider
  max: 80,            // ← máximo del slider
  step: 0.5,
  inv: false          // ← true si valores bajos = más peligroso
}
```

---

## Cómo añadir un nuevo indicador

1. Añadir objeto al array `INDS` con todos los campos
2. Añadir traducciones en `UI.es.ind` y `UI.en.ind`
3. Añadir la clave al prompt de búsqueda (string `prompt` en `fetchData()`)
4. Añadir la key al JSON esperado del prompt y a `data.json`
5. Añadir la guía del indicador en ambos idiomas (divs `guide-es` y `guide-en`)
6. Si es cualitativo (botones en vez de slider), añadirlo a `QUALS` y `UI.*.qual`

---

## Cómo desplegarlo en GitHub Pages

1. Subir `index.html` y `data.json` al repo en la rama `main`
2. Ir a **Settings → Pages → Branch: main → Save**
3. Esperar ~1 minuto
4. Acceder a `https://kikonavarro.github.io/macro-dashboard/`

Para actualizar: commit + push a `main`, GitHub Pages se actualiza automáticamente.

---

## Contexto de desarrollo

Este proyecto nació como un widget interactivo en claude.ai y fue evolucionando:

- **v1** — Dashboard estático con sliders manuales (8 indicadores)
- **v2** — Añadida llamada a Anthropic API con web search para datos en tiempo real
- **v3** — Añadidos MOVE Index y EUR/USD Cross-Currency Basis, flechas de tendencia, contador de alertas, botón copiar resumen, campo de API key
- **v4** — Recalibración de umbrales basada en estándares profesionales. BDT cambiado de % a puntos absolutos BDTI. FCI cambiado de cualitativo a numérico (Chicago Fed NFCI). Pestaña Guía con explicaciones detalladas
- **v5** — Flujo principal cambiado a data.json precargado (sin coste). API key como opción secundaria. Internacionalización ES/EN. Banner colapsable para visitantes
