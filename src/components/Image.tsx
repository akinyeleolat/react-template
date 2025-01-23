import React, { useEffect, useState, useRef } from "react";

interface CanvasProps {
    width: number;
    height: number;
}

interface Point {
    x: number;
    y: number;
}

interface ImageDimensions {
    width: number;
    height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [point, setPoint] = useState<Point>();
    const [isDragging, setIsDragging] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<Point>();
    const [distance, setDistance] = useState<number>(0);
    const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width, height });
    const [isResizing, setIsResizing] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleZoomIn = () => {
        setZoomLevel(prev => {
            const newZoom = prev + 0.1;
            const newWidth = width * newZoom;
            const newHeight = height * newZoom;
            setImageDimensions({ width: newWidth, height: newHeight });
            return newZoom;
        });
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const newZoom = Math.max(0.1, prev - 0.1);
            const newWidth = width * newZoom;
            const newHeight = height * newZoom;
            setImageDimensions({ width: newWidth, height: newHeight });
            return newZoom;
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        
        if (context) {
            context.clearRect(0, 0, width, height);
            context.getImageData(0, 0, width, height);
        }
    }, [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (context) {
            drawImage(context, imageDimensions.width, imageDimensions.height);
        }
    }, [imageDimensions, zoomLevel]);

    const drawImage = (context: CanvasRenderingContext2D, width: number, height: number) => {
        context.clearRect(0, 0, width, height);
        const image = new Image();
        image.src = 'https://plus.unsplash.com/premium_photo-1670148434900-5f0af77ba500?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
        image.onload = () => {
            context.save();
            context.scale(zoomLevel, zoomLevel);
            context.drawImage(image, 0, 0, width / zoomLevel, height / zoomLevel);
            context.restore();
        };
    };

    const getRelativePosition = (event: React.MouseEvent): Point => {
        if (canvasRef.current) {
            const { left, top } = canvasRef.current.getBoundingClientRect();
            return {
                x: (event.clientX - left) / zoomLevel,
                y: (event.clientY - top) / zoomLevel
            };
        }
        return { x: 0, y: 0 };
    };

    const calculateDistance = (pointA: Point, pointB: Point): number => {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const newPoint = getRelativePosition(event);
        
        const isInResizeArea = 
            newPoint.x > imageDimensions.width / zoomLevel - 20 && 
            newPoint.y > imageDimensions.height / zoomLevel - 20;

        if (isInResizeArea) {
            setIsResizing(true);
        } else {
            setIsDragging(true);
        }

        setPoint(newPoint);
        setCurrentPosition(newPoint);
        setDistance(0);
    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const endPoint = getRelativePosition(event);
        
        if (isResizing) {
            setIsResizing(false);
        } else if (point) {
            const finalDistance = calculateDistance(point, endPoint);
            setDistance(finalDistance);
        }
        
        setPoint(undefined);
        setIsDragging(false);
        setCurrentPosition(undefined);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!point || (!isDragging && !isResizing)) return;
        
        const newPosition = getRelativePosition(event);
        setCurrentPosition(newPosition);
        
        if (isResizing) {
            setImageDimensions({
                width: Math.max(50, newPosition.x * zoomLevel),
                height: Math.max(50, newPosition.y * zoomLevel)
            });
        } else {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            
            if (context) {
                context.clearRect(0, 0, imageDimensions.width, imageDimensions.height);
                drawImage(context, imageDimensions.width, imageDimensions.height);
                context.beginPath();
                context.moveTo(point.x * zoomLevel, point.y * zoomLevel);
                context.lineTo(newPosition.x * zoomLevel, newPosition.y * zoomLevel);
                context.stroke();
                setDistance(calculateDistance(point, newPosition));
            }
        }
    };

    return (
        <div className="canvas-container">
            <div className="controls" style={{ marginBottom: '10px' }}>
                <button 
                    onClick={handleZoomIn}
                    style={{ marginRight: '5px' }}
                >
                    Zoom In (+)
                </button>
                <button 
                    onClick={handleZoomOut}
                    style={{ marginRight: '5px' }}
                >
                    Zoom Out (-)
                </button>
                <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
            <canvas
                id="canvas"
                width={imageDimensions.width}
                height={imageDimensions.height}
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ 
                    border: '1px solid #ccc',
                    cursor: isResizing ? 'nwse-resize' : 'default'
                }}
            />
            <div className="resize-handle" 
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '20px',
                    height: '20px',
                    cursor: 'nwse-resize',
                    background: 'rgba(0,0,0,0.1)'
                }}
            />
            <div className="metrics">
                <div>Position: {currentPosition ? `(${Math.round(currentPosition.x)}, ${Math.round(currentPosition.y)})` : 'Not dragging'}</div>
                <div>Distance: {Math.round(distance)}px</div>
                <div>Dimensions: {Math.round(imageDimensions.width)}x{Math.round(imageDimensions.height)}</div>
            </div>
        </div>
    );
};