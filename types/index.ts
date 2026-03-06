// @mosta/face — Types
// Author: Dr Hamid MADANI drmdh@msn.com

export interface MostaFaceConfig {
  /** Path to face-api.js model files (default: '/models/face-api') */
  modelsPath?: string
  /** Detection score threshold (default: 0.5) */
  scoreThreshold?: number
  /** TinyFaceDetector input size (default: 320) */
  inputSize?: number
  /** Face matching distance threshold (default: 0.6) */
  matchThreshold?: number
}

export interface FaceDetectionResult {
  detection: {
    score: number
    box: { x: number; y: number; width: number; height: number }
  }
  landmarks?: any
}

export interface FaceMatchResult<T> {
  match: T
  distance: number
}

export type FaceDescriptor = Float32Array | number[]

// ── Face settings (defaults for consuming apps) ──────────────────
export interface FaceSettings {
  /** Enable face detection/recognition (default: true) */
  faceRecognitionEnabled: boolean
  /** Match distance threshold — lower = stricter (default: 0.6) */
  faceRecognitionThreshold: number
  /** Require face detected before photo capture (default: true) */
  faceRequireForCapture: boolean
  /** Auto-verify face after scan (default: false) */
  faceAutoVerify: boolean
}

export const DEFAULT_FACE_SETTINGS: FaceSettings = {
  faceRecognitionEnabled: true,
  faceRecognitionThreshold: 0.6,
  faceRequireForCapture: true,
  faceAutoVerify: false,
}
