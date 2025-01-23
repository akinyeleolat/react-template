import React, { useRef, useState, useEffect } from 'react';
import './CanvasComponent.css';
import { Rectangle } from '../types';


interface CanvasComponentProps {
    width: number;
    height: number;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    // State to store the two rectangles
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);

    const [tempRect, setTempRect] = useState<Rectangle | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const [startingPoint, setStartingPoint] = useState<{x:number, y:number}|null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const renderCtx = canvasRef.current.getContext('2d');
            if (renderCtx) {
                setContext(renderCtx);
            }
        }
    }, [canvasRef]);

    // Draw the rectangles whenever they are updated
    useEffect(() => {
        drawRectangles(rectangles);
    }, [rectangles]);

    const drawRectangles = (rects: Rectangle[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        // Draw each rectangle
        rects.forEach((rect) => {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fill();
      });
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context) return;

        if (rectangles.length >= 2) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setStartingPoint({x, y});
        setTempRect({x, y, width: 0, height: 0});
        setIsDrawing(true);
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context || !isDrawing || !startingPoint || !tempRect) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const width = x - startingPoint.x;
        const height = y - startingPoint.y;

        setTempRect({...tempRect, width, height});
    }

    const handleMouseUp = () => {
        if (!isDrawing || !tempRect) return;
    
        setIsDrawing(false);
        // Add tempRect to rectangles
        setRectangles((prev) => [...prev, tempRect]);
        setTempRect(null);
        setStartingPoint(null);
    };

    const handleClear = () => {
        setRectangles([]);
        setTempRect(null);
        setIsDrawing(false);
        drawRectangles([]);
    }

    //get dimensions of the rectangles
    const rect1 = rectangles[0];
    const rect2 = rectangles[1];

    const dimension1 = rect1 ? `Rectangle 1: ${Math.abs(rect1.width)} x ${Math.abs(rect1.height)}` : 'Rectangle 1: N/A';
    const dimension2 = rect2 ? `Rectangle 2: ${Math.abs(rect2.width)} x ${Math.abs(rect2.height)}` : 'Rectangle 2: N/A';

    const calculateDistance = (rect1: Rectangle, rect2: Rectangle) => {
        if (!rect1 || !rect2) return 0;

        const x1 = rect1.x + rect1.width / 2;
        const y1 = rect1.y + rect1.height / 2;
        const x2 = rect2.x + rect2.width / 2;
        const y2 = rect2.y + rect2.height / 2;

        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    


    return (
        <div>
        <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="canvas" 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        />
        <div style={{ marginTop: '1rem' }}>
        <div>Rectangle 1: {dimension1}</div>
        <div>Rectangle 2: {dimension2}</div>
        <div>Distance: {calculateDistance(rect1, rect2)}</div>
      </div>
      <button onClick={handleClear}>Clear Canvas</button>
        </div>
    );
};