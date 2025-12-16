import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CATALOG } from '../constants';
import { ItemType } from '../types';
import * as THREE from 'three';

// Fix for JSX elements in R3F - Augmenting both global and React namespaces
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      primitive: any;
      pointLight: any;
      ambientLight: any;
      
      // Geometries
      boxGeometry: any;
      cylinderGeometry: any;
      planeGeometry: any;
      capsuleGeometry: any;
      circleGeometry: any;
      ringGeometry: any;
      torusGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      
      // Helpers
      gridHelper: any;
    }
  }
  // Also augment React.JSX for newer TS/React versions
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any;
        mesh: any;
        primitive: any;
        pointLight: any;
        ambientLight: any;
        
        boxGeometry: any;
        cylinderGeometry: any;
        planeGeometry: any;
        capsuleGeometry: any;
        circleGeometry: any;
        ringGeometry: any;
        torusGeometry: any;
        
        meshStandardMaterial: any;
        meshPhysicalMaterial: any;
        meshBasicMaterial: any;
        
        gridHelper: any;
      }
    }
  }
}

interface Building3DProps {
  type: ItemType;
  x: number;
  y: number;
  rotation?: number;
}

// --- SUB-COMPONENTS FOR REUSABLE PARTS ---

const StatusLEDs: React.FC<{ count: number; height: number; width: number }> = ({ count, height, width }) => {
    const refs = useRef<(THREE.Mesh | null)[]>([]);
    
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        refs.current.forEach((ref, i) => {
            if (ref) {
                // Random blinking pattern simulation using sine waves at different frequencies
                const intensity = (Math.sin(t * (2 + i) + i * 10) > 0.5) ? 1 : 0.2;
                (ref.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
            }
        });
    });

    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <mesh 
                    key={i} 
                    ref={el => refs.current[i] = el}
                    position={[width/2 - 0.05, -height/2 + (height/count)*(i+0.5), 0.42]}
                >
                    <boxGeometry args={[0.02, 0.02, 0.01]} />
                    <meshStandardMaterial color="#00ff00" emissive="#00ff00" toneMapped={false} />
                </mesh>
            ))}
        </group>
    );
};

const SpinningFan: React.FC<{ size: number; color: string; speed?: number }> = ({ size, color, speed = 10 }) => {
    const fanRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (fanRef.current) fanRef.current.rotation.z -= delta * speed;
    });

    return (
        <group ref={fanRef}>
            <mesh>
                <cylinderGeometry args={[size * 0.2, size * 0.2, 0.05, 8]} rotation={[Math.PI/2, 0, 0]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {[0, 1, 2, 3].map(i => (
                <mesh key={i} rotation={[0, 0, i * (Math.PI / 2)]}>
                    <boxGeometry args={[size * 0.8, size * 0.2, 0.02]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
};

// --- MAIN COMPONENT ---

export const Building3D: React.FC<Building3DProps> = ({ type, x, y, rotation = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const stats = CATALOG[type];
  const [hovered, setHover] = useState(false);

  // Animation refs for specific parts
  const turbineRef = useRef<THREE.Group>(null);
  const reactorRingRef1 = useRef<THREE.Group>(null);
  const reactorRingRef2 = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Smooth placement lerp
    if (groupRef.current) {
         groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation, 0.1);
         
         // Hover float effect
         const targetY = hovered ? 0.1 : 0;
         groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    }

    // Wind Turbine Animation
    if (stats.modelType === 'WIND' && turbineRef.current) {
        turbineRef.current.rotation.z -= 2 * delta; 
    }

    // Reactor Animation
    if (stats.modelType === 'REACTOR') {
        if (reactorRingRef1.current) reactorRingRef1.current.rotation.x += delta * 0.5;
        if (reactorRingRef1.current) reactorRingRef1.current.rotation.z += delta * 0.2;
        if (reactorRingRef2.current) reactorRingRef2.current.rotation.x -= delta * 0.3;
    }
  });

  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: stats.color,
      roughness: 0.2,
      metalness: 0.7
  }), [stats.color]);

  const darkMetalMaterial = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.8 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({ 
      color: '#88ccff', 
      roughness: 0.0, 
      metalness: 0.1, 
      transmission: 0.6, 
      transparent: true,
      thickness: 0.5
  });

  const renderDetailedModel = () => {
      switch (stats.modelType) {
          case 'RACK':
              return (
                  <group>
                      {/* Frame */}
                      <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                          <boxGeometry args={[0.85, stats.height, 0.85]} />
                      </mesh>
                      
                      {/* Server Blades (The "Face") */}
                      <group position={[0, stats.height/2, 0.43]}>
                          {Array.from({ length: Math.floor(stats.height * 5) }).map((_, i, arr) => (
                              <mesh key={i} position={[0, (i - arr.length/2) * 0.18, 0]}>
                                  <boxGeometry args={[0.7, 0.15, 0.05]} />
                                  <meshStandardMaterial color="#222" roughness={0.8} />
                              </mesh>
                          ))}
                      </group>

                      {/* Glass Door */}
                      <mesh position={[0, stats.height/2, 0.45]}>
                          <boxGeometry args={[0.8, stats.height - 0.1, 0.02]} />
                          <primitive object={glassMaterial} />
                      </mesh>

                      {/* Side Vents */}
                      <mesh position={[0.43, stats.height/2, 0]}>
                          <boxGeometry args={[0.02, stats.height - 0.2, 0.6]} />
                          <meshStandardMaterial color="#111" />
                      </mesh>
                      <mesh position={[-0.43, stats.height/2, 0]}>
                          <boxGeometry args={[0.02, stats.height - 0.2, 0.6]} />
                          <meshStandardMaterial color="#111" />
                      </mesh>

                      {/* Activity LEDs */}
                      <group position={[0, stats.height/2, 0]}>
                          <StatusLEDs count={Math.floor(stats.height * 4)} height={stats.height} width={0.7} />
                      </group>
                      
                      {/* Top Cable Tray */}
                      <mesh position={[0, stats.height + 0.05, 0]}>
                          <boxGeometry args={[0.6, 0.1, 0.6]} />
                          <meshStandardMaterial color="#333" wireframe />
                      </mesh>
                  </group>
              );

          case 'BOX': // Air Cooling & Generators usually
              if (stats.type === 'COOLING') {
                  // Industrial AC Unit Look
                  return (
                      <group>
                          {/* Main Chassis */}
                          <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                              <boxGeometry args={[0.9, stats.height, 0.9]} />
                          </mesh>
                          
                          {/* Front Grills */}
                          <group position={[0, stats.height/2, 0.46]}>
                              {Array.from({ length: 6 }).map((_, i) => (
                                  <mesh key={i} position={[0, (i-2.5)*0.15, 0]} rotation={[Math.PI/4, 0, 0]}>
                                      <boxGeometry args={[0.8, 0.02, 0.05]} />
                                      <meshStandardMaterial color="#111" />
                                  </mesh>
                              ))}
                          </group>

                          {/* Top Fans */}
                          <group position={[0, stats.height, 0]} rotation={[-Math.PI/2, 0, 0]}>
                               <mesh>
                                   <boxGeometry args={[0.8, 0.8, 0.1]} />
                                   <meshStandardMaterial color="#222" />
                               </mesh>
                               <group position={[0, 0, 0.06]}>
                                   <SpinningFan size={0.7} color="#555" speed={15} />
                                   <mesh position={[0,0,0.05]}>
                                       <ringGeometry args={[0.1, 0.36, 16]} />
                                       <meshBasicMaterial color="#000" wireframe />
                                   </mesh>
                               </group>
                          </group>
                      </group>
                  );
              } else if (stats.type === 'POWER' && stats.id.includes('GEN')) {
                  // Diesel Generator Look
                  return (
                      <group>
                          {/* Engine Block */}
                          <mesh position={[0, 0.4, 0]} material={baseMaterial}>
                              <boxGeometry args={[0.9, 0.6, 0.9]} />
                          </mesh>
                          <mesh position={[0, 0.8, 0]}>
                              <boxGeometry args={[0.8, 0.4, 0.5]} />
                              <meshStandardMaterial color="#333" />
                          </mesh>

                          {/* Exhaust Pipe */}
                          <group position={[0.3, 1.0, -0.3]}>
                              <mesh>
                                  <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                                  <meshStandardMaterial color="#555" />
                              </mesh>
                              <mesh position={[0, 0.3, 0]}>
                                  <cylinderGeometry args={[0.08, 0.05, 0.1]} />
                                  <meshStandardMaterial color="#222" />
                              </mesh>
                          </group>

                          {/* Radiator Grill */}
                          <mesh position={[0, 0.4, 0.46]}>
                              <planeGeometry args={[0.8, 0.5]} />
                              <meshStandardMaterial color="#111" />
                          </mesh>
                      </group>
                  );
              } else {
                  // Generic / Battery
                  return (
                    <group>
                        <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                            <boxGeometry args={[0.9, stats.height, 0.4]} />
                        </mesh>
                        {/* Battery Charge Indicator */}
                        <mesh position={[0, stats.height - 0.2, 0.21]}>
                            <planeGeometry args={[0.6, 0.05]} />
                            <meshStandardMaterial color="#00ff00" emissive="#00ff00" />
                        </mesh>
                    </group>
                  );
              }

          case 'TANK': // Immersion Cooling
              return (
                  <group>
                      {/* Tub */}
                      <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                          <boxGeometry args={[0.95, stats.height, 0.95]} />
                      </mesh>
                      
                      {/* Inner Fluid Surface */}
                      <mesh position={[0, stats.height - 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                          <planeGeometry args={[0.85, 0.85]} />
                          <meshPhysicalMaterial 
                              color="#00ffff" 
                              transmission={0.8} 
                              roughness={0.2} 
                              clearcoat={1}
                              transparent 
                          />
                      </mesh>

                      {/* Submerged Servers hints */}
                      {[0, 1, 2].map(i => (
                          <mesh key={i} position={[(i-1)*0.25, stats.height/2, 0]}>
                              <boxGeometry args={[0.05, 0.4, 0.6]} />
                              <meshStandardMaterial color="#111" />
                          </mesh>
                      ))}

                      {/* Pipes */}
                      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, Math.PI/2]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                          <meshStandardMaterial color="#888" />
                      </mesh>
                  </group>
              );

          case 'REACTOR': // SMR Nuclear
              return (
                  <group>
                      {/* Base Containment */}
                      <mesh position={[0, 0.2, 0]} material={darkMetalMaterial}>
                          <cylinderGeometry args={[0.5, 0.6, 0.4, 16]} />
                      </mesh>

                      {/* Glowing Core */}
                      <mesh position={[0, 1, 0]}>
                          <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
                          <meshStandardMaterial color="#44ff88" emissive="#44ff88" emissiveIntensity={2} />
                      </mesh>
                      <pointLight position={[0, 1, 0]} color="#44ff88" distance={4} decay={2} intensity={2} />

                      {/* Glass Shell */}
                      <mesh position={[0, 1, 0]}>
                           <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
                           <primitive object={glassMaterial} />
                      </mesh>

                      {/* Spinning Containment Rings */}
                      <group position={[0, 1, 0]} ref={reactorRingRef1}>
                          <mesh rotation={[Math.PI/4, 0, 0]}>
                              <torusGeometry args={[0.5, 0.02, 8, 32]} />
                              <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
                          </mesh>
                      </group>
                      <group position={[0, 1, 0]} ref={reactorRingRef2}>
                          <mesh rotation={[-Math.PI/4, 0, 0]}>
                              <torusGeometry args={[0.4, 0.02, 8, 32]} />
                              <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
                          </mesh>
                      </group>
                  </group>
              );

          case 'WIND': // Wind Turbine
              return (
                  <group>
                       {/* Tower */}
                       <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                          <cylinderGeometry args={[0.08, 0.15, stats.height]} />
                      </mesh>
                      {/* Nacelle */}
                      <mesh position={[0, stats.height, 0.1]} rotation={[Math.PI/2, 0, 0]} material={baseMaterial}>
                          <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
                      </mesh>
                      {/* Rotor */}
                      <group position={[0, stats.height, 0.3]} ref={turbineRef}>
                          <mesh rotation={[Math.PI/2, 0, 0]}>
                              <cylinderGeometry args={[0.05, 0.05, 0.1]} />
                              <meshStandardMaterial color="#ddd" />
                          </mesh>
                          {[0, 1, 2].map(i => (
                              <mesh key={i} rotation={[0, 0, i * (Math.PI * 2) / 3]} position={[0, 0.8, 0]}>
                                  <boxGeometry args={[0.15, 1.8, 0.02]} />
                                  <meshStandardMaterial color="#fff" />
                              </mesh>
                          ))}
                      </group>
                  </group>
              );

          case 'SOLAR':
              return (
                  <group>
                      {/* Stand */}
                      <mesh position={[0, 0.1, 0]}>
                          <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                          <meshStandardMaterial color="#444" />
                      </mesh>
                      {/* Panel */}
                      <group position={[0, 0.2, 0]} rotation={[-Math.PI/6, 0, 0]}>
                           <mesh>
                               <boxGeometry args={[0.95, 0.05, 0.95]} />
                               <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.2} />
                           </mesh>
                           {/* Cells Texture Simulation */}
                           <mesh position={[0, 0.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
                               <planeGeometry args={[0.9, 0.9, 2, 2]} />
                               <meshStandardMaterial color="#000044" metalness={0.8} roughness={0.2} />
                           </mesh>
                           <mesh position={[0, 0.031, 0]} rotation={[-Math.PI/2, 0, 0]}>
                               <gridHelper args={[0.9, 3, 0xaaaaaa, 0xaaaaaa]} rotation={[Math.PI/2, 0, 0]} />
                           </mesh>
                      </group>
                  </group>
              );

          default:
              return (
                  <mesh position={[0, stats.height/2, 0]} material={baseMaterial}>
                      <boxGeometry args={[0.8, stats.height, 0.8]} />
                  </mesh>
              );
      }
  };

  return (
    <group 
        ref={groupRef} 
        position={[x, 0, y]}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
    >
      {renderDetailedModel()}
      
      {/* Selection Highlight */}
      {hovered && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[0.5, 0.6, 32]} />
              <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
          </mesh>
      )}

      {/* Shadow/Base Plate */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <circleGeometry args={[0.45, 32]} />
         <meshBasicMaterial color="#000000" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

export const GhostBuilding: React.FC<{ type: ItemType; x: number; y: number; valid: boolean }> = ({ type, x, y, valid }) => {
    const stats = CATALOG[type];
    return (
        <group position={[x, stats.height / 2, y]}>
            <mesh>
                <boxGeometry args={[0.8, stats.height, 0.8]} />
                <meshStandardMaterial 
                    color={valid ? '#10b981' : '#ef4444'} 
                    transparent 
                    opacity={0.4} 
                    wireframe
                />
            </mesh>
            <mesh position={[0, -stats.height/2 + 0.02, 0]} rotation={[-Math.PI/2,0,0]}>
                 <planeGeometry args={[0.9, 0.9]} />
                 <meshBasicMaterial color={valid ? '#10b981' : '#ef4444'} opacity={0.2} transparent />
            </mesh>
        </group>
    );
}