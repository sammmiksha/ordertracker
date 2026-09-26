export interface HubLocation {
  name: string;
  state: string;
  coords: [number, number]; // [lat, lng]
  isMajorHub: boolean;
  hubType?: 'Mega Hub' | 'Sorting Center' | 'Delivery Center';
}

export const INDIAN_HUBS: Record<string, HubLocation> = {
  // Mumbai & Mumbai Metropolitan Region (MMR)
  'mumbai': {
    name: 'Mumbai Central Delivery Hub',
    state: 'Maharashtra',
    coords: [19.0760, 72.8777],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'miraroad': {
    name: 'Mira Road Local Hub (Mira-Bhayandar)',
    state: 'Maharashtra',
    coords: [19.2812, 72.8561],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'mira road': {
    name: 'Mira Road Delivery Center',
    state: 'Maharashtra',
    coords: [19.2812, 72.8561],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'bhayandar': {
    name: 'Bhayandar Delivery Center',
    state: 'Maharashtra',
    coords: [19.3015, 72.8523],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'borivali': {
    name: 'Borivali Logistics Gateway',
    state: 'Maharashtra',
    coords: [19.2307, 72.8567],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'kandivali': {
    name: 'Kandivali Local Delivery Hub',
    state: 'Maharashtra',
    coords: [19.2045, 72.8376],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'malad': {
    name: 'Malad Hub',
    state: 'Maharashtra',
    coords: [19.1874, 72.8484],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'andheri': {
    name: 'Andheri West/East Hub',
    state: 'Maharashtra',
    coords: [19.1136, 72.8697],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'bandra': {
    name: 'Bandra Delivery Center',
    state: 'Maharashtra',
    coords: [19.0596, 72.8295],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'dadar': {
    name: 'Dadar Central Hub',
    state: 'Maharashtra',
    coords: [19.0178, 72.8478],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'thane': {
    name: 'Thane City Sorting Facility',
    state: 'Maharashtra',
    coords: [19.2183, 72.9781],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'navi mumbai': {
    name: 'Navi Mumbai Distribution Center',
    state: 'Maharashtra',
    coords: [19.0330, 73.0297],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'vashi': {
    name: 'Vashi Logistics Center',
    state: 'Maharashtra',
    coords: [19.0771, 72.9986],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'kalyan': {
    name: 'Kalyan Logistics Hub',
    state: 'Maharashtra',
    coords: [19.2403, 73.1305],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'dombivli': {
    name: 'Dombivli Delivery Hub',
    state: 'Maharashtra',
    coords: [19.2184, 73.0867],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'vasai': {
    name: 'Vasai Palghar Logistics Hub',
    state: 'Maharashtra',
    coords: [19.3919, 72.8397],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'virar': {
    name: 'Virar Delivery Hub',
    state: 'Maharashtra',
    coords: [19.4564, 72.8081],
    isMajorHub: false,
    hubType: 'Delivery Center',
  },
  'panvel': {
    name: 'Panvel Gateway Hub',
    state: 'Maharashtra',
    coords: [18.9894, 73.1175],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'bhiwandi': {
    name: 'Bhiwandi Mega Sort Facility',
    state: 'Maharashtra',
    coords: [19.2967, 73.0631],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'pune': {
    name: 'Pune Chakan Distribution Hub',
    state: 'Maharashtra',
    coords: [18.5204, 73.8567],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'nagpur': {
    name: 'Nagpur Multi-Modal MIHAN Hub',
    state: 'Maharashtra',
    coords: [21.1458, 79.0882],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'nashik': {
    name: 'Nashik Ambad Industrial Hub',
    state: 'Maharashtra',
    coords: [19.9975, 73.7898],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },

  // Delhi NCR
  'delhi': {
    name: 'Delhi NCR Hub (Okhla / Manesar)',
    state: 'Delhi NCR',
    coords: [28.6139, 77.2090],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'gurugram': {
    name: 'Gurugram Bilaspur Logistics Hub',
    state: 'Haryana',
    coords: [28.3588, 76.9400],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'gurgaon': {
    name: 'Gurugram Bilaspur Logistics Hub',
    state: 'Haryana',
    coords: [28.3588, 76.9400],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'noida': {
    name: 'Noida Sector 62 Distribution Center',
    state: 'Uttar Pradesh',
    coords: [28.5355, 77.3910],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'ghaziabad': {
    name: 'Ghaziabad Loni Logistics Hub',
    state: 'Uttar Pradesh',
    coords: [28.6692, 77.4538],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'faridabad': {
    name: 'Faridabad Industrial Hub',
    state: 'Haryana',
    coords: [28.4089, 77.3178],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },

  // South India
  'bengaluru': {
    name: 'Bengaluru Nelamangala Gateway',
    state: 'Karnataka',
    coords: [12.9716, 77.5946],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'bangalore': {
    name: 'Bengaluru Nelamangala Gateway',
    state: 'Karnataka',
    coords: [12.9716, 77.5946],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'hyderabad': {
    name: 'Hyderabad Medchal Sort Center',
    state: 'Telangana',
    coords: [17.3850, 78.4867],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'chennai': {
    name: 'Chennai Sriperumbudur Hub',
    state: 'Tamil Nadu',
    coords: [13.0827, 80.2707],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'kochi': {
    name: 'Kochi Kalamassery Hub',
    state: 'Kerala',
    coords: [9.9312, 76.2673],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'coimbatore': {
    name: 'Coimbatore Logistics Hub',
    state: 'Tamil Nadu',
    coords: [11.0168, 76.9558],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },

  // West & North
  'jaipur': {
    name: 'Jaipur Sitapura Sorting Hub',
    state: 'Rajasthan',
    coords: [26.9124, 75.7873],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'surat': {
    name: 'Surat Textile Logistics Hub',
    state: 'Gujarat',
    coords: [21.1702, 72.8311],
    isMajorHub: true,
    hubType: 'Sorting Center',
  },
  'ahmedabad': {
    name: 'Ahmedabad Changodar Hub',
    state: 'Gujarat',
    coords: [23.0225, 72.5714],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'chandigarh': {
    name: 'Chandigarh Mohali Logistics Hub',
    state: 'Punjab',
    coords: [30.7333, 76.7794],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'lucknow': {
    name: 'Lucknow Transport Nagar Hub',
    state: 'Uttar Pradesh',
    coords: [26.8467, 80.9462],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'indore': {
    name: 'Indore Dewas Naka Sort Facility',
    state: 'Madhya Pradesh',
    coords: [22.7196, 75.8577],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'bhopal': {
    name: 'Bhopal Mandideep Hub',
    state: 'Madhya Pradesh',
    coords: [23.2599, 77.4126],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },

  // East & Northeast
  'kolkata': {
    name: 'Kolkata Dankuni Gateway',
    state: 'West Bengal',
    coords: [22.5726, 88.3639],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
  'patna': {
    name: 'Patna Fatuha Logistics Hub',
    state: 'Bihar',
    coords: [25.5941, 85.1376],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'guwahati': {
    name: 'Guwahati Northeast Gateway Hub',
    state: 'Assam',
    coords: [26.1445, 91.7362],
    isMajorHub: false,
    hubType: 'Sorting Center',
  }
};

/**
 * Fast local geocoder that maps city/hub names to coordinates
 */
export function geocodeCity(nameOrPincode: string): { name: string; coords: [number, number]; state?: string } {
  if (!nameOrPincode) {
    return { name: 'Mumbai', coords: [19.0760, 72.8777], state: 'Maharashtra' };
  }

  const normalized = nameOrPincode.toLowerCase().replace(/[-_]/g, ' ').trim();
  const compact = normalized.replace(/\s+/g, '');

  // Exact or substring match in hub catalog
  for (const [key, hub] of Object.entries(INDIAN_HUBS)) {
    const keyCompact = key.replace(/\s+/g, '');
    if (
      normalized.includes(key) || 
      compact.includes(keyCompact) || 
      hub.name.toLowerCase().includes(normalized)
    ) {
      return { name: hub.name, coords: hub.coords, state: hub.state };
    }
  }

  // Common Indian postal code regions
  if (/^401\d{3}/.test(compact)) {
    // 401xxx = Thane / Mira-Bhayandar / Palghar / Vasai-Virar region
    return { name: 'Mira Road / Thane Suburbs', coords: [19.2812, 72.8561], state: 'Maharashtra' };
  }
  if (/^400\d{3}/.test(compact)) {
    // 400xxx = Mumbai
    return { name: 'Mumbai', coords: [19.0760, 72.8777], state: 'Maharashtra' };
  }
  if (/^411\d{3}/.test(compact)) {
    return { name: 'Pune', coords: [18.5204, 73.8567], state: 'Maharashtra' };
  }
  if (/^110\d{3}/.test(compact)) {
    return { name: 'Delhi', coords: [28.6139, 77.2090], state: 'Delhi' };
  }
  if (/^122\d{3}/.test(compact)) {
    return { name: 'Gurugram', coords: [28.3588, 76.9400], state: 'Haryana' };
  }
  if (/^201\d{3}/.test(compact)) {
    return { name: 'Noida / Ghaziabad', coords: [28.5355, 77.3910], state: 'Uttar Pradesh' };
  }
  if (/^560\d{3}/.test(compact)) {
    return { name: 'Bengaluru', coords: [12.9716, 77.5946], state: 'Karnataka' };
  }
  if (/^600\d{3}/.test(compact)) {
    return { name: 'Chennai', coords: [13.0827, 80.2707], state: 'Tamil Nadu' };
  }
  if (/^500\d{3}/.test(compact)) {
    return { name: 'Hyderabad', coords: [17.3850, 78.4867], state: 'Telangana' };
  }
  if (/^700\d{3}/.test(compact)) {
    return { name: 'Kolkata', coords: [22.5726, 88.3639], state: 'West Bengal' };
  }
  if (/^380\d{3}/.test(compact)) {
    return { name: 'Ahmedabad', coords: [23.0225, 72.5714], state: 'Gujarat' };
  }

  // Fallback to Mumbai if unmatched Indian destination
  return { name: nameOrPincode, coords: [19.0760, 72.8777], state: 'Maharashtra' };
}

/**
 * Reverse Geocode user's GPS coordinates into city & locality using OpenStreetMap Nominatim
 */
export async function reverseGeocodeUserLocation(
  lat: number,
  lng: number
): Promise<{ city: string; pincode: string; formatted: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const addr = data.address || {};

    const suburb = addr.suburb || addr.neighbourhood || addr.subdistrict || '';
    const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Your Location';
    const postcode = addr.postcode || '';

    let formattedName = suburb ? `${suburb}, ${city}` : city;

    return {
      city: formattedName,
      pincode: postcode,
      formatted: data.display_name || formattedName,
    };
  } catch (err) {
    return {
      city: 'My Location',
      pincode: '',
      formatted: `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    };
  }
}

export interface PlaceSuggestion {
  displayName: string;
  coords: [number, number];
  city: string;
  pincode: string;
}

/**
 * Searches specific Indian localities, societies, streets, and areas using Nominatim
 */
export async function searchPlacesOnline(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim() + ' India')}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((item: any) => {
      const addr = item.address || {};
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
      const city = addr.city || addr.town || addr.municipality || addr.state_district || '';
      const name = suburb ? `${suburb}, ${city}` : (city || item.display_name.split(',')[0]);
      return {
        displayName: item.display_name,
        coords: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
        city: name || query,
        pincode: addr.postcode || '',
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Geocodes an arbitrary Indian address / particular area to coordinates
 */
export async function geocodeAddressOnline(query: string): Promise<[number, number] | null> {
  if (!query || query.trim().length < 2) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim() + ' India')}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (e) {
    return null;
  }
}

