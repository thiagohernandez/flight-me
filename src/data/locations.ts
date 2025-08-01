export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export const locations: Location[] = [
  // Spain
  {
    id: "lliria",
    name: "Lliria",
    country: "Spain",
    latitude: 39.64547,
    longitude: -0.68478,
    description: "Valencia region, Spain",
  },
  {
    id: "valencia",
    name: "Valencia",
    country: "Spain",
    latitude: 39.48074,
    longitude: -0.32927,
    description: "Valencia, Spain",
  },
  {
    id: "madrid",
    name: "Madrid",
    country: "Spain",
    latitude: 40.4168,
    longitude: -3.7038,
    description: "Madrid, Spain",
  },
  {
    id: "barcelona",
    name: "Barcelona",
    country: "Spain",
    latitude: 41.3851,
    longitude: 2.1734,
    description: "Barcelona, Spain",
  },
  {
    id: "sevilla",
    name: "Sevilla",
    country: "Spain",
    latitude: 37.3886,
    longitude: -5.9823,
    description: "Sevilla, Spain",
  },
  {
    id: "bilbao",
    name: "Bilbao",
    country: "Spain",
    latitude: 43.2627,
    longitude: -2.9253,
    description: "Bilbao, Spain",
  },

  // Europe
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
    description: "London, United Kingdom",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    description: "Paris, France",
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    latitude: 52.52,
    longitude: 13.405,
    description: "Berlin, Germany",
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    latitude: 41.9028,
    longitude: 12.4964,
    description: "Rome, Italy",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    latitude: 52.3676,
    longitude: 4.9041,
    description: "Amsterdam, Netherlands",
  },
  {
    id: "zurich",
    name: "Zurich",
    country: "Switzerland",
    latitude: 47.3769,
    longitude: 8.5417,
    description: "Zurich, Switzerland",
  },
  {
    id: "vienna",
    name: "Vienna",
    country: "Austria",
    latitude: 48.2082,
    longitude: 16.3738,
    description: "Vienna, Austria",
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    latitude: 55.6761,
    longitude: 12.5683,
    description: "Copenhagen, Denmark",
  },
  {
    id: "stockholm",
    name: "Stockholm",
    country: "Sweden",
    latitude: 59.3293,
    longitude: 18.0686,
    description: "Stockholm, Sweden",
  },
  {
    id: "oslo",
    name: "Oslo",
    country: "Norway",
    latitude: 59.9139,
    longitude: 10.7522,
    description: "Oslo, Norway",
  },

  // North America
  {
    id: "new_york",
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
    description: "New York, United States",
  },
  {
    id: "los_angeles",
    name: "Los Angeles",
    country: "United States",
    latitude: 34.0522,
    longitude: -118.2437,
    description: "Los Angeles, United States",
  },
  {
    id: "chicago",
    name: "Chicago",
    country: "United States",
    latitude: 41.8781,
    longitude: -87.6298,
    description: "Chicago, United States",
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    latitude: 43.6532,
    longitude: -79.3832,
    description: "Toronto, Canada",
  },
  {
    id: "vancouver",
    name: "Vancouver",
    country: "Canada",
    latitude: 49.2827,
    longitude: -123.1207,
    description: "Vancouver, Canada",
  },

  // Asia
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    description: "Tokyo, Japan",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    description: "Singapore",
  },
  {
    id: "hong_kong",
    name: "Hong Kong",
    country: "Hong Kong",
    latitude: 22.3193,
    longitude: 114.1694,
    description: "Hong Kong",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    description: "Dubai, United Arab Emirates",
  },

  // Oceania
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    description: "Sydney, Australia",
  },
  {
    id: "melbourne",
    name: "Melbourne",
    country: "Australia",
    latitude: -37.8136,
    longitude: 144.9631,
    description: "Melbourne, Australia",
  },
];

// Helper function to get location by ID
export function getLocationById(id: string): Location | undefined {
  return locations.find((location) => location.id === id);
}

// Helper function to get default location (Lliria)
export function getDefaultLocation(): Location {
  return getLocationById("lliria")!;
}
