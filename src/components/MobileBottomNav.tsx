'use client';

import React from 'react';
import { Zap, UserCheck, Activity, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'pot', label: 'Clock In', icon: Zap },
    { id: 'wallet', label: 'Wallet', icon: UserCheck },
    { id: 'distributions', label: 'Ledger', icon: Activity },
    { id: 'docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c0e14]/95 backdrop-blur-md border-t border-[#1e2432] px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#cfff04]/15 text-[#cfff04] font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#cfff04]' : 'text-gray-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
