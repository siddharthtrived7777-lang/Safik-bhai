import React, { useState } from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Phone, 
  PhoneCall, 
  Calendar, 
  Store, 
  Check, 
  Filter, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { ShopEntry } from '../types';
import { formatGujaratiDate } from '../utils/dateUtils';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { MonthlyEarningsModal } from './MonthlyEarningsModal';

interface PaymentTrackingViewProps {
  shops: ShopEntry[];
  onTogglePaymentStatus: (shop: ShopEntry) => void;
  onOpenPaymentReminder: (shop: ShopEntry) => void;
  onEditPaymentAmount: (shop: ShopEntry) => void;
  onOpenShopDetails?: (shop: ShopEntry) => void;
}

export const PaymentTrackingView: React.FC<PaymentTrackingViewProps> = ({
  shops,
  onTogglePaymentStatus,
  onOpenPaymentReminder,
  onEditPaymentAmount,
  onOpenShopDetails
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState<boolean>(false);

  const pendingShops = shops.filter((s) => s.paymentStatus === 'remaining');
  const completedShops = shops.filter((s) => s.paymentStatus === 'done');

  const totalPendingAmount = pendingShops.reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);
  const totalCollectedAmount = completedShops.reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);

  const displayList = activeTab === 'pending' ? pendingShops : shops;

  return (
    <div className="space-y-4 pb-6">
      {/* Top Banner: Financial Overview */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-5 text-white shadow-xl space-y-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">પેમેન્ટ હિસાબ અને ફોલો-અપ</h2>
              <p className="text-[11px] text-slate-400">સુરેન્દ્રનગર દુકાન પ્રમોશન આવક</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full">
            લાઇવ હિસાબ
          </span>
        </div>

        {/* Amount Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Pending Amount */}
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3">
            <div className="text-[11px] font-medium text-rose-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>કુલ બાકી રકમ</span>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ₹{totalPendingAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-rose-200/80 mt-0.5">
              {pendingShops.length} દુકાનો પાસે બાકી
            </div>
          </div>

          {/* Collected Amount / મેળવેલી રકમ (Clickable for Month-wise Earnings) */}
          <button
            type="button"
            onClick={() => setIsMonthlyModalOpen(true)}
            className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 text-left hover:bg-emerald-500/25 active:scale-98 transition-all group relative cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>મેળવેલી રકમ</span>
              </div>
              <span className="text-[9px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 group-hover:bg-emerald-500/40 transition-colors">
                <span>મહિને હિસાબ</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{totalCollectedAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-0.5 flex items-center justify-between">
              <span>{completedShops.length} દુકાનો પૂર્ણ</span>
              <span className="text-emerald-300 text-[10px] font-semibold underline group-hover:text-emerald-200">
                મહિના મુજબ જુઓ ↗
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
        <button
          id="tab-pending-payments"
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-white text-rose-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>પેમેન્ટ રિમાઇન્ડર ({pendingShops.length})</span>
        </button>
        <button
          id="tab-all-payments"
          type="button"
          onClick={() => setActiveTab('all')}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>બધા પેમેન્ટ રેકોર્ડ ({shops.length})</span>
        </button>
      </div>

      {/* Payment Reminder Guidelines Alert */}
      {activeTab === 'pending' && pendingShops.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
          <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">WhatsApp રિમાઇન્ડર સુવિધા: </span>
            દરેક દુકાનદારને નીચે આપેલા લીલા બટનથી ગુજરાતી અથવા અંગ્રેજીમાં નમ્રતાપૂર્વક પેમેન્ટ રિમાઇન્ડર મેસેજ મોકલી શકાય છે.
          </div>
        </div>
      )}

      {/* List of Payments */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            {activeTab === 'pending' ? 'કોઈ પેમેન્ટ બાકી નથી!' : 'કોઈ પેમેન્ટ રેકોર્ડ નથી'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'pending'
              ? 'બધી દુકાનોનું પેમેન્ટ મળી ચૂક્યું છે. ખૂબ સરસ કામ!'
              : 'દુકાન ઉમેરીને પેમેન્ટ નોંધો'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((shop) => {
            const isRemaining = shop.paymentStatus === 'remaining';

            return (
              <div
                key={shop.id}
                className={`bg-white rounded-3xl p-4 border shadow-sm space-y-3 transition-all ${
                  isRemaining
                    ? 'border-rose-200/90 hover:border-rose-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Shop info row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                      {shop.shopName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${shop.ownerPhone}`}
                        title="ફોન ડાયલરમાં સીધો કૉલ કરો"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+91 {shop.ownerPhone}</span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold">કૉલ</span>
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>શૂટ તારીખ: {formatGujaratiDate(shop.shootDateTime, false)}</span>
                    </p>
                  </div>

                  {/* Amount and Status */}
                  <div className="text-right shrink-0">
                    <div 
                      onClick={() => onEditPaymentAmount(shop)}
                      className="cursor-pointer group"
                      title="રકમ બદલવા ક્લિક કરો"
                    >
                      <div className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                        ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
                      </div>
                      <span className="text-[10px] text-slate-400 underline">રકમ સુધારો</span>
                    </div>

                    <div className="mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          isRemaining
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isRemaining ? 'બાકી રકમ' : 'પેમેન્ટ પૂર્ણ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {/* Mark Done / Remaining toggle */}
                  <button
                    type="button"
                    onClick={() => onTogglePaymentStatus(shop)}
                    className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isRemaining
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRemaining ? 'પેમેન્ટ મળી ગયું (Mark Done)' : 'ફરી બાકી કરો'}</span>
                  </button>

                  {/* Send WhatsApp Reminder button */}
                  {isRemaining && (
                    <button
                      type="button"
                      onClick={() => onOpenPaymentReminder(shop)}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp રિમાઇન્ડર</span>
                    </button>
                  )}

                  {/* Call Owner Button */}
                  <a
                    href={`tel:${shop.ownerPhone}`}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                    title="કૉલ કરો"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month-wise Earnings Breakdown Modal */}
      <MonthlyEarningsModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        shops={shops}
        onOpenShopDetails={onOpenShopDetails}
      />
    </div>
  );
};
