'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FlightData } from '@/types/flights';

// LED Matrix Configuration
const MATRIX_WIDTH = 64;
const MATRIX_HEIGHT = 16;
const LED_SIZE = 0.15;
const LED_SPACING = 0.3;

// Full font for LED display
const FONT_MAP: Record<string, number[][]> = {
  A: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  B: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  C: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  D: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  E: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
  F: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  G: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  H: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  I: [[0, 1, 1, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  J: [[0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  K: [[1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [0, 0, 0, 0, 0]],
  L: [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
  M: [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  N: [[1, 0, 0, 0, 1], [1, 1, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  O: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  P: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  Q: [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 0], [0, 1, 1, 0, 1], [0, 0, 0, 0, 0]],
  R: [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [0, 0, 0, 0, 0]],
  S: [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  T: [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  U: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  V: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  W: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 1, 0, 1, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  X: [[1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0]],
  Y: [[1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  Z: [[1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
  '0': [[0, 1, 1, 1, 0], [1, 0, 0, 1, 1], [1, 0, 1, 0, 1], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '1': [[0, 0, 1, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '2': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
  '3': [[1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '4': [[1, 0, 0, 1, 0], [1, 0, 0, 1, 0], [1, 0, 0, 1, 0], [1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0]],
  '5': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '6': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '7': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 0, 0, 0]],
  '8': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  '9': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]],
  ' ': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '-': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  ':': [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
};

interface SimpleLED3DProps {
  flights: FlightData[];
}

function textToBitmap(text: string): number[][] {
  const bitmap: number[][] = [];
  
  for (let row = 0; row < 7; row++) {
    bitmap[row] = [];
    let colIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();
      const fontData = FONT_MAP[char] || FONT_MAP[' '];

      for (let col = 0; col < 5; col++) {
        bitmap[row][colIndex] = fontData[row][col];
        colIndex++;
      }
      // Add space between characters
      bitmap[row][colIndex] = 0;
      colIndex++;
    }
  }

  return bitmap;
}

// Format flight data for display
function formatFlightText(flights: FlightData[]): string {
  if (flights.length === 0) {
    return "NO FLIGHTS DETECTED     ";
  }

  const flightTexts = flights.map(flight => {
    const callsign = flight.callsign !== "Unknown" ? flight.callsign.trim() : flight.icao24.slice(-4).toUpperCase();
    const airline = flight.airline !== "Unknown" ? flight.airline : "UNKNOWN AIRLINE";
    const originCity = flight.originCity && flight.originCity !== "Unknown" ? flight.originCity : flight.country;
    
    return `${callsign} - ${airline} - FROM ${originCity}`;
  });

  return flightTexts.join("   •   ") + "     ";
}

function LEDMatrix({ text }: { text: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const scrollOffsetRef = useRef(0);

  // Create LED positions and refs
  const ledRefs = useRef<(THREE.Mesh | null)[][]>([]);
  
  // Initialize LED grid
  for (let row = 0; row < MATRIX_HEIGHT; row++) {
    if (!ledRefs.current[row]) {
      ledRefs.current[row] = [];
    }
  }

  const leds = useMemo(() => {
    const elements = [];
    for (let row = 0; row < MATRIX_HEIGHT; row++) {
      for (let col = 0; col < MATRIX_WIDTH; col++) {
        const x = (col - MATRIX_WIDTH / 2) * LED_SPACING;
        const y = (MATRIX_HEIGHT / 2 - row) * LED_SPACING;
        
        elements.push(
          <mesh
            key={`${row}-${col}`}
            position={[x, y, 0]}
            ref={(ref) => {
              if (ledRefs.current[row]) {
                ledRefs.current[row][col] = ref;
              }
            }}
          >
            <sphereGeometry args={[LED_SIZE, 8, 6]} />
            <meshBasicMaterial color={0x441111} transparent opacity={0.3} />
          </mesh>
        );
      }
    }
    return elements;
  }, []);

  useFrame((state, delta) => {
    scrollOffsetRef.current += delta * 15; // Scroll speed
    
    const bitmap = textToBitmap(text);
    const bitmapWidth = bitmap[0]?.length || 0;

    // Update LEDs
    for (let row = 0; row < MATRIX_HEIGHT; row++) {
      for (let col = 0; col < MATRIX_WIDTH; col++) {
        const led = ledRefs.current[row]?.[col];
        if (!led || !(led.material instanceof THREE.MeshBasicMaterial)) continue;

        let isOn = false;
        
        // Only use first 7 rows for text
        if (row < 7 && bitmapWidth > 0) {
          const textCol = Math.floor(col + scrollOffsetRef.current) % (bitmapWidth + 20);
          if (textCol >= 0 && textCol < bitmapWidth && bitmap[row]) {
            isOn = bitmap[row][textCol] === 1;
          }
        }

        // Update LED appearance with flight-specific effects
        if (isOn) {
          // Add some color variation based on scroll position for visual interest
          const colorVariation = Math.sin(scrollOffsetRef.current * 0.01 + col * 0.1) * 0.3 + 0.7;
          const red = Math.floor(0xff * colorVariation);
          const color = (red << 16) | (0x44 << 8) | 0x44;
          
          led.material.color.setHex(color);
          led.material.opacity = 1.0;
          led.scale.setScalar(1.1 + Math.sin(scrollOffsetRef.current * 0.05 + col * 0.2) * 0.1);
        } else {
          led.material.color.setHex(0x441111);
          led.material.opacity = 0.3;
          led.scale.setScalar(1.0);
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {leds}
      {/* Background panel */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[MATRIX_WIDTH * LED_SPACING + 1, MATRIX_HEIGHT * LED_SPACING + 1]} />
        <meshBasicMaterial color={0x111111} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export default function SimpleLED3D({ flights }: SimpleLED3DProps) {
  const displayText = formatFlightText(flights);
  const testText = displayText.length > 20 ? displayText : "HELLO WORLD     ";

  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000011, 1);
        }}
      >
        <ambientLight intensity={0.5} color={0x222222} />
        <LEDMatrix text={testText} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded backdrop-blur-sm">
        <div className="text-sm">
          <div className="font-bold mb-1">3D LED Flight Display</div>
          <div className="text-xs opacity-80">
            {flights.length} flights • Drag to rotate • Scroll to zoom
          </div>
          <div className="text-xs mt-2 opacity-60">
            Text: &quot;{testText.substring(0, 30)}...&quot;
          </div>
        </div>
      </div>
    </div>
  );
}