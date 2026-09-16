/**
 * LocalStorage Management, CSV/JSON Export & Initial Seed Data
 */

import { ShopEntry, PromoterProfile } from '../types';

const STORAGE_KEY_SHOPS = 'sn_insta_promoter_shops_v2';
const STORAGE_KEY_PIN = 'sn_insta_promoter_pin_v1';
const STORAGE_KEY_PIN_ENABLED = 'sn_insta_promoter_pin_enabled_v1';
const STORAGE_KEY_PROFILE = 'sn_insta_promoter_profile_v1';

// Fresh initial data: empty array for client production use
export const INITIAL_SAMPLE_SHOPS: ShopEntry[] = [];

export const DEFAULT_PROFILE: PromoterProfile = {
  name: 'સફીક ભાઈ',
  pageName: 'surendranagar_safik',
  phone: '9825000000',
  city: 'સુરેન્દ્રનગર (Surendranagar)'
};

/** Load shops from localStorage */
export function getStoredShops(): ShopEntry[] {
  try {
    // Clear legacy sample data if present
    if (localStorage.getItem('sn_insta_promoter_shops_v1')) {
      localStorage.removeItem('sn_insta_promoter_shops_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY_SHOPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: ShopEntry) => ({
      ...s,
      status: s.status === 'upcoming' ? 'upcoming' : 'completed'
    }));
  } catch {
    return [];
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
