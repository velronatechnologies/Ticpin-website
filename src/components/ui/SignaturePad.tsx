'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onChange?: (signatureDataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Redraw all paths on the canvas
  const redraw = (canvas: HTMLCanvasElement, allPaths: Point[][], activePath: Point[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    // Clear the canvas taking CSS pixel dimensions since context is scaled by DPR
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Styling properties for a smooth ink-like stroke
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawPath = (path: Point[]) => {
      if (path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x * rect.width, path[0].y * rect.height);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * rect.width, path[i].y * rect.height);
      }
      ctx.stroke();
    };

    allPaths.forEach(drawPath);
    drawPath(activePath);
  };

  // Adjust canvas width and height to fit the container and scale for High-DPI screens
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    // Set internal canvas pixel dimensions to match device display resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    // Redraw all existing paths on the scaled canvas
    redraw(canvas, paths, currentPath);
  };

  // Setup ResizeObserver for robust layout responsiveness
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [paths, currentPath]);

  // Handle reporting data to the parent component
  const updateParent = (allPaths: Point[][]) => {
    if (!onChange) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (allPaths.length === 0) {
      onChange(null);
    } else {
      // Export as a PNG Data URL
      onChange(canvas.toDataURL('image/png'));
    }
  };

  // Helper to extract relative mouse/touch coordinates
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Return normalized coordinates (0 to 1) so it resizes properly
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default touch interactions like scrolling while signing
    if (e.cancelable) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    const newPath = [coords];
    setCurrentPath(newPath);

    const canvas = canvasRef.current;
    if (canvas) {
      redraw(canvas, paths, newPath);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    if (!coords) return;

    const newPath = [...currentPath, coords];
    setCurrentPath(newPath);

    const canvas = canvasRef.current;
    if (canvas) {
      redraw(canvas, paths, newPath);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const updatedPaths = [...paths, currentPath];
      setPaths(updatedPaths);
      setCurrentPath([]);
      updateParent(updatedPaths);
    }
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }
    if (onChange) onChange(null);
  };

  const undoSignature = () => {
    if (paths.length === 0) return;
    const updatedPaths = paths.slice(0, -1);
    setPaths(updatedPaths);
    setCurrentPath([]);
    const canvas = canvasRef.current;
    if (canvas) {
      redraw(canvas, updatedPaths, []);
    }
    updateParent(updatedPaths);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        ref={containerRef}
        className="relative border border-[#AEAEAE] rounded-[10px] bg-[#FAFAFA] h-[220px] w-full overflow-hidden cursor-crosshair touch-none select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Dash guide & watermark text */}
        {paths.length === 0 && currentPath.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <span className="text-[20px] font-medium text-[#AEAEAE] select-none" style={{ fontFamily: 'var(--font-anek-latin)' }}>
              Sign here using mouse, trackpad, or finger
            </span>
            <div className="w-[80%] border-b border-dashed border-[#AEAEAE] mt-8"></div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={clearSignature}
          disabled={paths.length === 0}
          className="flex items-center gap-2 border border-[#686868] rounded-[5px] h-[38px] px-5 text-[15px] font-medium text-black bg-[#EBEBEB] hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-anek-latin)' }}
        >
          <Trash2 size={16} />
          Clear
        </button>
        <button
          type="button"
          onClick={undoSignature}
          disabled={paths.length === 0}
          className="flex items-center gap-2 border border-[#686868] rounded-[5px] h-[38px] px-5 text-[15px] font-medium text-black bg-[#EBEBEB] hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-anek-latin)' }}
        >
          <RotateCcw size={16} />
          Undo
        </button>
      </div>
    </div>
  );
};
