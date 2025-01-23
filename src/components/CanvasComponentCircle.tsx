import React, { useRef, useState, useEffect } from 'react';
import './CanvasComponent.css';
import { Circles } from '../types';


interface CanvasComponentCircleProps {
    width: number;
    height: number;
}

export const CanvasComponentCircle: React.FC<CanvasComponentCircleProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    // State to store the two rectangles
    const [circles, setCircles] = useState<Circles[]>([]);

    const [tempCircles, setTempCircles] = useState<Circles | null>(null);

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

    // Add this useEffect to redraw circles when they change
    useEffect(() => {
        drawCircles(circles);
    }, [circles]);

    const drawCircles = (circles: Circles[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all circles, including temp circle
        const allCircles = tempCircles ? [...circles, tempCircles] : circles;

        // Draw each circles
        allCircles.forEach((circle) => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false)
            ctx.strokeStyle = 'blue';
            ctx.lineWidth=2;
            ctx.stroke();
            ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
            ctx.fill();
        });
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context) return;

        if (circles.length >= 2) return;

        const circle = canvasRef.current?.getBoundingClientRect();
        if (!circle) return;

        const x = event.clientX - circle.left;
        const y = event.clientY - circle.top;

        setStartingPoint({x, y});
        setTempCircles({x, y, radius: 0});
        setIsDrawing(true);
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!context || !isDrawing || !startingPoint || !tempCircles) return;

        const circle = canvasRef.current?.getBoundingClientRect();
        if (!circle) return;

       const x = event.clientX - circle.left;
       const y = event.clientY - circle.top;

        const width = x - startingPoint.x;
        const height = y - startingPoint.y;

        setTempCircles({...tempCircles, radius: Math.sqrt(width ** 2 + height ** 2)});
    }

    const handleMouseUp = () => {
        if (!isDrawing || !tempCircles) return;
    
        setIsDrawing(false);
        setCircles((prev) => [...prev, tempCircles]);
        setTempCircles(null);
        setStartingPoint(null);
    };

    const handleClear = () => {
        setCircles([]);
        setTempCircles(null);
        setIsDrawing(false);
        drawCircles([]);
    }

    //get dimensions of the rectangles
    const circle1 = circles[0];
    const circle2 = circles[1];

    const dimension1 = circle1 ? `Circle 1: ${Math.abs(circle1.radius)}` : 'Circle 1: N/A';
    const dimension2 = circle2 ? `Circle 2: ${Math.abs(circle2.radius)}` : 'Circle 2: N/A';

    const calculateDistance = (circle1: Circles, circle2: Circles) => {
        if (!circle1 || !circle2) return 0;

        const distance = Math.sqrt((circle1.x - circle2.x) ** 2 + (circle1.y - circle2.y) ** 2);
        return distance;
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
        <div>Circle 1: {dimension1}</div>
        <div>Circle 2: {dimension2}</div>
        <div>Distance: {calculateDistance(circle1, circle2)}</div>
        </div>
        <button onClick={handleClear}>Clear Canvas</button>
        </div>
    );
};