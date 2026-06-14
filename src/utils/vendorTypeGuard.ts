import type { VendorType } from '../types';

export const vendorTypes: VendorType[] = [
  'caterer',
  'photographer',
  'florist',
  'venue',
  'music',
  'other',
];

export function isVendorType(value: string): value is VendorType {
  return vendorTypes.includes(value as VendorType);
}
