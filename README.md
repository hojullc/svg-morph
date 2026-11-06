# ✨ svg-morph

> Morphing SVG paths, self-drawing line art, organic blobs, wave animations. Zero dependencies. 4 KB gzipped.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/hojullc/svg-morph)](https://github.com/hojullc/svg-morph/releases)

## Features

| Effect | Description |
|--------|-------------|
| `morph` | Interpolate between SVG path shapes with easing |
| `draw` | Stroke-dashoffset self-drawing line art animation |
| `blob` | Organic breathing blob via quadratic bezier |
| `wave` | Animated wave path with configurable amplitude & frequency |

## Install

**CDN**
```html
<script src="https://cdn.jsdelivr.net/gh/hojullc/svg-morph@1/src/svg-morph.js"></script>
```

**npm**
```bash
npm install svg-morph
```

## Quick start

```js
// Morph between shapes
SvgMorph.morph('#shape', [circlePath, starPath, blobPath], { duration: 900, loop: true });

// Self-drawing stroke
SvgMorph.draw('#illustration', { duration: 2000 });

// Organic blob
SvgMorph.blob('#blob', { points: 7, range: 0.35, speed: 0.004 });

// Animated wave
SvgMorph.wave('#wave', { amplitude: 20, frequency: 2, speed: 0.04 });
```

## Options

### morph(target, paths, opts)
| Option | Default | Description |
|--------|---------|-------------|
| `duration` | `800` | Transition duration in ms |
| `delay` | `1200` | Pause between transitions |
| `loop` | `true` | Loop the sequence |
| `easing` | `easeInOut` | Easing function |

### draw(target, opts)
| Option | Default | Description |
|--------|---------|-------------|
| `duration` | `1500` | Draw duration in ms |
| `reverse` | `false` | Erase instead of draw |

### blob(target, opts)
| Option | Default | Description |
|--------|---------|-------------|
| `points` | `7` | Number of control points |
| `range` | `0.35` | Deformation range (0–1) |
| `speed` | `0.004` | Animation speed |
| `r` | `38` | Base radius |

### wave(target, opts)
| Option | Default | Description |
|--------|---------|-------------|
| `amplitude` | `20` | Wave height in px |
| `frequency` | `2` | Number of wave cycles |
| `speed` | `0.04` | Animation speed |
| `baseline` | `50` | Vertical center position |

## Demo

Open `demo/index.html` or see the [live demo](https://github.com/hojullc/svg-morph).

## License

MIT © [Hoju LLC](https://hoju.us)
