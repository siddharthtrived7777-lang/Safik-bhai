import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Check } from 'lucide-react';
import { ShopEntry } from '../types';

interface EditAmountModalProps {
  shop: ShopEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAmount: (shopId: string, newAmount: number) => void;
}

export const EditAmountModal: React.FC<EditAmountModalProps> = ({
  shop,
  isOpen,
  onClose,
  onSaveAmount
}) => {
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (shop) {
      setAmount(shop.paymentAmount ? shop.paymentAmount.toString() : '');
    }
  }, [shop]);

  if (!isOpen || !shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val >= 0) {
      onSaveAmount(shop.id, val);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">પ્રમોશન રકમ સુધારો</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          દુકાન: <span className="font-bold text-slate-900">{shop.shopName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="number"
              min="0"
              step="50"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="રકમ દાખલ કરો"
              className="w-full p-3 pl-8 rounded-2xl border border-slate-300 font-bold text-base text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">₹</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm"
            >
              સાચવો
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
