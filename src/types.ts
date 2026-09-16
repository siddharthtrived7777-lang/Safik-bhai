/**
 * Types for Surendranagar Instagram Shop Promoter App
 */

export type ShootStatus = 
  | 'upcoming'        // આગામી શૂટ
  | 'shot'            // શૂટ પૂરું થયું
  | 'posted'          // પોસ્ટ/રીલ મુકાઈ ગઈ
  | 'payment_pending' // પેમેન્ટ બાકી
  | 'payment_done';   // પેમેન્ટ પૂર્ણ

export type PaymentStatus = 'remaining' | 'done'; // બાકી | મળી ગયું

export interface ShopEntry {
  id: string;
  shopName: string;            // દુકાનનું નામ
  ownerPhone: string;          // દુકાનદારનો મોબાઇલ નંબર
  shootDateTime: string;       // શૂટની તારીખ અને સમય (ISO or YYYY-MM-DDTHH:mm)
  addressNote?: string;        // દુકાનનું સરનામું / લોકેશન નોટ
  notes?: string;              // ખાસ નોંધ / શૂટ વિગત / રીલ આઇડિયા
  voiceNoteAudio?: string;     // વોઇસ નોટ ઑડિયો (Base64 Data URL)
  voiceNoteDuration?: number;  // વોઇસ નોટ સમયગાળો (સેકન્ડ્સમાં)
  status: ShootStatus;         // સ્ટેટસ
  paymentAmount?: number;      // પેમેન્ટ રકમ (₹)
  paymentStatus: PaymentStatus;// પેમેન્ટ સ્ટેટસ: બાકી કે મળી ગયું
  createdAt: string;           // બનાવ્યા તારીખ
  updatedAt: string;           // છેલ્લો ફેરફાર
}

export interface PromoterProfile {
  name: string;
  pageName: string;
  phone: string;
  city: string;
}

export type ActiveTab = 'dashboard' | 'calendar' | 'shops' | 'payments';
