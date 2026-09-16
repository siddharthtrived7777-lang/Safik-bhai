/**
 * LocalStorage Management, CSV/JSON Export & Initial Seed Data
 */

import { ShopEntry, PromoterProfile } from '../types';

const STORAGE_KEY_SHOPS = 'sn_insta_promoter_shops_v1';
const STORAGE_KEY_PIN = 'sn_insta_promoter_pin_v1';
const STORAGE_KEY_PIN_ENABLED = 'sn_insta_promoter_pin_enabled_v1';
const STORAGE_KEY_PROFILE = 'sn_insta_promoter_profile_v1';

// Seed sample data for Surendranagar promoter
export const INITIAL_SAMPLE_SHOPS: ShopEntry[] = [
  {
    id: 'shop-1',
    shopName: 'શ્રી રામ ડેરી એન્ડ સ્વીટ્સ',
    ownerPhone: '9825012345',
    // Set for today 4:00 PM
    shootDateTime: (() => {
      const d = new Date();
      d.setHours(16, 0, 0, 0);
      return d.toISOString();
    })(),
    addressNote: 'બસ સ્ટેન્ડ સામે, વઢવાણ રોડ, સુરેન્દ્રનગર',
    notes: 'તાજા માવા પેંડા અને કાજુ કતરી બનાવવાનો લાઈવ વિડીયો લેવાનો છે. ૩૦ સેકન્ડની રીલ.',
    status: 'upcoming',
    paymentAmount: 1500,
    paymentStatus: 'remaining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shop-2',
    shopName: 'બોમ્બે ફેશન હબ',
    ownerPhone: '9428098765',
    // Set for tomorrow 11:30 AM
    shootDateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(11, 30, 0, 0);
      return d.toISOString();
    })(),
    addressNote: 'દુકાન નં. ૧૨, મેગા મોલ પાસે, ૮૦ ફીટ રોડ, સુરેન્દ્રનગર',
    notes: 'દિવાળી / ફેસ્ટિવલ નવીન કલેક્શન મેન્સ વેર શૂટ. સ્પેશિયલ ઑફર રીલ.',
    status: 'upcoming',
    paymentAmount: 2500,
    paymentStatus: 'remaining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shop-3',
    shopName: 'મહાવીર કાપડ કેન્દ્ર',
    ownerPhone: '9879055443',
    // 2 days ago
    shootDateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      d.setHours(17, 0, 0, 0);
      return d.toISOString();
    })(),
    addressNote: 'મેઈન બજાર, ટાવર પાસે, સુરેન્દ્રનગર',
    notes: 'સાડીઓ અને ચણિયાચોળીનું રીલ શૂટ થઈ ગયું. રીલ ઇન્સ્ટાગ્રામ પેજ પર પોસ્ટ થઈ ગઈ છે.',
    status: 'posted',
    paymentAmount: 2000,
    paymentStatus: 'remaining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shop-4',
    shopName: 'શિવ શક્તિ કાઠીયાવાડી ઢાબા',
    ownerPhone: '9909011223',
    // 4 days ago
    shootDateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 4);
      d.setHours(20, 0, 0, 0);
      return d.toISOString();
    })(),
    addressNote: 'હાઇવે બાયપાસ, વઢવાણ ચોકડી, સુરેન્દ્રનગર',
    notes: 'ઓળો-રોટલો અને દેશી ઘી કાઠીયાવાડી થાળીનું શૂટિંગ પૂર્ણ.',
    status: 'payment_done',
    paymentAmount: 3000,
    paymentStatus: 'done',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shop-5',
    shopName: 'બાલાજી મોબાઇલ એન્ડ ગેજેટ્સ',
    ownerPhone: '9898033221',
    // in 3 days
    shootDateTime: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(15, 30, 0, 0);
      return d.toISOString();
    })(),
    addressNote: 'જવાહર રોડ, સુરેન્દ્રનગર',
    notes: 'નવા 5G સ્માર્ટફોન અને એસેસરીઝ ડિસ્કાઉન્ટ સ્કીમ રીલ બનાવવાની છે.',
    status: 'upcoming',
    paymentAmount: 1800,
    paymentStatus: 'remaining',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const DEFAULT_PROFILE: PromoterProfile = {
  name: 'સફીક ભાઈ',
  pageName: 'surendranagar_safik',
  phone: '9825000000',
  city: 'સુરેન્દ્રનગર (Surendranagar)'
};

/** Load shops from localStorage */
export function getStoredShops(): ShopEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOPS);
    if (!raw) {
      // Initialize with sample data
      localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(INITIAL_SAMPLE_SHOPS));
      return INITIAL_SAMPLE_SHOPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_SHOPS;
  } catch {
    return INITIAL_SAMPLE_SHOPS;
  }
}

/** Save shops to localStorage */
export function saveStoredShops(shops: ShopEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(shops));
  } catch (err) {
    console.error('Failed to save shops in localStorage', err);
  }
}

/** PIN Security Functions */
export function getStoredPin(): string {
  return localStorage.getItem(STORAGE_KEY_PIN) || '1234';
}

export function saveStoredPin(pin: string): void {
  localStorage.setItem(STORAGE_KEY_PIN, pin);
}

export function isPinEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEY_PIN_ENABLED);
  return val === null ? true : val === 'true';
}

export function setPinEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_PIN_ENABLED, enabled ? 'true' : 'false');
}

/** Profile info */
export function getStoredProfile(): PromoterProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.pageName || parsed.pageName === 'Surendranagar_Live_Updates' || parsed.pageName === 'Safik_Bhai_Promoter') {
        parsed.pageName = 'surendranagar_safik';
        parsed.name = 'સફીક ભાઈ';
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: PromoterProfile): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}
