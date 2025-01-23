import React from 'react';
import './CanvasLayout.css';

interface CanvasLayoutProps {
    children: React.ReactNode;
}

export const CanvasLayout: React.FC<CanvasLayoutProps> = ({ children }) => {
    return (
        <div className="canvas-layout">
            {children}
        </div>
    );
};