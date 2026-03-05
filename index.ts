// @mosta/face — Barrel exports
// Author: Dr Hamid MADANI drmdh@msn.com

// Core face-api service
export { loadModels, isLoaded, detectFace, detectAllFaces, extractDescriptor } from './lib/face-api'

// Matching
export { compareFaces, findMatch, findAllMatches } from './lib/face-matcher'

// Utils
export { descriptorToArray, arrayToDescriptor, isValidDescriptor, drawDetection } from './lib/face-utils'

// Hooks
export { useCamera } from './hooks/useCamera'
export { useFaceDetection } from './hooks/useFaceDetection'

// API route factories
export { createRecognizeHandler } from './api/recognize.route'
export { createDetectHandler } from './api/detect.route'

// Types
export type { MostaFaceConfig, FaceDetectionResult, FaceMatchResult, FaceDescriptor } from './types'
export type { FaceCandidate, RecognizeHandlerConfig } from './api/recognize.route'
export type { DetectHandlerConfig } from './api/detect.route'
