import { FlightData } from "@/types/flights";

interface FlightCardProps {
  flight: FlightData;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const formatAltitude = (altitude: number) => {
    return altitude > 0 ? `${Math.round(altitude)}m` : "Ground";
  };

  const formatVelocity = (velocity: number) => {
    return velocity > 0 ? `${Math.round(velocity * 3.6)} km/h` : "0 km/h";
  };

  const formatHeading = (heading: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return `${Math.round(heading)}° (${directions[index]})`;
  };

  const getLastContactTime = (lastContact: number) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsAgo = now - lastContact;
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    return `${Math.floor(secondsAgo / 3600)}h ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {flight.callsign}
        </h3>
        <h4 className="text-sm text-gray-600 dark:text-gray-400">
          {flight.airline || "Unknown Airline"}
        </h4>
        <h5 className="text-sm text-gray-500 dark:text-gray-400">
          {flight.aircraft || "Loading..."}
        </h5>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getLastContactTime(flight.lastContact)}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Country:</span>
          <span>{flight.country}</span>
        </div>
        <div className="flex justify-between">
          <span>Altitude:</span>
          <span>{formatAltitude(flight.altitude)}</span>
        </div>
        <div className="flex justify-between">
          <span>Speed:</span>
          <span>{formatVelocity(flight.velocity)}</span>
        </div>
        <div className="flex justify-between">
          <span>Heading:</span>
          <span>{formatHeading(flight.heading)}</span>
        </div>
        <div className="flex justify-between">
          <span>Position:</span>
          <span className="text-xs">
            {flight.latitude.toFixed(4)}, {flight.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ICAO: {flight.icao24.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
