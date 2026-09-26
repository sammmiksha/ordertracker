export interface HubLocation {
  name: string;
  state: string;
  coords: [number, number]; // [lat, lng]
  isMajorHub: boolean;
  hubType?: 'Mega Hub' | 'Sorting Center' | 'Delivery Center';
}

export const INDIAN_HUBS: Record<string, HubLocation> = {
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
  'mumbai': {
    name: 'Mumbai Central Delivery Hub',
    state: 'Maharashtra',
    coords: [19.0760, 72.8777],
    isMajorHub: true,
    hubType: 'Mega Hub',
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
  'bengaluru': {
    name: 'Bengaluru Nelamangala Gateway',
    state: 'Karnataka',
    coords: [12.9716, 77.5946],
    isMajorHub: true,
    hubType: 'Mega Hub',
  },
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
  'kolkata': {
    name: 'Kolkata Dankuni Gateway',
    state: 'West Bengal',
    coords: [22.5726, 88.3639],
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
  'lucknow': {
    name: 'Lucknow Transport Nagar Hub',
    state: 'Uttar Pradesh',
    coords: [26.8467, 80.9462],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'chandigarh': {
    name: 'Chandigarh Mohali Logistics Hub',
    state: 'Punjab',
    coords: [30.7333, 76.7794],
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
  'kochi': {
    name: 'Kochi Kalamassery Hub',
    state: 'Kerala',
    coords: [9.9312, 76.2673],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'guwahati': {
    name: 'Guwahati Northeast Gateway Hub',
    state: 'Assam',
    coords: [26.1445, 91.7362],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'patna': {
    name: 'Patna Fatuha Logistics Hub',
    state: 'Bihar',
    coords: [25.5941, 85.1376],
    isMajorHub: false,
    hubType: 'Sorting Center',
  },
  'nagpur': {
    name: 'Nagpur Multi-Modal MIHAN Hub',
    state: 'Maharashtra',
    coords: [21.1458, 79.0882],
    isMajorHub: true,
    hubType: 'Mega Hub',
  }
};

/**
 * Fast local geocoder that maps city/hub names to coordinates
 */
export function geocodeCity(nameOrPincode: string): { name: string; coords: [number, number]; state?: string } {
  const normalized = nameOrPincode.toLowerCase().trim();

  for (const [key, hub] of Object.entries(INDIAN_HUBS)) {
    if (normalized.includes(key) || hub.name.toLowerCase().includes(normalized)) {
      return { name: hub.name, coords: hub.coords, state: hub.state };
    }
  }

  // Fallbacks for common pincode regions or unmatched
  if (/^11\d{4}/.test(normalized)) return { name: 'Delhi', coords: [28.6139, 77.2090], state: 'Delhi' };
  if (/^40\d{4}/.test(normalized)) return { name: 'Mumbai', coords: [19.0760, 72.8777], state: 'Maharashtra' };
  if (/^56\d{4}/.test(normalized)) return { name: 'Bengaluru', coords: [12.9716, 77.5946], state: 'Karnataka' };
  if (/^60\d{4}/.test(normalized)) return { name: 'Chennai', coords: [13.0827, 80.2707], state: 'Tamil Nadu' };
  if (/^70\d{4}/.test(normalized)) return { name: 'Kolkata', coords: [22.5726, 88.3639], state: 'West Bengal' };
  if (/^50\d{4}/.test(normalized)) return { name: 'Hyderabad', coords: [17.3850, 78.4867], state: 'Telangana' };
  if (/^38\d{4}/.test(normalized)) return { name: 'Ahmedabad', coords: [23.0225, 72.5714], state: 'Gujarat' };

  // Default to central India (Nagpur / Delhi)
  return { name: nameOrPincode || 'Central Hub', coords: [21.1458, 79.0882], state: 'India' };
}
