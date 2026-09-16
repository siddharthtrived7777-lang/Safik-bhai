import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  IndianRupee, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Store,
  Sparkles
} from 'lucide-react';
import { ShopEntry, ShootStatus, ActiveTab } from '../types';
import { formatGujaratiDate, formatGujaratiTime, getRelativeDayLabel, isToday, isThisWeek } from '../utils/dateUtils';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface DashboardViewProps {
  shops: ShopEntry[];
  onAddNewShop: () => void;
  onOpenShopDetails: (shop: ShopEntry) => void;
  onOpenPaymentReminder: (shop: ShopEntry) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  shops,
  onAddNewShop,
  onOpenShopDetails,
  onOpenPaymentReminder,
  setActiveTab
}) => {
  // Toggle for expanding compact reminder row
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);

  // 1. Calculate urgent shoots: happening today or tomorrow
  const urgentShoots = shops.filter((s) => {
    if (s.status === 'payment_done') return false;
    const rel = getRelativeDayLabel(s.shootDateTime);
    return rel.type === 'today' || rel.type === 'tomorrow';
  }).sort((a, b) => new Date(a.shootDateTime).getTime() - new Date(b.shootDateTime).getTime());

  // 2. Today's shoots
  const todayShoots = shops.filter((s) => isToday(s.shootDateTime));

  // 3. This week's shoots
  const thisWeekShoots = shops.filter((s) => isThisWeek(s.shootDateTime));

  // 4. Pending payments
  const pendingPayments = shops.filter((s) => s.paymentStatus === 'remaining');
  const totalPendingAmount = pendingPayments.reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);

  // 5. Total upcoming shoots (future)
  const upcomingShoots = shops
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.shootDateTime).getTime() - new Date(b.shootDateTime).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: ShootStatus) => {
    switch (status) {
      case 'upcoming':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">આગામી શૂટ</span>;
      case 'completed':
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">શૂટ પૂર્ણ</span>;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header Profile Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-3xl p-4 text-white shadow-lg shadow-rose-500/20 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-rose-100 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>સફીક ભાઈ (@surendranagar_safik)</span>
          </div>
          <h1 className="text-xl font-black tracking-tight mt-0.5">
            નમસ્તે, સફીક ભાઈ! 🙏
          </h1>
          <p className="text-xs text-rose-100/90 mt-1">
            આજના શૂટ શેડ્યૂલ અને પેમેન્ટ ફોલો-અપ
          </p>
        </div>

        <button
          id="btn-quick-add-shop"
          type="button"
          onClick={onAddNewShop}
          className="bg-white text-rose-600 active:scale-95 font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all touch-manipulation hover:bg-rose-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>નવી દુકાન</span>
        </button>
      </div>

      {/* Stat Boxes: Today's Shoots & This Week (Placed Above Reminder List) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Shoot Card */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700">આજના શૂટ</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{todayShoots.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">આજે શૂટ કરવાના છે</div>
          </div>
        </div>

        {/* This Week Shoots */}
        <div 
          onClick={() => setActiveTab('calendar')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-700">આ અઠવાડિયે</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{thisWeekShoots.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">આગામી ૭ દિવસમાં શૂટ</div>
          </div>
        </div>
      </div>

      {/* Prominent Shoot Reminders / Alerts (Today & Tomorrow) */}
      {urgentShoots.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-3xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  તાત્કાલિક શૂટ રિમાઇન્ડર
                </h3>
                <p className="text-[10px] text-amber-800">
                  આજે અથવા આવતીકાલે શૂટ છે (વિગત જોવા ટેપ કરો)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
              {urgentShoots.length} દુકાનો
            </span>
          </div>

          <div className="space-y-1.5">
            {urgentShoots.map((shop) => {
              const rel = getRelativeDayLabel(shop.shootDateTime);
              const isExpanded = expandedReminderId === shop.id;
              const isToday = rel.type === 'today';

              return (
                <div
                  key={shop.id}
                  className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all border-l-4 ${
                    isToday 
                      ? 'border-l-rose-500 border-rose-200/80' 
                      : 'border-l-amber-500 border-amber-200/80'
                  }`}
                >
                  {/* Compact Slim Row — Shows pure Gujarati badge (આજે / આવતીકાલે) + Shop name + Time */}
                  <button
                    type="button"
                    onClick={() => setExpandedReminderId(isExpanded ? null : shop.id)}
                    className="w-full py-2.5 px-3 flex items-center justify-between text-left hover:bg-slate-50/60 active:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span 
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                          isToday 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {isToday ? 'આજે' : 'આવતીકાલે'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {shop.shopName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] font-semibold text-slate-600">
                        {formatGujaratiTime(shop.shootDateTime)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Information — Revealed ONLY when row is tapped */}
                  {isExpanded && (
                    <div className="p-3 border-t border-amber-100 bg-amber-50/30 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">તારીખ અને સમય:</span>
                        <span className="font-bold text-slate-800">
                          {formatGujaratiDate(shop.shootDateTime, false)} • {formatGujaratiTime(shop.shootDateTime)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">પ્રમોશન ચાર્જ:</span>
                        <span className="font-bold text-slate-900">
                          {shop.paymentAmount ? `₹${shop.paymentAmount.toLocaleString('en-IN')}` : 'રકમ નક્કી નથી'}
                        </span>
                      </div>

                      {shop.addressNote && (
                        <div className="text-[11px] text-slate-600 flex items-start gap-1.5 bg-white p-2 rounded-xl border border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{shop.addressNote}</span>
                        </div>
                      )}

                      {/* Action Buttons: Direct Call, WhatsApp & Full Details Modal */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${shop.ownerPhone}`}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>કૉલ કરો</span>
                        </a>
                        <a
                          href={getWhatsAppUrl(shop.ownerPhone, `નમસ્તે ${shop.shopName} જી, સફીક ભાઈ (@surendranagar_safik) પ્રમોશન શૂટ અંગે સંપર્ક કરું છું.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>વોટ્સએપ</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => onOpenShopDetails(shop)}
                          className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <span>વિગત જુઓ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of Dashboard: Pending Payments Summary */}
      <div 
        onClick={() => setActiveTab('payments')}
        className="bg-gradient-to-r from-rose-50 to-orange-50 p-4 rounded-2xl border border-rose-200/90 shadow-sm flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all"
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
            <IndianRupee className="w-4 h-4 text-rose-600" />
            <span>બાકી પેમેન્ટ હિસાબ</span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-rose-600/90 font-medium">
            {pendingPayments.length} દુકાનો પાસેથી પેમેન્ટ લેવાનું બાકી છે
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm flex items-center gap-1">
            <span>તપાસો</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Upcoming Shoots Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">આગામી શૂટ શેડ્યૂલ</h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('shops')}
            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>બધી જુઓ ({shops.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingShoots.length === 0 ? (
          <div className="text-center py-7 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-4">
            <Store className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">હાલ કોઈ શૂટ શેડ્યૂલ નથી</p>
            <p className="text-[11px] text-slate-400 mt-0.5">ક્લાયન્ટ/દુકાનદારની નવી વિગત ઉમેરો</p>
            <button
              type="button"
              onClick={onAddNewShop}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>પ્રથમ દુકાન ઉમેરો</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingShoots.map((shop) => (
              <div
                key={shop.id}
                onClick={() => onOpenShopDetails(shop)}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{shop.shopName}</h4>
                    {getStatusBadge(shop.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatGujaratiDate(shop.shootDateTime, false)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatGujaratiTime(shop.shootDateTime)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                    shop.paymentStatus === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {shop.paymentStatus === 'done' ? 'મળી ગયું' : 'બાકી'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Pending Payment Followups */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">પેમેન્ટ ફોલો-અપ (રિમાઇન્ડર)</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              બધા જુઓ
            </button>
          </div>

          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map((shop) => (
              <div
                key={shop.id}
                className="p-3 rounded-2xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{shop.shopName}</h4>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">
                    બાકી: ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'} • {shop.ownerPhone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenPaymentReminder(shop)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>રિમાઇન્ડર</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
