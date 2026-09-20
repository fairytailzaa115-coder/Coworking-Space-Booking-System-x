'use client';

import React from 'react';
import { BankOption } from '@/types/banks';

export default function BankLogo({ bank, size = 'md' }: { bank: BankOption; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[9px] rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-11 h-11 text-sm rounded-2xl'
  }[size];

  const svgSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  return (
    <div 
      className={`${sizeClasses} flex items-center justify-center font-black shadow-md border border-white/25 flex-shrink-0 relative overflow-hidden`}
      style={{ backgroundColor: bank.bgHex, color: bank.textColor }}
    >
      {bank.svgType === 'kbank' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          {/* Stylized K / Leaf motif */}
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}

      {bank.svgType === 'scb' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          {/* Stylized Lotus / SCB motif */}
          <path d="M12 2a10 10 0 0 0-7.07 17.07A10 10 0 1 0 12 2zm0 15a5 5 0 1 1 5-5 5 5 0 0 1-5 5z" opacity="0.4"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      )}

      {bank.svgType === 'bbl' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          {/* BBL Shield / Flower pattern */}
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"/>
        </svg>
      )}

      {bank.svgType === 'ktb' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          {/* Vayupak bird wing motif */}
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 14.93V15h-2v2.93A7.01 7.01 0 0 1 5.07 13H8v-2H5.07A7.01 7.01 0 0 1 11 5.07V8h2V5.07A7.01 7.01 0 0 1 18.93 11H16v2h2.93A7.01 7.01 0 0 1 13 17.93z"/>
        </svg>
      )}

      {bank.svgType === 'ttb' && (
        <span className="font-extrabold tracking-tighter text-[11px]">
          tt<span className="text-[#f05a22]">b</span>
        </span>
      )}

      {bank.svgType === 'bay' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.5l5 3.1v6.8L12 18.5l-5-3.1V8.6l5-3.1z"/>
        </svg>
      )}

      {bank.svgType === 'gsb' && (
        <svg className={`${svgSizes} fill-current`} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}
