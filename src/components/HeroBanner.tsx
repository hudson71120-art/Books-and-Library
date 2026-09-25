import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  onOpenAuth: (mode?: 'signin' | 'signup' | 'admin') => void;
  onOpenNewSession: () => void;
  onOpenLibrary: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenAuth,
  onOpenNewSession,
  onOpenLibrary,
}) => {
  const { user, isAdmin, isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#faf8f5] border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Narrative Copy */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span>Books & Friends Community</span>
              <span aria-hidden="true">·</span>
              <span>Open Library On-Demand Sync</span>
              <span aria-hidden="true">·</span>
              <span>Supabase Backend Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15] text-balance">
              Where curious minds gather to read together.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl font-reading">
              Connect your reading circles, fetch books on-demand from the Open Library catalog, and sync progress through a secured Supabase backend with strict Role-Based Access Control.
            </p>

            {/* Micro proof points */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mail Matching Sync Validation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Masked Password Security</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Developer Admin Data Isolation</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenNewSession}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <span>Start Reading Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenLibrary}
                className="px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                <span>Search Open Library</span>
              </button>

              {!isAdmin && (
                <button
                  onClick={() => onOpenAuth('admin')}
                  className="px-3.5 py-2.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span>Developer Admin Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Curatorial Photography */}
          <div className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden border border-stone-300/80 shadow-md aspect-[4/3] bg-stone-200">
              <img
                src="/src/assets/images/book_club_hero_1790311194150.jpg"
                alt="Books and friends reading circle table"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                <span className="text-[10px] tracking-wider uppercase opacity-80 font-medium block">
                  Reading Salon Edition 2026
                </span>
                <span className="font-serif italic text-stone-100">
                  "A book must be the axe for the frozen sea within us."
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
