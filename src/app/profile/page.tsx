'use client';

import { User, Settings, Info, Shield, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="space-y-8 pt-4">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center text-brand">
            <User className="w-8 h-8" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-text">Gast Gebruiker</h1>
            <p className="text-sm text-muted">Vat39 De Specialist</p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        <section className="space-y-2">
            <h2 className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Instellingen</h2>
            <div className="bg-white rounded-[16px] border border-divider divide-y divide-divider overflow-hidden">
                <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface2 transition-colors">
                    <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-text" />
                        <span className="text-sm font-medium">App Voorkeuren</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                </Link>
            </div>
        </section>

        <section className="space-y-2">
            <h2 className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Info & Privacy</h2>
            <div className="bg-white rounded-[16px] border border-divider divide-y divide-divider overflow-hidden">
                <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface2 transition-colors">
                    <div className="flex items-center space-x-3">
                        <Info className="w-5 h-5 text-text" />
                        <span className="text-sm font-medium">Over Vat39 Scan</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                </Link>
                <Link href="#" className="flex items-center justify-between p-4 hover:bg-surface2 transition-colors">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-text" />
                        <span className="text-sm font-medium">Privacybeleid</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                </Link>
            </div>
        </section>

        <button className="w-full flex items-center justify-center space-x-2 p-4 text-red-600 font-medium hover:bg-red-50 rounded-[16px] transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Uitloggen</span>
        </button>

        <div className="text-center space-y-2 py-4">
            <p className="text-xs text-muted">Versie 1.0.0 (Beta)</p>
            <p className="text-[10px] text-muted max-w-[250px] mx-auto leading-relaxed">
                Drink met mate. Geen 18, geen alcohol.
            </p>
        </div>
      </div>
    </div>
  );
}
