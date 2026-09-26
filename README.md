# 📦 OrderTracker — India Multi-Courier & E-Commerce Delivery Hub

A modern, privacy-first order and parcel tracking web application built specifically for Indian e-commerce shoppers (**Meesho, Ajio, Nykaa, Nike, Myntra, Zara, Aqualogica**).

OrderTracker bridges the gap between fragmented shopping apps and courier tracking by focusing on **consignment IDs, Indian logistics hub geocoding, and delivery timeline views**.

---

## ✨ Features

- **🇮🇳 Indian Mobile Auth (+91) with Realistic OTP:**
  - Standard 10-digit Indian phone number input.
  - Realistic carrier SMS verification code flow with clipboard auto-paste, rate limiting, and 30s cooldown.
- **⚡ Native Valmo (Meesho Logistics) Support:**
  - Instant auto-detection of Valmo consignment numbers (`VL...` forward shipments & `VLR...` returns).
- **🚚 Multi-Courier Auto-Detection Engine:**
  - **Valmo (Meesho Logistics)**: `VL...` series
  - **XpressBees**: 14-digit series (`14...` / `13...`)
  - **Delhivery**: 12–14 digit waybill numbers
  - **Blue Dart**: 8–11 digit Airway Bills (AWB)
  - **Shadowfax**: Consignments starting with `SF...`
  - **India Post (Speed Post)**: 13-character standard format ending in `IN`
  - **DTDC**: Consignments starting with `D`, `Z`, or `B`
  - **Ecom Express**: 9–10 digits starting with `8` or `9`
- **🗺️ Interactive India Hub Map (Leaflet):**
  - Custom SVG markers situated at the parcel's **last scanned hub city** (e.g. *Jaipur Sitapura Hub, Bhiwandi Mega Sort Facility, Bilaspur Gurugram, Nelamangala Bengaluru, Surat*).
  - Clear journey polylines: solid lines tracing origin to current hub, and dashed lines onwards to destination city.
  - Pulsing status rings for live deliveries.
- **📅 Delivery Timeline Buckets:**
  - **Arriving Today**: Urgent highlight + out-for-delivery indicators.
  - **Arriving Tomorrow**: Local city delivery terminal arrivals.
  - **Later this Week**: Trunk transit between inter-state hubs.
  - **Delivered**: Archived successfully with celebration confetti.
- **🔌 Zero-Friction Tracking:**
  - **Direct Smart Tracking Mode**: Works 100% out of the box with unlimited shipments and zero API key or business email requirements.
  - **TrackParcel / TrackCourier API Support**: Ready for external API connection with personal Gmail accounts.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Maps:** Leaflet & OpenStreetMap / CartoDB Voyager tiles
- **Icons:** Lucide React
- **Animations & FX:** Canvas Confetti, Tailwind Animations
- **Bundler & Server:** Vite 8

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ordertracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📂 Project Architecture

```
ordertracker/
├── src/
│   ├── components/
│   │   ├── AddOrderModal.tsx        # Add parcel modal with live courier recognition
│   │   ├── ApiKeyModal.tsx          # API providers & Direct mode settings
│   │   ├── ArchitectureModal.tsx    # In-app architecture & schema inspector
│   │   ├── DeliveryList.tsx         # Today/Tomorrow/Later delivery schedule cards
│   │   ├── Header.tsx               # Top bar with metrics & phone auth badge
│   │   ├── MapView.tsx              # Leaflet India logistics hub map
│   │   ├── PhoneAuthModal.tsx       # Realistic +91 phone & OTP verification
│   │   └── TimelineModal.tsx        # Vertical step-by-step scan history
│   ├── data/
│   │   ├── hubs.ts                  # Indian logistics hub coordinates & geocoder
│   │   └── mockOrders.ts            # Clean slate orders store
│   ├── services/
│   │   └── trackingApi.ts           # Direct mode & TrackParcel/TrackCourier services
│   ├── utils/
│   │   ├── courierDetector.ts       # Regex rules for Valmo, Delhivery, Xpressbees, etc.
│   │   ├── emailParser.ts           # Shipping confirmation email & SMS extractor
│   │   └── shopMeta.ts              # Meesho, Ajio, Nykaa, Nike logos and brand themes
│   ├── App.tsx                      # Root application & state management
│   ├── main.tsx                     # React entry point
│   ├── style.css                    # Tailwind CSS & Leaflet map styling
│   └── types.ts                     # Core TypeScript interfaces
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License
MIT License
