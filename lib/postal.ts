export type Coordinates = { lat: number; lng: number; district: string; name: string };

// Comprehensive Singapore Postal Sector Mapping (2-digit sector to base coordinates & district name)
const POSTAL_SECTOR_MAP: Record<string, { lat: number; lng: number; district: string; name: string }> = {
  // Raffles Place, Marina, Cecil
  '01': { lat: 1.2839, lng: 103.8515, district: 'D01', name: 'Raffles Place / Marina Bay' },
  '02': { lat: 1.2762, lng: 103.8461, district: 'D01', name: 'Anson / Tanjong Pagar' },
  '03': { lat: 1.2701, lng: 103.8582, district: 'D01', name: 'Queenstown / Telok Blangah' },
  '04': { lat: 1.2825, lng: 103.8488, district: 'D01', name: 'Chinatown / Telok Ayer' },
  '05': { lat: 1.2858, lng: 103.8449, district: 'D01', name: 'Hong Lim / Clark Quay' },
  '06': { lat: 1.2789, lng: 103.8502, district: 'D01', name: 'Shenton Way' },
  
  // Tanjong Pagar, Chinatown, Harbourfront
  '07': { lat: 1.2745, lng: 103.8431, district: 'D02', name: 'Tanjong Pagar / Spottiswoode' },
  '08': { lat: 1.2792, lng: 103.8390, district: 'D02', name: 'Cantonment / Everton' },
  '09': { lat: 1.2654, lng: 103.8211, district: 'D04', name: 'Telok Blangah / Harbourfront' },
  '10': { lat: 1.2731, lng: 103.8092, district: 'D04', name: 'Pasir Panjang / Keppel' },
  
  // Alexandra, Queenstown, Tiong Bahru
  '11': { lat: 1.2812, lng: 103.7991, district: 'D05', name: 'Pasir Panjang / Buona Vista' },
  '12': { lat: 1.3005, lng: 103.7712, district: 'D05', name: 'Clementi / West Coast' },
  '13': { lat: 1.3142, lng: 103.7895, district: 'D05', name: 'Kent Ridge / Dover' },
  '14': { lat: 1.2935, lng: 103.8051, district: 'D03', name: 'Queenstown / Alexandra' },
  '15': { lat: 1.2872, lng: 103.8212, district: 'D03', name: 'Tiong Bahru / Redhill' },
  '16': { lat: 1.2841, lng: 103.8329, district: 'D03', name: 'Delta / Lower Delta' },
  
  // High Street, Beach Road, Bugis, Little India
  '17': { lat: 1.2931, lng: 103.8521, district: 'D06', name: 'High Street / Beach Road' },
  '18': { lat: 1.3001, lng: 103.8552, district: 'D07', name: 'Middle Road / Bugis' },
  '19': { lat: 1.3082, lng: 103.8541, district: 'D08', name: 'Little India / Farrer Park' },
  '20': { lat: 1.3121, lng: 103.8572, district: 'D08', name: 'Jalan Besar / Farrer Park' },
  '21': { lat: 1.3165, lng: 103.8491, district: 'D08', name: 'Serangoon Road / Lavender' },
  
  // Orchard, River Valley, Cairnhill
  '22': { lat: 1.3031, lng: 103.8349, district: 'D09', name: 'Orchard / Cairnhill' },
  '23': { lat: 1.2974, lng: 103.8361, district: 'D09', name: 'River Valley / Killiney' },
  '24': { lat: 1.3092, lng: 103.8291, district: 'D10', name: 'Tanglin / Grange Road' },
  '25': { lat: 1.3185, lng: 103.8212, district: 'D10', name: 'Bukit Timah / Holland' },
  '26': { lat: 1.3129, lng: 103.8105, district: 'D10', name: 'Farrer Road / Holland Village' },
  '27': { lat: 1.3211, lng: 103.7915, district: 'D10', name: 'Holland / Sixth Avenue' },
  
  // Newton, Novena, Dunearn
  '28': { lat: 1.3142, lng: 103.8381, district: 'D11', name: 'Newton / Dunearn' },
  '29': { lat: 1.3201, lng: 103.8432, district: 'D11', name: 'Novena / Thomson' },
  '30': { lat: 1.3282, lng: 103.8391, district: 'D11', name: 'Balestier / Moulmein' },
  
  // Balestier, Toa Payoh, Serangoon
  '31': { lat: 1.3325, lng: 103.8481, district: 'D12', name: 'Toa Payoh / Kim Keat' },
  '32': { lat: 1.3262, lng: 103.8561, district: 'D12', name: 'Balestier / Whampoa' },
  '33': { lat: 1.3215, lng: 103.8652, district: 'D12', name: 'Serangoon / Boon Keng' },
  
  // Macpherson, Braddell, Geylang, Paya Lebar
  '34': { lat: 1.3162, lng: 103.8821, district: 'D14', name: 'Geylang / Eunos' },
  '35': { lat: 1.3211, lng: 103.8885, district: 'D14', name: 'Paya Lebar / MacPherson' },
  '36': { lat: 1.3365, lng: 103.8862, district: 'D14', name: 'MacPherson / Circuit Road' },
  '37': { lat: 1.3401, lng: 103.8912, district: 'D14', name: 'Kaki Bukit / Ubi' },
  
  // Katong, Joo Chiat, Marine Parade, Bedok
  '38': { lat: 1.3052, lng: 103.8915, district: 'D15', name: 'Tanjong Katong' },
  '39': { lat: 1.3091, lng: 103.9032, district: 'D15', name: 'Joo Chiat / Dunman' },
  '40': { lat: 1.3025, lng: 103.9101, district: 'D15', name: 'Marine Parade / East Coast' },
  '41': { lat: 1.3125, lng: 103.9185, district: 'D15', name: 'Siglap / Frankel' },
  '42': { lat: 1.3205, lng: 103.9291, district: 'D16', name: 'Bedok South / Sennett' },
  '43': { lat: 1.3292, lng: 103.9362, district: 'D16', name: 'Bedok North / Chai Chee' },
  '44': { lat: 1.3361, lng: 103.9451, district: 'D16', name: 'Upper East Coast / Bayshore' },
  '45': { lat: 1.3412, lng: 103.9512, district: 'D16', name: 'Bedok Reservoir / Tanah Merah' },
  
  // Changi, Loyang, Pasir Ris
  '46': { lat: 1.3551, lng: 103.9592, district: 'D17', name: 'Loyang / Changi' },
  '47': { lat: 1.3662, lng: 103.9651, district: 'D17', name: 'Changi Airport / Flora' },
  '48': { lat: 1.3785, lng: 103.9511, district: 'D17', name: 'Pasir Ris / Loyang' },
  '49': { lat: 1.3701, lng: 103.9482, district: 'D18', name: 'Pasir Ris Central / Elias' },
  '50': { lat: 1.3792, lng: 103.9391, district: 'D18', name: 'Pasir Ris Drive' },
  
  // Tampines, Simei
  '51': { lat: 1.3452, lng: 103.9531, district: 'D18', name: 'Simei / Tampines South' },
  '52': { lat: 1.3531, lng: 103.9442, district: 'D18', name: 'Tampines Central / West' },
  '53': { lat: 1.3651, lng: 103.8891, district: 'D19', name: 'Serangoon Garden / Hougang' },
  '54': { lat: 1.3712, lng: 103.8962, district: 'D19', name: 'Hougang Central / Buangkok' },
  '55': { lat: 1.3852, lng: 103.9015, district: 'D19', name: 'Sengkang / Punggol' },
  
  // Bishan, Ang Mo Kio
  '56': { lat: 1.3512, lng: 103.8485, district: 'D20', name: 'Bishan / Shunfu' },
  '57': { lat: 1.3695, lng: 103.8471, district: 'D20', name: 'Ang Mo Kio / Kebun Baru' },
  
  // Upper Bukit Timah, Clementi Park, Jurong
  '58': { lat: 1.3421, lng: 103.7761, district: 'D21', name: 'Upper Bukit Timah / Beauty World' },
  '59': { lat: 1.3562, lng: 103.7681, district: 'D21', name: 'Hume / Hillview' },
  '60': { lat: 1.3341, lng: 103.7421, district: 'D22', name: 'Jurong East / Toh Guan' },
  '61': { lat: 1.3412, lng: 103.7311, district: 'D22', name: 'Jurong West / Boon Lay' },
  '62': { lat: 1.3285, lng: 103.7152, district: 'D22', name: 'Taman Jurong / Pioneer' },
  '63': { lat: 1.3491, lng: 103.6981, district: 'D22', name: 'Jookoon / Tuas' },
  '64': { lat: 1.3415, lng: 103.6821, district: 'D22', name: 'Tuas South' },
  
  // Bukit Batok, Bukit Panjang, Choa Chu Kang
  '65': { lat: 1.3531, lng: 103.7541, district: 'D23', name: 'Bukit Batok / Hillview' },
  '66': { lat: 1.3651, lng: 103.7612, district: 'D23', name: 'Hillview / Dairy Farm' },
  '67': { lat: 1.3782, lng: 103.7621, district: 'D23', name: 'Bukit Panjang / Cashew' },
  '68': { lat: 1.3852, lng: 103.7461, district: 'D23', name: 'Choa Chu Kang / Teck Whye' },
  
  // Lim Chu Kang, Kranji, Sungei Kadut
  '69': { lat: 1.4215, lng: 103.7221, district: 'D24', name: 'Lim Chu Kang / Tengah' },
  '70': { lat: 1.4285, lng: 103.7481, district: 'D24', name: 'Kranji / Sungei Kadut' },
  '71': { lat: 1.4321, lng: 103.7312, district: 'D24', name: 'Neo Tiew / Turf Club' },
  
  // Yishun, Sembawang
  '72': { lat: 1.4112, lng: 103.8291, district: 'D27', name: 'Yishun / Khatib' },
  '73': { lat: 1.4391, lng: 103.8211, district: 'D27', name: 'Sembawang / Canberra' },
  '75': { lat: 1.4485, lng: 103.8182, district: 'D27', name: 'Admiralty / Sembawang North' },
  '76': { lat: 1.4291, lng: 103.8391, district: 'D27', name: 'Yishun East / Lower Seletar' },
  
  // Woodlands
  '77': { lat: 1.4382, lng: 103.7861, district: 'D25', name: 'Woodlands Central / Marsiling' },
  '78': { lat: 1.4462, lng: 103.7942, district: 'D25', name: 'Woodlands North' },
  '79': { lat: 1.4162, lng: 103.8651, district: 'D28', name: 'Seletar / Yio Chu Kang' },
  '80': { lat: 1.4091, lng: 103.8741, district: 'D28', name: 'Sengkang West / Jalan Kayu' },
  '81': { lat: 1.3982, lng: 103.9051, district: 'D19', name: 'Punggol Central / Waterway' },
  '82': { lat: 1.4085, lng: 103.9112, district: 'D19', name: 'Punggol North / Coast' },
};

// Default center for Singapore (Orchard / River Valley)
const DEFAULT_COORDS: Coordinates = {
  lat: 1.2974,
  lng: 103.8361,
  district: 'D09',
  name: 'River Valley / Orchard (Central)',
};

/**
 * Gets approximate lat/lng coordinates for any Singapore 6-digit or 5-digit postal code.
 */
export function getCoordsFromPin(pin?: string): Coordinates {
  if (!pin) return DEFAULT_COORDS;
  const cleanPin = pin.trim().padStart(6, '0');
  const sector = cleanPin.slice(0, 2);

  const base = POSTAL_SECTOR_MAP[sector] || DEFAULT_COORDS;

  // Add deterministic tiny micro-jitter based on last 4 digits for pin-point separation
  const numHash = parseInt(cleanPin.slice(2), 10) || 0;
  const latOffset = ((numHash % 100) - 50) * 0.00018; // ~200m variation
  const lngOffset = (((numHash / 100) % 100) - 50) * 0.00018;

  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset,
    district: base.district,
    name: base.name,
  };
}

/**
 * Calculates straight-line distance in kilometers between two lat/lng coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Helper to check if two PIN codes are within a given radius in km (default 5km).
 */
export function getPinMatch(pin1: string, pin2: string, radiusKm = 5.0) {
  const coords1 = getCoordsFromPin(pin1);
  const coords2 = getCoordsFromPin(pin2);
  const distance = calculateDistanceKm(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  return {
    distance,
    isWithin: distance <= radiusKm,
    district1: coords1.district,
    district2: coords2.district,
  };
}

/**
 * Fetch live reverse geocoding from Singapore's official SLA OneMap API.
 * Uses NEXT_PUBLIC_ONEMAP_API_KEY from environment variables if provided.
 */
export async function fetchOneMapGeocoding(postalCode: string): Promise<{ lat: number; lng: number; address: string } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_ONEMAP_API_KEY;
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      postalCode
    )}&returnGeoval=Y&getAddrDetails=Y`;

    const res = await fetch(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const first = data.results[0];
      return {
        lat: parseFloat(first.LATITUDE),
        lng: parseFloat(first.LONGITUDE),
        address: first.ADDRESS || first.BUILDING || 'Singapore Location',
      };
    }
    return null;
  } catch (err) {
    console.warn('OneMap API geocoding fallback:', err);
    return null;
  }
}

/**
 * HTML5 Web Geolocation API for live GPS radius tracking.
 */
export function watchLiveLocation(
  onSuccess: (coords: { lat: number; lng: number; accuracy: number; speed: number | null }) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    console.warn('Geolocation API is not supported in this browser environment.');
    return null;
  }

  return navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        speed: pos.coords.speed,
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    }
  );
}

