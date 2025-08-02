// Airport lookup service using airports.json data

export interface Airport {
  id: number;
  ident: string;
  type: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  elevation_ft: number;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  icao_code: string;
  iata_code: string;
  gps_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

// Cache for airports data
let airportsCache: Airport[] | null = null;

// Load airports data
async function loadAirports(): Promise<Airport[]> {
  if (airportsCache) {
    return airportsCache;
  }

  try {
    const response = await fetch('/data/airports.json');
    if (!response.ok) {
      throw new Error('Failed to load airports data');
    }
    
    airportsCache = await response.json();
    return airportsCache || [];
  } catch (error) {
    console.error('Error loading airports:', error);
    return [];
  }
}

// Find airport by ICAO code
export async function findAirportByICAO(icaoCode: string): Promise<Airport | null> {
  if (!icaoCode || icaoCode.length !== 4) {
    return null;
  }

  const airports = await loadAirports();
  return airports.find(airport => 
    airport.icao_code === icaoCode.toUpperCase()
  ) || null;
}

// Find airport by IATA code
export async function findAirportByIATA(iataCode: string): Promise<Airport | null> {
  if (!iataCode || iataCode.length !== 3) {
    return null;
  }

  const airports = await loadAirports();
  return airports.find(airport => 
    airport.iata_code === iataCode.toUpperCase()
  ) || null;
}

// Find airport by any identifier (ICAO, IATA, or ident)
export async function findAirport(code: string): Promise<Airport | null> {
  if (!code) return null;

  const airports = await loadAirports();
  const upperCode = code.toUpperCase();
  
  // Try ICAO first (4 letters)
  if (upperCode.length === 4) {
    const icaoMatch = airports.find(airport => airport.icao_code === upperCode);
    if (icaoMatch) return icaoMatch;
  }
  
  // Try IATA (3 letters)
  if (upperCode.length === 3) {
    const iataMatch = airports.find(airport => airport.iata_code === upperCode);
    if (iataMatch) return iataMatch;
  }
  
  // Try ident as fallback
  return airports.find(airport => airport.ident === upperCode) || null;
}

// Get city name from airport
export function getAirportCity(airport: Airport): string {
  return airport.municipality || airport.name || 'Unknown City';
}

// Get country from airport
export function getAirportCountry(airport: Airport): string {
  return airport.iso_country || 'Unknown Country';
}

const airportLookup = {
  findAirportByICAO,
  findAirportByIATA,
  findAirport,
  getAirportCity,
  getAirportCountry
};

export default airportLookup;