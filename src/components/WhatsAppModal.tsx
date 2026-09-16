import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, Store, Globe } from 'lucide-react';
import { ShopEntry, PromoterProfile } from '../types';
import { generatePaymentReminderMessage, getWhatsAppUrl } from '../utils/whatsapp';

interface WhatsAppModalProps {
  shop: ShopEntry | null;
  profile: PromoterProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  shop,
  profile,
  isOpen,
  onClose
}) => {
  const [language, setLanguage] = useState<'gu' | 'en'>('gu');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (shop) {
      const msg = generatePaymentReminderMessage(shop, language, profile.pageName);
      setCustomMessage(msg);
    }
  }, [shop, language, profile.pageName]);

  if (!isOpen || !shop) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = getWhatsAppUrl(shop.ownerPhone, customMessage);
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">વોટ્સએપ પેમેન્ટ રિમાઇન્ડર</h3>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <Store className="w-3.5 h-3.5" />
                <span className="font-semibold">{shop.shopName}</span>
              </p>
            </div>
          </div>
          <button
            id="close-whatsapp-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700/60 hover:bg-emerald-700 flex items-center justify-center text-white transition-colors"
            aria-label="બંધ કરો"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Shop Quick Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-slate-500 font-medium">દુકાનદારનો નંબર</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                +91 {shop.ownerPhone}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">બાકી રકમ</div>
              <div className="text-base font-bold text-rose-600">
                ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              મેસેજની ભાષા પસંદ કરો:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="lang-btn-gujarati"
                type="button"
                onClick={() => setLanguage('gu')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  language === 'gu'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇮🇳 ગુજરાતી ભાષા</span>
              </button>
              <button
                id="lang-btn-english"
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  language === 'en'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          {/* Message Preview and Editable Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                મેસેજ પૂર્વાવલોકન (તમે ફેરફાર કરી શકો છો):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'કોપી થઈ ગયો!' : 'કોપી કરો'}
              </button>
            </div>
            <textarea
              id="whatsapp-message-textarea"
              rows={7}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 leading-relaxed resize-none text-slate-800"
            />
          </div>
        </div>

        {/* Modal Footer with Primary Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2">
          <button
            id="send-whatsapp-btn"
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            <span>વોટ્સએપ ખોલો અને મોકલો</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 font-semibold hover:text-slate-800 transition-colors text-center"
          >
            પાછા જાઓ
          </button>
        </div>
      </div>
    </div>
  );
};
