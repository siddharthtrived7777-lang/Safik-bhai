import React, { useState, useEffect } from 'react';
import { 
  ShopEntry, 
  ActiveTab, 
  ShootStatus, 
  PaymentStatus, 
  PromoterProfile 
} from './types';
import { 
  getStoredShops, 
  saveStoredShops, 
  getStoredProfile 
} from './utils/storage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { ShopListView } from './components/ShopListView';
import { PaymentTrackingView } from './components/PaymentTrackingView';
import { ShopFormModal } from './components/ShopFormModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ShopDetailsModal } from './components/ShopDetailsModal';
import { EditAmountModal } from './components/EditAmountModal';
import { toInputDateTimeString } from './utils/dateUtils';
import { Instagram, Sparkles } from 'lucide-react';

export default function App() {
  // Persistence state
  const [shops, setShops] = useState<ShopEntry[]>(() => getStoredShops());
  const [profile, setProfile] = useState<PromoterProfile>(() => getStoredProfile());

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isShopFormOpen, setIsShopFormOpen] = useState<boolean>(false);
  const [editingShop, setEditingShop] = useState<ShopEntry | null>(null);
  const [isRepeatPromotion, setIsRepeatPromotion] = useState<boolean>(false);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [selectedWhatsAppShop, setSelectedWhatsAppShop] = useState<ShopEntry | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedDetailsShop, setSelectedDetailsShop] = useState<ShopEntry | null>(null);

  const [isEditAmountModalOpen, setIsEditAmountModalOpen] = useState<boolean>(false);
  const [selectedAmountShop, setSelectedAmountShop] = useState<ShopEntry | null>(null);

  // Sync shops to localStorage whenever changed
  useEffect(() => {
    saveStoredShops(shops);
  }, [shops]);

  // Keep details modal in sync if shop data changed
  useEffect(() => {
    if (selectedDetailsShop) {
      const updated = shops.find((s) => s.id === selectedDetailsShop.id);
      if (updated) {
        setSelectedDetailsShop(updated);
      }
    }
  }, [shops, selectedDetailsShop]);

  // Count of pending payments
  const pendingPaymentsCount = shops.filter((s) => s.paymentStatus === 'remaining').length;

  // --- CRUD Handlers ---

  const handleAddNewShop = () => {
    setEditingShop(null);
    setIsRepeatPromotion(false);
    setIsShopFormOpen(true);
  };

  const handleAddNewShopForDate = (date: Date) => {
    // Set time to current hour or default to 11 AM
    const d = new Date(date);
    d.setHours(11, 0, 0, 0);
    const stubShop: Partial<ShopEntry> = {
      shootDateTime: d.toISOString()
    };
    setEditingShop(stubShop as ShopEntry);
    setIsRepeatPromotion(false);
    setIsShopFormOpen(true);
  };

  const handleEditShop = (shop: ShopEntry) => {
    setEditingShop(shop);
    setIsRepeatPromotion(false);
    setIsShopFormOpen(true);
  };

  const handleRepeatShop = (shop: ShopEntry) => {
    // Keep history of repeat shops: opens form pre-filled with shop details,
    // but saves as a brand new entry so past promotion history is never overwritten!
    setEditingShop(shop);
    setIsRepeatPromotion(true);
    setIsShopFormOpen(true);
  };

  const handleSaveShop = (
    formData: Omit<ShopEntry, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();

    if (editId) {
      // Edit existing shop entry
      setShops((prev) =>
        prev.map((s) =>
          s.id === editId
            ? {
                ...s,
                ...formData,
                updatedAt: now
              }
            : s
        )
      );
    } else {
      // Create fresh new shop entry (also used for repeat promotions!)
      const newEntry: ShopEntry = {
        id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...formData,
        createdAt: now,
        updatedAt: now
      };
      setShops((prev) => [newEntry, ...prev]);
    }
  };

  const handleDeleteShop = (shopId: string) => {
    setShops((prev) => prev.filter((s) => s.id !== shopId));
    if (selectedDetailsShop?.id === shopId) {
      setIsDetailsModalOpen(false);
      setSelectedDetailsShop(null);
    }
  };

  const handleTogglePaymentStatus = (shop: ShopEntry) => {
    const newPaymentStatus: PaymentStatus = shop.paymentStatus === 'done' ? 'remaining' : 'done';

    setShops((prev) =>
      prev.map((s) =>
        s.id === shop.id
          ? {
              ...s,
              paymentStatus: newPaymentStatus,
              updatedAt: new Date().toISOString()
            }
          : s
      )
    );
  };

  const handleUpdateStatus = (shopId: string, newStatus: ShootStatus) => {
    setShops((prev) =>
      prev.map((s) => {
        if (s.id !== shopId) return s;
        return {
          ...s,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const handleSaveAmount = (shopId: string, newAmount: number) => {
    setShops((prev) =>
      prev.map((s) =>
        s.id === shopId
          ? {
              ...s,
              paymentAmount: newAmount,
              updatedAt: new Date().toISOString()
            }
          : s
      )
    );
  };

  // --- WhatsApp Modal Trigger ---
  const handleOpenPaymentReminder = (shop: ShopEntry) => {
    setSelectedWhatsAppShop(shop);
    setIsWhatsAppModalOpen(true);
  };

  // --- Shop Details Modal Trigger ---
  const handleOpenShopDetails = (shop: ShopEntry) => {
    setSelectedDetailsShop(shop);
    setIsDetailsModalOpen(true);
  };

  // --- Edit Amount Modal Trigger ---
  const handleEditPaymentAmount = (shop: ShopEntry) => {
    setSelectedAmountShop(shop);
    setIsEditAmountModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-rose-100 selection:text-rose-800">
      {/* Mobile Frame Container (max-w-md provides true mobile phone feel on desktop too) */}
      <main className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-2xl relative pb-20">
        
        {/* Top Sticky App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Instagram className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight truncate">
                  સફીક ભાઈનું ડેશબોર્ડ
                </h1>
                <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-md shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                સુરેન્દ્રનગર ઇન્સ્ટા પ્રમોશન • @{profile.pageName}
              </p>
            </div>
          </div>

          <div className="shrink-0 pl-2 text-right">
            <span className="text-[9px] font-semibold text-slate-400 block leading-tight">
              Developed by
            </span>
            <span className="text-[11px] font-bold text-slate-800 block leading-tight">
              Siddharth
            </span>
          </div>
        </header>

        {/* Content View Area */}
        <div className="p-4 flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              shops={shops}
              onAddNewShop={handleAddNewShop}
              onOpenShopDetails={handleOpenShopDetails}
              onOpenPaymentReminder={handleOpenPaymentReminder}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              shops={shops}
              onAddNewShopForDate={handleAddNewShopForDate}
              onOpenShopDetails={handleOpenShopDetails}
            />
          )}

          {activeTab === 'shops' && (
            <ShopListView
              shops={shops}
              onAddNewShop={handleAddNewShop}
              onEditShop={handleEditShop}
              onRepeatShop={handleRepeatShop}
              onDeleteShop={handleDeleteShop}
              onOpenPaymentReminder={handleOpenPaymentReminder}
              onTogglePaymentStatus={handleTogglePaymentStatus}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentTrackingView
              shops={shops}
              onTogglePaymentStatus={handleTogglePaymentStatus}
              onOpenPaymentReminder={handleOpenPaymentReminder}
              onEditPaymentAmount={handleEditPaymentAmount}
            />
          )}
        </div>

        {/* App Footer / Credit */}
        <footer className="py-3 px-4 text-center mt-auto border-t border-slate-200/60">
          <p className="text-[11px] text-slate-400 font-medium">
            Developed by <span className="font-bold text-slate-700">Siddharth</span>
          </p>
        </footer>

        {/* Bottom Mobile Navigation */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingPaymentsCount={pendingPaymentsCount}
        />

        {/* Modals */}
        <ShopFormModal
          isOpen={isShopFormOpen}
          onClose={() => {
            setIsShopFormOpen(false);
            setEditingShop(null);
            setIsRepeatPromotion(false);
          }}
          onSave={handleSaveShop}
          initialData={editingShop}
          isRepeatPromotion={isRepeatPromotion}
        />

        <WhatsAppModal
          isOpen={isWhatsAppModalOpen}
          shop={selectedWhatsAppShop}
          profile={profile}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setSelectedWhatsAppShop(null);
          }}
        />

        <ShopDetailsModal
          isOpen={isDetailsModalOpen}
          shop={selectedDetailsShop}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedDetailsShop(null);
          }}
          onEdit={handleEditShop}
          onRepeat={handleRepeatShop}
          onDelete={handleDeleteShop}
          onOpenPaymentReminder={handleOpenPaymentReminder}
          onUpdateStatus={handleUpdateStatus}
          onTogglePayment={handleTogglePaymentStatus}
        />

        <EditAmountModal
          isOpen={isEditAmountModalOpen}
          shop={selectedAmountShop}
          onClose={() => {
            setIsEditAmountModalOpen(false);
            setSelectedAmountShop(null);
          }}
          onSaveAmount={handleSaveAmount}
        />
      </main>
    </div>
  );
}
