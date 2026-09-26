'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Leaf, CalendarCheck, LogOut, Edit3, ShieldCheck, Settings, 
  CreditCard, Lock, ArrowUpRight, ImageIcon, ChevronDown, 
  Home, Info, Briefcase, Calendar, Award, Search, Building2
} from 'lucide-react';

interface MemberData {
  memberId: string;
  name: string;
  email?: string;
  phone?: string;
  tier: string;
  discountRate: number;
  rewardPoints: number;
  admin?: boolean;
  memberType?: string;
  spaceName?: string;
  spaceLocation?: string;
  dealerWorkspaceId?: string;
  dealerRoomId?: string;
  visaCardNumber?: string;
  visaCardHolder?: string;
  visaCardExpiry?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editTier, setEditTier] = useState('PRO');
  const [editVisaNumber, setEditVisaNumber] = useState('');
  const [editVisaHolder, setEditVisaHolder] = useState('');
  const [editVisaExpiry, setEditVisaExpiry] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMember = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('currentMember');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentMember(parsed);
      } catch (e) {}
    } else {
      setCurrentMember(null);
    }
  };

  useEffect(() => {
    loadMember();
    const handleStorageChange = () => { loadMember(); };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('memberUpdated', handleStorageChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setShowNavDropdown(false);
      }
      if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('memberUpdated', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
    setShowSearch(false);
  };

  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentMember');
    setCurrentMember(null);
    window.dispatchEvent(new Event('memberUpdated'));
    router.push('/login');
  };

  const openEditModal = () => {
    if (!currentMember) return;
    setEditName(currentMember.name || '');
    setEditPhone(currentMember.phone || '');
    setEditTier(currentMember.tier || 'PRO');

    // Format card number with spaces if present
    const rawCard = currentMember.visaCardNumber || '';
    const formattedCard = rawCard.replace(/(\d{4})(?=\d)/g, '$1 ');
    setEditVisaNumber(formattedCard);
    setEditVisaHolder(currentMember.visaCardHolder || currentMember.name || '');
    setEditVisaExpiry(currentMember.visaCardExpiry || '');
    setUpdateMsg(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) return;

    const cleanCard = editVisaNumber.replace(/\s+/g, '');
    if (cleanCard && (!cleanCard.startsWith('4') || cleanCard.length !== 16)) {
      setUpdateMsg({ type: 'error', text: 'หมายเลขบัตร Visa ต้องขึ้นต้นด้วย 4 และครบ 16 หลัก' });
      return;
    }

    setIsUpdating(true);
    setUpdateMsg(null);

    const discount = editTier === 'ENTERPRISE' ? 0.30 : editTier === 'PRO' ? 0.15 : 0.0;
    const updatedData: MemberData = {
      ...currentMember,
      name: editName.trim(),
      phone: editPhone.trim(),
      tier: editTier,
      discountRate: discount,
      visaCardNumber: cleanCard || currentMember.visaCardNumber,
      visaCardHolder: editVisaHolder.trim() || currentMember.visaCardHolder,
      visaCardExpiry: editVisaExpiry.trim() || currentMember.visaCardExpiry,
    };

    try {
      const res = await fetch(`/api/v1/members/${currentMember.memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editName.trim(), 
          phone: editPhone.trim(), 
          tier: editTier,
          visaCardNumber: cleanCard,
          visaCardHolder: editVisaHolder.trim(),
          visaCardExpiry: editVisaExpiry.trim()
        }),
      });
      if (res.ok) {
        const data = await res.json();
        updatedData.name = data.name;
        updatedData.phone = data.phone;
        updatedData.tier = data.membershipTier;
        updatedData.discountRate = data.discountRate;
        if (data.rewardPoints !== undefined) updatedData.rewardPoints = data.rewardPoints;
        if (data.visaCardNumber !== undefined) updatedData.visaCardNumber = data.visaCardNumber;
        if (data.visaCardHolder !== undefined) updatedData.visaCardHolder = data.visaCardHolder;
        if (data.visaCardExpiry !== undefined) updatedData.visaCardExpiry = data.visaCardExpiry;
      }
    } catch (err) {
      console.warn('Backend update failed, saving locally:', err);
    }

    localStorage.setItem('currentMember', JSON.stringify(updatedData));
    setCurrentMember(updatedData);
    window.dispatchEvent(new Event('memberUpdated'));
    setIsUpdating(false);
    setUpdateMsg({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
    setTimeout(() => { setShowEditModal(false); }, 900);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#04100C]/90 backdrop-blur-xl border-b border-[#00FF87]/15">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">

          {/* Brand Logo — icon moved to sit next to "System" */}
          <Link href="/" className="flex items-center gap-1 sm:gap-1.5 group shrink-0 whitespace-nowrap">
            <span className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-white whitespace-nowrap">
              Coworking Space{' '}
              <span className="text-[#00FF87] font-semibold inline-flex items-center gap-1">
                Booking System
                <span className="inline-flex w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#00FF87]/15 border border-[#00FF87]/40 items-center justify-center group-hover:scale-110 transition shadow-[0_0_12px_rgba(0,255,135,0.3)]">
                  <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00FF87] stroke-[2.5]" />
                </span>
              </span>
            </span>
          </Link>

          {/* Search Bar — expandable, hidden until icon clicked */}
          <div ref={searchFormRef} className="flex items-center justify-end">
            <form
              onSubmit={handleSearch}
              className={`flex items-center relative overflow-hidden transition-all duration-300 ease-in-out ${
                showSearch ? 'w-48 sm:w-64 lg:w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'
              }`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
                placeholder="ค้นหาห้อง..."
                className="w-full bg-[#061812] border border-[#00FF87]/40 rounded-2xl pl-4 pr-10 py-2 text-xs text-white placeholder-emerald-100/40 outline-none focus:border-[#00FF87]/80 shadow-inner transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#00FF87]/70 hover:text-[#00FF87] transition"
                aria-label="ค้นหา"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Search Icon Button — shown when search is closed */}
            {!showSearch && (
              <button
                type="button"
                onClick={openSearch}
                aria-label="เปิดช่องค้นหา"
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0B2B23]/70 hover:bg-[#0B2B23] border border-emerald-500/25 hover:border-[#00FF87]/40 text-[#A0AEC0] hover:text-[#00FF87] transition-all duration-200"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Menu Dropdown Button (replacing linear links) */}
          <div className="relative" ref={navDropdownRef}>
            <button
              onClick={() => setShowNavDropdown((prev) => !prev)}
              aria-label="Navigation Menu"
              aria-expanded={showNavDropdown}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 border ${
                showNavDropdown
                  ? 'bg-[#00FF87]/20 border-[#00FF87]/50 text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.25)]'
                  : 'bg-[#0B2B23]/70 hover:bg-[#0B2B23] border-emerald-500/25 hover:border-[#00FF87]/40 text-[#A0AEC0] hover:text-[#00FF87]'
              }`}
            >
              {/* 4-block icon (3 rounded squares, 1 circle bottom-right) */}
              <div className="w-[18px] h-[18px] grid grid-cols-2 gap-[3px] items-center justify-center p-[1px]">
                <span className="w-[6px] h-[6px] rounded-[1.5px] bg-current"></span>
                <span className="w-[6px] h-[6px] rounded-[1.5px] bg-current"></span>
                <span className="w-[6px] h-[6px] rounded-[1.5px] bg-current"></span>
                <span className="w-[6px] h-[6px] rounded-full bg-current"></span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showNavDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal / Popover */}
            {showNavDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 py-2 rounded-2xl bg-[#061812]/95 backdrop-blur-xl border border-[#00FF87]/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 mb-1 border-b border-emerald-500/15 text-[10px] uppercase font-bold tracking-widest text-[#00FF87]/70">
                  Navigation
                </div>
                <Link
                  href="/"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E6F4EA]/80 hover:text-white hover:bg-[#00FF87]/15 rounded-xl mx-1.5 transition"
                >
                  <Home className="w-4 h-4 text-[#00FF87]" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/#about"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E6F4EA]/80 hover:text-white hover:bg-[#00FF87]/15 rounded-xl mx-1.5 transition"
                >
                  <Info className="w-4 h-4 text-[#00FF87]" />
                  <span>About</span>
                </Link>
                <Link
                  href="/services"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E6F4EA]/80 hover:text-white hover:bg-[#00FF87]/15 rounded-xl mx-1.5 transition"
                >
                  <Briefcase className="w-4 h-4 text-[#00FF87]" />
                  <span>Services</span>
                </Link>
                <Link
                  href="/calendar"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E6F4EA]/80 hover:text-white hover:bg-[#00FF87]/15 rounded-xl mx-1.5 transition"
                >
                  <Calendar className="w-4 h-4 text-[#00FF87]" />
                  <span>Calendar</span>
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#E6F4EA]/80 hover:text-white hover:bg-[#00FF87]/15 rounded-xl mx-1.5 transition"
                >
                  <Award className="w-4 h-4 text-[#00FF87]" />
                  <span>Membership</span>
                </Link>
                <div className="my-1 border-t border-emerald-500/15"></div>
                <Link
                  href="/dashboard"
                  onClick={() => setShowNavDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-[#00FF87] hover:bg-[#00FF87]/20 rounded-xl mx-1.5 transition"
                >
                  <CalendarCheck className="w-4 h-4 text-[#00FF87]" />
                  <span>Book Room</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            {currentMember ? (
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                {currentMember.admin && (
                  <>
                    <Link
                      href="/admin"
                      title="จัดการคำขอจอง"
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="hidden 2xl:inline">จัดการอนุมัติ</span>
                    </Link>
                    <Link
                      href="/admin/customize"
                      title="จัดการหน้าเว็บ — แก้ไขราคาและรูปภาพ"
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                      <span className="hidden 2xl:inline">จัดการหน้าเว็บ</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      title="ตั้งค่าระบบ & LINE Notification"
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden 2xl:inline">Setting</span>
                    </Link>
                  </>
                )}
                {/* Dealer Portal Button */}
                {currentMember.memberType === 'DEALER' && (
                  <Link
                    href="/dealer/customize"
                    title="จัดการบัญชี & พื้นที่ของฉัน — เพิ่มห้องประชุม แก้ไขราคาและรูปภาพ"
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(20,184,166,0.2)] shrink-0"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    <span className="hidden sm:inline">จัดการบัญชี & พื้นที่ของฉัน</span>
                  </Link>
                )}
                {/* User Info Capsule */}
                <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-[#0B2B23]/90 border border-emerald-500/25 shadow-md shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-[#020D07] text-xs sm:text-sm shadow-md shrink-0">
                    {currentMember.name ? currentMember.name.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white max-w-[80px] sm:max-w-[120px] truncate">
                        {currentMember.name}
                      </span>
                      {currentMember.memberType === 'DEALER' ? (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 whitespace-nowrap">
                          🏢 DEALER
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          {currentMember.tier || 'PRO'} Tier (ลด {((currentMember.discountRate ?? 0.15) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-100/60 leading-tight mt-0.5 whitespace-nowrap">
                      {currentMember.memberType === 'DEALER' && currentMember.spaceName ? (
                        <span>พื้นที่: <span className="text-teal-300 font-medium">{currentMember.spaceName}</span></span>
                      ) : (
                        <span>รหัส: <span className="text-emerald-400 font-medium">{currentMember.memberId}</span> • {currentMember.rewardPoints || 0} พอยต์</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={openEditModal}
                  title="แก้ไขข้อมูลส่วนตัว"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">แก้ไขข้อมูล</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full text-xs font-extrabold text-white hover:text-[#00FF87] transition tracking-wider uppercase"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-full text-xs font-extrabold bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] shadow-[0_0_20px_rgba(0,255,135,0.4)] transition tracking-wider uppercase hover:scale-105"
                >
                  SIGNUP
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#020D07]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl bg-[#0B2B23]/95 text-emerald-50">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white">แก้ไขข้อมูลผู้ใช้งาน</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-emerald-100/60 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {updateMsg && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-semibold text-center ${updateMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}`}>
                {updateMsg.text}
              </div>
            )}

            {currentMember?.memberType === 'DEALER' && (
              <div className="mt-4 p-3.5 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    จัดการพื้นที่ & ห้องประชุม Dealer
                  </p>
                  <p className="text-[10px] text-teal-200/70 mt-0.5">เพิ่มห้องประชุมใหม่, แก้ไขราคา, ปรับแต่งรูปภาพ</p>
                </div>
                <Link
                  href="/dealer/customize"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-[#04140D] font-black text-xs shrink-0 flex items-center gap-1 transition shadow-sm"
                >
                  ไปจัดการห้อง →
                </Link>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-400"
                />
              </div>

              {/* Membership Tier (Read-only / Locked until payment) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-emerald-300 font-bold text-xs">ระดับสมาชิก (Membership Tier)</label>
                  <span className="text-[10px] text-amber-300/90 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Lock className="w-3 h-3 text-amber-400" /> ล็อคระดับสมาชิก
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-forest-950 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{editTier === 'ENTERPRISE' ? '🏢 ENTERPRISE Tier' : editTier === 'PRO' ? '⚡ PRO Tier' : '🌿 BASIC Tier'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          ส่วนลด {editTier === 'ENTERPRISE' ? '30%' : editTier === 'PRO' ? '15%' : '0%'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/50 mt-0.5">
                        ระดับสมาชิกไม่สามารถเปลี่ยนโดยตรงได้ ต้องอัปเกรดและชำระเงินตามแพ็กเกจ
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/payment?tier=ENTERPRISE"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1 flex-shrink-0"
                  >
                    <span>อัปเกรด</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visa Card Details Section */}
              <div className="pt-3 border-t border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    ข้อมูลบัตร Visa
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 font-black italic text-[10px]">
                    VISA
                  </span>
                </div>

                <div>
                  <label className="block text-emerald-100/70 font-semibold mb-1 text-[11px]">
                    หมายเลขบัตร Visa (16 หลัก)
                  </label>
                  <input
                    type="text"
                    value={editVisaNumber}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setEditVisaNumber(raw.replace(/(\d{4})(?=\d)/g, '$1 '));
                    }}
                    placeholder="4xxx xxxx xxxx xxxx"
                    maxLength={19}
                    className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white font-mono font-semibold outline-none focus:border-emerald-400"
                  />
                  <p className="text-[10px] text-emerald-400/60 mt-0.5">* บัตร Visa ขึ้นต้นด้วยเลข 4</p>
                </div>

                <div>
                  <label className="block text-emerald-100/70 font-semibold mb-1 text-[11px]">
                    ชื่อผู้ถือบัตร
                  </label>
                  <input
                    type="text"
                    value={editVisaHolder}
                    onChange={e => setEditVisaHolder(e.target.value.toUpperCase())}
                    placeholder="SOMCHAI JAIDEE"
                    className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white uppercase font-semibold outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-emerald-100/70 font-semibold mb-1 text-[11px]">
                    วันหมดอายุ (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={editVisaExpiry}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                      const formatted = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                      setEditVisaExpiry(formatted);
                    }}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full bg-[#020D07] border border-emerald-500/30 rounded-xl px-3 py-2.5 text-white font-mono font-semibold outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-500/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#020D07] hover:bg-[#0B2B23] text-emerald-100/70 border border-emerald-500/20 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#020D07] text-xs font-black transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
