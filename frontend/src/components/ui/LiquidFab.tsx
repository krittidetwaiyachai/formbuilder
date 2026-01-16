import React from 'react';
import './LiquidFab.css';

interface LiquidFabProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string; // Allow passing external classes
}

export const LiquidFab: React.FC<LiquidFabProps> = ({ onClick, isOpen, className }) => {
  return (
    <div 
        className={`loader cursor-pointer ${className || ''}`}
        onClick={onClick}
        style={{ 
            '--size': '0.73', 
            '--rotation': isOpen ? '45deg' : '0deg' 
        } as React.CSSProperties} // Scale down to approx 25px
        role="button"
        tabIndex={0}
    >
      <svg width="100" height="100" viewBox="0 0 100 100">
        <defs>
          <mask id="clipping">
            <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
            <polygon points="25,25 75,25 50,75" fill="white"></polygon>
            <polygon points="50,25 75,75 25,75" fill="white"></polygon>
            <polygon points="35,35 65,35 50,65" fill="white"></polygon>
            <polygon points="35,35 65,35 50,65" fill="white"></polygon>
            <polygon points="35,35 65,35 50,65" fill="white"></polygon>
            <polygon points="35,35 65,35 50,65" fill="white"></polygon>
          </mask>
        </defs>
      </svg>
      <div className="box"></div>
    </div>
  );
};
