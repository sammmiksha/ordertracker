import { Shop } from '../types';

export interface ShopInfo {
  id: Shop;
  name: string;
  brandColor: string;
  badgeBg: string;
  textColor: string;
  typicalItems: string[];
}

export const SHOP_META: Record<Shop, ShopInfo> = {
  ajio: {
    id: 'ajio',
    name: 'Ajio',
    brandColor: '#2C4152',
    badgeBg: 'bg-slate-800 text-amber-300',
    textColor: 'text-slate-800',
    typicalItems: ['Festive Kurti', 'Denim Jacket', 'Sneakers', 'Handbag'],
  },
  meesho: {
    id: 'meesho',
    name: 'Meesho',
    brandColor: '#9B2063',
    badgeBg: 'bg-pink-700 text-white',
    textColor: 'text-pink-700',
    typicalItems: ['Leather Wallet', 'Clutch', 'Earrings Set', 'Kitchen Organiser'],
  },
  nykaa: {
    id: 'nykaa',
    name: 'Nykaa',
    brandColor: '#FC2779',
    badgeBg: 'bg-rose-500 text-white',
    textColor: 'text-rose-500',
    typicalItems: ['Sunscreen SPF50', 'Matte Lipstick', 'Hair Mask', 'Perfume'],
  },
  nike: {
    id: 'nike',
    name: 'Nike',
    brandColor: '#111111',
    badgeBg: 'bg-black text-white',
    textColor: 'text-black',
    typicalItems: ['Air Max Sneakers', 'Dri-FIT Tee', 'Gym Duffle Bag', 'Cap'],
  },
  myntra: {
    id: 'myntra',
    name: 'Myntra',
    brandColor: '#F13AB1',
    badgeBg: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white',
    textColor: 'text-pink-600',
    typicalItems: ['Cotton Chinos', 'Formal Blazer', 'Sports Watch', 'Sunglasses'],
  },
  aqualogica: {
    id: 'aqualogica',
    name: 'Aqualogica',
    brandColor: '#00A896',
    badgeBg: 'bg-teal-600 text-white',
    textColor: 'text-teal-600',
    typicalItems: ['Radiance+ Dew Drops', 'Watermelon Sunscreen', 'Hydrating Moisturizer'],
  },
  zara: {
    id: 'zara',
    name: 'Zara',
    brandColor: '#000000',
    badgeBg: 'bg-zinc-900 text-white',
    textColor: 'text-zinc-900',
    typicalItems: ['Oversized Linen Shirt', 'Tailored Trousers', 'Leather Boots'],
  },
  snitch: {
    id: 'snitch',
    name: 'Snitch',
    brandColor: '#212121',
    badgeBg: 'bg-stone-800 text-white',
    textColor: 'text-stone-800',
    typicalItems: ['Cuban Collar Shirt', 'Baggy Cargo Pants', 'Corduroy Overshirt'],
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    brandColor: '#FF9900',
    badgeBg: 'bg-amber-500 text-slate-900 font-semibold',
    textColor: 'text-amber-600',
    typicalItems: ['Kindle Paperwhite', 'USB-C Cable', 'Aeropress Coffee Maker'],
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart',
    brandColor: '#2874F0',
    badgeBg: 'bg-blue-600 text-yellow-300 font-semibold',
    textColor: 'text-blue-600',
    typicalItems: ['Wireless Earbuds', 'Electric Kettle', 'Power Bank'],
  },
  other: {
    id: 'other',
    name: 'Independent Store',
    brandColor: '#4F46E5',
    badgeBg: 'bg-indigo-600 text-white',
    textColor: 'text-indigo-600',
    typicalItems: ['Artisan Pottery', 'Book', 'Custom Print'],
  }
};
