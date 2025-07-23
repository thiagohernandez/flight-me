import { FlightData } from "@/types/flights";

// Lliria, Spain coordinates (Valencia Airport)
export const LLIRIA_COORDINATES = {
  latitude: 39.489,
  longitude: -0.481,
};

// Fetch flights using server-side API route
export async function fetchFlights(
  radiusKm: number = 50
): Promise<FlightData[]> {
  try {
    const response = await fetch(`/api/flights?radius=${radiusKm}`);
    
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
