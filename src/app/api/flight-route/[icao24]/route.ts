import { NextRequest, NextResponse } from 'next/server';
import { findAirport, getAirportCity } from '@/lib/airport-lookup';

interface OpenSkyFlight {
  icao24: string;
  firstSeen: number;
  estDepartureAirport: string | null;
  lastSeen: number;
  estArrivalAirport: string | null;
  callsign: string;
  estDepartureAirportHorizDistance: number;
  estDepartureAirportVertDistance: number;
  estArrivalAirportHorizDistance: number;
  estArrivalAirportVertDistance: number;
  departureAirportCandidatesCount: number;
  arrivalAirportCandidatesCount: number;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ icao24: string }> }
) {
  const { icao24 } = await context.params;
  
  if (!icao24) {
    return NextResponse.json({ error: 'ICAO24 required' }, { status: 400 });
  }

  try {
    // Get current timestamp and 24 hours ago
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - (24 * 60 * 60);

    // Fetch flight data from OpenSky for this aircraft in the last 24 hours
    const url = `https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=${yesterday}&end=${now}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flight Tracker/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Flight data not found' }, { status: 404 });
    }

    const flights: OpenSkyFlight[] = await response.json();
    
    if (!flights || flights.length === 0) {
      return NextResponse.json({ error: 'No recent flights found' }, { status: 404 });
    }

    // Get the most recent flight
    const recentFlight = flights[flights.length - 1];
    
    let originCity = 'Unknown Origin';
    let destinationCity = 'Unknown Destination';

    // Look up departure airport
    if (recentFlight.estDepartureAirport) {
      const departureAirport = await findAirport(recentFlight.estDepartureAirport);
      if (departureAirport) {
        originCity = getAirportCity(departureAirport);
      }
    }

    // Look up arrival airport
    if (recentFlight.estArrivalAirport) {
      const arrivalAirport = await findAirport(recentFlight.estArrivalAirport);
      if (arrivalAirport) {
        destinationCity = getAirportCity(arrivalAirport);
      }
    }

    return NextResponse.json({
      icao24: icao24,
      originCity,
      destinationCity,
      departureAirport: recentFlight.estDepartureAirport,
      arrivalAirport: recentFlight.estArrivalAirport,
      callsign: recentFlight.callsign,
      lastSeen: recentFlight.lastSeen
    });

  } catch (error) {
    console.error(`Failed to fetch flight route for ${icao24}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch flight route data' },
      { status: 500 }
    );
  }
}