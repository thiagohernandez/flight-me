"use client";

import { useState, useEffect, useCallback } from "react";
import { FlightData } from "@/types/flights";
import { fetchFlights } from "@/lib/opensky";
import {
  locations,
  getLocationById,
  getDefaultLocation,
} from "@/data/locations";
import FlightCard from "@/components/FlightCard";
import LEDFlightBoard from "@/components/LEDFlightBoard";
import SimpleLED3D from "@/components/SimpleLED3D";

export default function Home() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [radius, setRadius] = useState(50);
  const [displayMode, setDisplayMode] = useState<"cards" | "led" | "3d">("led");
  const [selectedLocationId, setSelectedLocationId] = useState("lliria");

  const selectedLocation =
    getLocationById(selectedLocationId) || getDefaultLocation();

  const loadFlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const flightData = await fetchFlights(radius, selectedLocationId);
      setFlights(flightData);
      console.log(flightData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flights");
    } finally {
      setLoading(false);
    }
  }, [radius, selectedLocationId]);

  useEffect(() => {
    loadFlights();
    const interval = setInterval(loadFlights, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [loadFlights]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ✈️ Flights Over {selectedLocation.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time flight tracking over {selectedLocation.name},{" "}
            {selectedLocation.country} ({selectedLocation.latitude.toFixed(4)},{" "}
            {selectedLocation.longitude.toFixed(4)})
          </p>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Location:
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[160px]"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}, {location.country}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search radius:
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Display:
              </label>
              <select
                value={displayMode}
                onChange={(e) =>
                  setDisplayMode(e.target.value as "cards" | "led" | "3d")
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="led">🖥️ LED Board</option>
                <option value="3d">🎮 3D LED Matrix</option>
                <option value="cards">📱 Cards</option>
              </select>
            </div>
          </div>

          <button
            onClick={loadFlights}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {lastUpdate && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}

        {loading && flights.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading flights...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {flights.length} flights detected within {radius}km
              </h2>
            </div>

            {displayMode === "led" ? (
              <LEDFlightBoard flights={flights} />
            ) : displayMode === "3d" ? (
              <SimpleLED3D flights={flights} />
            ) : flights.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">
                  No flights currently detected in the area.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flights.map((flight) => (
                  <FlightCard key={flight.icao24} flight={flight} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
