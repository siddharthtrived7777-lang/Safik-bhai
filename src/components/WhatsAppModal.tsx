import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Copy, Check, MessageSquare, Phone, Store, Globe, 
  Download, QrCode, Share2, Sparkles, AlertCircle 
} from 'lucide-react';
import { ShopEntry, PromoterProfile } from '../types';
import { generatePaymentReminderMessage, getWhatsAppUrl } from '../utils/whatsapp';
import { generateSafikGPayImage, SAFIK_UPI_ID, SAFIK_UPI_NAME } from '../utils/qrGenerator';

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
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const isRemainingPayment = shop?.paymentStatus === 'remaining';

  // Generate reminder message
  useEffect(() => {
    if (shop) {
      const msg = generatePaymentReminderMessage(shop, language, profile.pageName);
      setCustomMessage(msg);
    }
  }, [shop, language, profile.pageName]);

  // Generate Safik Google Pay QR code image for remaining payment holders
  useEffect(() => {
    let isMounted = true;
    if (shop && isRemainingPayment) {
      generateSafikGPayImage({
        amount: shop.paymentAmount || undefined,
        shopName: shop.shopName
      })
        .then(({ dataUrl, blob }) => {
          if (isMounted) {
            setQrDataUrl(dataUrl);
            setQrBlob(blob);
          }
        })
        .catch((err) => {
          console.error('Failed to generate QR:', err);
        });
    } else {
      setQrDataUrl(null);
      setQrBlob(null);
    }

    return () => {
      isMounted = false;
    };
  }, [shop, isRemainingPayment]);

  if (!isOpen || !shop) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(SAFIK_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Safik_Bhai_Payment_QR_${shop.shopName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareFeedback('QR ઇમેજ ડાઉનલોડ થઈ ગઈ!');
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const handleCopyQrImage = async () => {
    if (!qrBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': qrBlob,
          }),
        ]);
        setCopiedImage(true);
        setShareFeedback('QR ઇમેજ ક્લિપબોર્ડમાં કોપી થઈ ગઈ! વોટ્સએપમાં Paste કરો.');
        setTimeout(() => {
          setCopiedImage(false);
          setShareFeedback(null);
        }, 3000);
      } else {
        handleDownloadQr();
      }
    } catch {
      handleDownloadQr();
    }
  };

  /**
   * Primary action: Share on WhatsApp with QR image (Web Share API with file attachment)
   * If on mobile with Web Share file support, directly opens WhatsApp with the QR image attached and message filled!
   * If Web Share is not supported, triggers instant download of QR + opens WhatsApp URL.
   */
  const handleShareWithWhatsApp = async () => {
    if (!shop) return;
    setIsSharing(true);

    try {
      if (qrBlob && navigator.canShare) {
        const file = new File(
          [qrBlob],
          `Safik_Payment_QR_${shop.shopName.replace(/\s+/g, '_')}.png`,
          { type: 'image/png' }
        );

        const shareData = {
          files: [file],
          title: `પેમેન્ટ QR - ${shop.shopName}`,
          text: customMessage,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setIsSharing(false);
          return;
        }
      }
    } catch (err: any) {
      // User cancelled share or abort error - do not treat as fatal
      if (err.name === 'AbortError') {
        setIsSharing(false);
        return;
      }
      console.warn('Web Share failed, falling back to direct WhatsApp link:', err);
    }

    // Fallback: If share is not supported or failed, auto-download QR and open WhatsApp
    if (qrDataUrl) {
      handleDownloadQr();
    }
    const url = getWhatsAppUrl(shop.ownerPhone, customMessage);
    window.open(url, '_blank');
    setIsSharing(false);
  };

  const handleDirectWhatsAppText = () => {
    const url = getWhatsAppUrl(shop.ownerPhone, customMessage);
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
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
                <span className="font-semibold truncate max-w-[200px]">{shop.shopName}</span>
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
              <div className="text-xs text-slate-500 font-medium">બાકી પેમેન્ટ રકમ</div>
              <div className="text-base font-black text-rose-600">
                ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
              </div>
            </div>
          </div>

          {/* Dedicated Google Pay QR Code Section for Remaining Payment */}
          {isRemainingPayment && (
            <div className="bg-gradient-to-b from-blue-50/60 to-slate-50 rounded-2xl p-3.5 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>સફીક ભાઈનો Google Pay QR કોડ</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  સ્કેન કરવા તૈયાર
                </span>
              </div>

              {/* QR Image Card Display */}
              <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm relative group">
                {qrDataUrl ? (
                  <div className="relative">
                    <img 
                      src={qrDataUrl} 
                      alt="Safik Jusab Google Pay UPI QR Code" 
                      className="w-56 h-auto max-h-72 rounded-xl object-contain mx-auto shadow-xs border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                    QR કોડ લોડ થઈ રહ્યો છે...
                  </div>
                )}

                {/* UPI ID Pill with Quick Copy */}
                <div className="mt-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    UPI: <strong className="text-slate-900">{SAFIK_UPI_ID}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md shrink-0 ml-1 transition-colors"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? 'કોપી થયું!' : 'કોપી'}</span>
                  </button>
                </div>
              </div>

              {/* QR Action Buttons: Download & Copy Image */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>QR સેવ કરો</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyQrImage}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copiedImage ? 'કોપી થઈ ગયું!' : 'QR ફોટો કોપી'}</span>
                </button>
              </div>

              {/* Feedback toast if any */}
              {shareFeedback && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center font-semibold animate-fade-in">
                  {shareFeedback}
                </p>
              )}
            </div>
          )}

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
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  language === 'gu'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇮🇳 ગુજરાતી</span>
              </button>
              <button
                id="lang-btn-english"
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
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
                મેસેજ પૂર્વાવલોકન:
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
              >
                {copiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedText ? 'ટેક્સ્ટ કોપી થઈ!' : 'ટેક્સ્ટ કોપી કરો'}
              </button>
            </div>
            <textarea
              id="whatsapp-message-textarea"
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 leading-relaxed resize-none text-slate-800"
            />
          </div>
        </div>

        {/* Modal Footer with Primary Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2">
          {/* Main Action: Send with QR */}
          {isRemainingPayment ? (
            <button
              id="send-whatsapp-btn"
              type="button"
              disabled={isSharing}
              onClick={handleShareWithWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-75"
            >
              <Share2 className="w-5 h-5 shrink-0" />
              <span>QR ફોટો સાથે WhatsApp માં મોકલો</span>
            </button>
          ) : (
            <button
              id="send-whatsapp-btn"
              type="button"
              onClick={handleDirectWhatsAppText}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Send className="w-5 h-5 shrink-0" />
              <span>વોટ્સએપ ખોલો અને મોકલો</span>
            </button>
          )}

          {isRemainingPayment && (
            <button
              type="button"
              onClick={handleDirectWhatsAppText}
              className="w-full py-2 px-3 text-xs text-emerald-800 font-bold hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors text-center flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>માત્ર મેસેજ (ટેક્સ્ટ) મોકલો</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-xs text-slate-500 font-semibold hover:text-slate-800 transition-colors text-center"
          >
            પાછા જાઓ
          </button>
        </div>
      </div>
    </div>
  );
};

