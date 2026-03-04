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
