export interface GeocodeResult {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

interface GeocodingApiResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding API responded with ${res.status}`);
  }
  const data: { results?: GeocodingApiResult[] } = await res.json();

  return (data.results ?? []).map((r) => ({
    name: r.name,
    country: r.country ?? "",
    admin1: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }));
}
