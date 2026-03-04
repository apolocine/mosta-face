# @mostajs/face

> Reusable face recognition module — detection, descriptor extraction, 1:N matching.

[![npm version](https://img.shields.io/npm/v/@mostajs/face.svg)](https://www.npmjs.com/package/@mostajs/face)
[![license](https://img.shields.io/npm/l/@mostajs/face.svg)](LICENSE)

Part of the [@mosta suite](https://mostajs.dev).

---

## Installation

```bash
npm install @mostajs/face
```

## Quick Start

### 1. Load models and detect faces

```typescript
import { loadModels, detectFace, extractDescriptor } from '@mostajs/face'

await loadModels('/models')  // path to face-api.js model files

const detection = await detectFace(imageElement)
const descriptor = await extractDescriptor(imageElement)
```

### 2. Compare faces

```typescript
import { compareFaces, findMatch } from '@mostajs/face'

const distance = compareFaces(descriptor1, descriptor2)

const match = findMatch(unknownDescriptor, knownFaces, 0.6)
if (match) {
  console.log('Matched:', match.label, 'distance:', match.distance)
}
```

### 3. React hooks

```tsx
import { useCamera } from '@mostajs/face/hooks/useCamera'
import { useFaceDetection } from '@mostajs/face/hooks/useFaceDetection'

function FaceCapture() {
  const { videoRef, start, stop } = useCamera()
  const { detection, descriptor } = useFaceDetection(videoRef)
  // ...
}
```

## API Reference

| Export | Description |
|--------|-------------|
| `loadModels(path)` | Load face-api.js models |
| `detectFace(input)` | Detect single face with landmarks |
| `detectAllFaces(input)` | Detect all faces |
| `extractDescriptor(input)` | Extract 128-dim face descriptor |
| `compareFaces(d1, d2)` | Euclidean distance between descriptors |
| `findMatch(descriptor, known, threshold)` | Find best match |
| `findAllMatches(descriptor, known, threshold)` | Find all matches |
| `useCamera()` | Camera management hook |
| `useFaceDetection()` | Continuous detection hook |

## License

MIT — © 2025 Dr Hamid MADANI <drmdh@msn.com>
