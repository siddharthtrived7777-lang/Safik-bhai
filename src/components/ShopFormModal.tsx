import React, { useState, useEffect } from 'react';
import { X, Store, Phone, Calendar, MapPin, FileText, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import { ShopEntry, ShootStatus, PaymentStatus } from '../types';
import { toInputDateTimeString } from '../utils/dateUtils';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

interface ShopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shopData: Omit<ShopEntry, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  initialData?: ShopEntry | null;
  isRepeatPromotion?: boolean;
}

export const ShopFormModal: React.FC<ShopFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isRepeatPromotion = false
}) => {
  const [shopName, setShopName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [shootDateTime, setShootDateTime] = useState<string>('');
  const [addressNote, setAddressNote] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<ShootStatus>('upcoming');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('remaining');
  const [voiceNoteAudio, setVoiceNoteAudio] = useState<string | undefined>(undefined);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setShopName(initialData.shopName || '');
      setOwnerPhone(initialData.ownerPhone || '');
      setAddressNote(initialData.addressNote || '');
      setPaymentAmount(initialData.paymentAmount ? initialData.paymentAmount.toString() : '');

      if (isRepeatPromotion) {
        // New repeat promotion: fresh date/time, upcoming status, remaining payment
        setShootDateTime(toInputDateTimeString());
        setStatus('upcoming');
        setPaymentStatus('remaining');
        setNotes(initialData.notes ? `ફરીથી પ્રમોશન: ${initialData.notes}` : '');
        setVoiceNoteAudio(undefined);
        setVoiceNoteDuration(undefined);
      } else {
        // Edit mode
        setShootDateTime(
          initialData.shootDateTime 
            ? toInputDateTimeString(new Date(initialData.shootDateTime))
            : toInputDateTimeString()
        );
        setStatus(initialData.status);
        setPaymentStatus(initialData.paymentStatus);
        setNotes(initialData.notes || '');
        setVoiceNoteAudio(initialData.voiceNoteAudio);
        setVoiceNoteDuration(initialData.voiceNoteDuration);
      }
    } else {
      // Clean new shop
      setShopName('');
      setOwnerPhone('');
      setShootDateTime(toInputDateTimeString());
      setAddressNote('');
      setNotes('');
      setVoiceNoteAudio(undefined);
      setVoiceNoteDuration(undefined);
      setStatus('upcoming');
      setPaymentAmount('');
      setPaymentStatus('remaining');
    }
    setErrors({});
  }, [initialData, isRepeatPromotion, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!shopName.trim()) {
      newErrors.shopName = 'દુકાનનું નામ લખવું જરૂરી છે';
    }
    const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.ownerPhone = 'મોબાઇલ નંબર લખવો જરૂરી છે';
    } else if (cleanPhone.length < 10) {
      newErrors.ownerPhone = 'ઓછામાં ઓછો ૧૦ અંકનો મોબાઇલ નંબર દાખલ કરો';
    }
    if (!shootDateTime) {
      newErrors.shootDateTime = 'શૂટની તારીખ અને સમય પસંદ કરો';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amountNum = paymentAmount ? parseFloat(paymentAmount) : undefined;

    onSave(
      {
        shopName: shopName.trim(),
        ownerPhone: ownerPhone.trim(),
        shootDateTime: new Date(shootDateTime).toISOString(),
        addressNote: addressNote.trim() || undefined,
        notes: notes.trim() || undefined,
        voiceNoteAudio,
        voiceNoteDuration,
        status,
        paymentAmount: isNaN(Number(amountNum)) ? undefined : amountNum,
        paymentStatus
      },
      isRepeatPromotion ? undefined : initialData?.id
    );

    onClose();
  };

  // If status changed to payment_done, auto-mark payment as done
  const handleStatusChange = (newStatus: ShootStatus) => {
    setStatus(newStatus);
    if (newStatus === 'payment_done') {
      setPaymentStatus('done');
    } else if (newStatus === 'payment_pending') {
      setPaymentStatus('remaining');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isRepeatPromotion
                  ? 'દુકાનનું ફરીથી પ્રમોશન શૂટ'
                  : initialData
                  ? 'દુકાનની વિગતો સુધારો'
                  : 'નવી દુકાન ઉમેરો'}
              </h2>
              <p className="text-xs text-rose-100">
                સુરેન્દ્રનગર ઇન્સ્ટાગ્રામ શૂટ રેકોર્ડ
              </p>
            </div>
          </div>
          <button
            id="close-shop-form"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-800/60 hover:bg-rose-800 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              દુકાનનું નામ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-shop-name"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="દા.ત. શ્રી રામ ડેરી, બોમ્બે ફેશન હબ..."
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                  errors.shopName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.shopName && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.shopName}</p>}
          </div>

          {/* Owner Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              દુકાનદારનો મોબાઇલ નંબર <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-owner-phone"
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="૧૦ અંકનો નંબર (દા.ત. 9825012345)"
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                  errors.ownerPhone ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.ownerPhone && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.ownerPhone}</p>}
          </div>

          {/* Shoot Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              શૂટની તારીખ અને સમય <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-shoot-datetime"
                type="datetime-local"
                value={shootDateTime}
                onChange={(e) => setShootDateTime(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                  errors.shootDateTime ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300 bg-slate-50/50'
                }`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.shootDateTime && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.shootDateTime}</p>}
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              શૂટ સ્ટેટસ (Status)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'upcoming' as ShootStatus, label: 'આગામી શૂટ (Upcoming)', color: 'bg-amber-50 border-amber-300 text-amber-900' },
                { id: 'shot' as ShootStatus, label: 'શૂટ પૂરું (Shot)', color: 'bg-blue-50 border-blue-300 text-blue-900' },
                { id: 'posted' as ShootStatus, label: 'રીલ પોસ્ટ થઈ (Posted)', color: 'bg-purple-50 border-purple-300 text-purple-900' },
                { id: 'payment_pending' as ShootStatus, label: 'પેમેન્ટ બાકી (Pending)', color: 'bg-rose-50 border-rose-300 text-rose-900' },
                { id: 'payment_done' as ShootStatus, label: 'પેમેન્ટ પૂર્ણ (Done)', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`status-option-${item.id}`}
                  type="button"
                  onClick={() => handleStatusChange(item.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    status === item.id
                      ? `${item.color} ring-2 ring-rose-500 shadow-sm`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Amount & Status */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                પેમેન્ટ વિગત (ચાર્જ)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  પ્રમોશન રકમ (₹)
                </label>
                <div className="relative">
                  <input
                    id="input-payment-amount"
                    type="number"
                    min="0"
                    step="50"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="દા.ત. 1500"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  પેમેન્ટ સ્થિતિ
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    id="payment-status-remaining"
                    type="button"
                    onClick={() => setPaymentStatus('remaining')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentStatus === 'remaining'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    બાકી
                  </button>
                  <button
                    id="payment-status-done"
                    type="button"
                    onClick={() => setPaymentStatus('done')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      paymentStatus === 'done'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    મળી ગયું
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Address / Location note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              સરનામું / લોકેશન નોટ (ઓપ્શનલ)
            </label>
            <div className="relative">
              <input
                id="input-address-note"
                type="text"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                placeholder="દા.ત. મેગા મોલ પાસે, 80 ફીટ રોડ, વઢવાણ..."
                className="w-full p-3 pl-10 rounded-xl border border-slate-300 bg-slate-50/50 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Notes (Typing) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ખાસ નોંધ / શૂટ વિગત (ટાઇપિંગ)
            </label>
            <div className="relative">
              <textarea
                id="input-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="દા.ત. ખાસ નવી ઑફર દર્શાવવી, દુકાન બપોરે ૨ થી ૪ બંધ રહે છે..."
                className="w-full p-3 pl-10 rounded-xl border border-slate-300 bg-slate-50/50 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Voice Note (Alternative to typing) */}
          <div>
            <VoiceNoteRecorder
              audioData={voiceNoteAudio}
              duration={voiceNoteDuration}
              onChange={(newAudio, newDuration) => {
                setVoiceNoteAudio(newAudio);
                setVoiceNoteDuration(newDuration);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 pb-1">
            <button
              id="btn-save-shop"
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-base shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{initialData && !isRepeatPromotion ? 'વિગત અપડેટ કરો' : 'દુકાન સાચવો (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
