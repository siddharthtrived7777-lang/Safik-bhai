import React from 'react';
import { Home, Calendar, Store, IndianRupee } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingPaymentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingPaymentsCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'ડેશબોર્ડ',
      icon: Home
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'કેલેન્ડર',
      icon: Calendar
    },
    {
      id: 'shops' as ActiveTab,
      label: 'દુકાનો',
      icon: Store
    },
    {
      id: 'payments' as ActiveTab,
      label: 'પેમેન્ટ',
      icon: IndianRupee,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
    }
  ];

  return (
    <nav 
      id="bottom-navigation" 
      aria-label="મુખ્ય નેવિગેશન"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] max-w-md mx-auto"
    >
      <div className="grid grid-cols-4 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-150 touch-manipulation select-none ${
                isActive
                  ? 'text-rose-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-rose-50 text-rose-600 scale-105' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] leading-tight truncate px-0.5 ${isActive ? 'font-semibold text-rose-600' : 'font-normal'}`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-rose-600 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
