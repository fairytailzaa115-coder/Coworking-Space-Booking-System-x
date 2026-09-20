'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Leaf, Lock, Mail, ArrowRight, Eye, EyeOff,
  Wifi, Coffee, Users, Star
} from 'lucide-react';

const FEATURES = [
  { icon: Wifi, text: 'อินเทอร์เน็ตความเร็วสูง' },
  { icon: Coffee, text: 'เครื่องดื่มฟรีตลอดวัน' },
  { icon: Users, text: 'ชุมชนนักสร้างสรรค์' },
  { icon: Star, text: 'สิทธิพิเศษสมาชิก' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      localStorage.setItem('currentMember', JSON.stringify({
        memberId: data.memberId,
        name: data.name,
        email: data.email,
        tier: data.membershipTier,
        discountRate: data.discountRate,
        rewardPoints: data.rewardPoints,
        memberType: data.memberType,
        admin: data.admin === true,
        maxMonthlyHours: data.maxMonthlyHours,
        visaCardNumber: data.visaCardNumber,
        visaCardHolder: data.visaCardHolder,
        visaCardExpiry: data.visaCardExpiry
      }));

      router.push('/dashboard');
    } catch (err: any) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-forest-950 selection:bg-emerald-500 selection:text-forest-950">

      {/* ── Left Visual Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12">
        {/* Animated background blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-500/8 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-600/6 blur-[80px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(52,211,153,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(52,211,153,1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Floating decorative circles */}
        <div className="absolute top-28 right-12 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
          <Wifi className="w-6 h-6 text-emerald-400/70" />
        </div>
        <div className="absolute bottom-36 left-10 w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center backdrop-blur-sm">
          <Coffee className="w-5 h-5 text-teal-400/70" />
        </div>

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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">Coworking Space</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              พื้นที่ทำงาน<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                ที่ใช่สำหรับคุณ
              </span>
            </h2>
            <p className="text-sm text-emerald-100/50 leading-relaxed max-w-xs">
              จองพื้นที่ทำงานพรีเมียม ที่มาพร้อมสิ่งอำนวยความสะดวกครบครัน
              เหมาะสำหรับทุกไลฟ์สไตล์การทำงาน
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-100/70">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial / Stats */}
        <div className="relative z-10">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-emerald-100/60 leading-relaxed mb-3">
              "EcoSpace เปลี่ยนวิธีที่ผมทำงานไปเลย บรรยากาศดี เน็ตแรง ทีมงานใจดีมาก"
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-black text-forest-950">
                สม
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">สมชาย ใจดี</div>
                <div className="text-[10px] text-emerald-100/40">Freelance Developer · Pro Member</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf className="w-4 h-4 text-forest-950 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-white">
              ECO<span className="text-emerald-400">SPACE</span>
            </span>
          </Link>
          <Link href="/register" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition">
            สมัครสมาชิก →
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px] space-y-8">

            {/* Header */}
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white">ยินดีต้อนรับกลับ</h1>
              <p className="text-sm text-emerald-100/50">เข้าสู่ระบบเพื่อจัดการการจองของคุณ</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm font-semibold">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="name@company.com"
                    required
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white text-sm font-medium outline-none placeholder:text-emerald-100/25 focus:border-emerald-400/50 focus:bg-emerald-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                    รหัสผ่าน
                  </label>
                  <a href="#" className="text-[11px] text-emerald-400/70 hover:text-emerald-400 transition font-semibold">
                    ลืมรหัสผ่าน?
                  </a>
                </div>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-emerald-400' : 'text-emerald-600/60'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white text-sm font-medium outline-none placeholder:text-emerald-100/25 focus:border-emerald-400/50 focus:bg-emerald-500/5 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600/60 hover:text-emerald-400 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo hint */}
              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-sm">💡</span>
                <span className="text-[11px] text-emerald-100/50 leading-relaxed">
                  <strong className="text-emerald-300/80">Demo:</strong> alex.tech@antigravity.dev (รหัสผ่านใดก็ได้)
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 rounded-xl overflow-hidden group font-bold text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 transition-all duration-200" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-emerald-400 to-teal-300 blur-xl" />
                <span className="relative flex items-center justify-center gap-2 text-forest-950 font-black">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-forest-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>เข้าสู่ระบบ <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-emerald-100/30 font-medium">ยังไม่มีบัญชี?</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Register link */}
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-200"
            >
              สมัครสมาชิกใหม่ฟรี
            </Link>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 text-center text-[11px] text-emerald-100/25">
          © 2026 EcoSpace · Secured by Spring Boot &amp; Next.js
        </div>
      </div>

    </div>
  );
}
