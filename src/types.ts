export type Courier = 
  | 'delhivery'
  | 'xpressbees'
  | 'shadowfax'
  | 'bluedart'
  | 'ecom_express'
  | 'indiapost'
  | 'dtdc'
  | 'valmo'
  | 'amazon_logistics'
  | 'other';

export type Shop = 
  | 'ajio'
  | 'meesho'
  | 'nykaa'
  | 'nike'
  | 'myntra'
  | 'aqualogica'
  | 'zara'
  | 'amazon'
  | 'flipkart'
  | 'snitch'
  | 'other';

export type DeliveryStatus = 
  | 'order_placed'
  | 'in_transit'
  | 'reached_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed';

export type TimelineGroup = 'today' | 'tomorrow' | 'later' | 'delivered';

export interface TrackingEvent {
  id: string;
  timestamp: string; // e.g., "26 Sep, 02:40 PM"
  timeAgo: string; // e.g., "2 hrs ago"
  location: string;
  hubName: string;
  coordinates: [number, number]; // [lat, lng]
  status: DeliveryStatus;
  description: string;
}

export interface Order {
  id: string;
  trackingId: string;
  label: string; // e.g. "Festive Kurti", "Wallet"
  shop: Shop;
  courier: Courier;
  status: DeliveryStatus;
  expectedDate: string; // e.g. "Today by 7 PM", "Tomorrow, 27 Sep"
  timelineGroup: TimelineGroup;
  originCity: string;
  originCoords: [number, number];
  currentCity: string;
  currentCoords: [number, number];
  destinationCity: string;
  destinationPincode: string;
  destinationCoords: [number, number];
  lastUpdated: string;
  tag?: string; // e.g. "Mom's parcel", "Gift", "Work"
  events: TrackingEvent[];
}
