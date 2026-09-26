'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Leaf, User, Mail, Phone, Lock, ArrowRight,
  Eye, EyeOff, CheckCircle2, Sparkles, Zap, Shield, CreditCard,
  QrCode, Building, Wallet, Copy, Check, Building2, MapPin, DollarSign, Users, Image as ImageIcon
} from 'lucide-react';
import { BANK_OPTIONS } from '@/types/banks';
import BankLogo from '@/components/BankLogo';

const TIERS = [
  {
    id: 'BASIC',
    name: 'Basic',
    icon: '🌿',
    discount: '0% ส่วนลด',
    fee: 'ฟรี',
    perks: ['เข้าใช้พื้นที่ทั่วไป', 'อินเทอร์เน็ตพื้นฐาน'],
    color: 'from-slate-500/20 to-slate-600/10',
    border: 'border-slate-500/20',
    activeBorder: 'border-slate-400',
    tag: '',
  },
  {
    id: 'PRO',
    name: 'Pro',
    icon: '⚡',
    discount: '15% ส่วนลด',
    fee: '฿1,500/ด.',
    perks: ['ห้องประชุมฟรี 5ชม./ด.', 'เครื่องดื่มฟรี'],
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/25',
    activeBorder: 'border-emerald-400',
    tag: 'ยอดนิยม',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    icon: '🏢',
    discount: '30% ส่วนลด',
    fee: '฿4,500/ด.',
    perks: ['ห้องส่วนตัว', 'บริการ Concierge'],
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/25',
    activeBorder: 'border-violet-400',
    tag: 'พรีเมียม',
  },
];

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#04100C] flex items-center justify-center text-white">กำลังโหลด...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTier = searchParams.get('tier')?.toUpperCase();

  const [accountType, setAccountType] = useState<'USER' | 'DEALER'>('USER');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tier: initialTier === 'ENTERPRISE' ? 'ENTERPRISE' : initialTier === 'BASIC' ? 'BASIC' : 'PRO',
    visaCardNumber: '',
    visaCardHolder: '',
    visaCardExpiry: '',
    visaCardCvv: ''
  });

  const [dealerData, setDealerData] = useState({
    spaceName: '',
    spaceLocation: '',
    roomPricePerHour: '650',
    roomCapacity: '12',
    spaceDescription: '',
    roomImageUrl: '/images/meeting-room.jpg'
  });

  useEffect(() => {
    const t = searchParams.get('tier')?.toUpperCase();
    if (t && ['BASIC', 'PRO', 'ENTERPRISE'].includes(t)) {
      setFormData(prev => ({ ...prev, tier: t }));
    }
  }, [searchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'PROMPTPAY' | 'TRANSFER'>('CARD');
  const [selectedBankId, setSelectedBankId] = useState<string>(BANK_OPTIONS[0].id);
  const [copiedBank, setCopiedBank] = useState(false);

  const selectedTier = TIERS.find(t => t.id === formData.tier) || TIERS[1];

  const STEPS = accountType === 'DEALER'
    ? ['ข้อมูลผู้ปล่อยเช่าและรหัสผ่าน', 'ข้อมูลห้องประชุมและสถานที่']
    : formData.tier === 'ENTERPRISE'
    ? ['ข้อมูลส่วนตัว', 'ระดับสมาชิก', 'บัตร Visa', 'รหัสผ่าน', 'ชำระเงิน']
    : formData.tier === 'PRO'
    ? ['ข้อมูลส่วนตัว', 'ระดับสมาชิก', 'รหัสผ่าน', 'ชำระเงิน']
    : ['ข้อมูลส่วนตัว', 'ระดับสมาชิก', 'รหัสผ่าน'];

  const passwordsMatch = formData.password && formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : null;

  // Format credit card input: 4111 2222 3333 4444
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData(prev => ({ ...prev, visaCardNumber: formatted }));
  };

  // Format expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setFormData(prev => ({ ...prev, visaCardExpiry: formatted }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
    setFormData(prev => ({ ...prev, visaCardCvv: raw }));
  };

  const executeRegistration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        memberType: accountType === 'DEALER' ? 'DEALER' : 'REGISTERED',
      };

      if (accountType === 'DEALER') {
        payload.spaceName = dealerData.spaceName.trim();
        payload.spaceLocation = dealerData.spaceLocation.trim();
        payload.spaceDescription = dealerData.spaceDescription.trim();
        payload.roomPricePerHour = parseFloat(dealerData.roomPricePerHour) || 550;
        payload.roomCapacity = parseInt(dealerData.roomCapacity) || 10;
        payload.roomImageUrl = dealerData.roomImageUrl || '/images/meeting-room.jpg';
        payload.tier = 'ENTERPRISE';
      } else {
        payload.tier = formData.tier;
        payload.visaCardNumber = formData.visaCardNumber.replace(/\s+/g, '');
        payload.visaCardHolder = formData.visaCardHolder;
        payload.visaCardExpiry = formData.visaCardExpiry;
      }

      const response = await fetch('/api/v1/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      localStorage.setItem('currentMember', JSON.stringify({
        memberId: result.memberId,
        name: result.name,
        email: result.email,
        phone: result.phone,
        memberType: result.memberType || (accountType === 'DEALER' ? 'DEALER' : 'REGISTERED'),
        tier: result.membershipTier,
        discountRate: result.discountRate,
        rewardPoints: result.rewardPoints,
        admin: result.admin,
        spaceName: result.spaceName,
        spaceLocation: result.spaceLocation,
        dealerWorkspaceId: result.dealerWorkspaceId,
        dealerRoomId: result.dealerRoomId,
        visaCardNumber: result.visaCardNumber,
        visaCardHolder: result.visaCardHolder,
        visaCardExpiry: result.visaCardExpiry
      }));

      window.dispatchEvent(new Event('memberUpdated'));

      if (accountType === 'DEALER') {
        setSuccess(`🎉 สมัครพาร์ทเนอร์ Dealer สำเร็จ! รหัส: ${result.memberId}`);
        setTimeout(() => router.push('/dealer/customize'), 1500);
      } else {
        setSuccess(`🎉 ชำระเงินและสมัครสมาชิกสำเร็จ! รหัสสมาชิก: ${result.memberId}`);
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'DEALER') {
      if (!dealerData.spaceName.trim()) {
        setError('กรุณากรอกชื่อแบรนด์/สถานที่ห้องประชุม');
        return;
      }
      if (!dealerData.spaceLocation.trim()) {
        setError('กรุณากรอกทำเลที่ตั้งของห้องประชุม');
        return;
      }
      await executeRegistration();
      return;
    }

    if (formData.tier === 'BASIC') {
      if (formData.password !== formData.confirmPassword) {
        setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
      await executeRegistration();
    } else {
      // For PRO and ENTERPRISE, submission happens on final payment step
      await executeRegistration();
    }
  };

  const nextStep = () => {
    setError(null);

    // Dealer flow
    if (accountType === 'DEALER') {
      if (step === 0) {
        if (!formData.name.trim()) { setError('กรุณากรอกชื่อ-นามสกุล / ชื่อผู้ติดต่อ'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) { setError('อีเมลไม่ถูกต้อง'); return; }
        if (!formData.phone.trim()) { setError('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ'); return; }
        if (!formData.password || formData.password.length < 4) { setError('กรุณาตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร'); return; }
        if (formData.password !== formData.confirmPassword) { setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'); return; }
      }
      setStep(s => s + 1);
      return;
    }

    // User flow
    if (step === 0) {
      if (!formData.name.trim()) {
        setError('กรุณากรอกชื่อ-นามสกุล'); return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        setError('อีเมลไม่ถูกต้อง'); return;
      }
    }

    // Moving from Visa Card step (Enterprise)
    if (formData.tier === 'ENTERPRISE' && step === 2) {
      const cleanNum = formData.visaCardNumber.replace(/\s+/g, '');
      if (!cleanNum.startsWith('4') || cleanNum.length !== 16) {
        setError('กรุณากรอกเลขบัตร Visa ให้ถูกต้อง (16 หลัก และขึ้นต้นด้วยเลข 4)');
        return;
      }
      if (!formData.visaCardHolder.trim()) {
        setError('กรุณากรอกชื่อผู้ถือบัตร Visa');
        return;
      }
      if (!formData.visaCardExpiry.trim() || formData.visaCardExpiry.length < 5) {
        setError('กรุณากรอกวันหมดอายุบัตร (MM/YY)');
        return;
      }
      if (!formData.visaCardCvv.trim() || formData.visaCardCvv.length < 3) {
        setError('กรุณากรอกรหัส CVV 3 หลัก');
        return;
      }
    }

    // Moving from Password step (For PRO or ENTERPRISE)
    const isPasswordStep = (formData.tier === 'ENTERPRISE' && step === 3) || (formData.tier !== 'ENTERPRISE' && step === 2);
    if (isPasswordStep) {
      if (!formData.password || formData.password.length < 4) {
        setError('กรุณาตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    setStep(s => s + 1);
  };

  const inputClass = (field: string) =>
    `w-full bg-white/[0.04] border rounded-xl pl-11 pr-4 py-3.5 text-white text-sm font-medium outline-none placeholder:text-emerald-100/25 transition-all duration-200 ${focused === field
      ? 'border-emerald-400/50 bg-emerald-500/5'
      : 'border-white/10 hover:border-white/20'
    }`;

  return (
    <div className="min-h-screen flex bg-forest-950 selection:bg-emerald-500 selection:text-forest-950">

      {/* ── Left Visual Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[350px] h-[350px] rounded-full bg-teal-500/8 blur-[100px] animate-pulse delay-700" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(52,211,153,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-5 h-5 text-forest-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Coworking Space <span className="text-emerald-400">Booking System</span>
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">เริ่มต้นฟรี</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              เข้าร่วมชุมชน<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                นักสร้างสรรค์
              </span>
            </h2>
            <p className="text-sm text-emerald-100/50 leading-relaxed max-w-xs">
              สมัครสมาชิกวันนี้ เพื่อเข้าถึงพื้นที่ทำงานที่ดีที่สุด
              พร้อมสิทธิพิเศษและส่วนลดเฉพาะสมาชิก
            </p>
          </div>

          {/* Tier preview */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-300/60 uppercase tracking-wider">ระดับสมาชิกที่เลือก</p>
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${selectedTier.color} border ${selectedTier.activeBorder} transition-all duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedTier.icon}</span>
                  <div>
                    <div className="text-base font-black text-white">{selectedTier.name}</div>
                    <div className="text-xs text-emerald-400 font-bold">{selectedTier.discount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{selectedTier.fee}</div>
                  {selectedTier.tag && (
                    <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full mt-0.5">
                      {selectedTier.tag}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {selectedTier.perks.map(perk => (
                  <div key={perk} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] text-emerald-100/70">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Shield, label: 'ข้อมูลปลอดภัย' },
              { icon: Zap, label: 'สมัครใน 1 นาที' },
              { icon: CheckCircle2, label: 'ยกเลิกได้ทุกเวลา' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-100/50 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-[11px] text-emerald-100/25">
          © 2026 EcoSpace Coworking System
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-forest-950 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              ECO<span className="text-emerald-400">SPACE</span>
            </span>
          </Link>
          <Link href="/login" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition">
            เข้าสู่ระบบ →
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">

            {/* Header */}
            <div className="mb-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                {accountType === 'DEALER' ? (
                  <Building2 className="w-5 h-5 text-teal-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <h1 className="text-2xl font-black text-white">
                {accountType === 'DEALER' ? 'สมัครพาร์ทเนอร์ผู้ปล่อยเช่า' : 'สมัครสมาชิกใหม่'}
              </h1>
              <p className="text-sm text-emerald-100/50">
                {accountType === 'DEALER'
                  ? 'นำห้องประชุมของคุณมาปล่อยเช่าและจัดการพื้นที่บนแพลตฟอร์ม'
                  : 'สร้างบัญชีและเริ่มจองพื้นที่ได้เลย'}
              </p>
            </div>

            {/* Account Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => { setAccountType('USER'); setStep(0); setError(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  accountType === 'USER'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-forest-950 shadow-md'
                    : 'text-emerald-100/60 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>สมาชิกทั่วไป (User)</span>
              </button>
              <button
                type="button"
                onClick={() => { setAccountType('DEALER'); setStep(0); setError(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  accountType === 'DEALER'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-forest-950 shadow-md'
                    : 'text-emerald-100/60 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>พาร์ทเนอร์ปล่อยเช่า (Dealer)</span>
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                      i < step ? 'bg-emerald-500 text-forest-950' :
                      i === step ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400' :
                      'bg-white/5 border border-white/10 text-white/30'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-bold transition-colors duration-300 ${
                      i === step ? 'text-emerald-300' : i < step ? 'text-emerald-500' : 'text-white/25'
                    }`}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-emerald-500/50' : 'bg-white/8'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm font-semibold mb-5">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-sm font-semibold mb-5">
                <span>🎉</span><span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ── DEALER FLOW: Step 0 (Contact & Password) ── */}
              {accountType === 'DEALER' && step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ชื่อผู้ติดต่อ / เจ้าของพื้นที่</label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'name' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="ดร. สมชาย พาร์ทเนอร์สเปซ"
                        required
                        className={inputClass('name')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">อีเมลสำหรับเข้าสู่ระบบ</label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        placeholder="dealer@myspace.com"
                        required
                        className={inputClass('email')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">เบอร์โทรศัพท์ติดต่อ</label>
                    <div className="relative">
                      <Phone className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'phone' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused(null)}
                        placeholder="02-123-4567 หรือ 081-xxx-xxxx"
                        required
                        className={inputClass('phone')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">รหัสผ่าน</label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'pass' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocused('pass')}
                        onBlur={() => setFocused(null)}
                        placeholder="กำหนดรหัสผ่านอย่างน้อย 4 ตัวอักษร"
                        required
                        className={inputClass('pass')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ยืนยันรหัสผ่าน</label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'confirm' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused(null)}
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        required
                        className={inputClass('confirm')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="relative w-full py-3.5 rounded-xl overflow-hidden group font-black text-sm mt-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-400 group-hover:from-teal-400 group-hover:to-cyan-300 transition-all duration-200" />
                    <span className="relative flex items-center justify-center gap-2 text-forest-950 font-black">
                      ถัดไป: ข้อมูลห้องประชุมและสถานที่ <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              )}

              {/* ── DEALER FLOW: Step 1 (Space & Room Details) ── */}
              {accountType === 'DEALER' && step === 1 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200">
                    🏢 <strong>สิทธิพิเศษ Dealer:</strong> คุณสามารถแก้ไขและจัดการราคา รวมถึงรูปภาพเฉพาะห้องประชุมของคุณได้ตลอดเวลาผ่านหน้าเว็บไซต์
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ชื่อสถานที่ / แบรนด์ห้องประชุม</label>
                    <div className="relative">
                      <Building2 className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'spaceName' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={dealerData.spaceName}
                        onChange={e => setDealerData({ ...dealerData, spaceName: e.target.value })}
                        onFocus={() => setFocused('spaceName')}
                        onBlur={() => setFocused(null)}
                        placeholder="เช่น KMITL Meeting Space หรือ Siam Hub"
                        required
                        className={inputClass('spaceName')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ทำเลที่ตั้ง / ที่อยู่</label>
                    <div className="relative">
                      <MapPin className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'spaceLocation' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={dealerData.spaceLocation}
                        onChange={e => setDealerData({ ...dealerData, spaceLocation: e.target.value })}
                        onFocus={() => setFocused('spaceLocation')}
                        onBlur={() => setFocused(null)}
                        placeholder="เช่น ลาดกระบัง กรุงเทพมหานคร หรือ BTS อโศก"
                        required
                        className={inputClass('spaceLocation')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ราคาต่อชั่วโมง (฿)</label>
                      <div className="relative">
                        <DollarSign className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'roomPrice' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                        <input
                          type="number"
                          value={dealerData.roomPricePerHour}
                          onChange={e => setDealerData({ ...dealerData, roomPricePerHour: e.target.value })}
                          onFocus={() => setFocused('roomPrice')}
                          onBlur={() => setFocused(null)}
                          placeholder="650"
                          min="1"
                          required
                          className={inputClass('roomPrice')}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">ความจุผู้ใช้ (ท่าน)</label>
                      <div className="relative">
                        <Users className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'capacity' ? 'text-teal-400' : 'text-emerald-600/60'}`} />
                        <input
                          type="number"
                          value={dealerData.roomCapacity}
                          onChange={e => setDealerData({ ...dealerData, roomCapacity: e.target.value })}
                          onFocus={() => setFocused('capacity')}
                          onBlur={() => setFocused(null)}
                          placeholder="12"
                          min="1"
                          required
                          className={inputClass('capacity')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-teal-300 tracking-wide uppercase">รายละเอียดและจุดเด่น</label>
                    <textarea
                      value={dealerData.spaceDescription}
                      onChange={e => setDealerData({ ...dealerData, spaceDescription: e.target.value })}
                      placeholder="เช่น ห้องประชุมระดับพรีเมียม จอ 4K Ultra HD พร้อมระบบ Video Conference..."
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-white text-sm outline-none placeholder:text-emerald-100/25 focus:border-teal-400/50"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="w-1/3 py-3 rounded-xl border border-white/15 hover:border-white/30 text-white font-bold text-xs transition"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-forest-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'กำลังบันทึกข้อมูล...' : '🚀 เปิดพื้นที่ & สมัคร Dealer'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── USER FLOW: Step 0: Personal Info ── */}
              {accountType === 'USER' && step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'name' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="สมชาย ใจดี"
                        required
                        className={inputClass('name')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">อีเมล</label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        placeholder="somchai@work.com"
                        required
                        className={inputClass('email')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                      เบอร์โทรศัพท์ <span className="text-white/30 font-normal normal-case">(ไม่บังคับ)</span>
                    </label>
                    <div className="relative">
                      <Phone className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'phone' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={() => setFocused('phone')}
                        onBlur={() => setFocused(null)}
                        placeholder="081-234-5678"
                        className={inputClass('phone')}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="relative w-full py-3.5 rounded-xl overflow-hidden group font-black text-sm mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all duration-200" />
                    <span className="relative flex items-center justify-center gap-2 text-forest-950">
                      ถัดไป <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>
              )}

              {/* ── USER FLOW: Step 1: Tier Selection ── */}
              {accountType === 'USER' && step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {TIERS.map(tier => (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => setFormData({ ...formData, tier: tier.id })}
                        className={`w-full p-4 rounded-2xl text-left border transition-all duration-200 bg-gradient-to-br ${tier.color} ${
                          formData.tier === tier.id
                            ? `${tier.activeBorder} shadow-lg`
                            : `${tier.border} opacity-70 hover:opacity-90`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{tier.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white">{tier.name}</span>
                                {tier.tag && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300">
                                    {tier.tag}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-emerald-400 font-semibold">{tier.discount}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">{tier.fee}</div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto mt-1 transition-all duration-200 ${
                              formData.tier === tier.id
                                ? 'border-emerald-400 bg-emerald-400'
                                : 'border-white/20'
                            }`}>
                              {formData.tier === tier.id && (
                                <div className="w-2 h-2 rounded-full bg-forest-950" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tier.perks.map(perk => (
                            <div key={perk} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span className="text-[10px] text-emerald-100/60">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-emerald-100/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="relative flex-[2] py-3.5 rounded-xl overflow-hidden group font-black text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                      <span className="relative flex items-center justify-center gap-2 text-forest-950">
                        {formData.tier === 'ENTERPRISE' ? 'ถัดไป (กรอกบัตร Visa)' : 'ถัดไป'}{' '}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Visa Card Information (For Enterprise Tier) ── */}
              {formData.tier === 'ENTERPRISE' && step === 2 && (
                <div className="space-y-4">
                  {/* Visa Card Visual representation */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-900 via-indigo-900 to-violet-950 border border-indigo-500/40 shadow-xl relative overflow-hidden text-white">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold tracking-wider text-indigo-300">ENTERPRISE MEMBERSHIP</span>
                      <div className="px-3 py-1 bg-white/15 rounded-lg border border-white/20 text-white font-black italic tracking-widest text-sm">
                        VISA
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl font-mono tracking-widest mb-4">
                      {formData.visaCardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <div className="text-[10px] text-indigo-200/60 uppercase">CARD HOLDER</div>
                        <div className="font-semibold truncate max-w-[170px] uppercase">
                          {formData.visaCardHolder || 'YOUR FULL NAME'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-indigo-200/60 uppercase">EXPIRES</div>
                        <div className="font-semibold font-mono">
                          {formData.visaCardExpiry || 'MM/YY'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                      หมายเลขบัตร Visa (16 หลัก)
                    </label>
                    <div className="relative">
                      <CreditCard className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'card' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={formData.visaCardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setFocused('card')}
                        onBlur={() => setFocused(null)}
                        placeholder="4xxx xxxx xxxx xxxx"
                        maxLength={19}
                        required
                        className={`${inputClass('card')} font-mono`}
                      />
                    </div>
                    <p className="text-[10px] text-indigo-300/70">* หมายเลขบัตร Visa ต้องขึ้นต้นด้วยเลข 4 และครบ 16 หลัก</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                      ชื่อผู้ถือบัตร (ตามหน้าบัตร)
                    </label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'holder' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type="text"
                        value={formData.visaCardHolder}
                        onChange={e => setFormData({ ...formData, visaCardHolder: e.target.value.toUpperCase() })}
                        onFocus={() => setFocused('holder')}
                        onBlur={() => setFocused(null)}
                        placeholder="SOMCHAI JAIDEE"
                        required
                        className={`${inputClass('holder')} uppercase font-medium`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                        วันหมดอายุ (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={formData.visaCardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        maxLength={5}
                        required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm outline-none focus:border-emerald-400/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                        CVV (3 หลัก)
                      </label>
                      <input
                        type="password"
                        value={formData.visaCardCvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        maxLength={3}
                        required
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm outline-none focus:border-emerald-400/50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-emerald-100/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="relative flex-[2] py-3.5 rounded-xl overflow-hidden group font-black text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                      <span className="relative flex items-center justify-center gap-2 text-forest-950">
                        ถัดไป (ตั้งรหัสผ่าน) <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Password Step (Step 3 for Enterprise, Step 2 for others) ── */}
              {((formData.tier === 'ENTERPRISE' && step === 3) || (formData.tier !== 'ENTERPRISE' && step === 2)) && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">รหัสผ่าน</label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        required
                        className={`${inputClass('password')} pr-11`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600/60 hover:text-emerald-400 transition">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">ยืนยันรหัสผ่าน</label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'confirm' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        required
                        className={`w-full bg-white/[0.04] border rounded-xl pl-11 pr-11 py-3.5 text-white text-sm font-medium outline-none placeholder:text-emerald-100/25 transition-all duration-200 ${
                          focused === 'confirm' ? 'border-emerald-400/50 bg-emerald-500/5' :
                          passwordsMatch === false ? 'border-rose-500/40' :
                          passwordsMatch === true ? 'border-emerald-500/40' :
                          'border-white/10 hover:border-white/20'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600/60 hover:text-emerald-400 transition">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordsMatch === false && (
                      <p className="text-[11px] text-rose-400 font-semibold">รหัสผ่านไม่ตรงกัน</p>
                    )}
                    {passwordsMatch === true && (
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> รหัสผ่านตรงกัน
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
                    <p className="text-[11px] font-bold text-emerald-300/60 uppercase tracking-wider mb-2">สรุปข้อมูล</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        ['ชื่อ', formData.name || '–'],
                        ['อีเมล', formData.email || '–'],
                        ['โทร', formData.phone || '–'],
                        ['ระดับ', `${selectedTier.icon} ${selectedTier.name}`],
                        ...(formData.tier === 'ENTERPRISE' ? [['บัตร Visa', `•••• ${formData.visaCardNumber.slice(-4) || '••••'}`]] : []),
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[10px] text-emerald-100/30 font-medium">{k}</div>
                          <div className="text-[11px] text-emerald-100/80 font-semibold truncate">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(formData.tier === 'ENTERPRISE' ? 2 : 1)}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-emerald-100/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      ← ย้อนกลับ
                    </button>
                    {formData.tier === 'BASIC' ? (
                      <button
                        type="submit"
                        disabled={isLoading || passwordsMatch === false}
                        className="relative flex-[2] py-3.5 rounded-xl overflow-hidden group font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                        <span className="relative flex items-center justify-center gap-2 text-forest-950">
                          {isLoading ? (
                            <span className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>สมัครสมาชิกฟรี <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                          )}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={passwordsMatch === false || !formData.password}
                        className="relative flex-[2] py-3.5 rounded-xl overflow-hidden group font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                        <span className="relative flex items-center justify-center gap-2 text-forest-950">
                          ไปที่หน้าชำระเงิน <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step: Payment (Step 4 for Enterprise, Step 3 for Pro) ── */}
              {((formData.tier === 'ENTERPRISE' && step === 4) || (formData.tier === 'PRO' && step === 3)) && (
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{selectedTier.icon}</span>
                        <div>
                          <span className="text-sm font-black text-white">{selectedTier.name} Membership</span>
                          <p className="text-[11px] text-emerald-400 font-semibold">{selectedTier.discount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400">{selectedTier.fee}</div>
                        <span className="text-[10px] text-emerald-100/50">รวมภาษีมูลค่าเพิ่มแล้ว</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                      เลือกวิธีการชำระเงิน
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                          paymentMethod === 'CARD'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-[11px] font-bold">บัตรเครดิต/Visa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PROMPTPAY')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                          paymentMethod === 'PROMPTPAY'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                        <span className="text-[11px] font-bold">พร้อมเพย์ QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('TRANSFER')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                          paymentMethod === 'TRANSFER'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <Building className="w-5 h-5" />
                        <span className="text-[11px] font-bold">โอนเงินธนาคาร</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Details */}
                  {paymentMethod === 'CARD' && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      {formData.tier === 'ENTERPRISE' && formData.visaCardNumber ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                          <div className="flex items-center gap-3">
                            <div className="px-2 py-1 bg-white/15 rounded text-[10px] font-black italic tracking-wider text-white">VISA</div>
                            <div>
                              <div className="text-xs font-mono font-bold text-white">•••• •••• •••• {formData.visaCardNumber.replace(/\s+/g, '').slice(-4)}</div>
                              <div className="text-[10px] text-indigo-200/60 uppercase">{formData.visaCardHolder || 'CARD HOLDER'} (Exp: {formData.visaCardExpiry})</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">พร้อมตัดเงิน</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-emerald-300/70">หมายเลขบัตร Visa / Mastercard</label>
                            <input
                              type="text"
                              value={formData.visaCardNumber}
                              onChange={handleCardNumberChange}
                              placeholder="4xxx xxxx xxxx xxxx"
                              maxLength={19}
                              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-xs outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-emerald-300/70">วันหมดอายุ</label>
                              <input
                                type="text"
                                value={formData.visaCardExpiry}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-emerald-300/70">CVV</label>
                              <input
                                type="password"
                                value={formData.visaCardCvv}
                                onChange={handleCvvChange}
                                placeholder="•••"
                                maxLength={3}
                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'PROMPTPAY' && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center space-y-3">
                      <div className="w-36 h-36 bg-white p-2 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                        <div className="text-[10px] font-black text-blue-900 tracking-wider mb-1">PROMPTPAY QR</div>
                        <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                          <QrCode className="w-16 h-16 text-gray-800" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">พร้อมเพย์ สแกนจ่ายได้ทุกธนาคาร</div>
                        <div className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">ยอดชำระ: {selectedTier.fee}</div>
                        <div className="text-[10px] text-emerald-100/60 mt-1">PromptPay ID: 081-234-5678 (บมจ Coworking Space Booking System)</div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'TRANSFER' && (() => {
                    const currentBank = BANK_OPTIONS.find(b => b.id === selectedBankId) || BANK_OPTIONS[0];
                    return (
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                            เลือกธนาคารที่ต้องการโอน:
                          </label>
                          <div className="relative">
                            <select
                              value={selectedBankId}
                              onChange={e => setSelectedBankId(e.target.value)}
                              className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-400 transition cursor-pointer appearance-none pr-8"
                            >
                              {BANK_OPTIONS.map(b => (
                                <option key={b.id} value={b.id} className="bg-[#04140D] text-white">
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 text-[10px]">
                              ▼
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Account Card */}
                        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${currentBank.color} border space-y-2.5 transition-all`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <BankLogo bank={currentBank} size="sm" />
                              <span className="font-bold text-xs text-white">{currentBank.name}</span>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full ${currentBank.dotColor}`}></span>
                          </div>
                          <div className="p-2.5 bg-black/40 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="text-[9px] text-emerald-100/60 uppercase">เลขที่บัญชี</div>
                              <div className="font-mono text-base font-black text-white">{currentBank.accountNumber}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(currentBank.accountNumber.replace(/-/g, ''));
                                setCopiedBank(true);
                                setTimeout(() => setCopiedBank(false), 2000);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              {copiedBank ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedBank ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                            </button>
                          </div>
                          <div className="text-[10px] text-emerald-100/70">
                            ชื่อบัญชี: <span className="text-white font-bold">{currentBank.accountName}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-emerald-100/50 text-center">
                          หลังยืนยัน ระบบจะเปิดใช้งานสมาชิกให้คุณทันทีโดยอัตโนมัติ
                        </div>
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(formData.tier === 'ENTERPRISE' ? 3 : 2)}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-emerald-100/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative flex-[2] py-3.5 rounded-xl overflow-hidden group font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all" />
                      <span className="relative flex items-center justify-center gap-2 text-forest-950">
                        {isLoading ? (
                          <span className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>ยืนยันชำระเงิน {selectedTier.fee} <CheckCircle2 className="w-4 h-4" /></>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer link */}
            <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
              <p className="text-xs text-emerald-100/40">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition">
                  เข้าสู่ระบบทันที
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
