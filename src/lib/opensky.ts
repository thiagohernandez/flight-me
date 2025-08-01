import { FlightData } from "@/types/flights";
import { getDefaultLocation } from "@/data/locations";

// Export default coordinates for backward compatibility
export const LLIRIA_COORDINATES = getDefaultLocation();

// Fetch flights using server-side API route
export async function fetchFlights(
  radiusKm: number = 50,
  locationId?: string
): Promise<FlightData[]> {
  try {
    const params = new URLSearchParams({
      radius: radiusKm.toString(),
      ...(locationId && { location: locationId }),
    });
    
    const response = await fetch(`/api/flights?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const flights: FlightData[] = await response.json();
    return flights;
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw error;
  }
}
