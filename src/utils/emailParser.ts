import { Shop, Courier, DeliveryStatus, Order } from '../types';
import { detectCourier } from './courierDetector';
import { geocodeCity, INDIAN_HUBS } from '../data/hubs';

export interface ParsedEmailResult {
  shop: Shop;
  label: string;
  trackingId: string;
  courier: Courier;
  estimatedDelivery?: string;
  destinationCity?: string;
  sourceType: 'email' | 'sms';
}

export const SAMPLE_EMAILS = [
  {
    id: 'sample-ajio',
    source: 'AJIO Shipping Confirmation',
    preview: 'Good news! Your AJIO order #AJ8921739 for Floral Anarkali Kurta has shipped via Delhivery (AWB: 140982736192)...',
    text: `Subject: Great news! Your AJIO Order #AJ8921739 has been dispatched!
From: updates@ajio.com

Hi Ananya,

Your order containing "Floral Embroidered Anarkali Kurta" is on its way to you!

Shipping Details:
- Courier Partner: Delhivery Express
- Tracking ID / AWB: 140982736192
- Destination: Bengaluru, Karnataka (560038)
- Estimated Delivery: 28 September, 2026

Track your package directly or keep your OTP handy at the time of delivery.

Happy Shopping,
Team AJIO`
  },
  {
    id: 'sample-meesho',
    source: 'Meesho Order Update',
    preview: 'Your Meesho order for Vintage Leather Clutch has been shipped with Xpressbees AWB 14298172948123...',
    text: `Subject: Your Meesho order for "Vintage Leather Clutch" is shipped!
From: no-reply@meesho.com

Order ID: MEESH_8921738
Item: Vintage Leather Clutch (Brown)
Carrier: Xpressbees
AWB / Consignment: 14298172948123
Destination City: Mumbai
Expected Delivery: Tomorrow, 27 Sep by 8 PM

Please ensure someone is available at the address to receive the parcel.`
  },
  {
    id: 'sample-nike',
    source: 'Nike India Order Dispatched',
    preview: 'Your Nike.com order containing Air Jordan 1 Low is on its way via Blue Dart AWB: 84920194821...',
    text: `Subject: Your Nike order is on the way!
From: order-update@nike.com

Your order has shipped via Blue Dart Express.

Item: Air Jordan 1 Low Retro
Tracking Number: 84920194821
Shipping Carrier: Blue Dart
Delivery Address: New Delhi, 110025
Estimated Delivery: 29 September, 2026

Thanks for shopping with Nike.`
  },
  {
    id: 'sample-delhivery-sms',
    source: 'Delhivery SMS Notification',
    preview: 'SMS: Your parcel containing Fastrack Watch (AWB: 139827162534) from Myntra is arriving today...',
    text: `[SMS from VM-DLHVRY]
Hi, your package containing "Fastrack Smart Watch" from Myntra with Delhivery AWB 139827162534 is out for delivery in Jaipur today. Share OTP 4821 with delivery agent Rajesh Kumar only after receiving parcel. Track: https://dlv.in/t/139827162534`
  }
];

/**
 * Intelligent regex-based parser for Indian e-commerce shipping emails & courier SMS
 */
export function parseShippingMessage(text: string): ParsedEmailResult {
  const lower = text.toLowerCase();

  // Detect Shop
  let shop: Shop = 'other';
  if (lower.includes('ajio')) shop = 'ajio';
  else if (lower.includes('meesho')) shop = 'meesho';
  else if (lower.includes('nike')) shop = 'nike';
  else if (lower.includes('nykaa')) shop = 'nykaa';
  else if (lower.includes('myntra')) shop = 'myntra';
  else if (lower.includes('aqualogica')) shop = 'aqualogica';
  else if (lower.includes('zara')) shop = 'zara';
  else if (lower.includes('snitch')) shop = 'snitch';
  else if (lower.includes('amazon')) shop = 'amazon';
  else if (lower.includes('flipkart')) shop = 'flipkart';

  // Extract Item Label
  let label = 'Shopping Parcel';
  const labelMatches = [
    /(?:containing|order for|item:?)\s*["“']?([^"”'\n\r,–—]+)["”']?/i,
    /(?:shipped your order for)\s*["“']?([^"”'\n\r,–—]+)["”']?/i,
    /(?:item\s*name\s*[:\-])\s*([^\n\r,–—]+)/i
  ];
  for (const regex of labelMatches) {
    const match = text.match(regex);
    if (match && match[1] && match[1].trim().length > 2 && match[1].trim().length < 50) {
      label = match[1].trim();
      break;
    }
  }

  // Extract Tracking ID / AWB
  let trackingId = '';
  const trackingMatches = [
    /(?:AWB|tracking\s*(?:id|number|no)?|consignment(?:\s*no)?)\s*[:\-]?\s*([A-Z0-9]{8,18})/i,
    /\b(SF\d{8,12})\b/i,
    /\b(\d{14})\b/,
    /\b(\d{12})\b/,
    /\b(\d{9,11})\b/
  ];

  for (const regex of trackingMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      // Validate not just random phone number or pincode
      const val = match[1].trim();
      if (!val.startsWith('91') && !val.startsWith('091') && val.length >= 8) {
        trackingId = val;
        break;
      }
    }
  }

  // Detect Courier
  let courier: Courier = 'other';
  if (lower.includes('delhivery')) courier = 'delhivery';
  else if (lower.includes('xpressbees')) courier = 'xpressbees';
  else if (lower.includes('blue dart') || lower.includes('bluedart')) courier = 'bluedart';
  else if (lower.includes('shadowfax')) courier = 'shadowfax';
  else if (lower.includes('ecom express') || lower.includes('ecomexpress')) courier = 'ecom_express';
  else if (lower.includes('speed post') || lower.includes('india post')) courier = 'indiapost';
  else if (lower.includes('dtdc')) courier = 'dtdc';
  else if (trackingId) {
    courier = detectCourier(trackingId).courier;
  }

  // Extract Destination City
  let destinationCity = 'Mumbai';
  const cityMatches = [
    /(?:destination|delivery address|to)\s*[:\-]?\s*([A-Za-z\s]+?)(?:,\s*[A-Za-z\s]+|\s*\(\d{6}\)|\s*\d{6}|\n|$)/i,
    /\bin\s+(Delhi|Bengaluru|Mumbai|Jaipur|Kolkata|Pune|Chennai|Hyderabad|Ahmedabad|Lucknow|Chandigarh)\b/i
  ];
  for (const regex of cityMatches) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cityCandidate = match[1].trim();
      if (cityCandidate.length > 2 && cityCandidate.length < 25) {
        destinationCity = cityCandidate;
        break;
      }
    }
  }

  // Extract Estimated Date
  let estimatedDelivery = 'In 2-3 Days';
  const dateMatch = text.match(/(?:estimated delivery|expected delivery|arriving)\s*[:\-]?\s*([^\n\r.]+)/i);
  if (dateMatch && dateMatch[1]) {
    estimatedDelivery = dateMatch[1].trim();
  }

  const isSms = text.includes('SMS') || text.includes('OTP') || text.length < 200;

  return {
    shop,
    label,
    trackingId: trackingId || 'DLV' + Math.floor(100000000000 + Math.random() * 900000000000),
    courier: courier !== 'other' ? courier : 'delhivery',
    estimatedDelivery,
    destinationCity,
    sourceType: isSms ? 'sms' : 'email'
  };
}

/**
 * Converts a parsed email/SMS into a fully hydrated Order with origin/hub/destination and tracking events
 */
export function createOrderFromParsed(data: ParsedEmailResult): Order {
  const destInfo = geocodeCity(data.destinationCity || 'Delhi');
  
  // Pick an origin hub based on courier / shop
  const hubsList = Object.values(INDIAN_HUBS);
  const originHub = hubsList[Math.floor(Math.random() * 4)];
  const transitHub = hubsList[4 + Math.floor(Math.random() * 4)];

  const isToday = data.estimatedDelivery?.toLowerCase().includes('today');
  const isTomorrow = data.estimatedDelivery?.toLowerCase().includes('tomorrow');

  const initialStatus: DeliveryStatus = isToday ? 'out_for_delivery' : 'in_transit';

  return {
    id: 'ord-' + Date.now().toString().slice(-6),
    trackingId: data.trackingId,
    label: data.label,
    shop: data.shop,
    courier: data.courier,
    status: initialStatus,
    expectedDate: data.estimatedDelivery || 'In 2 Days',
    timelineGroup: isToday ? 'today' : (isTomorrow ? 'tomorrow' : 'later'),
    originCity: originHub.name,
    originCoords: originHub.coords,
    currentCity: transitHub.name,
    currentCoords: transitHub.coords,
    destinationCity: destInfo.name,
    destinationPincode: '400001',
    destinationCoords: destInfo.coords,
    lastUpdated: 'Just now (via Email Auto-Import)',
    tag: 'Auto-Imported',
    events: [
      {
        id: 'ev-auto-2',
        timestamp: 'Today, Just now',
        timeAgo: 'Just now',
        location: transitHub.name,
        hubName: transitHub.name,
        coordinates: transitHub.coords,
        status: initialStatus,
        description: `Consignment scanned at ${transitHub.name}. Forwarded for final destination delivery.`
      },
      {
        id: 'ev-auto-1',
        timestamp: 'Yesterday',
        timeAgo: '1 day ago',
        location: originHub.name,
        hubName: originHub.name,
        coordinates: originHub.coords,
        status: 'order_placed',
        description: `Electronic shipping info received by ${data.courier}. Parcel dispatched from seller center.`
      }
    ]
  };
}
