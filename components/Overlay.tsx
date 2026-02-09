
import React, { useEffect, useRef } from 'react';
import { FeedbackMarker } from '../types';

interface OverlayProps {
  markers: FeedbackMarker[];
  width: number;
  height: number;
}

const Overlay: React.FC<OverlayProps> = ({ markers, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    markers.forEach(marker => {
      const pxX = (marker.x / 100) * width;
      const pxY = (marker.y / 100) * height;

      // Draw Marker Glow
      ctx.beginPath();
      ctx.arc(pxX, pxY, 15, 0, Math.PI * 2);
      ctx.fillStyle = `${marker.color}33`; // 20% opacity
      ctx.fill();

      // Draw Marker Dot
      ctx.beginPath();
      ctx.arc(pxX, pxY, 6, 0, Math.PI * 2);
      ctx.fillStyle = marker.color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Label Background
      ctx.font = 'bold 12px sans-serif';
      const textWidth = ctx.measureText(marker.label).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(pxX + 10, pxY - 10, textWidth + 10, 20);

      // Draw Label Text
      ctx.fillStyle = 'white';
      ctx.fillText(marker.label, pxX + 15, pxY + 4);
    });
  }, [markers, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 z-10"
    />
  );
};

export default Overlay;
