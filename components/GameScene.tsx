import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Building3D, GhostBuilding } from './Building3D';
import { GridItem, ItemType, ToolMode } from '../types';

// Fix for JSX elements in R3F - Augmenting both global and React namespaces
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      
      // HTML Elements
      div: any;
      span: any;
      p: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      button: any;
      input: any;
    }
  }
  // Also augment React.JSX
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        ambientLight: any;
        pointLight: any;
        group: any;
        mesh: any;
        planeGeometry: any;
        meshBasicMaterial: any;
        
        // HTML Elements
        div: any;
        span: any;
        p: any;
        h1: any;
        h2: any;
        h3: any;
        h4: any;
        button: any;
        input: any;
      }
    }
  }
}

interface GameSceneProps {
  gridSize: number;
  items: GridItem[];
  placementMode: ItemType | null;
  toolMode: ToolMode;
  onPlaceItem: (x: number, y: number) => void;
  onItemClick: (item: GridItem) => void;
}

export const GameScene: React.FC<GameSceneProps> = ({ 
  gridSize, 
  items, 
  placementMode, 
  toolMode,
  onPlaceItem,
  onItemClick 
}) => {
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  // Helper to snap to grid centers
  // Math.floor(val) + 0.5 centers the object in the 1x1 grid cell
  const snapToGrid = (val: number) => Math.floor(val) + 0.5;

  return (
    <div className={`w-full h-full bg-slate-900 shadow-inner cursor-${toolMode === ToolMode.SELL ? 'crosshair' : toolMode === ToolMode.MOVE ? 'move' : 'default'}`}>
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />

        <OrbitControls 
            makeDefault 
            maxPolarAngle={Math.PI / 2.2} // Prevent going under the floor
            minDistance={5}
            maxDistance={40}
        />

        {/* The Grid Floor */}
        <Grid 
            args={[gridSize, gridSize]} 
            cellSize={1} 
            cellThickness={0.6} 
            cellColor="#475569" 
            sectionSize={5} 
            sectionColor="#64748b" 
            fadeDistance={30}
            infiniteGrid={false}
            position={[0, 0, 0]}
        />
        
        {/* Invisible plane for catching clicks */}
        <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.01, 0]}
            onPointerMove={(e) => {
                const x = snapToGrid(e.point.x);
                const z = snapToGrid(e.point.z);
                
                // Limit to grid bounds centered at 0,0
                // Since we use center snapping (+0.5), the bounds logic needs to account for half-width
                const half = gridSize / 2;
                
                if (x > -half && x < half && z > -half && z < half) {
                     setHoverPos({ x, y: z });
                } else {
                    setHoverPos(null);
                }
            }}
            onClick={(e) => {
                if (hoverPos && placementMode) {
                    // Prevent propagation to controls
                    e.stopPropagation();
                    onPlaceItem(hoverPos.x, hoverPos.y);
                }
            }}
        >
            <planeGeometry args={[gridSize, gridSize]} />
            <meshBasicMaterial visible={false} />
        </mesh>

        {/* Placed Items */}
        {items.map((item) => (
          <group 
            key={item.id} 
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item);
            }}
            onPointerOver={() => {
                if (toolMode !== ToolMode.BUILD) {
                    document.body.style.cursor = toolMode === ToolMode.SELL ? 'alias' : 'grab';
                }
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'auto';
            }}
          >
             <Building3D type={item.type} x={item.x} y={item.y} rotation={item.rotation} />
          </group>
        ))}

        {/* Placement Ghost */}
        {placementMode && hoverPos && (
            <GhostBuilding 
                type={placementMode} 
                x={hoverPos.x} 
                y={hoverPos.y} 
                valid={!items.find(i => Math.abs(i.x - hoverPos.x) < 0.1 && Math.abs(i.y - hoverPos.y) < 0.1)}
            />
        )}

      </Canvas>
    </div>
  );
};