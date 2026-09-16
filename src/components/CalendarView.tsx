import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  MessageCircle, 
  Plus, 
  Store, 
  MapPin 
} from 'lucide-react';
import { ShopEntry } from '../types';
import { 
  GUJARATI_MONTHS, 
  GUJARATI_DAYS_SHORT, 
  formatGujaratiDate, 
  formatGujaratiTime 
} from '../utils/dateUtils';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface CalendarViewProps {
  shops: ShopEntry[];
  onAddNewShopForDate: (date: Date) => void;
  onOpenShopDetails: (shop: ShopEntry) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  shops,
  onAddNewShopForDate,
  onOpenShopDetails
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Prev / Next month handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Map of date string 'YYYY-MM-DD' -> shops
  const shopsByDate: Record<string, ShopEntry[]> = {};
  shops.forEach((shop) => {
    if (!shop.shootDateTime) return;
    const d = new Date(shop.shootDateTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!shopsByDate[key]) shopsByDate[key] = [];
    shopsByDate[key].push(shop);
  });

  const selectedKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const shopsForSelectedDate = shopsByDate[selectedKey] || [];

  // Check if today
  const today = new Date();
  const isSelectedDateToday = 
    selectedDate.getDate() === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-4 pb-6">
      {/* Calendar Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-600" />
              <span>{GUJARATI_MONTHS[month]} {year}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">શૂટ શેડ્યૂલ કેલેન્ડર</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="calendar-today-btn"
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl mr-1 transition-colors"
            >
              આજે
            </button>
            <button
              id="calendar-prev-btn"
              type="button"
              onClick={handlePrevMonth}
              aria-label="ગત મહિનો"
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="calendar-next-btn"
              type="button"
              onClick={handleNextMonth}
              aria-label="આગામી મહિનો"
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header in Gujarati */}
        <div className="grid grid-cols-7 text-center gap-1 text-xs font-bold text-slate-500 py-1 border-b border-slate-100">
          {GUJARATI_DAYS_SHORT.map((day, idx) => (
            <div key={day} className={idx === 0 ? 'text-rose-500' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="h-11 rounded-2xl" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: totalDaysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayShops = shopsByDate[dateKey] || [];
            const hasShops = dayShops.length > 0;

            const isCurrentDay =
              dayNum === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const isSelected =
              dayNum === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDate(dateObj)}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all touch-manipulation text-xs font-bold ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 scale-105 z-10'
                    : isCurrentDay
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{dayNum}</span>

                {/* Event indicators */}
                {hasShops && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {dayShops.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : s.paymentStatus === 'done'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    ))}
                    {dayShops.length > 3 && (
                      <span className={`text-[8px] ${isSelected ? 'text-white' : 'text-slate-400'}`}>+</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>બાકી પેમેન્ટ / શૂટ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>પેમેન્ટ પૂર્ણ</span>
          </div>
        </div>
      </div>

      {/* Selected Day's Schedule List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {formatGujaratiDate(selectedDate.toISOString(), true)}
            </h3>
            <p className="text-xs text-slate-500">
              {isSelectedDateToday ? 'આજનો દિવસ' : 'પસંદ કરેલ તારીખનું શેડ્યૂલ'}
            </p>
          </div>

          <button
            id="add-shoot-selected-date-btn"
            type="button"
            onClick={() => onAddNewShopForDate(selectedDate)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>શૂટ ઉમેરો</span>
          </button>
        </div>

        {shopsForSelectedDate.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Store className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-600">આ દિવસે કોઈ શૂટ શેડ્યૂલ નથી</p>
            <button
              type="button"
              onClick={() => onAddNewShopForDate(selectedDate)}
              className="mt-3 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>આ તારીખે શૂટ ઉમેરો</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {shopsForSelectedDate.map((shop) => (
              <div
                key={shop.id}
                className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 
                      onClick={() => onOpenShopDetails(shop)}
                      className="text-sm font-bold text-slate-900 cursor-pointer hover:text-rose-600"
                    >
                      {shop.shopName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatGujaratiTime(shop.shootDateTime)}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      shop.paymentStatus === 'done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {shop.paymentStatus === 'done' ? 'પેમેન્ટ મળી ગયું' : 'પેમેન્ટ બાકી'}
                    </span>
                  </div>
                </div>

                {shop.addressNote && (
                  <p className="text-xs text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{shop.addressNote}</span>
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <a
                    href={`tel:${shop.ownerPhone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>કૉલ</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(shop.ownerPhone, `નમસ્તે ${shop.shopName} જી, પ્રમોશન શૂટ અંગે સંપર્ક કરું છું.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>વોટ્સએપ</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onOpenShopDetails(shop)}
                    className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold active:scale-95 transition-all"
                  >
                    વિગત
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
