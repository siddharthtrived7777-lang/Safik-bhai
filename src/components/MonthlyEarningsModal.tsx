import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  TrendingUp, 
  Store, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ShopEntry } from '../types';
import { GUJARATI_MONTHS, formatGujaratiDate } from '../utils/dateUtils';

interface MonthlyEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: ShopEntry[];
  onOpenShopDetails?: (shop: ShopEntry) => void;
}

interface MonthGroup {
  year: number;
  monthIndex: number; // 0 - 11
  monthName: string;
  totalCollected: number;
  shops: ShopEntry[];
}

export const MonthlyEarningsModal: React.FC<MonthlyEarningsModalProps> = ({
  isOpen,
  onClose,
  shops,
  onOpenShopDetails
}) => {
  const [expandedMonthKey, setExpandedMonthKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter only shops where payment is completed/collected ('done')
  const completedShops = shops.filter((s) => s.paymentStatus === 'done');
  const totalLifetimeCollected = completedShops.reduce((sum, s) => sum + (s.paymentAmount || 0), 0);

  // Group by Year and Month based on shootDateTime or updatedAt
  const monthMap = new Map<string, MonthGroup>();

  completedShops.forEach((shop) => {
    // Prefer shootDateTime or fallback to updatedAt
    const dateObj = new Date(shop.shootDateTime || shop.updatedAt || shop.createdAt);
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
    
    const year = validDate.getFullYear();
    const monthIndex = validDate.getMonth();
    const key = `${year}-${String(monthIndex).padStart(2, '0')}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        year,
        monthIndex,
        monthName: GUJARATI_MONTHS[monthIndex] || 'મહિનો',
        totalCollected: 0,
        shops: []
      });
    }

    const group = monthMap.get(key)!;
    group.totalCollected += (shop.paymentAmount || 0);
    group.shops.push(shop);
  });

  // Sort months in descending order (latest month first)
  const sortedMonthGroups = Array.from(monthMap.entries())
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([key, group]) => {
      // Sort shops within the month by date desc
      group.shops.sort((a, b) => new Date(b.shootDateTime).getTime() - new Date(a.shootDateTime).getTime());
      return { key, ...group };
    });

  const toggleMonth = (key: string) => {
    setExpandedMonthKey(prev => prev === key ? null : key);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold leading-tight">મેળવેલી રકમ - મહિને હિસાબ</h3>
                <span className="text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                  માસિક કમાણી
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                સફીક ભાઈનો મહિને મળેલો કુલ પ્રમોશન પેમેન્ટ હિસાબ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Top Lifetime Summary Card */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-slate-50 border border-emerald-300/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>કુલ મેળવેલી રકમ (All Time)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                ₹{totalLifetimeCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {completedShops.length} દુકાનોના પ્રમોશન પેમેન્ટ મળ્યા
              </div>
            </div>
            <div className="text-right bg-white px-3 py-2 rounded-xl border border-emerald-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 block">કુલ સક્રિય મહિના</span>
              <span className="text-base font-black text-emerald-800">
                {sortedMonthGroups.length}
              </span>
            </div>
          </div>

          {/* Month Wise Breakdown List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>મહિના મુજબની વિગત (Month-wise Breakdown)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                વિગત જોવા ટેપ કરો
              </span>
            </div>

            {sortedMonthGroups.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200 space-y-2">
                <IndianRupee className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">હજુ સુધી કોઈ પેમેન્ટ મળેલ તરીકે માર્ક નથી</p>
                <p className="text-[11px] text-slate-400">
                  દુકાનદાર પાસેથી રકમ મળે ત્યારે "પેમેન્ટ મળી ગયું" બટન દબાવો, જેથી અહીં મહિને હિસાબ નોંધાશે.
                </p>
              </div>
            ) : (
              sortedMonthGroups.map((group, index) => {
                const isExpanded = expandedMonthKey === group.key || (expandedMonthKey === null && index === 0);

                return (
                  <div 
                    key={group.key}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isExpanded 
                        ? 'border-emerald-400 shadow-sm ring-1 ring-emerald-400/30' 
                        : 'border-slate-200 hover:border-emerald-300 shadow-2xs'
                    }`}
                  >
                    {/* Month Summary Bar */}
                    <button
                      type="button"
                      onClick={() => toggleMonth(group.key)}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-xs shrink-0">
                          {group.monthIndex + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{group.monthName} {group.year}</span>
                            {index === 0 && (
                              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                                હાલનો મહિનો
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {group.shops.length} દુકાનો પૂર્ણ
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-700">
                            ₹{group.totalCollected.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600/80">મેળવેલી રકમ</span>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Shop Breakdown for this Month */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="text-[11px] font-bold text-slate-600 px-1 pt-1 flex items-center justify-between">
                          <span>આ મહિનામાં કઈ દુકાનેથી કેટલા મળ્યા:</span>
                          <span className="text-emerald-700">કુલ ₹{group.totalCollected.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="space-y-1.5">
                          {group.shops.map((shop) => (
                            <div 
                              key={shop.id}
                              className="bg-white rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between shadow-2xs hover:border-emerald-300 transition-colors"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {shop.shopName}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  શૂટ: {formatGujaratiDate(shop.shootDateTime, false)}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <span className="text-xs font-black text-emerald-700 block">
                                    ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                                    મળી ગયું
                                  </span>
                                </div>

                                {onOpenShopDetails && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onOpenShopDetails(shop);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="દુકાનની વિગત જુઓ"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            સફીક જુસાબ • ઇન્સ્ટાગ્રામ પ્રમોશન હિસાબ
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
