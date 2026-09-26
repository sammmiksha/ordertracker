from typing import Tuple, Optional, Dict
import re

# Comprehensive coordinates for key Indian logistics gateways and hubs
INDIAN_LOGISTICS_HUBS: Dict[str, Tuple[float, float]] = {
    # Western Hubs
    "mumbai": (19.0760, 72.8777),
    "bhiwandi": (19.2967, 73.0631),
    "pune": (18.5204, 73.8567),
    "chakan": (18.7597, 73.8580),
    "surat": (21.1702, 72.8311),
    "ahmedabad": (23.0225, 72.5714),
    "sanand": (22.9868, 72.3815),
    "vadodara": (22.3072, 73.1812),
    "nagpur": (21.1458, 79.0882), # Central India multimodal hub

    # Northern Hubs
    "delhi": (28.6139, 77.2090),
    "gurugram": (28.4595, 77.0266),
    "gurgaon": (28.4595, 77.0266),
    "bilaspur": (28.3242, 76.9073), # Major Delhivery/XpressBees mega center
    "noida": (28.5355, 77.3910),
    "jaipur": (26.9124, 75.7873),
    "sitapura": (26.7725, 75.8340), # Major apparel / Jaipur hub
    "lucknow": (26.8467, 80.9462),
    "kanpur": (26.4499, 80.3319),
    "ludhiana": (30.9010, 75.8573),
    "chandigarh": (30.7333, 76.7794),

    # Southern Hubs
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "bommasandra": (12.8167, 77.6917),
    "nelamangala": (13.0970, 77.3900),
    "chennai": (13.0827, 80.2707),
    "sriperumbudur": (12.9711, 79.9427),
    "hyderabad": (17.3850, 78.4867),
    "medchal": (17.6297, 78.4814),
    "shamshabad": (17.2543, 78.4311),
    "kochi": (9.9312, 76.2673),
    "coimbatore": (11.0168, 76.9558),

    # Eastern Hubs
    "kolkata": (22.5726, 88.3639),
    "dankuni": (22.6841, 88.2932), # Major East India gateway
    "patna": (25.5941, 85.1376),
    "bhubaneswar": (20.2961, 85.8245),
    "guwahati": (26.1445, 91.7362), # Northeast Gateway
    "ranchi": (23.3441, 85.3096),
}

DEFAULT_INDIA_COORDS = (20.5937, 78.9629)

def geocode_location(text: str) -> Tuple[float, float]:
    """
    Extracts and maps location strings from courier scan descriptions to precise latitude/longitude.
    """
    if not text:
        return DEFAULT_INDIA_COORDS

    clean_text = text.lower()

    # Search for known hub keywords
    for hub, coords in INDIAN_LOGISTICS_HUBS.items():
        if re.search(r'\b' + re.escape(hub) + r'\b', clean_text):
            return coords

    # Fallback to Delhi if North India / Central coordinates
    return DEFAULT_INDIA_COORDS
