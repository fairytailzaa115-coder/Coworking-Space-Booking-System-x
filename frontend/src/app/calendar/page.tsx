'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  CalendarCheck,
  Loader2,
  AlertTriangle,
  MapPin,
  ChevronDown,
  Building2,
  Filter
} from 'lucide-react';

interface Room {
  roomId: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  status: string;
  image?: string;
  roomType?: string;
  pricingRuleDescription?: string;
  tag?: string;
  emoji?: string;
  location?: string;
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

interface MemberData {
  memberId: string;
  name: string;
  tier: string;
  discountRate: number;
  rewardPoints: number;
}

const VICTOR_CLUB_ROOM_ID = 'RM-MTG-VICTOR-FYI';

// ── All rooms data ──
const ALL_ROOMS: Room[] = [
  { roomId: 'RM-HOT-101', name: 'Hot Desk Alpha #12 (Solar Powered)', capacity: 1, pricePerHour: 80, status: 'AVAILABLE', roomType: 'HOT_DESK', image: '/images/hot-desk-room.jpg', tag: 'HOT DESK', emoji: '☀️', pricingRuleDescription: 'ลด 20% เมื่อจอง 8 ชม.ขึ้นไป' },
  { roomId: 'RM-PHN-401', name: 'Acoustic Sound Pod #1 (Private)', capacity: 1, pricePerHour: 50, status: 'AVAILABLE', roomType: 'PHONE_BOOTH', image: '/images/soundproof-booth.jpg', tag: 'PHONE BOOTH', emoji: '🎙️', pricingRuleDescription: 'ตู้เก็บเสียง Soundproof 45dB' },
  { roomId: 'RM-MTG-101', name: 'Focus Pod Meeting Room (Compact)', capacity: 2, pricePerHour: 180, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/individual-pod.jpg', tag: 'MINI POD', emoji: '🫧', pricingRuleDescription: '฿180/ชม. + AV & Soundproof ฿50' },
  { roomId: 'RM-OFF-301', name: 'Executive Eco Suite Alpha', capacity: 4, pricePerHour: 600, status: 'AVAILABLE', roomType: 'PRIVATE_OFFICE', image: '/images/executive-suite.jpg', tag: 'PRIVATE SUITE', emoji: '🌿', pricingRuleDescription: 'ขั้นต่ำ 2 ชม. ลด 25% เมื่อจอง 24 ชม.' },
  { roomId: 'RM-MTG-102', name: 'Creative Huddle Room', capacity: 4, pricePerHour: 250, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/creative-huddle.jpg', tag: 'HUDDLE ROOM', emoji: '💡', pricingRuleDescription: '฿250/ชม. + AV & ไวท์บอร์ดแก้ว ฿100' },
  { roomId: 'RM-MTG-202', name: 'Synergy Brainstorming Lab', capacity: 6, pricePerHour: 350, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/meeting-room.jpg', tag: 'BRAINSTORM LAB', emoji: '🧠', pricingRuleDescription: '฿350/ชม. + Smart Interactive Board ฿120' },
  { roomId: 'RM-MTG-201', name: 'Summit Smart Boardroom (8-P)', capacity: 8, pricePerHour: 450, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/summit-boardroom.jpg', tag: 'SMART BOARDROOM', emoji: '🖥️', pricingRuleDescription: '฿450/ชม. + AI Video Conference ฿150' },
  { roomId: 'RM-MTG-301', name: 'Executive Strategy Room', capacity: 12, pricePerHour: 650, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/executive-strategy-room.jpg', tag: 'STRATEGY ROOM', emoji: '♟️', pricingRuleDescription: '฿650/ชม. + จอ 85 นิ้ว 4K ฿200' },
  { roomId: 'RM-MTG-302', name: 'Visionary Conference Hall', capacity: 20, pricePerHour: 950, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/visionary-conference.jpg', tag: 'CONFERENCE HALL', emoji: '🏟️', pricingRuleDescription: '฿950/ชม. + เลเซอร์โปรเจกเตอร์ 120 นิ้ว ฿300' },
  { roomId: 'RM-MTG-401', name: 'Grand Auditorium & Town Hall', capacity: 40, pricePerHour: 1800, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/grand-auditorium.jpg', tag: 'TOWN HALL (MAX)', emoji: '🎭', pricingRuleDescription: '฿1,800/ชม. + LED Wall & ถ่ายทอดสด ฿500' },
  { roomId: 'RM-MTG-KMITL', name: 'KMITL Meeting Room', capacity: 16, pricePerHour: 750, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/meeting-room.jpg', tag: 'KMITL ROOM', emoji: '🏛️', location: 'สจล. ลาดกระบัง', pricingRuleDescription: '฿750/ชม. + ระบบถ่ายทอดสด & Smart Board สจล. ฿200' },
  { roomId: 'RM-EXE-KMITL', name: 'KMITL Executive Hall', capacity: 30, pricePerHour: 1200, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/grand-auditorium.jpg', tag: 'PREMIUM HALL', emoji: '🏢', location: 'สจล. ลาดกระบัง', pricingRuleDescription: '฿1,200/ชม. + LED 4K & Cisco Webex ฿300' },
  { roomId: 'RM-MTG-MII', name: 'Mii Space ห้องประชุมโรงแรม บางนา-ศรีนครินทร์', capacity: 10, pricePerHour: 550, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/summit-boardroom.jpg', tag: 'MII SPACE HOTEL', emoji: '🏨', location: 'บางนา-ศรีนครินทร์', pricingRuleDescription: '฿550/ชม. + จอโปรเจกเตอร์ 4K & สิ่งอำนวยความสะดวกครบครัน ฿150' },
  { roomId: VICTOR_CLUB_ROOM_ID, name: 'Victor Club @ FYI Center Meeting Room', capacity: 12, pricePerHour: 200, status: 'AVAILABLE', roomType: 'MEETING_ROOM', image: '/images/meeting-room.jpg', tag: 'VICTOR CLUB', emoji: '🏢', location: 'FYI Center', pricingRuleDescription: '฿200/ชม. · รองรับ 12 ท่าน' },
];

// ── Venue / Station Groups (เหมือนหน้าแรก) ──
const VENUE_GROUPS = [
  {
    groupId: 'GS',
    label: 'GreenSpace Coworking Space',
    sublabel: 'อโศก กรุงเทพมหานคร',
    emoji: '🌿',
    themeColor: 'emerald',
    accentBorder: 'border-[#00FF87]/30',
    accentText: 'text-[#00FF87]',
    accentBg: 'bg-[#00FF87]',
    accentGlow: 'shadow-[0_0_20px_rgba(0,255,135,0.3)]',
    accentRing: 'ring-[#00FF87]',
    accentHoverBg: 'hover:bg-[#00FF87]/15',
    accentLightBg: 'bg-[#00FF87]/15',
    roomIds: ['RM-HOT-101', 'RM-PHN-401', 'RM-MTG-101', 'RM-OFF-301', 'RM-MTG-102', 'RM-MTG-202', 'RM-MTG-201', 'RM-MTG-301', 'RM-MTG-302', 'RM-MTG-401', VICTOR_CLUB_ROOM_ID],
  },
  {
    groupId: 'KMITL',
    label: 'KMITL Room (สจล.)',
    sublabel: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง',
    emoji: '🏛️',
    themeColor: 'amber',
    accentBorder: 'border-amber-400/30',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500',
    accentGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    accentRing: 'ring-amber-400',
    accentHoverBg: 'hover:bg-amber-500/15',
    accentLightBg: 'bg-amber-500/15',
    roomIds: ['RM-MTG-KMITL', 'RM-EXE-KMITL'],
  },
  {
    groupId: 'MII',
    label: 'Mii Space Hotel',
    sublabel: 'ห้องประชุมโรงแรม บางนา-ศรีนครินทร์',
    emoji: '🏨',
    themeColor: 'teal',
    accentBorder: 'border-teal-400/30',
    accentText: 'text-teal-400',
    accentBg: 'bg-teal-500',
    accentGlow: 'shadow-[0_0_20px_rgba(20,184,166,0.3)]',
    accentRing: 'ring-teal-400',
    accentHoverBg: 'hover:bg-teal-500/15',
    accentLightBg: 'bg-teal-500/15',
    roomIds: ['RM-MTG-MII'],
  },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8..21

export default function CalendarPage() {
  const [rooms, setRooms] = useState<Room[]>(ALL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Station dropdown state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('GS');
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selected room state (default to first room or null for all rooms in venue)
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');

  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState<{ room: Room } | null>(null);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalStartHour, setModalStartHour] = useState<string>('09');
  const [modalDuration, setModalDuration] = useState<number>(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ type: 'success' | 'error'; text: string; bookingId?: string } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVenueDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch('/api/v1/workspaces/WS-ASOKE/rooms'),
          fetch('/api/v1/bookings')
        ]);
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          const backupRooms = [...ALL_ROOMS];

          if (Array.isArray(data) && data.length > 0) {
            // Merge backend rooms into ALL_ROOMS, preserving rooms that might belong to other venues (KMITL, Mii Space)
            const backendMap = new Map(data.map((br: any) => [br.roomId, br]));
            const merged = backupRooms.map(preset => {
              const br = backendMap.get(preset.roomId);
              if (br) {
                return {
                  ...preset,
                  ...br,
                  image: preset.image || '/images/meeting-room.jpg',
                  tag: preset.tag || br.roomType || 'ROOM',
                  emoji: preset.emoji || '🏢',
                  pricingRuleDescription: br.pricingRuleDescription || preset.pricingRuleDescription || (`฿${br.pricePerHour}/ชม.`)
                };
              }
              return preset;
            });

            // If backend has rooms not in ALL_ROOMS, append them too
            data.forEach((br: any) => {
              if (!merged.some(m => m.roomId === br.roomId)) {
                merged.push({
                  ...br,
                  image: '/images/meeting-room.jpg',
                  tag: br.roomType || 'ROOM',
                  emoji: '🏢',
                  pricingRuleDescription: br.pricingRuleDescription || (`฿${br.pricePerHour}/ชม.`)
                });
              }
            });

            // Force the known Victor Club preset to stay available in the GreenSpace venue even when backend data is stale or incomplete.
            const victorPreset = backupRooms.find(room => room.roomId === VICTOR_CLUB_ROOM_ID);
            if (victorPreset && !merged.some(room => room.roomId === VICTOR_CLUB_ROOM_ID)) {
              merged.push(victorPreset);
            }

            merged.sort((a, b) => a.capacity - b.capacity);
            setRooms(merged);
          } else {
            setRooms(backupRooms);
          }
        }
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          if (Array.isArray(bData)) setBookings(bData);
        }
      } catch (err) {
        console.warn('Backend offline, using fallback:', err);
      }
    };
    fetchData();

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentMember');
      if (saved) {
        try { setCurrentMember(JSON.parse(saved)); } catch {}
      }
    }
  }, []);

  // Current venue group
  const currentGroup = VENUE_GROUPS.find(g => g.groupId === selectedGroupId) || VENUE_GROUPS[0];

  // Rooms in the currently selected station/venue
  const groupRooms = useMemo(() =>
    rooms.filter(r => currentGroup.roomIds.includes(r.roomId)),
    [rooms, currentGroup]
  );

  // When changing venue group, reset selected room to 'ALL' (or first room)
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedRoomId('ALL');
    setVenueDropdownOpen(false);
  };

  // Rooms filtered on the right panel based on selectedRoomId
  const activeRoomsOnRight = useMemo(() => {
    if (selectedRoomId === 'ALL') {
      return groupRooms;
    }
    const found = groupRooms.find(r => r.roomId === selectedRoomId);
    return found ? [found] : groupRooms;
  }, [groupRooms, selectedRoomId]);

  // Calendar dates helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  // Get bookings for a room on a date
  const getRoomBookingsOnDate = (roomId: string, dateStr: string) =>
    bookings.filter(b => {
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      return b.roomId === roomId && b.startTime.split('T')[0] === dateStr;
    });

  // Calculate day availability (depends on whether a specific room is selected or all rooms in group)
  const getDayAvailability = (dateStr: string) => {
    if (selectedRoomId !== 'ALL') {
      // Focus on the specific room selected
      const targetRoom = groupRooms.find(r => r.roomId === selectedRoomId);
      if (!targetRoom) return { status: 'AVAILABLE', label: 'ว่าง', color: 'text-emerald-400', dotColor: 'bg-emerald-400 shadow-[0_0_6px_#34d399]', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
      const roomBookings = getRoomBookingsOnDate(targetRoom.roomId, dateStr);
      const bookedHours = new Set<number>();
      roomBookings.forEach(b => {
        const st = new Date(b.startTime);
        const et = new Date(b.endTime);
        for (let h = st.getHours(); h < et.getHours(); h++) bookedHours.add(h);
      });
      if (bookedHours.size === 0) return { status: 'AVAILABLE', label: 'ว่างทั้งวัน', color: 'text-emerald-400', dotColor: 'bg-emerald-400 shadow-[0_0_6px_#34d399]', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
      if (bookedHours.size >= 12) return { status: 'FULL', label: 'เต็มแล้ว', color: 'text-rose-400', dotColor: 'bg-rose-400 shadow-[0_0_6px_#f87171]', badgeBg: 'bg-rose-500/15 border-rose-500/30' };
      return { status: 'PARTIAL', label: 'ว่างบางช่วง', color: 'text-amber-400', dotColor: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]', badgeBg: 'bg-amber-500/15 border-amber-500/30' };
    }

    // If 'ALL' is selected for this station: check rooms in this venue
    const targetRoomIds = new Set(groupRooms.map(r => r.roomId));
    const active = bookings.filter(b => {
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;
      return targetRoomIds.has(b.roomId) && b.startTime.split('T')[0] === dateStr;
    });
    const bookedIds = new Set(active.map(b => b.roomId));
    const total = groupRooms.length || 1;
    const count = bookedIds.size;
    if (count === 0) return { status: 'AVAILABLE', label: 'ว่างทุกห้อง', color: 'text-emerald-400', dotColor: 'bg-emerald-400 shadow-[0_0_6px_#34d399]', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
    if (count >= total) return { status: 'FULL', label: 'เต็มทุกห้อง', color: 'text-rose-400', dotColor: 'bg-rose-400 shadow-[0_0_6px_#f87171]', badgeBg: 'bg-rose-500/15 border-rose-500/30' };
    return { status: 'PARTIAL', label: `ว่างบางห้อง (${count}/${total})`, color: 'text-amber-400', dotColor: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]', badgeBg: 'bg-amber-500/15 border-amber-500/30' };
  };

  const selectedDateOverview = useMemo(() => getDayAvailability(selectedDateStr), [bookings, selectedDateStr, selectedRoomId, groupRooms]);

  const isSlotBookedOnDate = (roomId: string, dateStr: string, hour: number) =>
    getRoomBookingsOnDate(roomId, dateStr).some(b => {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      const bookStart = start.getHours() + start.getMinutes() / 60;
      const bookEnd = end.getHours() + end.getMinutes() / 60;
      return bookStart < hour + 1 && bookEnd > hour;
    });

  const isRangeConflicted = (roomId: string, dateStr: string, startH: number, dur: number) => {
    for (let h = startH; h < startH + dur; h++) {
      if (isSlotBookedOnDate(roomId, dateStr, h)) return true;
    }
    return false;
  };

  const findFirstAvailableHour = (roomId: string, dateStr: string) => {
    for (let h = 8; h <= 20; h++) {
      if (!isSlotBookedOnDate(roomId, dateStr, h)) return String(h).padStart(2, '0');
    }
    return '09';
  };

  const openBookingModal = (room: Room) => {
    setBookingModal({ room });
    setModalDate(selectedDateStr);
    const initialHour = findFirstAvailableHour(room.roomId, selectedDateStr);
    setModalStartHour(initialHour);
    setModalDuration(1);
    setBookingResult(null);
  };

  const closeBookingModal = () => {
    setBookingModal(null);
    setBookingResult(null);
  };

  const calcPrice = () => {
    if (!bookingModal) return 0;
    let base = bookingModal.room.pricePerHour * modalDuration;
    if (modalDuration >= 8) base = base * 0.8;
    const rate = currentMember?.discountRate || 0;
    return Math.round(base * (1 - rate));
  };

  const isCurrentSelectionConflicted = useMemo(() => {
    if (!bookingModal || !modalDate) return false;
    return isRangeConflicted(bookingModal.room.roomId, modalDate, parseInt(modalStartHour), modalDuration);
  }, [bookingModal, modalDate, modalStartHour, modalDuration, bookings]);

  const handleBookingSubmit = async () => {
    if (!bookingModal || !currentMember) {
      setBookingResult({ type: 'error', text: 'กรุณาเข้าสู่ระบบก่อนทำการจอง' });
      return;
    }
    if (isCurrentSelectionConflicted) {
      setBookingResult({ type: 'error', text: 'ช่วงเวลาที่คุณเลือกมีผู้อื่นจองแล้ว กรุณาเลือกเวลาหรือระยะเวลาอื่นที่ไม่ทับซ้อน' });
      return;
    }
    setBookingLoading(true);
    setBookingResult(null);
    try {
      const start = new Date(`${modalDate}T${modalStartHour}:00:00`);
      const end = new Date(start.getTime() + modalDuration * 3600000);
      const payload = { memberId: currentMember.memberId, roomId: bookingModal.room.roomId, startTime: start.toISOString(), endTime: end.toISOString() };
      const res = await fetch('/api/v1/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'เกิดข้อผิดพลาดในการจอง');
      const refreshRes = await fetch('/api/v1/bookings');
      if (refreshRes.ok) { const refreshData = await refreshRes.json(); if (Array.isArray(refreshData)) setBookings(refreshData); }
      setBookingResult({ type: 'success', text: 'บันทึกข้อมูลและส่งแจ้งเตือนเข้า LINE เรียบร้อยแล้ว', bookingId: data.bookingId } as any);
    } catch (e: any) {
      setBookingResult({ type: 'error', text: e?.message || 'ไม่สามารถส่งคำขอจองได้ กรุณาลองใหม่' });
    }
    setBookingLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA] selection:bg-[#00FF87] selection:text-[#04100C]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-12 pb-14 border-b border-[#00FF87]/15 overflow-visible z-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#00FF87]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-black uppercase tracking-widest">
            <CalendarIcon className="w-3.5 h-3.5 animate-pulse" />
            BOOKING SCHEDULE &amp; AVAILABILITY CALENDAR
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ปฏิทินตรวจสอบสถานะห้องว่าง
          </h1>
          <p className="text-sm text-[#E6F4EA]/70 max-w-2xl mx-auto leading-relaxed">
            เลือกสถานที่จากเมนูดรอปดาวน์ และเลือกห้องประชุมที่ต้องการเพื่อดูปฏิทินของห้องนั้นๆ โดยเฉพาะ
          </p>

          {/* ── Dropdownlist เลือกสถานที่ (เหมือนหน้าแรก) ── */}
          <div className="pt-3 flex justify-center" ref={dropdownRef}>
            <div className="relative inline-block text-left w-full max-w-md">
              <button
                type="button"
                onClick={() => setVenueDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#061812] border border-[#00FF87]/35 hover:border-[#00FF87]/70 text-white text-sm font-bold transition-all shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{currentGroup.emoji}</span>
                  <div className="text-left">
                    <div className="text-white font-black text-sm">{currentGroup.label}</div>
                    <div className="text-[11px] text-[#E6F4EA]/60">{currentGroup.sublabel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentGroup.accentLightBg} ${currentGroup.accentText}`}>
                    {groupRooms.length} ห้อง
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#00FF87] transition-transform duration-200 ${venueDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu Items */}
              {venueDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl border border-[#00FF87]/30 bg-[#061812]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#00FF87]/70 border-b border-emerald-500/15 mb-1">
                      เลือกสถานที่ / สถานี
                    </div>
                    {VENUE_GROUPS.map(group => {
                      const isSelected = selectedGroupId === group.groupId;
                      const roomCount = group.roomIds.filter(id => rooms.find(r => r.roomId === id)).length;
                      return (
                        <button
                          key={group.groupId}
                          type="button"
                          onClick={() => handleSelectGroup(group.groupId)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                            isSelected
                              ? 'bg-[#00FF87]/15 border border-[#00FF87]/40 text-white'
                              : 'hover:bg-white/5 border border-transparent text-[#E6F4EA]/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{group.emoji}</span>
                            <div>
                              <div className="text-sm font-bold text-white">{group.label}</div>
                              <div className="text-[11px] text-[#E6F4EA]/60">{group.sublabel}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${group.accentLightBg} ${group.accentText}`}>
                            {roomCount} ห้อง
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Status Legends */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />ว่างทุกห้อง (Available)
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />ว่างบางห้อง (Partially Booked)
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f87171]" />เต็มทุกห้อง (Fully Booked)
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Calendar */}
            <div className="lg:col-span-7 nature-glass-card rounded-[32px] p-6 sm:p-8 border border-[#00FF87]/25 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-[#00FF87]/15">
                <div>
                  <h3 className="text-xl font-black text-white">{monthNames[month]} {year + 543} ({year})</h3>
                  <p className="text-xs text-[#E6F4EA]/60 mt-0.5">
                    สถานที่: <span className="font-bold text-[#00FF87]">{currentGroup.label}</span>
                    {selectedRoomId !== 'ALL' && (
                      <span className="ml-1 text-[#E6F4EA]/80 font-semibold">
                        • {groupRooms.find(r => r.roomId === selectedRoomId)?.name}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} aria-label="Previous Month" className="w-9 h-9 rounded-xl bg-[#04100C] hover:bg-[#00FF87] text-white hover:text-[#04100C] border border-[#00FF87]/30 flex items-center justify-center transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} aria-label="Next Month" className="w-9 h-9 rounded-xl bg-[#04100C] hover:bg-[#00FF87] text-white hover:text-[#04100C] border border-[#00FF87]/30 flex items-center justify-center transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mt-4 text-center text-xs font-extrabold text-[#00FF87]/80 pb-2">
                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(d => <span key={d}>{d}</span>)}
              </div>

              <div className="grid grid-cols-7 gap-2 mt-2">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={'e' + i} className="h-16 sm:h-20 rounded-2xl bg-white/[0.02] border border-transparent opacity-30" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const mStr = String(month + 1).padStart(2, '0');
                  const dStr = String(dayNum).padStart(2, '0');
                  const dateStr = `${year}-${mStr}-${dStr}`;
                  const isSelected = selectedDateStr === dateStr;
                  const av = getDayAvailability(dateStr);
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-16 sm:h-20 rounded-2xl p-1.5 sm:p-2 text-left flex flex-col justify-between border transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#00FF87]/20 border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.3)] ring-2 ring-[#00FF87]'
                          : 'bg-[#061812]/80 hover:bg-[#00FF87]/10 border-[#00FF87]/15 hover:border-[#00FF87]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-[#00FF87]' : 'text-white'}`}>{dayNum}</span>
                        <span className={`w-2 h-2 rounded-full ${av.dotColor}`} />
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold truncate leading-tight mt-1">
                        {av.status === 'AVAILABLE' ? <span className="text-emerald-400 hidden sm:inline">ว่าง</span>
                          : av.status === 'FULL' ? <span className="text-rose-400">เต็ม</span>
                          : <span className="text-amber-400">บางส่วน</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Day Detail & Room Selection Buttons (เหมือนเดิมตรงวันที่เลือก) */}
            <div className="lg:col-span-5 nature-glass-card rounded-[32px] p-6 sm:p-8 border border-[#00FF87]/25 shadow-2xl flex flex-col gap-5">

              {/* Date Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#00FF87]/15 gap-3">
                <div>
                  <span className="text-[11px] font-black text-[#00FF87] uppercase tracking-wider">วันที่เลือก</span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {new Date(selectedDateStr).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${selectedDateOverview.badgeBg} ${selectedDateOverview.color}`}>
                  {selectedDateOverview.status === 'AVAILABLE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selectedDateOverview.status === 'PARTIAL' && <AlertCircle className="w-3.5 h-3.5" />}
                  {selectedDateOverview.status === 'FULL' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{selectedDateOverview.label}</span>
                </div>
              </div>



              {/* Room List with Time Slots for Selected Date */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {activeRoomsOnRight.map(room => {
                  const roomBookings = getRoomBookingsOnDate(room.roomId, selectedDateStr);
                  const isFree = roomBookings.length === 0;
                  const isPartial = roomBookings.length > 0 && roomBookings.length < 4;
                  const isFull = roomBookings.length >= 4;

                  return (
                    <div key={room.roomId} className="rounded-2xl bg-[#04100C]/80 border border-[#00FF87]/15 hover:border-[#00FF87]/35 transition overflow-hidden">
                      {/* Room Header */}
                      <div className="flex items-center justify-between gap-3 p-3.5">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {room.image && (
                            <img src={room.image} alt={room.name} className="w-11 h-11 rounded-xl object-cover border border-[#00FF87]/25 flex-shrink-0" />
                          )}
                          <div className="overflow-hidden">
                            <span className="text-xs font-black text-white truncate block">{room.name}</span>
                            <div className="text-[11px] text-[#E6F4EA]/60 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5"><Users className="w-3 h-3 text-[#00FF87]" /> {room.capacity} ท่าน</span>
                              <span>•</span>
                              <span className="text-[#00FF87] font-bold">฿{room.pricePerHour}/ชม.</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {isFree && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">● ว่างทั้งวัน</span>}
                          {isPartial && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">● ว่างบางช่วง</span>}
                          {isFull && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">● เต็มแล้ว</span>}
                          <button
                            onClick={() => openBookingModal(room)}
                            disabled={isFull}
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg transition ${
                              isFull
                                ? 'bg-white/5 text-[#E6F4EA]/30 cursor-not-allowed'
                                : 'bg-[#00FF87]/15 text-[#00FF87] hover:bg-[#00FF87] hover:text-[#04100C]'
                            }`}
                          >
                            <CalendarCheck className="w-3 h-3" /> จองห้องนี้
                          </button>
                        </div>
                      </div>

                      {/* Time Slot Bar */}
                      <div className="px-3.5 pb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-2.5 h-2.5 text-[#00FF87]" />
                          <span className="text-[10px] text-[#E6F4EA]/50 font-semibold">ช่วงเวลาที่จอง (08:00 - 21:00)</span>
                        </div>
                        <div className="flex gap-0.5">
                          {HOURS.map(h => {
                            const booked = isSlotBookedOnDate(room.roomId, selectedDateStr, h);
                            return (
                              <div
                                key={h}
                                title={booked ? `${h}:00-${h+1}:00 มีการจองแล้ว` : `${h}:00-${h+1}:00 ว่าง`}
                                className={`flex-1 h-5 rounded-sm transition-colors ${
                                  booked
                                    ? 'bg-rose-500/70 border border-rose-500/40'
                                    : 'bg-emerald-500/20 border border-emerald-500/20'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-0.5 text-[8px] text-[#E6F4EA]/30 font-semibold">
                          <span>8:00</span><span>12:00</span><span>16:00</span><span>21:00</span>
                        </div>
                        {roomBookings.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {roomBookings.map(b => {
                              const st = new Date(b.startTime);
                              const et = new Date(b.endTime);
                              const fmt = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                              return (
                                <span key={b.bookingId} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  🚫 {fmt(st)}–{fmt(et)}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== BOOKING MODAL ===== */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020D07]/80 backdrop-blur-md">
          <div className="w-full max-w-md nature-glass-card rounded-[28px] border border-[#00FF87]/30 shadow-2xl p-7 relative">
            <button onClick={closeBookingModal} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-[#E6F4EA]/60 hover:text-rose-400 flex items-center justify-center transition">
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black text-[#00FF87] uppercase tracking-widest">BOOK THIS ROOM</span>
              <h2 className="text-xl font-black text-white mt-1">{bookingModal.room.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#E6F4EA]/60 flex-wrap">
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#00FF87]" /> {bookingModal.room.capacity} ท่าน</span>
                <span>•</span>
                <span className="text-[#00FF87] font-bold">฿{bookingModal.room.pricePerHour}/ชม.</span>
                {bookingModal.room.tag && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30 text-[9px] font-black">{bookingModal.room.tag}</span>
                )}
              </div>
            </div>

            {!bookingResult || bookingResult.type === 'error' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-[#00FF87] uppercase tracking-wider mb-1.5 block">วันที่จอง</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={e => {
                      const newDate = e.target.value;
                      setModalDate(newDate);
                      if (bookingModal) {
                        const newHour = findFirstAvailableHour(bookingModal.room.roomId, newDate);
                        setModalStartHour(newHour);
                      }
                    }}
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00FF87] transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-[#00FF87] uppercase tracking-wider">เวลาเริ่มต้น</label>
                    <span className="text-[10px] text-[#E6F4EA]/50">* ช่วงที่ถูกจองแล้วจะไม่สามารถเลือกได้</span>
                  </div>
                  <select
                    value={modalStartHour}
                    onChange={e => setModalStartHour(e.target.value)}
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00FF87] transition"
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const h = i + 8;
                      const hStr = String(h).padStart(2, '0');
                      const isBooked = isSlotBookedOnDate(bookingModal.room.roomId, modalDate, h);
                      return (
                        <option key={h} value={hStr} disabled={isBooked} className={isBooked ? 'bg-red-950 text-rose-400' : 'bg-[#04100C] text-white'}>
                          {hStr}:00 น. {isBooked ? '(⛔ มีผู้จองแล้ว)' : '(ว่าง)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-[#00FF87] uppercase tracking-wider">จำนวนชั่วโมง</label>
                    <span className="text-[10px] text-[#E6F4EA]/50">* ปิดการเลือกหากทับซ้อนช่วงที่ถูกจอง</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 6, 8].map(d => {
                      const startH = parseInt(modalStartHour);
                      const exceedsClosing = startH + d > 22;
                      const hasOverlap = isRangeConflicted(bookingModal.room.roomId, modalDate, startH, d);
                      const isDisabled = exceedsClosing || hasOverlap;
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setModalDuration(d)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition border ${
                            isDisabled
                              ? 'bg-white/[0.02] text-rose-400/40 border-rose-500/20 cursor-not-allowed line-through'
                              : modalDuration === d
                              ? 'bg-[#00FF87] text-[#04140D] border-[#00FF87] shadow-[0_0_10px_rgba(0,255,135,0.4)]'
                              : 'bg-[#04100C] text-[#E6F4EA]/70 border-[#00FF87]/20 hover:border-[#00FF87]/50'
                          }`}
                        >
                          {d} ชม.
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isCurrentSelectionConflicted && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>ช่วงเวลาที่คุณเลือกชนกับคิวการจองของผู้อื่น กรุณาเปลี่ยนเวลาเริ่มต้นหรือลดจำนวนชั่วโมง</span>
                  </div>
                )}

                {!currentMember && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    ⚠️ กรุณา <Link href="/login" className="underline font-bold">เข้าสู่ระบบ</Link> ก่อนทำการจอง
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#00FF87]/5 border border-[#00FF87]/20 space-y-2">
                  <div className="flex justify-between text-xs text-[#E6F4EA]/70">
                    <span>ราคาก่อนส่วนลด</span>
                    <span>฿{(bookingModal.room.pricePerHour * modalDuration).toLocaleString()}</span>
                  </div>
                  {modalDuration >= 8 && (
                    <div className="flex justify-between text-xs text-[#00FF87] font-semibold">
                      <span>ส่วนลดเต็มวัน (ลด 20%)</span>
                      <span>-฿{Math.round(bookingModal.room.pricePerHour * modalDuration * 0.2).toLocaleString()}</span>
                    </div>
                  )}
                  {currentMember && currentMember.discountRate > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>ส่วนลดสมาชิก ({(currentMember.discountRate * 100).toFixed(0)}%)</span>
                      <span>-฿{Math.round((modalDuration >= 8 ? bookingModal.room.pricePerHour * modalDuration * 0.8 : bookingModal.room.pricePerHour * modalDuration) * currentMember.discountRate).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-white border-t border-[#00FF87]/15 pt-2">
                    <span>ยอดรวม</span>
                    <span className="text-[#00FF87]">฿{calcPrice().toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-[#E6F4EA]/50">
                    {modalStartHour}:00 น. – {String(parseInt(modalStartHour) + modalDuration).padStart(2, '0')}:00 น. • {modalDate ? new Date(modalDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '–'}
                  </div>
                </div>

                {bookingResult?.type === 'error' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    ❌ {bookingResult.text}
                  </div>
                )}

                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading || !currentMember || !modalDate || isCurrentSelectionConflicted}
                  className="w-full py-3 rounded-2xl bg-[#00FF87] hover:bg-[#22FF96] disabled:opacity-50 disabled:cursor-not-allowed text-[#04140D] font-black text-sm uppercase tracking-wider transition hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.3)]"
                >
                  {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                  {bookingLoading ? 'กำลังส่งคำขอ...' : 'ยืนยันการจองห้องนี้'}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">🎉 จองห้องสำเร็จเรียบร้อย!</h3>
                  <p className="text-xs text-[#E6F4EA]/70 mt-0.5">{bookingResult.text}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#04100C] border border-[#00FF87]/25 text-xs text-left space-y-1.5">
                  <div className="flex justify-between"><span className="text-[#E6F4EA]/60">รหัสการจอง</span><span className="text-[#00FF87] font-black font-mono">{bookingResult.bookingId || 'BK-SUCCESS'}</span></div>
                  <div className="flex justify-between"><span className="text-[#E6F4EA]/60">ห้อง</span><span className="text-white font-bold">{bookingModal.room.name}</span></div>
                  <div className="flex justify-between"><span className="text-[#E6F4EA]/60">วันที่</span><span className="text-white font-bold">{modalDate ? new Date(modalDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : modalDate}</span></div>
                  <div className="flex justify-between"><span className="text-[#E6F4EA]/60">เวลา</span><span className="text-white font-bold">{modalStartHour}:00 – {String(parseInt(modalStartHour) + modalDuration).padStart(2, '0')}:00 น. ({modalDuration} ชม.)</span></div>
                  <div className="flex justify-between border-t border-[#00FF87]/15 pt-1 mt-1"><span className="text-[#E6F4EA]/60">ยอดชำระสุทธิ</span><span className="text-[#00FF87] font-black text-sm">฿{calcPrice().toLocaleString()} บาท</span></div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#06C755]/10 border border-[#06C755]/30 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#06C755] animate-ping" />
                      <span className="text-xs font-black text-[#06C755] uppercase tracking-wider">📲 แจ้งเตือนเข้า LINE สำเร็จ</span>
                    </div>
                    <span className="text-[10px] text-[#06C755] font-bold bg-[#06C755]/20 px-2 py-0.5 rounded-full">ระบบอัตโนมัติ</span>
                  </div>
                  <p className="text-[11px] text-[#E6F4EA]/80 leading-relaxed">ระบบส่งข้อความสรุปการจองเข้า LINE ของคุณเรียบร้อยแล้ว</p>
                  <a
                    href={'https://line.me/R/msg/text/?' + encodeURIComponent(
                      '🎉 ยืนยันการจองห้องสำเร็จ!\n' +
                      '━━━━━━━━━━━━━━━━━━━━\n' +
                      '🔖 รหัสการจอง: ' + (bookingResult.bookingId || 'BK-SUCCESS') + '\n' +
                      '🚪 ห้อง: ' + bookingModal.room.name + '\n' +
                      '👤 ผู้จอง: ' + (currentMember?.name || 'สมาชิก') + '\n' +
                      '📅 วันที่: ' + (modalDate || '') + '\n' +
                      '⏰ เวลา: ' + modalStartHour + ':00 – ' + String(parseInt(modalStartHour) + modalDuration).padStart(2, '0') + ':00 น.\n' +
                      '⏳ ระยะเวลา: ' + modalDuration + ' ชม.\n' +
                      '💰 ยอดรวม: ' + calcPrice().toLocaleString() + ' บาท\n' +
                      '━━━━━━━━━━━━━━━━━━━━\n' +
                      'GreenSpace Coworking Space'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02]"
                  >
                    💬 เปิดดูหรือแชร์ใน LINE ทันที
                  </a>
                </div>

                <button onClick={closeBookingModal} className="w-full py-2.5 rounded-2xl border border-[#00FF87]/30 text-[#00FF87] font-bold text-xs hover:bg-[#00FF87]/10 transition">
                  เสร็จสิ้น / ปิดหน้าต่างนี้
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
