'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sparkles,
  ArrowLeft,
  Leaf,
  Copy,
  Check
} from 'lucide-react';
import { BANK_OPTIONS, BankOption } from '@/types/banks';
import BankLogo from '@/components/BankLogo';

interface TierInfo {
  id: string;
  name: string;
  price: number;
  feeText: string;
  discount: string;
  icon: string;
  color: string;
  tag?: string;
}

const TIERS_DATA: Record<string, TierInfo> = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Eco',
    price: 0,
    feeText: 'ฟรี',
    discount: '0% ส่วนลด',
    icon: '🌿',
    color: 'from-slate-500/20 to-slate-600/10'
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Tech',
    price: 1500,
    feeText: '฿1,500/เดือน',
    discount: '15% ส่วนลดทุกห้อง',
    icon: '⚡',
    color: 'from-emerald-500/20 to-teal-500/10',
    tag: 'ยอดนิยม'
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 4500,
    feeText: '฿4,500/เดือน',
    discount: '30% ส่วนลดทุกห้อง',
    icon: '🏢',
    color: 'from-violet-500/20 to-purple-500/10',
    tag: 'พรีเมียม'
  }
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04100C] flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tierParam = searchParams.get('tier')?.toUpperCase() || 'PRO';
  const selectedTier = TIERS_DATA[tierParam] || TIERS_DATA.PRO;

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PROMPTPAY' | 'TRANSFER'>('CARD');
  const [selectedBankId, setSelectedBankId] = useState<string>(BANK_OPTIONS[0].id);
  const [copiedBank, setCopiedBank] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentMember');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentMember(parsed);
        if (parsed.visaCardNumber) {
          const raw = parsed.visaCardNumber.replace(/\D/g, '');
          setCardNumber(raw.replace(/(\d{4})(?=\d)/g, '$1 '));
          setCardHolder(parsed.visaCardHolder || parsed.name || '');
          setCardExpiry(parsed.visaCardExpiry || '');
        }
      } catch (e) {}
    }
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setCardExpiry(formatted);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // If user is already logged in, upgrade their tier in localStorage
      if (currentMember) {
        const updated = {
          ...currentMember,
          tier: selectedTier.id,
          discountRate: selectedTier.id === 'ENTERPRISE' ? 0.30 : selectedTier.id === 'PRO' ? 0.15 : 0.0,
          visaCardNumber: cardNumber.replace(/\s+/g, '') || currentMember.visaCardNumber,
          visaCardHolder: cardHolder || currentMember.visaCardHolder,
          visaCardExpiry: cardExpiry || currentMember.visaCardExpiry
        };
        localStorage.setItem('currentMember', JSON.stringify(updated));
        window.dispatchEvent(new Event('memberUpdated'));
      }

      setTimeout(() => {
        if (currentMember) {
          router.push('/dashboard');
        } else {
          // If not registered yet, redirect to register with tier and payment pre-approved
          router.push(`/register?tier=${selectedTier.id}&paid=true`);
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-forest-950 text-emerald-50 bg-green-mesh selection:bg-emerald-500 selection:text-forest-950 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-5 border-b border-emerald-500/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-5 h-5 text-forest-950 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Coworking Space <span className="text-emerald-400">Booking System</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs text-emerald-100/60 hover:text-white flex items-center gap-1.5 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-2xl glass-panel border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">ชำระเงินสำเร็จเรียบร้อย!</h2>
              <p className="text-sm text-emerald-100/70">
                ระบบได้ยืนยันการเป็นสมาชิก <span className="text-emerald-400 font-bold">{selectedTier.name}</span> ของคุณแล้ว
              </p>
              <div className="text-xs text-emerald-100/40">กำลังนำท่านเข้าสู่ระบบ...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                      SECURE PAYMENT GATEWAY
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white">หน้าชำระเงินค่าสมาชิก</h1>
                  <p className="text-xs text-emerald-100/60">ยืนยันรายการและเลือกวิธีการชำระเงินของคุณ</p>
                </div>

                {/* Plan Badge */}
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedTier.color} border border-emerald-500/30 text-right min-w-[170px]`}>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{selectedTier.name}</div>
                  <div className="text-2xl font-black text-white">{selectedTier.feeText}</div>
                  <div className="text-[10px] text-emerald-200/70 font-semibold mt-0.5">{selectedTier.discount}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                  เลือกช่องทางการชำระเงิน
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition text-center ${
                      paymentMethod === 'CARD'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold">บัตรเครดิต / Visa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition text-center ${
                      paymentMethod === 'PROMPTPAY'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span className="text-xs font-bold">พร้อมเพย์ QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TRANSFER')}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition text-center ${
                      paymentMethod === 'TRANSFER'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Building className="w-6 h-6" />
                    <span className="text-xs font-bold">โอนเงินธนาคาร</span>
                  </button>
                </div>
              </div>

              {/* Detail section */}
              {paymentMethod === 'CARD' && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-4">
                  <div className="flex items-center justify-between text-xs text-emerald-300/80 font-bold uppercase">
                    <span>ข้อมูลบัตรเครดิต / เดบิต</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black italic text-[10px]">VISA</span>
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black italic text-[10px]">MASTERCARD</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200/70">หมายเลขบัตร (16 หลัก)</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444"
                        maxLength={19}
                        className="w-full bg-forest-950 border border-emerald-500/25 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200/70">ชื่อผู้ถือบัตร</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="SOMCHAI JAIDEE"
                      className="w-full bg-forest-950 border border-emerald-500/25 rounded-xl px-4 py-3 text-white uppercase text-sm outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-200/70">วันหมดอายุ (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        maxLength={5}
                        className="w-full bg-forest-950 border border-emerald-500/25 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-200/70">CVV (3 หลัก)</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full bg-forest-950 border border-emerald-500/25 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'PROMPTPAY' && (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20 flex flex-col items-center text-center space-y-4">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                    <div className="text-[11px] font-black text-blue-900 tracking-wider mb-1">PROMPTPAY QR</div>
                    <div className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center bg-gray-50">
                      <QrCode className="w-24 h-24 text-gray-800" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">สแกน QR Code ด้วยแอปธนาคารทุกแห่ง</h4>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-1">ยอดชำระ: {selectedTier.feeText}</p>
                    <p className="text-xs text-emerald-100/60 mt-1">พร้อมเพย์: 081-234-5678 (บมจ Coworking Space Booking System)</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'TRANSFER' && (() => {
                const currentBank = BANK_OPTIONS.find(b => b.id === selectedBankId) || BANK_OPTIONS[0];
                return (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/20 space-y-4">
                    {/* Dropdown Select Bank */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 mb-1.5 uppercase tracking-wide">
                        เลือกธนาคารที่ต้องการโอนชำระ:
                      </label>
                      <div className="relative">
                        <select
                          value={selectedBankId}
                          onChange={e => setSelectedBankId(e.target.value)}
                          className="w-full bg-[#04100C] border-2 border-emerald-500/35 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-emerald-400 transition cursor-pointer appearance-none pr-10 shadow-lg"
                        >
                          {BANK_OPTIONS.map(b => (
                            <option key={b.id} value={b.id} className="bg-[#04140D] text-white py-2">
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Account Card */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentBank.color} border shadow-xl relative overflow-hidden transition-all duration-300 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BankLogo bank={currentBank} size="md" />
                          <div>
                            <span className="text-xs font-bold text-white block">{currentBank.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">Code: {currentBank.code}</span>
                          </div>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${currentBank.dotColor} shadow-[0_0_10px_currentColor] animate-pulse`}></span>
                      </div>

                      <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-emerald-100/60 font-semibold uppercase tracking-wider">เลขที่บัญชี</div>
                          <div className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest mt-0.5">
                            {currentBank.accountNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentBank.accountNumber.replace(/-/g, ''));
                            setCopiedBank(true);
                            setTimeout(() => setCopiedBank(false), 2000);
                          }}
                          title="คัดลอกเลขบัญชี"
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        >
                          {copiedBank ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-emerald-100/80">
                        ชื่อบัญชี: <span className="text-white font-bold">{currentBank.accountName}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-emerald-100/60 text-center pt-1">
                      ยอดชำระ <span className="font-bold text-emerald-400">{selectedTier.feeText}</span> • ระบบจะเปิดใช้งานสมาชิกทันทีหลังยืนยัน
                    </div>
                  </div>
                );
              })()}

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-100/50 py-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>การเชื่อมต่อเข้ารหัสแบบ 256-bit ปลอดภัยตามมาตรฐานสากล</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-1/3 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-emerald-100/60 hover:text-white hover:border-white/20 transition"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="relative w-2/3 py-3.5 rounded-xl overflow-hidden group font-black text-sm disabled:opacity-60"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                  <span className="relative flex items-center justify-center gap-2 text-forest-950">
                    {isProcessing ? (
                      <span className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>ยืนยันชำระเงิน {selectedTier.feeText} <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-emerald-500/10 text-center text-xs text-emerald-100/40">
        © 2026 EcoSpace Coworking System. All rights reserved.
      </footer>
    </div>
  );
}
