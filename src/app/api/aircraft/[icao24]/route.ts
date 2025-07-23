import { NextRequest, NextResponse } from 'next/server';
import { AircraftMetadata } from '@/types/flights';

export async function GET(
  request: NextRequest,
  { params }: { params: { icao24: string } }
) {
  const { icao24 } = params;
  
  if (!icao24) {
    return NextResponse.json({ error: 'ICAO24 required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`,
      {
        headers: {
          'User-Agent': 'Flight Tracker Lliria/1.0',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    const data: AircraftMetadata = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch aircraft metadata for ${icao24}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft data' },
      { status: 500 }
    );
  }
}