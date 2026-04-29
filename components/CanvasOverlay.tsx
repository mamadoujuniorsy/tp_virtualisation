import React, { useRef, useEffect, useState } from 'react';
import { DetectedObject } from '../types';

interface CanvasOverlayProps {
  imageSrc: string | null;
  predictions: DetectedObject[];
  onImageLoaded: (img: HTMLImageElement) => void;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({ 
  imageSrc, 
  predictions,
  onImageLoaded 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);

  // Load Image
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageElement(img);
      onImageLoaded(img);
    };
  }, [imageSrc, onImageLoaded]);

  // Handle Resize & Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // Calculate aspect ratio fit
      const containerAspect = container.clientWidth / container.clientHeight;
      const imageAspect = imageElement.width / imageElement.height;

      let renderWidth, renderHeight;

      if (containerAspect > imageAspect) {
        // Limited by height
        renderHeight = container.clientHeight;
        renderWidth = imageElement.width * (renderHeight / imageElement.height);
      } else {
        // Limited by width
        renderWidth = container.clientWidth;
        renderHeight = imageElement.height * (renderWidth / imageElement.width);
      }

      // Update scale factor for bounding boxes
      const currentScale = renderWidth / imageElement.width;
      setScale(currentScale);

      // Set canvas dimensions
      canvas.width = renderWidth;
      canvas.height = renderHeight;

      // Draw Image
      ctx.drawImage(imageElement, 0, 0, renderWidth, renderHeight);

      // Draw Predictions
      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;

        // Scale coordinates
        const sx = x * currentScale;
        const sy = y * currentScale;
        const sw = width * currentScale;
        const sh = height * currentScale;

        // 1. Draw Shadow for visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(sx, sy, sw, sh);
        ctx.shadowBlur = 0;

        // 2. Draw Main Box (Gradient-like effect via stroke)
        ctx.strokeStyle = '#4f46e5'; // Indigo-600
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        // 3. Draw Label Background
        const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
        ctx.font = '600 14px Inter, sans-serif';
        const textMetrics = ctx.measureText(text);
        const textHeight = 24;
        const textPadding = 8;
        const bgWidth = textMetrics.width + textPadding * 2;

        ctx.fillStyle = '#4f46e5';
        
        // Ensure label doesn't go out of bounds (top)
        let labelY = sy - textHeight;
        if (labelY < 0) labelY = sy;

        ctx.fillRect(sx, labelY, bgWidth, textHeight);

        // 4. Draw Label Text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, sx + textPadding, labelY + 17);
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);

  }, [imageElement, predictions]);

  if (!imageSrc) return null;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center p-8 bg-slate-50 relative overflow-hidden"
    >
      {/* Subtle grid pattern background for the canvas area */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 opacity-60"></div>
      
      <canvas 
        ref={canvasRef} 
        className="rounded-xl shadow-2xl shadow-slate-300/50 border border-white bg-white"
      />
    </div>
  );
};