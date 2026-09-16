/**
 * WhatsApp message generation and URL helper
 */

import { ShopEntry } from '../types';

export function cleanPhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[^0-9]/g, '');
  // If 10 digits (standard Indian mobile), prefix with 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  // If starts with 0 and total 11 digits
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `91${cleaned.substring(1)}`;
  }
  return cleaned;
}

export function generatePaymentReminderMessage(
  shop: ShopEntry,
  language: 'gu' | 'en',
  promoterPageName = 'surendranagar_safik'
): string {
  const amountText = shop.paymentAmount ? `₹${shop.paymentAmount.toLocaleString('en-IN')}` : 'ચર્ચા મુજબ';
  const amountTextEn = shop.paymentAmount ? `₹${shop.paymentAmount.toLocaleString('en-IN')}` : 'as discussed';
  const handleTag = promoterPageName.startsWith('@') ? promoterPageName : `@${promoterPageName}`;

  if (language === 'gu') {
    return `નમસ્તે ${shop.shopName} જી 🙏,

આપણી ઇન્સ્ટાગ્રામ પેજ (${handleTag}) પર પ્રમોશન શૂટ અને રીલનું કામ પૂરું થયેલ છે.

બાકી પેમેન્ટ રકમ: ${amountText}

નમ્ર વિનંતી કે કૃપા કરીને બાકી પેમેન્ટ Google Pay / PhonePe / રોકડેથી પૂર્ણ કરી આપશો જી.

જો પેમેન્ટ થઈ ગયું હોય તો આ મેસેજને અવગણશો.

આભાર & શુભકામનાઓ! 📸
- સફીક ભાઈ (${handleTag} - સુરેન્દ્રનગર)`;
  }

  // English
  return `Hello ${shop.shopName} 🙏,

This is a gentle reminder regarding the Instagram promotion shoot & reel completed on our page (${handleTag}).

Pending Amount: ${amountTextEn}

Kindly arrange to clear the pending payment via UPI (GPay/PhonePe) or cash at your earliest convenience.

If already paid, kindly ignore this message.

Thank you & Best regards! 📸
- Safik Bhai (${handleTag} - Surendranagar)`;
}

export function generateShootReminderMessage(
  shop: ShopEntry,
  language: 'gu' | 'en',
  promoterPageName = 'surendranagar_safik'
): string {
  const handleTag = promoterPageName.startsWith('@') ? promoterPageName : `@${promoterPageName}`;
  if (language === 'gu') {
    return `નમસ્તે ${shop.shopName} જી 🙏,

આવતીકાલે / ટૂંક સમયમાં આપણી દુકાન પર ઇન્સ્ટાગ્રામ રીલ પ્રમોશન (${handleTag}) નું શૂટ શેડ્યૂલ કરેલ છે.

કૃપા કરીને શૂટ માટે દુકાનની તૈયારી અને સમય ધ્યાને લેશો.

કોઈ ફેરફાર હોય તો સંપર્ક કરશો જી.
ધન્યવાદ! 📸
- સફીક ભાઈ (${handleTag})`;
  }

  return `Hello ${shop.shopName} 🙏,

This is a reminder for your upcoming Instagram Reel promotion shoot scheduled with ${handleTag}.

Kindly keep the store items and setup ready as discussed.

Thank you! 📸
- Safik Bhai (${handleTag})`;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleaned = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  if (!cleaned) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}
