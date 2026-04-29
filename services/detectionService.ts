import * as tensorflow from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '../types';

// Singleton to hold the model instance
let model: cocoSsd.ObjectDetection | null = null;

export const loadModel = async (): Promise<void> => {
  if (model) return;
  // Load the open-source COCO-SSD model
  // This runs entirely in the browser using WebGL or CPU
  await tensorflow.ready();
  model = await cocoSsd.load({
    base: 'lite_mobilenet_v2' // Faster for web demos
  });
};

export const detectObjects = async (
  img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<DetectedObject[]> => {
  if (!model) {
    await loadModel();
  }
  if (!model) throw new Error("Model failed to load");

  const predictions = await model.detect(img);
  return predictions;
};