# @mostajs/face

> Reusable face recognition module — detection, descriptor extraction, 1:N matching, API route factories.

[![npm version](https://img.shields.io/npm/v/@mostajs/face.svg)](https://www.npmjs.com/package/@mostajs/face)
[![license](https://img.shields.io/npm/l/@mostajs/face.svg)](LICENSE)

Part of the [@mosta suite](https://mostajs.dev). **100% standalone** — zero dependency on `@mostajs/orm` or any other `@mostajs/*` package.

---

## Table des matieres

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [API Route Factories](#api-route-factories)
4. [React Hooks](#react-hooks)
5. [Integration complete dans une nouvelle app](#integration-complete)
6. [API Reference](#api-reference)
7. [Architecture](#architecture)

---

## Installation

```bash
npm install @mostajs/face
```

Copier les modeles face-api.js dans votre dossier `public/` :

```bash
mkdir -p public/models/face-api
# Copier les fichiers .bin et .json depuis node_modules/@vladmandic/face-api/model/
cp node_modules/@vladmandic/face-api/model/tiny_face_detector_model-* public/models/face-api/
cp node_modules/@vladmandic/face-api/model/face_landmark_68_model-* public/models/face-api/
cp node_modules/@vladmandic/face-api/model/face_recognition_model-* public/models/face-api/
```

---

## Quick Start

### 1. Charger les modeles et detecter des visages

```typescript
import { loadModels, detectFace, extractDescriptor } from '@mostajs/face'

await loadModels('/models/face-api')

const detection = await detectFace(imageElement)
const descriptor = await extractDescriptor(imageElement) // Float32Array(128)
```

### 2. Comparer des visages

```typescript
import { compareFaces, findMatch } from '@mostajs/face'

// Distance euclidienne entre deux descripteurs
const distance = compareFaces(descriptor1, descriptor2)
console.log(distance < 0.6 ? 'Meme personne' : 'Personnes differentes')

// Recherche 1:N parmi des candidats
const candidates = [
  { id: '1', faceDescriptor: [...], name: 'Alice' },
  { id: '2', faceDescriptor: [...], name: 'Bob' },
]
const match = findMatch(unknownDescriptor, candidates, 0.6)
if (match) {
  console.log('Match:', match.match.name, 'distance:', match.distance)
}
```

---

## API Route Factories

Depuis la v1.1.0, le package fournit des factories pour creer des routes API (Next.js App Router ou tout framework supportant `Request`/`Response`).

### POST /api/face/recognize

Factory qui recoit un descripteur facial et cherche le meilleur match parmi vos candidats.

```typescript
// src/app/api/face/recognize/route.ts
import { createRecognizeHandler } from '@mostajs/face/api/recognize.route'
import { db } from '@/lib/db'

export const { POST } = createRecognizeHandler({
  // Fournir les candidats depuis votre base de donnees
  getCandidates: async () => {
    return db.query('SELECT id, name, photo, "faceDescriptor" FROM users WHERE "faceDescriptor" IS NOT NULL')
  },

  // Seuil de matching (defaut: 0.6)
  getThreshold: async () => 0.55,

  // Champs retournes dans la reponse (defaut: tous sauf faceDescriptor)
  publicFields: ['name', 'photo', 'email'],

  // Optionnel: verifier l'authentification
  checkAuth: async (req) => {
    const token = req.headers.get('Authorization')
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return null // OK
  },

  // Optionnel: desactiver la feature
  isEnabled: async () => {
    const settings = await getAppSettings()
    return settings.faceRecognitionEnabled
  },
})
```

**Requete :**
```json
POST /api/face/recognize
{ "faceDescriptor": [0.023, -0.114, 0.087, ...] }
```

**Reponse (match) :**
```json
{
  "data": {
    "match": true,
    "distance": 0.312,
    "candidate": { "id": "abc123", "name": "Alice", "photo": "/photos/alice.jpg" }
  }
}
```

**Reponse (pas de match) :**
```json
{
  "data": { "match": false, "distance": 0.782 }
}
```

### POST /api/face/detect (placeholder)

```typescript
// src/app/api/face/detect/route.ts
import { createDetectHandler } from '@mostajs/face/api/detect.route'

export const { POST } = createDetectHandler({
  checkAuth: async (req) => { /* ... */ return null },
  isEnabled: async () => true,
})
```

> La detection se fait cote client via face-api.js. Cette route sert de point d'entree pour le controle d'acces et un futur traitement serveur.

---

## React Hooks

### useCamera

```tsx
import { useCamera } from '@mostajs/face/hooks/useCamera'

function CameraView() {
  const { videoRef, streaming, start, stop, capture } = useCamera()

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      {!streaming
        ? <button onClick={start}>Demarrer</button>
        : <button onClick={() => capture(canvas)}>Capturer</button>
      }
    </div>
  )
}
```

### useFaceDetection

```tsx
import { useFaceDetection } from '@mostajs/face/hooks/useFaceDetection'

function LiveDetection({ videoRef }) {
  const { faceDetected, detection, descriptor } = useFaceDetection(videoRef, {
    scoreThreshold: 0.5,
    inputSize: 320,
  })

  return <span>{faceDetected ? 'Visage detecte' : 'Aucun visage'}</span>
}
```

---

## Integration complete

Exemple complet d'integration dans une nouvelle app Next.js.

### Etape 1 — Installer

```bash
npm install @mostajs/face
```

### Etape 2 — Copier les modeles

```bash
mkdir -p public/models/face-api
cp node_modules/@vladmandic/face-api/model/tiny_face_detector_model-* public/models/face-api/
cp node_modules/@vladmandic/face-api/model/face_landmark_68_model-* public/models/face-api/
cp node_modules/@vladmandic/face-api/model/face_recognition_model-* public/models/face-api/
```

### Etape 3 — Route API recognize

```typescript
// src/app/api/face/recognize/route.ts
import { createRecognizeHandler } from '@mostajs/face/api/recognize.route'
import prisma from '@/lib/prisma' // ou tout ORM

export const { POST } = createRecognizeHandler({
  getCandidates: async () => {
    const users = await prisma.user.findMany({
      where: { faceDescriptor: { not: null } },
      select: { id: true, name: true, photo: true, faceDescriptor: true },
    })
    return users.map(u => ({
      ...u,
      faceDescriptor: u.faceDescriptor as number[],
    }))
  },
  getThreshold: async () => 0.6,
  publicFields: ['name', 'photo'],
})
```

### Etape 4 — Composant React

```tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useCamera } from '@mostajs/face/hooks/useCamera'

export default function FaceSearch() {
  const { videoRef, streaming, start, stop } = useCamera()
  const [result, setResult] = useState(null)
  const faceApiRef = useRef(null)

  useEffect(() => {
    import('@mostajs/face').then(mod => {
      mod.loadModels('/models/face-api')
      faceApiRef.current = mod
    })
  }, [])

  const recognize = useCallback(async () => {
    if (!faceApiRef.current || !videoRef.current) return
    const descriptor = await faceApiRef.current.extractDescriptor(videoRef.current)
    if (!descriptor) { alert('Aucun visage'); return }

    const res = await fetch('/api/face/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceDescriptor: Array.from(descriptor) }),
    })
    const json = await res.json()
    setResult(json.data)
  }, [videoRef])

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      {!streaming
        ? <button onClick={start}>Camera</button>
        : <button onClick={recognize}>Rechercher</button>
      }
      {result?.match && <p>Trouve: {result.candidate.name}</p>}
    </div>
  )
}
```

### Etape 5 — Verification locale

```bash
# Demarrer l'app
npm run dev

# Tester l'API
curl -X POST http://localhost:3000/api/face/recognize \
  -H 'Content-Type: application/json' \
  -d '{"faceDescriptor": [0.1, 0.2, ...]}'
```

---

## API Reference

### Core (client-side)

| Export | Description |
|--------|-------------|
| `loadModels(path)` | Charger les modeles face-api.js |
| `isLoaded()` | Verifier si les modeles sont charges |
| `detectFace(input)` | Detecter un visage avec landmarks |
| `detectAllFaces(input)` | Detecter tous les visages |
| `extractDescriptor(input)` | Extraire un descripteur 128-dim |

### Matching (client ou serveur)

| Export | Description |
|--------|-------------|
| `compareFaces(d1, d2)` | Distance euclidienne entre 2 descripteurs |
| `findMatch(descriptor, candidates, threshold)` | Meilleur match sous le seuil |
| `findAllMatches(descriptor, candidates, threshold)` | Tous les matchs sous le seuil |

### Utils

| Export | Description |
|--------|-------------|
| `descriptorToArray(Float32Array)` | Convertir en `number[]` |
| `arrayToDescriptor(number[])` | Convertir en `Float32Array` |
| `isValidDescriptor(value)` | Verifier (128 nombres) |
| `drawDetection(canvas, detection, w, h)` | Dessiner le cadre de detection |

### Route Factories (serveur)

| Export | Description |
|--------|-------------|
| `createRecognizeHandler(config)` | Factory POST recognize avec matching 1:N |
| `createDetectHandler(config?)` | Factory POST detect (placeholder) |

### React Hooks

| Export | Description |
|--------|-------------|
| `useCamera()` | Gestion camera (start/stop/capture) |
| `useFaceDetection(videoRef, config?)` | Detection continue en temps reel |

### Types

| Type | Description |
|------|-------------|
| `MostaFaceConfig` | Configuration (modelsPath, thresholds, inputSize) |
| `FaceDetectionResult` | Resultat detection (score, box) |
| `FaceMatchResult<T>` | Resultat matching (match, distance) |
| `FaceDescriptor` | `Float32Array \| number[]` |
| `FaceCandidate` | Interface candidat (id, faceDescriptor, ...) |
| `RecognizeHandlerConfig` | Config de `createRecognizeHandler` |
| `DetectHandlerConfig` | Config de `createDetectHandler` |

---

## Architecture

```
@mostajs/face (100% standalone)
├── lib/
│   ├── face-api.ts         # Chargement modeles, detection, extraction
│   ├── face-matcher.ts     # Comparaison, findMatch, findAllMatches
│   └── face-utils.ts       # Dessin, conversion descripteurs
├── api/
│   ├── recognize.route.ts  # Factory POST /api/face/recognize
│   └── detect.route.ts     # Factory POST /api/face/detect
├── hooks/
│   ├── useCamera.ts        # Hook gestion camera
│   └── useFaceDetection.ts # Hook detection temps reel
├── types/
│   └── index.ts            # Types exports
└── index.ts                # Barrel exports

Dependances:
  @vladmandic/face-api  (seule dep runtime)
  react >= 18           (peer dependency)

Zero dependance sur: @mostajs/orm, @mostajs/auth, @mostajs/settings
```

### Pattern Factory

Le meme pattern que `@mostajs/setup` : le package exporte des factories, l'app injecte ses dependances :

```
┌─────────────────────┐     inject callbacks      ┌──────────────────────┐
│   @mostajs/face     │ ◄──────────────────────── │   Votre app          │
│                     │                            │                      │
│ createRecognizeHandler({                         │ getCandidates: () => │
│   getCandidates,    │                            │   db.query(...)      │
│   checkAuth,        │                            │ checkAuth: () =>     │
│   getThreshold,     │                            │   verifyToken(...)   │
│ })                  │                            │                      │
└─────────────────────┘                            └──────────────────────┘
```


                                                                             
  Résultat
                                                                                    
  Ce qui a été migré dans @mostajs/face v1.1.0
                                                                                    
  ┌────────────────────────┬─────────────────────────────────────────────────────┐
  │        Fichier         │                     Description                     │
  ├────────────────────────┼─────────────────────────────────────────────────────┤
  │ api/recognize.route.ts │ Factory createRecognizeHandler() — matching 1:N     │
  │                        │ avec callbacks injectés                             │
  ├────────────────────────┼─────────────────────────────────────────────────────┤
  │ api/detect.route.ts    │ Factory createDetectHandler() — placeholder avec    │
  │                        │ auth/enable                                         │
  ├────────────────────────┼─────────────────────────────────────────────────────┤
  │ index.ts               │ +4 exports (2 factories + 2 types)                  │
  ├────────────────────────┼─────────────────────────────────────────────────────┤
  │ package.json           │ v1.1.0, subpath exports ./api/*, ./lib/*, ./types   │
  ├────────────────────────┼─────────────────────────────────────────────────────┤
  │ README.md              │ Tutoriel complet avec intégration nouvelle app      │
  └────────────────────────┴─────────────────────────────────────────────────────┘

  Routes app simplifiées

  - src/app/api/face/recognize/route.ts : 101 lignes → 30 lignes (injection de
  getCandidates, checkAuth, getThreshold, publicFields)
  - src/app/api/face/detect/route.ts : 30 lignes → 15 lignes

  Ce qui reste dans l'app (non migré)

  - src/app/api/scan/route.ts — Scanning de tickets (QR, quotas, réentrée). Pas lié
  à face, relève d'un futur @mostajs/ticketing
  - src/components/clients/FaceDetector.tsx — Composant UI trop couplé (shadcn,
  sonner, settings). Les hooks useCamera/useFaceDetection du package couvrent la
  partie réutilisable


---

## License

MIT — Dr Hamid MADANI <drmdh@msn.com>
