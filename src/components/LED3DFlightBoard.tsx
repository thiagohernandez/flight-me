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

// Font bitmap (5x7 pixel font) - same as the HTML version
const FONT_MAP: Record<string, number[][]> = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  B: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  C: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ],
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  I: [
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  J: [
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  K: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  N: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  Q: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  V: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  X: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ],
  ' ': [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ],
  '3': [
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '4': [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '6': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
  ],
  '-': [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  ':': [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

interface LED3DFlightBoardProps {
  flights: FlightData[];
}

// Convert text to bitmap
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
    const altitude = Math.round(flight.altitude * 3.28084); // Convert to feet
    const speed = Math.round(flight.velocity * 1.94384); // Convert to knots
    return `${callsign} ${altitude}FT ${speed}KT`;
  });

  return flightTexts.join("   -   ") + "     ";
}

// LED Matrix Component
function LEDMatrix({ text, scrollSpeed = 1.5 }: { text: string; scrollSpeed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ledsRef = useRef<THREE.Mesh[][]>([]);
  const scrollOffsetRef = useRef(0);

  // Create LED geometry and materials
  const ledGeometry = useMemo(() => new THREE.SphereGeometry(LED_SIZE, 8, 6), []);
  const offMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x441111,
    transparent: true,
    opacity: 0.3,
  }), []);

  // Initialize LEDs
  const leds = useMemo(() => {
    const ledArray: THREE.Mesh[][] = [];
    const ledElements: React.ReactElement[] = [];

    for (let row = 0; row < MATRIX_HEIGHT; row++) {
      ledArray[row] = [];
      for (let col = 0; col < MATRIX_WIDTH; col++) {
        const key = `led-${row}-${col}`;
        const x = (col - MATRIX_WIDTH / 2) * LED_SPACING;
        const y = (MATRIX_HEIGHT / 2 - row) * LED_SPACING;
        
        ledElements.push(
          <mesh
            key={key}
            geometry={ledGeometry}
            material={offMaterial.clone()}
            position={[x, y, 0]}
            ref={(ref) => {
              if (ref) ledArray[row][col] = ref;
            }}
          />
        );
      }
    }

    ledsRef.current = ledArray;
    return ledElements;
  }, [ledGeometry, offMaterial]);

  // Animation loop
  useFrame((state, delta) => {
    if (!ledsRef.current[0] || !ledsRef.current[0][0]) return;

    // Update scroll position
    scrollOffsetRef.current += scrollSpeed * delta * 20;

    const bitmap = textToBitmap(text);
    const bitmapWidth = bitmap[0]?.length || 0;

    // Clear all LEDs first
    for (let row = 0; row < MATRIX_HEIGHT; row++) {
      for (let col = 0; col < MATRIX_WIDTH; col++) {
        const led = ledsRef.current[row]?.[col];
        if (led && led.material instanceof THREE.MeshBasicMaterial) {
          led.material.color.setHex(0x441111);
          led.material.opacity = 0.3;
          led.scale.setScalar(1.0);
        }
      }
    }

    // Draw text on first 7 rows
    if (bitmapWidth > 0) {
      for (let row = 0; row < Math.min(7, MATRIX_HEIGHT); row++) {
        for (let col = 0; col < MATRIX_WIDTH; col++) {
          // Calculate the text position for scrolling
          const textCol = Math.floor(col + scrollOffsetRef.current) % (bitmapWidth + MATRIX_WIDTH);
          
          let isOn = false;
          if (textCol >= 0 && textCol < bitmapWidth && bitmap[row] && bitmap[row][textCol] !== undefined) {
            isOn = bitmap[row][textCol] === 1;
          }

          if (isOn) {
            const led = ledsRef.current[row]?.[col];
            if (led && led.material instanceof THREE.MeshBasicMaterial) {
              led.material.color.setHex(0xff4444);
              led.material.opacity = 1.0;
              led.scale.setScalar(1.2);
            }
          }
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

export default function LED3DFlightBoard({ flights }: LED3DFlightBoardProps) {
  const flightText = formatFlightText(flights);
  
  // For debugging - let's start with simple text to ensure it works
  const testText = flights.length > 0 ? flightText : "HELLO WORLD     ";

  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000011, 1);
        }}
      >
        <ambientLight intensity={0.5} color={0x222222} />
        <LEDMatrix text={testText} scrollSpeed={1.5} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded backdrop-blur-sm">
        <div className="text-sm">
          <div className="font-bold mb-1">3D LED Flight Display</div>
          <div className="text-xs opacity-80">
            {flights.length} flights • Drag to rotate • Scroll to zoom
          </div>
          <div className="text-xs mt-2 opacity-60">
            Text: &quot;{testText.substring(0, 20)}...&quot;
          </div>
        </div>
      </div>
    </div>
  );
}