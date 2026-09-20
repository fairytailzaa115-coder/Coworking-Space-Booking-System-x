'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Laptop, 
  DoorClosed, 
  PhoneCall, 
  Presentation,
  Tag,
  Leaf,
  LogOut,
  CalendarCheck,
  CreditCard,
  QrCode,
  Building,
  Copy,
  Check
} from 'lucide-react';
import { BANK_OPTIONS } from '@/types/banks';
import BankLogo from '@/components/BankLogo';

interface Room {
  roomId: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  status: string;
  image?: string;
  roomType?: string;
  equipmentFee?: number;
  hasDualMonitors?: boolean;
  hasVideoConference?: boolean;
  hasWhiteboard?: boolean;
  dedicatedDesks?: number;
  soundproofCertified?: boolean;
  pricingRuleDescription?: string;
  tag?: string;
}

interface Booking {
  bookingId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: string;
  totalPrice: number;
}

interface Quote {
  originalBasePrice?: number;
  fullDayDiscount?: number;
  basePrice: number;
  discountRateTier: string;
  discountRate: number;
  discountAmount: number;
  totalPrice: number;
  durationHours: number;
}

const ALL_ROOMS_CATALOG: Room[] = [
  {
    roomId: 'RM-HOT-101',
    name: 'Hot Desk Alpha #12 (Solar Powered)',
    capacity: 1,
    pricePerHour: 80,
    status: 'AVAILABLE',
    roomType: 'HOT_DESK',
    image: '/images/hot-desk-room.jpg',
    hasDualMonitors: true,
    tag: 'HOT DESK',
    pricingRuleDescription: 'ลด 20% เมื่อจอง 8 ชม.ขึ้นไป (Full-day pass)'
  },
  {
    roomId: 'RM-PHN-401',
    name: 'Acoustic Sound Pod #1 (Private)',
    capacity: 1,
    pricePerHour: 50,
    status: 'AVAILABLE',
    roomType: 'PHONE_BOOTH',
    image: '/images/soundproof-booth.jpg',
    soundproofCertified: true,
    tag: 'PHONE BOOTH',
    pricingRuleDescription: 'ตู้เก็บเสียงกระจกนิรภัย 2 ชั้น คิดราคาตามช่วงเวลาจริง'
  },
  {
    roomId: 'RM-MTG-101',
    name: 'Focus Pod Meeting Room (Compact)',
    capacity: 2,
    pricePerHour: 180,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 50,
    hasVideoConference: true,
    hasWhiteboard: true,
    soundproofCertified: true,
    image: '/images/individual-pod.jpg',
    tag: 'MINI POD',
    pricingRuleDescription: '฿180/ชม. + ค่าบริการระบบ AV & Soundproof ฿50'
  },
  {
    roomId: 'RM-OFF-301',
    name: 'Executive Eco Suite Alpha',
    capacity: 4,
    pricePerHour: 600,
    status: 'AVAILABLE',
    roomType: 'PRIVATE_OFFICE',
    image: '/images/executive-suite.jpg',
    dedicatedDesks: 4,
    tag: 'PRIVATE SUITE',
    pricingRuleDescription: 'ขั้นต่ำ 2 ชั่วโมง ส่วนลด 25% เมื่อจอง 24 ชม.ขึ้นไป'
  },
  {
    roomId: 'RM-MTG-102',
    name: 'Creative Huddle Room',
    capacity: 4,
    pricePerHour: 250,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 100,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/creative-huddle.jpg',
    tag: 'HUDDLE ROOM',
    pricingRuleDescription: '฿250/ชม. + ค่าบริการ AV & ไวท์บอร์ดแก้ว ฿100'
  },
  {
    roomId: 'RM-MTG-202',
    name: 'Synergy Brainstorming Lab',
    capacity: 6,
    pricePerHour: 350,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 120,
    hasVideoConference: true,
    hasWhiteboard: true,
    hasDualMonitors: true,
    image: '/images/meeting-room.jpg',
    tag: 'BRAINSTORM LAB',
    pricingRuleDescription: '฿350/ชม. + อุปกรณ์ Smart Interactive Board ฿120'
  },
  {
    roomId: 'RM-MTG-201',
    name: 'Summit Smart Boardroom (8-P)',
    capacity: 8,
    pricePerHour: 450,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 150,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/summit-boardroom.jpg',
    tag: 'SMART BOARDROOM',
    pricingRuleDescription: '฿450/ชม. + ค่าบริการระบบ AI Video Conference ฿150'
  },
  {
    roomId: 'RM-MTG-301',
    name: 'Executive Strategy Room',
    capacity: 12,
    pricePerHour: 650,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 200,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/executive-strategy-room.jpg',
    tag: 'STRATEGY ROOM',
    pricingRuleDescription: '฿650/ชม. + จอ 85 นิ้ว 4K HDR & ไมค์แยกรายคน ฿200'
  },
  {
    roomId: 'RM-MTG-302',
    name: 'Visionary Conference Hall',
    capacity: 20,
    pricePerHour: 950,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 300,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/visionary-conference.jpg',
    tag: 'CONFERENCE HALL',
    pricingRuleDescription: '฿950/ชม. + เลเซอร์โปรเจกเตอร์ 120 นิ้ว & ระบบแสงเสียง ฿300'
  },
  {
    roomId: 'RM-MTG-401',
    name: 'Grand Auditorium & Town Hall',
    capacity: 40,
    pricePerHour: 1800,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 500,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/grand-auditorium.jpg',
    tag: 'TOWN HALL (MAX)',
    pricingRuleDescription: '฿1,800/ชม. + เวที LED Wall & ชุดถ่ายทอดสด ฿500'
  }
];

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>(ALL_ROOMS_CATALOG);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MEETING_ROOM' | 'HOT_DESK' | 'PRIVATE_OFFICE' | 'PHONE_BOOTH'>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'my-bookings'>('rooms');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('09:00');
  const [duration, setDuration] = useState('2');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<'CARD' | 'PROMPTPAY' | 'TRANSFER'>('CARD');
  const [selectedBankId, setSelectedBankId] = useState<string>(BANK_OPTIONS[0].id);
  const [copiedBank, setCopiedBank] = useState(false);

  const [currentMember, setCurrentMember] = useState<{
    memberId: string;
    name: string;
    tier: string;
    discountRate: number;
    rewardPoints: number;
    admin: boolean;
    visaCardNumber?: string;
    visaCardHolder?: string;
    visaCardExpiry?: string;
  }>({
    memberId: 'MEM-001',
    name: 'Alex Kittisuk',
    tier: 'PRO',
    discountRate: 0.15,
    rewardPoints: 120,
    admin: false
  });

  useEffect(() => {
    // Load registered member from storage if available
    const saved = localStorage.getItem('currentMember');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentMember(parsed);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/workspaces/WS-ASOKE/rooms');
        if (!res.ok) throw new Error('API fetch failed');
        const data: Room[] = await res.json();
        if (data.length > 0) {
          const merged = data.map(backendRoom => {
            const preset = ALL_ROOMS_CATALOG.find(p => p.roomId === backendRoom.roomId);
            return {
              ...backendRoom,
              image: preset?.image || '/images/meeting-room.jpg',
              tag: preset?.tag || backendRoom.roomType || 'ROOM',
              equipmentFee: backendRoom.equipmentFee ?? preset?.equipmentFee,
              pricingRuleDescription: backendRoom.pricingRuleDescription || preset?.pricingRuleDescription || `฿${backendRoom.pricePerHour}/ชม.`
            };
          });
          merged.sort((a, b) => a.capacity - b.capacity);
          setRooms(merged);
        }
      } catch (e) {
        console.warn('Using local all rooms catalog:', e);
        setRooms(ALL_ROOMS_CATALOG);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!currentMember.memberId || currentMember.memberId === 'MEM-001') return;

    const loadMyBookings = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/members/${currentMember.memberId}/bookings`);
        if (!res.ok) throw new Error('Cannot fetch booking history');
        const data = await res.json();
        setMyBookings(data);
      } catch (e) {
        console.warn('Unable to load booking history from backend:', e);
        setMyBookings([]);
      }
    };

    loadMyBookings();
  }, [currentMember.memberId]);

  useEffect(() => {
    if (!selectedRoom) return;
    const dur = Number(duration);
    let base = selectedRoom.pricePerHour * dur;
    
    // OOP Polymorphic pricing simulation
    if (selectedRoom.roomType === 'MEETING_ROOM' || selectedRoom.roomId.startsWith('RM-MTG')) {
      const eqFee = selectedRoom.equipmentFee ?? 150;
      let roomRate = selectedRoom.pricePerHour * dur;
      if (dur >= 8) {
        roomRate = roomRate * 0.8;
      }
      base = roomRate + eqFee;
    } else if (selectedRoom.roomId === 'RM-OFF-301' || selectedRoom.roomType === 'PRIVATE_OFFICE') {
      const billedHours = Math.max(2, dur);
      let roomRate = selectedRoom.pricePerHour * billedHours;
      if (dur >= 24) {
        roomRate = roomRate * 0.75;
      } else if (dur >= 8) {
        roomRate = roomRate * 0.8;
      }
      base = roomRate;
    } else {
      if (dur >= 8) {
        base = base * 0.8;
      }
    }

    let fullDayDiscount = 0;
    let originalBase = selectedRoom.pricePerHour * dur;
    if (selectedRoom.roomType === 'MEETING_ROOM' || selectedRoom.roomId.startsWith('RM-MTG')) {
      originalBase += (selectedRoom.equipmentFee ?? 150);
      if (dur >= 8) {
        fullDayDiscount = Number(((selectedRoom.pricePerHour * dur) * 0.2).toFixed(2));
      }
    } else if (selectedRoom.roomId === 'RM-OFF-301' || selectedRoom.roomType === 'PRIVATE_OFFICE') {
      const billedHours = Math.max(2, dur);
      originalBase = selectedRoom.pricePerHour * billedHours;
      if (dur >= 24) {
        fullDayDiscount = Number((originalBase * 0.25).toFixed(2));
      } else if (dur >= 8) {
        fullDayDiscount = Number((originalBase * 0.2).toFixed(2));
      }
    } else {
      if (dur >= 8) {
        fullDayDiscount = Number((originalBase * 0.2).toFixed(2));
      }
    }

    const rate = currentMember.discountRate || (currentMember.tier === 'ENTERPRISE' ? 0.30 : currentMember.tier === 'PRO' ? 0.15 : 0.0);
    const discountAmount = Number((base * rate).toFixed(2));
    const totalPrice = Number((base - discountAmount).toFixed(2));

    setQuote({
      originalBasePrice: Number(originalBase.toFixed(2)),
      fullDayDiscount,
      basePrice: Number(base.toFixed(2)),
      discountRateTier: currentMember.tier,
      discountRate: rate,
      discountAmount,
      totalPrice,
      durationHours: dur
    });
  }, [selectedRoom, duration, currentMember]);

  const handleBookingConfirm = async () => {
    if (!selectedRoom || !quote) return;
    const start = new Date(`${startDate}T${startHour}:00`);
    const end = new Date(start.getTime() + quote.durationHours * 3600000);

    const bookingPayload = {
      memberId: currentMember.memberId,
      roomId: selectedRoom.roomId,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };

    try {
      // Direct call to Spring Boot API
      const res = await fetch('http://localhost:8080/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setMyBookings([data, ...myBookings]);

      // Build LINE share message
      const lineMsg = encodeURIComponent(
        '🎉 ยืนยันการจองห้องสำเร็จ!\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        '🔖 รหัสการจอง: ' + data.bookingId + '\n' +
        '🚪 ห้อง: ' + selectedRoom.name + '\n' +
        '👤 ผู้จอง: ' + currentMember.name + '\n' +
        '⏰ เวลาเริ่ม: ' + start.toLocaleString('th-TH') + '\n' +
        '⏰ เวลาสิ้นสุด: ' + end.toLocaleString('th-TH') + '\n' +
        '⏳ ระยะเวลา: ' + quote.durationHours + ' ชม.\n' +
        '💰 ยอดรวม: ' + quote.totalPrice.toLocaleString() + ' บาท\n' +
        '━━━━━━━━━━━━━━━━━━━━\n' +
        'GreenSpace Coworking Space'
      );
      const lineUrl = 'https://line.me/R/msg/text/?' + lineMsg;

      setAlert({
        type: 'success',
        text: `🎉 จองสำเร็จ! รหัสการจอง: ${data.bookingId} | ระบบส่งแจ้งเตือน LINE ให้อัตโนมัติแล้ว || LINE_URL:${lineUrl}`
      });
    } catch (e: any) {
      setAlert({ type: 'error', text: e?.message || 'ไม่สามารถส่งคำขอจองได้ กรุณาลองใหม่อีกครั้ง' });
    }

    setSelectedRoom(null);
  };


  const handleCancelBooking = (bookingId: string) => {
    setMyBookings(myBookings.map(b => b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b));
    setAlert({ type: 'success', text: 'ยกเลิกการจองเรียบร้อยแล้ว' });
  };

  return (
    <div className="min-h-screen bg-forest-950 text-emerald-50 bg-green-mesh selection:bg-emerald-500 selection:text-forest-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* User Status Bar */}
        <div className="glass-panel rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-forest-950 text-xl shadow-lg shadow-emerald-500/20">
              {currentMember.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentMember.name}</h1>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentMember.tier} Tier (ส่วนลด {(currentMember.discountRate || 0.15) * 100}%)
                </span>
              </div>
              <p className="text-xs text-emerald-100/60 mt-0.5">
                รหัสสมาชิก: <span className="text-emerald-400 font-bold">{currentMember.memberId}</span> • สะสมแล้ว {currentMember.rewardPoints || 50} พอยต์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-850 text-emerald-300 border border-emerald-500/20 text-xs font-bold transition flex items-center gap-1.5">
              หน้าแรก
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
            </Link>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`mb-6 p-4 rounded-2xl ${
            alert.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {alert.type === 'success' && alert.text.includes('LINE_URL:') ? (
              <div className="space-y-3">
                {/* Success Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{alert.text.split(' || LINE_URL:')[0]}</span>
                  <button onClick={() => setAlert(null)} className="text-sm font-bold opacity-70 hover:opacity-100">✕</button>
                </div>
                {/* LINE Notification Card */}
                <div className="p-3 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#06C755]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06C755] animate-ping"></span>
                    📲 ระบบส่งแจ้งเตือนเข้า LINE อัตโนมัติเรียบร้อยแล้ว
                  </div>
                  <p className="text-[11px] text-emerald-200/70">รายละเอียดการจอง (รหัสการจอง, ห้อง, เวลา, ราคา) ถูกส่งเข้า LINE ของคุณแล้ว</p>
                  <a
                    href={alert.text.split(' || LINE_URL:')[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white text-[11px] font-black transition"
                  >
                    💬 เปิดดูหรือแชร์ใน LINE
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{alert.text}</span>
                <button onClick={() => setAlert(null)} className="text-sm font-bold opacity-70 hover:opacity-100">✕</button>
              </div>
            )}
          </div>
        )}


        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-emerald-500/10 pb-3">
          <button 
            onClick={() => setActiveTab('rooms')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'rooms' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-forest-950 font-black shadow-lg shadow-emerald-500/20' : 'text-emerald-100/60 hover:text-white'
            }`}>
            <Sparkles className="w-4 h-4" /> พื้นที่ทำงานทั้งหมด ({rooms.length})
          </button>
          <button 
            onClick={() => setActiveTab('my-bookings')} 
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'my-bookings' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-forest-950 font-black shadow-lg shadow-emerald-500/20' : 'text-emerald-100/60 hover:text-white'
            }`}>
            <CalendarCheck className="w-4 h-4" /> ประวัติการจองของฉัน ({myBookings.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'rooms' ? (
          <div>
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span className="text-xs text-emerald-100/60 font-medium mr-2">ประเภทพื้นที่:</span>
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === 'ALL'
                    ? 'bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20'
                    : 'bg-forest-900/80 text-emerald-100/70 hover:text-white border border-emerald-500/15'
                }`}
              >
                ทั้งหมด ({rooms.length})
              </button>
              <button
                onClick={() => setCategoryFilter('MEETING_ROOM')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === 'MEETING_ROOM'
                    ? 'bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20'
                    : 'bg-forest-900/80 text-emerald-100/70 hover:text-white border border-emerald-500/15'
                }`}
              >
                ห้องประชุม (7)
              </button>
              <button
                onClick={() => setCategoryFilter('HOT_DESK')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === 'HOT_DESK'
                    ? 'bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20'
                    : 'bg-forest-900/80 text-emerald-100/70 hover:text-white border border-emerald-500/15'
                }`}
              >
                Hot Desk (1)
              </button>
              <button
                onClick={() => setCategoryFilter('PRIVATE_OFFICE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === 'PRIVATE_OFFICE'
                    ? 'bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20'
                    : 'bg-forest-900/80 text-emerald-100/70 hover:text-white border border-emerald-500/15'
                }`}
              >
                Private Office (1)
              </button>
              <button
                onClick={() => setCategoryFilter('PHONE_BOOTH')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  categoryFilter === 'PHONE_BOOTH'
                    ? 'bg-emerald-400 text-forest-950 shadow-md shadow-emerald-500/20'
                    : 'bg-forest-900/80 text-emerald-100/70 hover:text-white border border-emerald-500/15'
                }`}
              >
                Phone Booth (1)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {rooms
              .filter(room => {
                if (categoryFilter === 'ALL') return true;
                if (categoryFilter === 'MEETING_ROOM') return room.roomType === 'MEETING_ROOM' || room.roomId.startsWith('RM-MTG');
                if (categoryFilter === 'HOT_DESK') return room.roomType === 'HOT_DESK' || room.roomId.startsWith('RM-HOT');
                if (categoryFilter === 'PRIVATE_OFFICE') return room.roomType === 'PRIVATE_OFFICE' || room.roomId.startsWith('RM-OFF');
                if (categoryFilter === 'PHONE_BOOTH') return room.roomType === 'PHONE_BOOTH' || room.roomId.startsWith('RM-PHN');
                return true;
              })
              .map((room) => (
              <div key={room.roomId} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden transition flex flex-col justify-between group">
                <div>
                  {/* Room Thumbnail */}
                  <div className="h-44 w-full relative overflow-hidden bg-forest-900/50">
                    {room.image ? (
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-400/40">
                        <Building2 className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-forest-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
                        {room.roomId}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
                        ● {room.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pb-0">
                    <h3 className="text-base font-bold text-white line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-emerald-100/60 mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" /> รองรับ {room.capacity} ท่าน
                    </p>
                    <div className="text-xs text-emerald-200/70 mt-3 bg-forest-950/80 p-3 rounded-2xl border border-emerald-500/15 leading-relaxed">
                      <Tag className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                      {room.pricingRuleDescription}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-4 mt-4 border-t border-emerald-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-white">฿{room.pricePerHour}</span>
                    <span className="text-xs text-emerald-100/50"> /ชม.</span>
                  </div>
                  <button 
                    onClick={() => setSelectedRoom(room)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-forest-950 text-xs font-black rounded-xl transition shadow-lg shadow-emerald-500/20">
                    จองห้องนี้
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {myBookings.length === 0 ? (
              <div className="text-center py-16 text-emerald-100/40 font-semibold glass-panel rounded-3xl">
                ยังไม่มีประวัติการจองในระบบ
              </div>
            ) : (
              myBookings.map((b) => (
                <div key={b.bookingId} className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{b.bookingId}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-emerald-200 mt-1">ห้องรหัส: {b.roomId}</div>
                    <div className="text-xs text-emerald-100/60 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {new Date(b.startTime).toLocaleString('th-TH')} ({b.durationHours} ชั่วโมง)
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-emerald-100/50 font-medium">ยอดชำระสุทธิ</div>
                      <div className="text-xl font-black text-emerald-400">฿{b.totalPrice}</div>
                    </div>
                    {b.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancelBooking(b.bookingId)}
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 transition">
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Booking Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-forest-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-panel border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-start pb-4 border-b border-emerald-500/10 gap-4">
                <div className="flex items-center gap-3.5">
                  {selectedRoom.image && (
                    <img 
                      src={selectedRoom.image} 
                      alt={selectedRoom.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-emerald-500/30 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{selectedRoom.name}</h3>
                    <p className="text-xs text-emerald-100/60 mt-0.5">ความจุ {selectedRoom.capacity} ท่าน • อัตราปกติ ฿{selectedRoom.pricePerHour}/ชม.</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRoom(null)} className="text-emerald-100/60 hover:text-white font-bold text-lg p-1">✕</button>
              </div>

              <div className="space-y-4 mt-5 text-xs">
                <div>
                  <label className="block text-emerald-300 font-bold mb-1">วันที่จอง</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="w-full bg-forest-950 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">เวลาเริ่มต้น</label>
                    <input 
                      type="time" 
                      value={startHour} 
                      onChange={e => setStartHour(e.target.value)} 
                      className="w-full bg-forest-950 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 font-bold mb-1">ระยะเวลา</label>
                    <select 
                      value={duration} 
                      onChange={e => setDuration(e.target.value)} 
                      className="w-full bg-forest-950 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-emerald-400">
                      <option value="1">1 ชั่วโมง</option>
                      <option value="2">2 ชั่วโมง</option>
                      <option value="4">4 ชั่วโมง (ครึ่งวัน)</option>
                      <option value="8">8 ชั่วโมง (เต็มวัน - ลด 20%)</option>
                    </select>
                  </div>
                </div>

                {quote && (
                  <div className="bg-forest-950/90 border border-emerald-500/20 rounded-2xl p-4 space-y-2 mt-4">
                    {quote.fullDayDiscount && quote.fullDayDiscount > 0 ? (
                      <>
                        <div className="flex justify-between text-emerald-100/60">
                          <span>ราคาปกติ ({quote.durationHours} ชม.):</span>
                          <span className="line-through text-emerald-100/50">฿{quote.originalBasePrice}</span>
                        </div>
                        <div className="flex justify-between text-emerald-300 font-semibold">
                          <span>ส่วนลดจองเต็มวัน (ลด 20%):</span>
                          <span>-฿{quote.fullDayDiscount}</span>
                        </div>
                        <div className="flex justify-between text-emerald-100/80">
                          <span>ราคาหลังลดเต็มวัน (Polymorphic):</span>
                          <span className="font-semibold text-emerald-100">฿{quote.basePrice}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-emerald-100/60">
                        <span>ราคาตามสูตรคำนวณประเภทห้อง (Polymorphic):</span>
                        <span className="font-semibold text-emerald-100">฿{quote.basePrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-emerald-400">
                      <span>ส่วนลดสมาชิก (Strategy: {quote.discountRateTier} - {quote.discountRate * 100}%):</span>
                      <span className="font-bold">-฿{quote.discountAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-emerald-500/10">
                      <span>ยอดสุทธิที่ต้องชำระ:</span>
                      <span className="text-emerald-400 text-lg font-black">฿{quote.totalPrice}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setSelectedRoom(null)} 
                  className="w-1/3 py-3 bg-forest-900 hover:bg-forest-850 text-emerald-300 rounded-xl font-bold transition text-xs border border-emerald-500/20">
                  ยกเลิก
                </button>
                <button 
                  onClick={() => setShowPaymentModal(true)} 
                  className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-forest-950 rounded-xl font-black transition shadow-lg shadow-emerald-500/25 text-xs flex items-center justify-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> ไปหน้าชำระเงิน (฿{quote?.totalPrice})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Payment Modal */}
        {showPaymentModal && selectedRoom && quote && (
          <div className="fixed inset-0 bg-forest-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-panel border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-emerald-500/10">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" /> ชำระเงินค่าจองห้อง
                  </h3>
                  <p className="text-xs text-emerald-100/60 mt-0.5">{selectedRoom.name} • {quote.durationHours} ชั่วโมง</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-emerald-100/60 hover:text-white font-bold text-lg p-1">✕</button>
              </div>

              {/* Amount Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-100/60">ยอดสุทธิที่ต้องชำระ</span>
                  <div className="text-2xl font-black text-emerald-400">฿{quote.totalPrice.toLocaleString()}</div>
                </div>
                <div className="text-right text-[11px] text-emerald-100/60 space-y-0.5">
                  {quote.fullDayDiscount && quote.fullDayDiscount > 0 ? (
                    <>
                      <div>ราคาปกติ: ฿{quote.originalBasePrice}</div>
                      <div className="text-emerald-300 font-semibold">ลดเต็มวัน (20%): -฿{quote.fullDayDiscount}</div>
                    </>
                  ) : (
                    <div>ราคาห้อง: ฿{quote.basePrice}</div>
                  )}
                  <div className="text-emerald-400 font-semibold">ส่วนลดสมาชิก {quote.discountRateTier}: -฿{quote.discountAmount}</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-300/70 tracking-wide uppercase">
                  เลือกวิธีชำระเงิน
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                      bookingPaymentMethod === 'CARD'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px] font-bold">บัตร Visa/เครดิต</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingPaymentMethod('PROMPTPAY')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                      bookingPaymentMethod === 'PROMPTPAY'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[11px] font-bold">พร้อมเพย์ QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingPaymentMethod('TRANSFER')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                      bookingPaymentMethod === 'TRANSFER'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-[11px] font-bold">โอนเงินธนาคาร</span>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {bookingPaymentMethod === 'CARD' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  {currentMember.visaCardNumber ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30">
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-1 bg-white/15 rounded text-[10px] font-black italic tracking-wider text-white">VISA</div>
                        <div>
                          <div className="text-xs font-mono font-bold text-white">•••• •••• •••• {currentMember.visaCardNumber.slice(-4)}</div>
                          <div className="text-[10px] text-indigo-200/60 uppercase">{currentMember.visaCardHolder || currentMember.name} (Exp: {currentMember.visaCardExpiry || '12/28'})</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">บัตรของฉัน</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-forest-900/50 border border-emerald-500/20 text-xs text-emerald-100/70">
                      💳 ตัดเงินผ่านบัตรเครดิต/เดบิตที่บันทึกไว้ในระบบ หรือเลือกวิธีชำระอื่นด้านบน
                    </div>
                  )}
                </div>
              )}

              {bookingPaymentMethod === 'PROMPTPAY' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center space-y-2.5">
                  <div className="w-32 h-32 bg-white p-2 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                    <div className="text-[9px] font-black text-blue-900 tracking-wider mb-1">PROMPTPAY QR</div>
                    <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                      <QrCode className="w-14 h-14 text-gray-800" />
                    </div>
                  </div>
                  <div className="text-xs text-emerald-200">
                    สแกน QR Code เพื่อชำระยอด <span className="font-bold text-emerald-400">฿{quote.totalPrice}</span>
                  </div>
                  <div className="text-[10px] text-emerald-100/60">
                    พร้อมเพย์: 081-234-5678 (บมจ Coworking Space Booking System)
                  </div>
                </div>
              )}

              {bookingPaymentMethod === 'TRANSFER' && (() => {
                const currentBank = BANK_OPTIONS.find(b => b.id === selectedBankId) || BANK_OPTIONS[0];
                return (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-emerald-300 block mb-1">เลือกธนาคาร:</label>
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

                    {/* Dynamic Bank Account Card */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentBank.color} border space-y-2 transition-all`}>
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
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-1/3 py-3 bg-forest-900 hover:bg-forest-850 text-emerald-300 rounded-xl font-bold transition text-xs border border-emerald-500/20"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowPaymentModal(false);
                    await handleBookingConfirm();
                  }}
                  className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-forest-950 rounded-xl font-black transition shadow-lg shadow-emerald-500/25 text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> ยืนยันการชำระเงิน ฿{quote.totalPrice}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
