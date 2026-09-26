import { Courier } from '../types';

export interface CourierInfo {
  id: Courier;
  name: string;
  badgeColor: string;
  badgeBg: string;
  website: string;
  prefixPattern: string;
  logoInitial: string;
}

export const COURIER_META: Record<Courier, CourierInfo> = {
  delhivery: {
    id: 'delhivery',
    name: 'Delhivery',
    badgeColor: 'text-red-700',
    badgeBg: 'bg-red-50 border-red-200',
    website: 'https://www.delhivery.com',
    prefixPattern: '12-14 digits (starts with 1, 2, 3 or DLV)',
    logoInitial: 'D',
  },
  xpressbees: {
    id: 'xpressbees',
    name: 'Xpressbees',
    badgeColor: 'text-amber-800',
    badgeBg: 'bg-amber-50 border-amber-200',
    website: 'https://www.xpressbees.com',
    prefixPattern: '14 digits or starts with 14... / XPB',
    logoInitial: 'XB',
  },
  bluedart: {
    id: 'bluedart',
    name: 'Blue Dart',
    badgeColor: 'text-blue-800',
    badgeBg: 'bg-blue-50 border-blue-200',
    website: 'https://www.bluedart.com',
    prefixPattern: '8-11 digits AWB',
    logoInitial: 'BD',
  },
  shadowfax: {
    id: 'shadowfax',
    name: 'Shadowfax',
    badgeColor: 'text-emerald-800',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    website: 'https://www.shadowfax.in',
    prefixPattern: 'Starts with SF... or 10-12 chars',
    logoInitial: 'SF',
  },
  ecom_express: {
    id: 'ecom_express',
    name: 'Ecom Express',
    badgeColor: 'text-violet-800',
    badgeBg: 'bg-violet-50 border-violet-200',
    website: 'https://ecomexpress.in',
    prefixPattern: '9-10 digits (starts with 8 or 9)',
    logoInitial: 'EE',
  },
  indiapost: {
    id: 'indiapost',
    name: 'India Post (Speed Post)',
    badgeColor: 'text-rose-800',
    badgeBg: 'bg-rose-50 border-rose-200',
    website: 'https://www.indiapost.gov.in',
    prefixPattern: '13 chars (e.g. EU123456789IN)',
    logoInitial: 'IP',
  },
  dtdc: {
    id: 'dtdc',
    name: 'DTDC',
    badgeColor: 'text-orange-800',
    badgeBg: 'bg-orange-50 border-orange-200',
    website: 'https://www.dtdc.in',
    prefixPattern: 'Starts with D, Z, or B + 8 digits',
    logoInitial: 'DT',
  },
  valmo: {
    id: 'valmo',
    name: 'Valmo (Meesho Logistics)',
    badgeColor: 'text-fuchsia-800',
    badgeBg: 'bg-fuchsia-50 border-fuchsia-200',
    website: 'https://www.valmo.in',
    prefixPattern: 'Starts with VL... or VLR...',
    logoInitial: 'VL',
  },
  amazon_logistics: {
    id: 'amazon_logistics',
    name: 'Amazon Shipping',
    badgeColor: 'text-yellow-800',
    badgeBg: 'bg-yellow-50 border-yellow-200',
    website: 'https://track.amazon.in',
    prefixPattern: 'TBA... or AMZN',
    logoInitial: 'AZ',
  },
  other: {
    id: 'other',
    name: 'Standard Logistics',
    badgeColor: 'text-slate-800',
    badgeBg: 'bg-slate-50 border-slate-200',
    website: '',
    prefixPattern: 'Unknown format',
    logoInitial: 'PKG',
  }
};

/**
 * Intelligent courier detection engine for Indian tracking IDs
 */
export function detectCourier(trackingId: string): { courier: Courier; confidence: 'high' | 'medium' | 'low'; reason: string } {
  const clean = trackingId.trim().toUpperCase().replace(/[\s-]/g, '');

  if (!clean) {
    return { courier: 'other', confidence: 'low', reason: 'Empty tracking number' };
  }

  // India Post pattern: 2 letters + 9 digits + 2 letters (usually "IN", e.g. EM123456789IN, RK123456789IN)
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(clean)) {
    return { courier: 'indiapost', confidence: 'high', reason: 'India Post standard 13-character Speed Post format (ends with IN)' };
  }

  // Valmo (Meesho Logistics) pattern: begins with VL or VLR followed by digits
  if (/^VLR?\d+/i.test(clean)) {
    return { courier: 'valmo', confidence: 'high', reason: 'Valmo (Meesho Logistics) consignment ID (VL prefix)' };
  }

  // Shadowfax pattern: begins with SF or SHFX
  if (/^(SF|SHFX)/i.test(clean)) {
    return { courier: 'shadowfax', confidence: 'high', reason: 'Shadowfax consignment identifier prefix' };
  }

  // Amazon Logistics pattern: starts with TBA
  if (/^TBA/i.test(clean)) {
    return { courier: 'amazon_logistics', confidence: 'high', reason: 'Amazon Shipping (TBA format)' };
  }

  // DTDC pattern: begins with D, Z, or B followed by 8-9 digits (e.g. D12345678)
  if (/^[DZB]\d{8,9}$/i.test(clean)) {
    return { courier: 'dtdc', confidence: 'high', reason: 'DTDC consignment number format (D/Z prefix)' };
  }

  // Pure digits checks
  if (/^\d+$/.test(clean)) {
    // Xpressbees: 14 digits, typically starting with 14, 13, or 12
    if (clean.length === 14 && (clean.startsWith('14') || clean.startsWith('13') || clean.startsWith('12'))) {
      return { courier: 'xpressbees', confidence: 'high', reason: '14-digit Xpressbees tracking series' };
    }

    // Ecom Express: 9 or 10 digits starting with 8 or 9
    if ((clean.length === 9 || clean.length === 10) && (clean.startsWith('8') || clean.startsWith('9'))) {
      return { courier: 'ecom_express', confidence: 'high', reason: '9-10 digit Ecom Express sequence starting with 8/9' };
    }

    // Blue Dart: usually 8, 9, 10 or 11 digits
    if (clean.length >= 8 && clean.length <= 11) {
      // If starts with 7 or 8 and 11 digits, strong Blue Dart AWB
      return { courier: 'bluedart', confidence: 'medium', reason: `${clean.length}-digit AWB (matches Blue Dart)` };
    }

    // Delhivery: 12-14 digits, commonly starting with 1, 2, 3, 4
    if (clean.length >= 12 && clean.length <= 14) {
      return { courier: 'delhivery', confidence: 'high', reason: `${clean.length}-digit Delhivery surface/express waybill` };
    }
  }

  // Fallback defaults
  if (clean.length >= 12) {
    return { courier: 'delhivery', confidence: 'medium', reason: '12+ character format common to Delhivery' };
  }

  return { courier: 'other', confidence: 'low', reason: 'Unknown courier pattern - you can manually select below' };
}
