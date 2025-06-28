interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: { // For reverse geocoding
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    ISO3166_2_lvl4?: string; // Province code like ID-JK
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export async function getCurrentDeviceLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn(`Geolocation error: ${error.message}`);
        resolve(null);
      }
    );
  });
}

export async function geocodeLocationString(query: string): Promise<{ lat: number, lon: number, displayName: string } | null> {
  if (!query.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=id`; // Limit to Indonesia

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' } }); // Be a good citizen
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status}`);
      return null;
    }
    const data = await response.json() as NominatimResult[];
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to geocode location:", error);
    return null;
  }
}

export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<NominatimResult | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' } });
        if (!response.ok) {
            console.error(`Nominatim reverse geocoding error: ${response.status}`);
            return null;
        }
        const data = await response.json() as NominatimResult;
        return data;
    } catch (error) {
        console.error("Failed to reverse geocode:", error);
        return null;
    }
}