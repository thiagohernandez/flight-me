import { NextResponse } from "next/server";
import { FlightData, OpenSkyResponse, AircraftMetadata } from "@/types/flights";
import { getLocationById, getDefaultLocation } from "@/data/locations";


// Airline ICAO code lookup table
const AIRLINE_CODES: Record<string, string> = {
  // Major US carriers
  AAL: "American Airlines",
  UAL: "United Airlines",
  DAL: "Delta Air Lines",
  SWA: "Southwest Airlines",
  JBU: "JetBlue Airways",
  ASA: "Alaska Airlines",
  FFT: "Frontier Airlines",
  NKS: "Spirit Airlines",

  // European carriers
  BAW: "British Airways",
  KLM: "KLM Royal Dutch Airlines",
  AFR: "Air France",
  DLH: "Lufthansa",
  IBE: "Iberia",
  VLG: "Vueling",
  RYR: "Ryanair",
  EZY: "easyJet",
  SAS: "Scandinavian Airlines",
  FIN: "Finnair",
  AUA: "Austrian Airlines",
  SWR: "Swiss International Air Lines",
  AEA: "Air Europa",
  ANE: "Europe Airpost",
  BEL: "Brussels Airlines",
  CTN: "Croatia Airlines",
  CSA: "Czech Airlines",
  DAT: "Danish Air Transport",
  ELY: "El Al Israel Airlines",
  EWG: "Eurowings",
  ICE: "Icelandair",
  IBS: "Iberia Express",
  TAP: "TAP Air Portugal",
  THY: "Turkish Airlines",
  TVS: "Transavia",
  WZZ: "Wizz Air",
  NOZ: "Norwegian Air",
  AZA: "Alitalia",
  ITY: "ITA Airways",
  MSR: "EgyptAir",
  RAM: "Royal Air Maroc",
  TUN: "Tunisair",
  AHY: "Azerbaijan Airlines",
  LOT: "LOT Polish Airlines",
  ROT: "Tarom",
  BUL: "Bulgaria Air",
  TRA: "Transavia France",
  VCE: "Volotea",
  CFG: "Condor",
  EWE: "Eurowings Europe",
  GWI: "Germanwings",
  TUI: "TUI Airways",
  JKK: "Jet2.com",
  EXS: "Jet2.com",
  MON: "Monarch Airlines",
  VIR: "Virgin Atlantic",
  BMI: "BMI",
  TCX: "Thomas Cook Airlines",
  TOM: "TUI Airways",

  // Middle Eastern carriers
  UAE: "Emirates",
  QTR: "Qatar Airways",
  ETD: "Etihad Airways",
  SVA: "Saudi Arabian Airlines",

  // Asian carriers
  ANA: "All Nippon Airways",
  JAL: "Japan Airlines",
  SIA: "Singapore Airlines",
  CPA: "Cathay Pacific",
  KAL: "Korean Air",
  AAR: "Asiana Airlines",
  THA: "Thai Airways",

  // Others
  ACA: "Air Canada",
  QFA: "Qantas",
  TAM: "LATAM Airlines",
  GOL: "GOL Linhas Aéreas",
};

function getAirlineFromCallsign(callsign: string): string {
  if (!callsign || callsign === "Unknown") return "Unknown";

  // Extract the first 3 characters (airline code)
  const airlineCode = callsign.substring(0, 3).toUpperCase();

  return AIRLINE_CODES[airlineCode] || `Unknown (${airlineCode})`;
}

// Cache for aircraft metadata to avoid repeated API calls
const aircraftCache = new Map<string, string>();

async function getAircraftInfo(
  icao24: string
): Promise<{ aircraft: string; operator: string }> {
  if (!icao24) return { aircraft: "Unknown", operator: "Unknown" };

  const cacheKey = `${icao24}_full`;
  // Check cache first
  if (aircraftCache.has(cacheKey)) {
    const cached = aircraftCache.get(cacheKey)!;
    const [aircraft, operator] = cached.split("|");
    return { aircraft, operator };
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/aircraft/${icao24}`
    );

    if (!response.ok) {
      const fallback = { aircraft: "Unknown", operator: "Unknown" };
      aircraftCache.set(cacheKey, "Unknown|Unknown");
      return fallback;
    }

    const metadata: AircraftMetadata = await response.json();

    // Format aircraft info: "Boeing 737-800" or "Airbus A320-200"
    let aircraftInfo = "Unknown";
    if (metadata.manufacturername && metadata.model) {
      aircraftInfo = `${metadata.manufacturername} ${metadata.model}`;
    } else if (metadata.typecode) {
      aircraftInfo = metadata.typecode;
    }

    // Get operator info - more accurate than callsign parsing
    let operatorInfo = "Unknown";
    if (metadata.operator) {
      operatorInfo = metadata.operator;
    } else if (metadata.operatoricao && AIRLINE_CODES[metadata.operatoricao]) {
      operatorInfo = AIRLINE_CODES[metadata.operatoricao];
    }

    const result = { aircraft: aircraftInfo, operator: operatorInfo };
    aircraftCache.set(cacheKey, `${aircraftInfo}|${operatorInfo}`);
    return result;
  } catch (error) {
    console.error(`Failed to fetch aircraft info for ${icao24}:`, error);
    const fallback = { aircraft: "Unknown", operator: "Unknown" };
    aircraftCache.set(cacheKey, "Unknown|Unknown");
    return fallback;
  }
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getFlightAccessToken(): Promise<{
  token: string | null;
  response?: NextResponse;
}> {
  try {
    const { getAccessTokenWithResponse } = await import("@/lib/token-manager");
    const result = await getAccessTokenWithResponse();
    return {
      token: result.token?.access_token || null,
      response: result.response
    };
  } catch (error) {
    console.error("Token request failed:", error);
    return { token: null };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const radiusKm = Number(searchParams.get("radius")) || 50;
    const locationId = searchParams.get("location") || "lliria";
    
    // Get the coordinates for the selected location
    const location = getLocationById(locationId) || getDefaultLocation();
    const coordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const tokenResult = await getFlightAccessToken();
    // console.log("Access token:", tokenResult.token);
    if (!tokenResult.token) {
      return NextResponse.json(
        { error: "Failed to retrieve access token" },
        { status: 500 }
      );
    }

    // Calculate bounding box for the area around the selected location
    const kmPerDegreeLat = 111;
    const kmPerDegreeLon =
      111 * Math.cos((coordinates.latitude * Math.PI) / 180);

    const latDelta = radiusKm / kmPerDegreeLat;
    const lonDelta = radiusKm / kmPerDegreeLon;

    const minLat = coordinates.latitude - latDelta;
    const maxLat = coordinates.latitude + latDelta;
    const minLon = coordinates.longitude - lonDelta;
    const maxLon = coordinates.longitude + lonDelta;

    const url = `https://opensky-network.org/api/states/all?lamin=${minLat}&lomin=${minLon}&lamax=${maxLat}&lomax=${maxLon}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Flight Tracker Lliria/1.0",
        Authorization: `Bearer ${tokenResult.token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenSky API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: OpenSkyResponse = await response.json();

    if (!data.states) {
      return NextResponse.json([]);
    }

    // console.log("Raw flight data:", data.states);

    // Convert the raw data to our FlightData format and filter by distance
    // console.log("Total states before filtering:", data.states.length);

    const validStates = data.states.filter(
      (state) => state[5] !== null && state[6] !== null && !state[8]
    );
    // console.log("Valid airborne states:", validStates.length);

    const flights: FlightData[] = validStates
      .map((state) => {
        // console.log("Raw state:", state);
        const callsign = state[1]?.trim() || "Unknown";
        return {
          icao24: state[0],
          callsign,
          airline: getAirlineFromCallsign(callsign),
          aircraft: "Loading...", // Will be populated later
          country: state[2],
          latitude: state[6]!,
          longitude: state[5]!,
          altitude: state[7] || state[13] || 0,
          velocity: state[9] || 0,
          heading: state[10] || 0,
          lastContact: state[4],
        };
      })
      .filter((flight) => {
        // console.log(
        //   `Flight ${flight.callsign} coords:`,
        //   flight.latitude,
        //   flight.longitude
        // );
        // console.log(
        //   `Base coords:`,
        //   LLIRIA_COORDINATES.latitude,
        //   LLIRIA_COORDINATES.longitude
        // );
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          flight.latitude,
          flight.longitude
        );
        // console.log(
        //   `Flight ${flight.callsign}: distance ${distance.toFixed(
        //     2
        //   )}km, within ${radiusKm}km?`,
        //   distance <= radiusKm
        // );
        return distance <= radiusKm;
      });

    // console.log("Flights fetched:", flights);
    // console.log(
    //   flights,
    //   `Found ${flights.length} flights within ${radiusKm} km of Lliria`
    // );

    // Asynchronously fetch aircraft info and update operator for each flight
    const flightsWithAircraftInfo = await Promise.all(
      flights.map(async (flight) => {
        const { aircraft, operator } = await getAircraftInfo(flight.icao24);
        return {
          ...flight,
          aircraft,
          airline: operator !== "Unknown" ? operator : flight.airline,
        };
      })
    );

    // Create the response with flight data
    const flightResponse = NextResponse.json(flightsWithAircraftInfo);
    
    // If we have a token response with cookies, copy the opensky_token cookie
    if (tokenResult.response && tokenResult.response.cookies.get('opensky_token')) {
      const tokenCookie = tokenResult.response.cookies.get('opensky_token');
      if (tokenCookie) {
        flightResponse.cookies.set('opensky_token', tokenCookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1800, // 30 minutes
        });
      }
    }
    
    return flightResponse;
  } catch (error) {
    console.error("Error fetching flights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
