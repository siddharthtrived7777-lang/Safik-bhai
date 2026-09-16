import React from 'react';
import { 
  X, 
  Store, 
  Phone, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  IndianRupee, 
  MessageCircle, 
  Repeat, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Share2 
} from 'lucide-react';
import { ShopEntry, ShootStatus } from '../types';
import { formatGujaratiDate, formatGujaratiTime, getRelativeDayLabel } from '../utils/dateUtils';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { VoiceNotePlayer } from './VoiceNotePlayer';

interface ShopDetailsModalProps {
  shop: ShopEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (shop: ShopEntry) => void;
  onRepeat: (shop: ShopEntry) => void;
  onDelete: (shopId: string) => void;
  onOpenPaymentReminder: (shop: ShopEntry) => void;
  onUpdateStatus: (shopId: string, newStatus: ShootStatus) => void;
  onTogglePayment: (shop: ShopEntry) => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  shop,
  isOpen,
  onClose,
  onEdit,
  onRepeat,
  onDelete,
  onOpenPaymentReminder,
  onUpdateStatus,
  onTogglePayment
}) => {
  if (!isOpen || !shop) return null;

  const rel = getRelativeDayLabel(shop.shootDateTime);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                દુકાન પ્રમોશન વિગત
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {shop.shopName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto text-sm">
          {/* Status & Timing Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">શૂટ શેડ્યૂલ</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{formatGujaratiDate(shop.shootDateTime, true)}</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatGujaratiTime(shop.shootDateTime)} ({rel.label})</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">પ્રમોશન ચાર્જ</div>
              <div className="text-base font-extrabold text-slate-900">
                ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
              </div>
              <button
                type="button"
                onClick={() => onTogglePayment(shop)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                  shop.paymentStatus === 'done'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {shop.paymentStatus === 'done' ? '✓ પેમેન્ટ મળી ગયું' : '⏳ પેમેન્ટ બાકી'}
              </button>
            </div>
          </div>

          {/* Phone Number & Direct Contact Buttons */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-800 font-bold">દુકાનદાર મોબાઇલ નંબર</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                +91 {shop.ownerPhone}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={`tel:${shop.ownerPhone}`}
                className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>કૉલ</span>
              </a>
              <a
                href={getWhatsAppUrl(shop.ownerPhone, `નમસ્તે ${shop.shopName} જી, સફીક ભાઈ (@surendranagar_safik) પ્રમોશન શૂટ અંગે સંપર્ક કરું છું.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>ચેટ</span>
              </a>
            </div>
          </div>

          {/* Status Quick Changer: Only Upcoming and Completed in Gujarati */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              શૂટ સ્ટેટસ:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateStatus(shop.id, 'upcoming')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  shop.status === 'upcoming'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                આગામી શૂટ
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(shop.id, 'completed')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  shop.status === 'completed'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs ring-1 ring-emerald-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                શૂટ પૂર્ણ
              </button>
            </div>
          </div>

          {/* Address Note */}
          {shop.addressNote && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>સરનામું / લોકેશન:</span>
              </div>
              <p className="text-xs text-slate-700">{shop.addressNote}</p>
            </div>
          )}

          {/* Voice Note Recording Player */}
          {shop.voiceNoteAudio && (
            <VoiceNotePlayer
              audioData={shop.voiceNoteAudio}
              duration={shop.voiceNoteDuration}
            />
          )}

          {/* Notes */}
          {shop.notes && (
            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
              <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-0.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>ખાસ નોંધ / વિગત:</span>
              </div>
              <p className="text-xs text-amber-950">{shop.notes}</p>
            </div>
          )}

          {/* WhatsApp Payment Reminder trigger */}
          {shop.paymentStatus === 'remaining' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPaymentReminder(shop);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp પેમેન્ટ રિમાઇન્ડર મોકલો (ગુજરાતી / English)</span>
            </button>
          )}

          {/* Bottom Action Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRepeat(shop);
              }}
              className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
            >
              <Repeat className="w-4 h-4 text-blue-600" />
              <span>ફરી શૂટ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(shop);
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
            >
              <Edit className="w-4 h-4" />
              <span>સુધારો</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`શું તમે ${shop.shopName} નો રેકોર્ડ કાઢી નાખવા માંગો છો?`)) {
                  onDelete(shop.id);
                  onClose();
                }
              }}
              className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>કાઢી નાખો</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
