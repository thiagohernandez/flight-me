'use client';

import { FlightData } from "@/types/flights";
import { useState, useEffect } from "react";

interface LEDFlightBoardProps {
  flights: FlightData[];
}

interface LEDFlightRowProps {
  flight: FlightData;
  delay: number;
}

function LEDFlightRow({ flight, delay }: LEDFlightRowProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const formatAltitude = (altitude: number) => {
    return altitude > 0 ? `${Math.round(altitude)}M` : "GND";
  };

  const formatVelocity = (velocity: number) => {
    return velocity > 0 ? `${Math.round(velocity * 3.6)}` : "0";
  };

  const formatHeading = (heading: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  const getStatusColor = (lastContact: number) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsAgo = now - lastContact;
    if (secondsAgo < 30) return "text-green-400";
    if (secondsAgo < 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div 
      className={`
        flex items-center h-12 border-b border-amber-600/30 font-mono text-amber-400 
        transition-all duration-1000 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
      style={{ 
        background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)',
        textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
      }}
    >
      {/* Flight Number */}
      <div className="w-24 px-3 text-center font-bold text-lg">
        {flight.callsign || 'UNKNOWN'}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Airline */}
      <div className="w-32 px-3 text-center text-sm truncate">
        {flight.airline || 'UNKNOWN'}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Aircraft */}
      <div className="w-28 px-3 text-center text-sm truncate">
        {flight.aircraft === 'Loading...' ? 'LOADING' : flight.aircraft || 'UNKNOWN'}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Altitude */}
      <div className="w-20 px-3 text-center">
        {formatAltitude(flight.altitude)}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Speed */}
      <div className="w-20 px-3 text-center">
        {formatVelocity(flight.velocity)} KMH
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Direction */}
      <div className="w-16 px-3 text-center">
        {formatHeading(flight.heading)}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Country */}
      <div className="w-24 px-3 text-center text-sm truncate">
        {flight.country || 'UNKNOWN'}
      </div>
      
      {/* Separator */}
      <div className="w-px h-8 bg-amber-600/50"></div>
      
      {/* Status Indicator */}
      <div className="w-16 px-3 text-center">
        <div className={`w-3 h-3 rounded-full mx-auto animate-pulse ${getStatusColor(flight.lastContact)} bg-current`}></div>
      </div>
    </div>
  );
}

export default function LEDFlightBoard({ flights }: LEDFlightBoardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black rounded-lg border-4 border-gray-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="h-16 flex items-center justify-between px-6 border-b-2 border-amber-600/50 font-mono text-amber-400"
        style={{ 
          background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(40,40,40,0.9) 100%)',
          textShadow: '0 0 10px currentColor',
        }}
      >
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold">✈️ FLIGHT INFORMATION</div>
          <div className="text-sm">LLIRIA SPAIN</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <div className="text-sm">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div 
        className="h-10 flex items-center font-mono text-amber-300 text-sm font-bold border-b border-amber-600/30"
        style={{ 
          background: 'linear-gradient(90deg, rgba(20,20,20,0.8) 0%, rgba(40,40,40,0.9) 100%)',
          textShadow: '0 0 5px currentColor',
        }}
      >
        <div className="w-24 px-3 text-center">FLIGHT</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-32 px-3 text-center">AIRLINE</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-28 px-3 text-center">AIRCRAFT</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-20 px-3 text-center">ALT</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-20 px-3 text-center">SPEED</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-16 px-3 text-center">DIR</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-24 px-3 text-center">ORIGIN</div>
        <div className="w-px h-6 bg-amber-600/50"></div>
        <div className="w-16 px-3 text-center">STATUS</div>
      </div>

      {/* Flight Data */}
      <div className="max-h-96 overflow-y-auto">
        {flights.length === 0 ? (
          <div className="h-24 flex items-center justify-center font-mono text-amber-400 text-lg">
            <div className="animate-pulse">NO FLIGHTS DETECTED</div>
          </div>
        ) : (
          flights.map((flight, index) => (
            <LEDFlightRow 
              key={flight.icao24} 
              flight={flight} 
              delay={index * 200} // Staggered animation
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div 
        className="h-8 flex items-center justify-center font-mono text-amber-400 text-xs border-t border-amber-600/30"
        style={{ 
          background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.9) 100%)',
          textShadow: '0 0 5px currentColor',
        }}
      >
        <div className="animate-pulse">REAL-TIME DATA • OPENSKY NETWORK • AUTO-REFRESH 30S</div>
      </div>
    </div>
  );
}