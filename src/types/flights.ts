// OpenSky Network API types - states are returned as arrays
export type FlightState = [
  string,           // 0: icao24
  string | null,    // 1: callsign
  string,           // 2: origin_country
  number | null,    // 3: time_position
  number,           // 4: last_contact
  number | null,    // 5: longitude
  number | null,    // 6: latitude
  number | null,    // 7: baro_altitude
  boolean,          // 8: on_ground
  number | null,    // 9: velocity
  number | null,    // 10: true_track
  number | null,    // 11: vertical_rate
  number[] | null,  // 12: sensors
  number | null,    // 13: geo_altitude
  string | null,    // 14: squawk
  boolean,          // 15: spi
  number            // 16: position_source
];

export interface OpenSkyResponse {
  time: number;
  states: FlightState[] | null;
}

export interface FlightData {
  icao24: string;
  callsign: string;
  airline: string;
  aircraft: string;
  country: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  lastContact: number;
  originCity?: string;
}

export interface AircraftMetadata {
  icao24: string;
  registration: string;
  manufacturericao: string;
  manufacturername: string;
  model: string;
  typecode: string;
  serialnumber: string;
  linenumber: string;
  icaoaircrafttype: string;
  operator: string;
  operatorcallsign: string;
  operatoricao: string;
  operatoriata: string;
  owner: string;
  testreg: string;
}