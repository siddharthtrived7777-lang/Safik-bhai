import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  PhoneCall,
  MessageCircle, 
  Edit, 
  Trash2, 
  Repeat, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  IndianRupee, 
  CheckCircle, 
  Clock3, 
  Video, 
  Share2, 
  Store,
  ChevronDown,
  Mic
} from 'lucide-react';
import { ShopEntry, ShootStatus } from '../types';
import { formatGujaratiDate, formatGujaratiTime } from '../utils/dateUtils';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { VoiceNotePlayer } from './VoiceNotePlayer';

interface ShopListViewProps {
  shops: ShopEntry[];
  onAddNewShop: () => void;
  onEditShop: (shop: ShopEntry) => void;
  onRepeatShop: (shop: ShopEntry) => void;
  onDeleteShop: (shopId: string) => void;
  onOpenPaymentReminder: (shop: ShopEntry) => void;
  onTogglePaymentStatus: (shop: ShopEntry) => void;
}

export const ShopListView: React.FC<ShopListViewProps> = ({
  shops,
  onAddNewShop,
  onEditShop,
  onRepeatShop,
  onDeleteShop,
  onOpenPaymentReminder,
  onTogglePaymentStatus
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name' | 'amount'>('date_asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filterTabs = [
    { id: 'all', label: 'તમામ', count: shops.length },
    { id: 'upcoming', label: 'આગામી શૂટ', count: shops.filter(s => s.status === 'upcoming').length },
    { id: 'completed', label: 'શૂટ પૂર્ણ', count: shops.filter(s => s.status === 'completed').length },
    { id: 'payment_pending', label: 'પેમેન્ટ બાકી', count: shops.filter(s => s.paymentStatus === 'remaining').length },
    { id: 'payment_done', label: 'પેમેન્ટ પૂર્ણ', count: shops.filter(s => s.paymentStatus === 'done').length },
  ];

  const filteredShops = useMemo(() => {
    let result = [...shops];

    // Status filter
    if (selectedFilter === 'upcoming') {
      result = result.filter(s => s.status === 'upcoming');
    } else if (selectedFilter === 'completed') {
      result = result.filter(s => s.status === 'completed');
    } else if (selectedFilter === 'payment_pending') {
      result = result.filter(s => s.paymentStatus === 'remaining');
    } else if (selectedFilter === 'payment_done') {
      result = result.filter(s => s.paymentStatus === 'done');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        s.shopName.toLowerCase().includes(q) ||
        s.ownerPhone.includes(q) ||
        (s.addressNote && s.addressNote.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.shootDateTime).getTime() - new Date(b.shootDateTime).getTime();
      } else if (sortBy === 'date_desc') {
        return new Date(b.shootDateTime).getTime() - new Date(a.shootDateTime).getTime();
      } else if (sortBy === 'name') {
        return a.shopName.localeCompare(b.shopName);
      } else if (sortBy === 'amount') {
        return (b.paymentAmount || 0) - (a.paymentAmount || 0);
      }
      return 0;
    });

    return result;
  }, [shops, selectedFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: ShootStatus) => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <Clock3 className="w-3 h-3 text-amber-600" />
            <span>આગામી શૂટ</span>
          </span>
        );
      case 'completed':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>શૂટ પૂર્ણ</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900">બધી દુકાનો ({shops.length})</h2>
          <p className="text-xs text-slate-500">પ્રમોશન શૂટ અને ગ્રાહક રેકોર્ડ</p>
        </div>

        <button
          id="btn-add-shop-from-list"
          type="button"
          onClick={onAddNewShop}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>નવી દુકાન</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          id="search-shop-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="દુકાનનું નામ અથવા મોબાઇલ નંબર શોધો..."
          className="w-full p-3 pl-10 pr-9 rounded-2xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Filter Tabs (Horizontal scrolling on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              id={`filter-tab-${tab.id}`}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort options */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <span>પરિણામ: {filteredShops.length} રેકોર્ડ</span>
        <div className="flex items-center gap-1">
          <span>સોર્ટ:</span>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="date_asc">શૂટ તારીખ (નજીકનું)</option>
            <option value="date_desc">શૂટ તારીખ (નવીનતમ)</option>
            <option value="name">દુકાન નામ (A-Z)</option>
            <option value="amount">રકમ (વધુથી ઓછી)</option>
          </select>
        </div>
      </div>

      {/* Shop Cards List */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">કોઈ દુકાન મળી નથી</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'અન્ય નામ અથવા નંબર વડે શોધો' : 'નવી દુકાન ઉમેરવા માટે ઉપર ક્લિક કરો'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShops.map((shop) => {
            const isDeleting = deleteConfirmId === shop.id;

            return (
              <div
                key={shop.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3 relative hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {shop.shopName}
                      </h3>
                      {getStatusBadge(shop.status)}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${shop.ownerPhone}`}
                        title="ફોન ડાયલરમાં સીધો કૉલ કરો"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+91 {shop.ownerPhone}</span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded font-bold">કૉલ</span>
                      </a>

                      {shop.voiceNoteAudio && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                          <Mic className="w-3 h-3 text-rose-600" />
                          <span>વોઇસ નોટ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Amount & Quick Toggle */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{shop.paymentAmount ? shop.paymentAmount.toLocaleString('en-IN') : '૦'}
                    </div>
                    <button
                      type="button"
                      onClick={() => onTogglePaymentStatus(shop)}
                      title="સ્ટેટસ બદલવા ક્લિક કરો"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 transition-transform active:scale-95 ${
                        shop.paymentStatus === 'done'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {shop.paymentStatus === 'done' ? (
                        <>
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>મળી ગયું</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5 text-rose-600" />
                          <span>બાકી</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Shoot Date & Time */}
                <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl text-slate-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatGujaratiDate(shop.shootDateTime, false)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatGujaratiTime(shop.shootDateTime)}</span>
                  </span>
                </div>

                {/* Address Note */}
                {shop.addressNote && (
                  <p className="text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{shop.addressNote}</span>
                  </p>
                )}

                {/* Voice Note Player */}
                {shop.voiceNoteAudio && (
                  <VoiceNotePlayer
                    audioData={shop.voiceNoteAudio}
                    duration={shop.voiceNoteDuration}
                  />
                )}

                {/* Notes */}
                {shop.notes && (
                  <p className="text-xs text-slate-500 bg-amber-50/70 border border-amber-200/50 p-2 rounded-xl flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="italic">{shop.notes}</span>
                  </p>
                )}

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                  {/* Left actions: Call & WhatsApp */}
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${shop.ownerPhone}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                      title="કૉલ કરો"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </a>

                    <a
                      href={getWhatsAppUrl(shop.ownerPhone, `નમસ્તે ${shop.shopName} જી, સફીક ભાઈ (@surendranagar_safik) પ્રમોશન પેજ તરફથી સંપર્ક કરું છું.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:scale-95 transition-all"
                      title="વોટ્સએપ ચેટ"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    </a>

                    {shop.paymentStatus === 'remaining' && (
                      <button
                        type="button"
                        onClick={() => onOpenPaymentReminder(shop)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>રિમાઇન્ડર</span>
                      </button>
                    )}
                  </div>

                  {/* Right actions: Repeat Promotion, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    {/* Repeat shop promotion button: requirement #3 "Keep history of repeat shops" */}
                    <button
                      type="button"
                      onClick={() => onRepeatShop(shop)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      title="આ જ દુકાન માટે ફરીથી પ્રમોશન શૂટ ઉમેરો"
                    >
                      <Repeat className="w-3.5 h-3.5 text-blue-600" />
                      <span>ફરી શૂટ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditShop(shop)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
                      title="વિગત સુધારો"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(shop.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Overlay */}
                {isDeleting && (
                  <div className="absolute inset-0 bg-slate-900/90 rounded-3xl p-4 flex flex-col items-center justify-center text-white text-center gap-3 z-20 animate-fade-in">
                    <p className="text-xs font-bold">
                      શું તમે &ldquo;{shop.shopName}&rdquo; નો રેકોર્ડ કાઢી નાખવા માંગો છો?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteShop(shop.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md active:scale-95"
                      >
                        હા, કાઢી નાખો
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white active:scale-95"
                      >
                        રદ કરો
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
