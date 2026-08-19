export interface WatchPoint {
  name: string;
  lat: number;
  lon: number;
}

/**
 * No free global "active floods" feed exists, so the Flood Agent polls named,
 * genuinely flood-prone locations instead of pretending to cover the globe.
 */
export const FLOOD_WATCHLIST: WatchPoint[] = [
  { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "New Orleans, USA", lat: 29.9511, lon: -90.0715 },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639 },
  { name: "Ho Chi Minh City, Vietnam", lat: 10.8231, lon: 106.6297 },
  { name: "Manila, Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Venice, Italy", lat: 45.4408, lon: 12.3155 },
  { name: "Mumbai, India", lat: 19.076, lon: 72.8777 },
];

/**
 * Same rationale as FLOOD_WATCHLIST — real, named wildfire-prone regions
 * rather than a fabricated fire-perimeter feed.
 */
export const WILDFIRE_WATCHLIST: WatchPoint[] = [
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Athens, Greece", lat: 37.9838, lon: 23.7275 },
  { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Lisbon, Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Santiago, Chile", lat: -33.4489, lon: -70.6693 },
  { name: "Vancouver, Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Marseille, France", lat: 43.2965, lon: 5.3698 },
  { name: "Perth, Australia", lat: -31.9505, lon: 115.8605 },
  { name: "Denver, USA", lat: 39.7392, lon: -104.9903 },
];
