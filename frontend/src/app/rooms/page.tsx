'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Users, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tv, 
  Mic, 
  Video, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Info,
  CalendarCheck
} from 'lucide-react';

interface Room {
  roomId: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  status: string;
  image?: string;
  roomType?: string;
  equipmentFee?: number;
  hasVideoConference?: boolean;
  hasWhiteboard?: boolean;
  hasDualMonitors?: boolean;
  soundproofCertified?: boolean;
  pricingRuleDescription?: string;
  features?: string[];
  tag?: string;
  recommendedFor?: string;
}

interface Quote {
  originalRoomRate?: number;
  fullDayDiscount?: number;
  basePrice: number;
  discountRateTier: string;
  discountRate: number;
  discountAmount: number;
  totalPrice: number;
  durationHours: number;
}

const MEETING_ROOMS_CATALOG: Room[] = [
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
    image: '/images/soundproof-booth.jpg',
    tag: 'MINI POD',
    recommendedFor: '1-on-1 Interview / สนทนาส่วนตัว 2 ท่าน',
    pricingRuleDescription: '฿180/ชม. + ค่าบริการระบบ AV & Soundproof ฿50',
    features: ['จอ LCD 32 นิ้ว', 'Acoustic Soundproof', 'Webcam Full HD', 'Wi-Fi 6E']
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
    image: '/images/executive-suite.jpg',
    tag: 'HUDDLE ROOM',
    recommendedFor: 'ทีมย่อย 3-4 ท่าน ประชุมสรุปงานประจำสัปดาห์',
    pricingRuleDescription: '฿250/ชม. + ค่าบริการ AV & กระดานแก้ว ฿100',
    features: ['จอสัมผัส 4K 50 นิ้ว', 'กระจกไวท์บอร์ดเขียนไอเดีย', 'ไมค์ตัดเสียงรบกวน', 'พอร์ต Fast Charge']
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
    recommendedFor: 'ทีมดีไซน์และ Dev ทำสปรินต์ แลกเปลี่ยนความคิด',
    pricingRuleDescription: '฿350/ชม. + ค่าบริการอุปกรณ์ Interactive ฿120',
    features: ['Smart Interactive Board 65"', 'Dual 4K Displays', 'ไมค์รอบทิศทาง 360°', 'ผนังต้นไม้ฟอกอากาศ']
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
    recommendedFor: 'ประชุมผู้บริหาร เจรจาธุรกิจ นำเสนอลูกค้า VIP',
    pricingRuleDescription: '฿450/ชม. + ค่าบริการ AI AV Conference ฿150',
    features: ['AI Video Conference Auto-tracking', 'Dual 4K Displays', 'เซนเซอร์วัด CO2', 'ระบบเสียงห้องประชุมมืออาชีพ']
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
    recommendedFor: 'ประชุมบอร์ดบริหาร ประชุมแผนก วางแผนกลยุทธ์',
    pricingRuleDescription: '฿650/ชม. + ค่าบริการระบบผู้บริหาร ฿200',
    features: ['จอ Cinema 85" 4K HDR', 'ไมโครโฟนก้านอิสระรายบุคคล', 'ระบบสแกนใบหน้าเข้าห้อง', 'Free Barista Coffee']
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
    recommendedFor: 'ประชุมแผนกใหญ่ การสัมมนา และเทรนนิ่งพนักงาน',
    pricingRuleDescription: '฿950/ชม. + ค่าบริการควบคุมแสงเสียง ฿300',
    features: ['เลเซอร์โปรเจกเตอร์ 4K 120"', 'ไมค์ลอยไร้สาย 4 ตัว', 'ระบบ Hybrid Zoom Rooms', 'ระบบฟอกอากาศ HEPA ระดับการแพทย์']
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
    recommendedFor: 'งานสัมมนาใหญ่ ประชุมประจำปี All-Hands Town Hall',
    pricingRuleDescription: '฿1,800/ชม. + เจ้าหน้าที่เทคนิคและชุดถ่ายทอดสด ฿500',
    features: ['เวทีบรรยาย + จอ LED Wall ขนาดใหญ่', 'ระบบเสียงรอบทิศทาง Dolby', 'สตรีมมิ่งสด 4K Multi-cam', 'พื้นที่รับรองและแคเทอริ่ง']
  },
  {
    roomId: 'RM-MTG-KMITL',
    name: 'KMITL Room สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง',
    capacity: 16,
    pricePerHour: 750,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 200,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/executive-strategy-room.jpg',
    tag: 'KMITL ROOM',
    recommendedFor: 'งานประชุมสัมมนา งานแถลงข่าว หรือประชุมทางวิชาการและภาคธุรกิจ',
    pricingRuleDescription: '฿750/ชม. + ระบบถ่ายทอดสด & Smart Board สจล. ฿200',
    features: ['Smart Interactive Board 85"', 'ระบบถ่ายทอดสด Hybrid Conference', 'ไมค์ตั้งโต๊ะรายบุคคล', 'Free WiFi ความเร็วสูง']
  },
  {
    roomId: 'RM-MTG-MII',
    name: 'Mii Space ห้องประชุมโรงแรม บางนา-ศรีนครินทร์',
    capacity: 10,
    pricePerHour: 550,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 150,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/summit-boardroom.jpg',
    tag: 'MII SPACE HOTEL',
    recommendedFor: 'ประชุมผู้บริหาร ประชุมบริษัท หรือนัดคุยกับลูกค้าในบรรยากาศโรงแรมหรู',
    pricingRuleDescription: '฿550/ชม. + จอโปรเจกเตอร์ 4K & สิ่งอำนวยความสะดวกครบครัน ฿150',
    features: ['จอแสดงผล 4K HDR 65"', 'ระบบเสียงคุณภาพสูง', 'บริการเครื่องดื่มและของว่างระดับโรงแรม', 'ที่จอดรถสะดวกสบาย']
  },
  {
    roomId: 'RM-MTG-VICTOR-FYI',
    name: 'Victor Club @ FYI Center Meeting Room',
    capacity: 12,
    pricePerHour: 200,
    status: 'AVAILABLE',
    roomType: 'MEETING_ROOM',
    equipmentFee: 100,
    hasVideoConference: true,
    hasWhiteboard: true,
    image: '/images/meeting-room.jpg',
    tag: 'VICTOR CLUB',
    recommendedFor: 'Victor Club @ FYI Center • ชั้น 2 อาคารเอฟวายไอ เซ็นเตอร์ 2',
    pricingRuleDescription: '฿200/ชม. · รองรับ 12 ท่าน',
    features: ['Smart Display / Board', 'อินเทอร์เน็ตความเร็วสูง', 'ระบบแสงและเครื่องเสียงครบครัน', 'ใกล้ MRT ศูนย์การประชุมแห่งชาติสิริกิติ์']
  }
];

export default function MeetingRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(MEETING_ROOMS_CATALOG);
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large' | 'dealer' | 'kmitl' | 'mii'>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState('09:00');
  const [duration, setDuration] = useState('2');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentMember, setCurrentMember] = useState({
    memberId: 'MEM-001',
    name: 'Alex Kittisuk',
    tier: 'PRO',
    discountRate: 0.15,
    rewardPoints: 120,
    admin: false
  });

  useEffect(() => {
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
        const [roomRes, wsRes] = await Promise.all([
          fetch('/api/v1/rooms').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/v1/workspaces').then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        const wsMap = new Map((wsRes as any[]).map(w => [w.workspaceId, w]));

        const allRooms: Room[] = Array.isArray(roomRes) ? roomRes : [];
        const meetingRooms = allRooms.filter(r => 
          r.roomId.startsWith('RM-MTG') || r.roomId.startsWith('RM-DLR') || (r as any).roomType === 'MEETING_ROOM'
        );

        let customMap: Record<string, { price: number; image: string }> = {};
        try {
          const customRaw = localStorage.getItem('adminPageCustomization');
          if (customRaw) {
            const customList = JSON.parse(customRaw) as Array<{ id: string; price: number; proPrice: number; image: string }>;
            customList.forEach(r => { customMap[r.id] = { price: r.price, image: r.image }; });
          }
        } catch (e) {}

        if (meetingRooms.length > 0) {
          const merged = meetingRooms.map(backendRoom => {
            const preset = MEETING_ROOMS_CATALOG.find(p => p.roomId === backendRoom.roomId);
            const ws = wsMap.get((backendRoom as any).workspaceId);
            const isDealer = (backendRoom as any).workspaceId?.startsWith('WS-DLR') || ws?.type === 'DEALER_SPACE' || backendRoom.roomId.startsWith('RM-DLR');

            const overridePrice = customMap[backendRoom.roomId]?.price;
            const overrideImage = customMap[backendRoom.roomId]?.image;

            return {
              ...backendRoom,
              pricePerHour: overridePrice ?? backendRoom.pricePerHour,
              image: overrideImage || (backendRoom as any).imageUrl || preset?.image || '/images/meeting-room.jpg',
              tag: isDealer ? `DEALER · ${ws?.name || 'PARTNER'}` : (preset?.tag || 'MEETING ROOM'),
              recommendedFor: isDealer 
                ? `${ws?.name || 'พื้นที่พาร์ทเนอร์'} • ${ws?.location || 'ทำเลคุณภาพ'} (รองรับ ${backendRoom.capacity} ท่าน)`
                : (preset?.recommendedFor || `เหมาะสำหรับทีม ${backendRoom.capacity} ท่าน`),
              features: preset?.features || ['จองออนไลน์สะดวก', 'Fiber WiFi ความเร็วสูง', 'Smart Display / Board', 'เครื่องดื่มและบริการ'],
              pricingRuleDescription: backendRoom.pricingRuleDescription || preset?.pricingRuleDescription || `฿${overridePrice ?? backendRoom.pricePerHour}/ชม.`
            };
          });

          merged.sort((a, b) => a.capacity - b.capacity);
          setRooms(merged);
        } else {
          setRooms(MEETING_ROOMS_CATALOG.map(room => ({
            ...room,
            pricePerHour: customMap[room.roomId]?.price ?? room.pricePerHour,
            image: customMap[room.roomId]?.image ?? room.image,
          })));
        }
      } catch (e) {
        console.warn('Using local meeting rooms catalog:', e);
        setRooms(MEETING_ROOMS_CATALOG);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => {
    if (sizeFilter === 'small') return room.capacity <= 4;
    if (sizeFilter === 'medium') return room.capacity >= 6 && room.capacity <= 12;
    if (sizeFilter === 'large') return room.capacity > 12;
    if (sizeFilter === 'dealer') return room.roomId.startsWith('RM-DLR') || (room as any).workspaceId?.startsWith('WS-DLR') || room.tag?.includes('DEALER');
    if (sizeFilter === 'kmitl') return room.roomId === 'RM-MTG-KMITL';
    if (sizeFilter === 'mii') return room.roomId === 'RM-MTG-MII';
    return true;
  });

  useEffect(() => {
    if (!selectedRoom) return;
    const dur = Number(duration);
    const eqFee = selectedRoom.equipmentFee ?? 150;
    let roomRate = selectedRoom.pricePerHour * dur;
    if (dur >= 8) {
      roomRate = roomRate * 0.8;
    }
    const base = roomRate + eqFee;

    const rate = currentMember.discountRate || (currentMember.tier === 'ENTERPRISE' ? 0.30 : currentMember.tier === 'PRO' ? 0.15 : 0.0);
    const discountAmount = Number((base * rate).toFixed(2));
    const totalPrice = Number((base - discountAmount).toFixed(2));

    const originalRoomRate = selectedRoom.pricePerHour * dur;
    const fullDayDiscount = dur >= 8 ? Number((originalRoomRate * 0.2).toFixed(2)) : 0;

    setQuote({
      originalRoomRate,
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
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);

      setAlert({ 
        type: 'success', 
        text: `🎉 จองห้อง "${selectedRoom.name}" สำเร็จเรียบร้อย! รหัสการจอง: ${data.bookingId}` 
      });
    } catch (e: any) {
      setAlert({ 
        type: 'error', 
        text: e?.message || 'ไม่สามารถส่งคำขอจองได้ กรุณาลองใหม่อีกครั้ง' 
      });
    }

    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA] selection:bg-[#00FF87] selection:text-[#04100C]">
      <Navbar />

      <section className="relative pt-12 pb-14 border-b border-[#00FF87]/15 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF87]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                EXCLUSIVELY MEETING ROOMS
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                ศูนย์รวมห้องประชุมอัจฉริยะ (Smart Meeting Rooms)
              </h1>
              <p className="text-sm text-[#E6F4EA]/70 mt-2 max-w-2xl leading-relaxed">
                คัดสรรเฉพาะพื้นที่ห้องประชุมระดับพรีเมียม เรียงลำดับจาก <strong className="text-[#00FF87]">ขนาดเล็กสุด (2 ท่าน)</strong> ไปจนถึง <strong className="text-[#00FF87]">ขนาดใหญ่สุด (40 ท่าน)</strong> พร้อมระบบ AI Video Conference และเทคโนโลยีฟอกอากาศ
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,135,0.3)] transition hover:scale-105 flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> ดูการจองทั้งหมด
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-[#E6F4EA]/60 flex items-center gap-1.5 mr-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00FF87]" /> กรองตามขนาด:
            </span>
            <button
              onClick={() => setSizeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                sizeFilter === 'all'
                  ? 'bg-[#00FF87] text-[#04140D] shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              ทั้งหมด ({rooms.length} ห้อง)
            </button>
            <button
              onClick={() => setSizeFilter('small')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                sizeFilter === 'small'
                  ? 'bg-[#00FF87] text-[#04140D] shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              ขนาดเล็ก (2 - 4 ท่าน)
            </button>
            <button
              onClick={() => setSizeFilter('medium')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                sizeFilter === 'medium'
                  ? 'bg-[#00FF87] text-[#04140D] shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              ขนาดกลาง (6 - 12 ท่าน)
            </button>
            <button
              onClick={() => setSizeFilter('large')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                sizeFilter === 'large'
                  ? 'bg-[#00FF87] text-[#04140D] shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              ขนาดใหญ่ / Town Hall (20 - 40 ท่าน)
            </button>
            <button
              onClick={() => setSizeFilter('dealer')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                sizeFilter === 'dealer'
                  ? 'bg-teal-400 text-neutral-950 shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                  : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30'
              }`}
            >
              <span>🏢 พื้นที่ Dealer / พาร์ทเนอร์</span>
            </button>
            <button
              onClick={() => setSizeFilter('kmitl')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                sizeFilter === 'kmitl'
                  ? 'bg-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span>🏛️ KMITL Room (สจล.)</span>
            </button>
            <button
              onClick={() => setSizeFilter('mii')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                sizeFilter === 'mii'
                  ? 'bg-teal-400 text-neutral-950 shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                  : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30'
              }`}
            >
              <span>🏨 Mii Space (บางนา-ศรีนครินทร์)</span>
            </button>
          </div>
        </div>
      </section>

      {alert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-2xl flex items-center justify-between ${
            alert.type === 'success' 
              ? 'bg-[#00FF87]/15 border border-[#00FF87]/40 text-[#00FF87]' 
              : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
          }`}>
            <span className="text-xs font-bold">{alert.text}</span>
            <button onClick={() => setAlert(null)} className="text-sm font-bold opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-xs text-[#E6F4EA]/60">
            แสดงห้องประชุม <strong className="text-white">{filteredRooms.length}</strong> ห้อง (เรียงจากเล็ก ➜ ใหญ่)
          </div>
          <div className="text-xs text-[#00FF87] font-bold">
            ✓ อัปเดตราคาและสิทธิพิเศษสมาชิกอัตโนมัติ
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room, index) => (
            <div 
              key={room.roomId}
              className="nature-glass-card rounded-[28px] overflow-hidden border border-[#00FF87]/20 flex flex-col justify-between group hover:border-[#00FF87]/50 hover:shadow-[0_0_30px_rgba(0,255,135,0.15)] transition-all duration-300"
            >
              <div>
                <div className="h-52 relative overflow-hidden bg-black/40">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04100C] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#04100C]/90 backdrop-blur-md text-[10px] font-black text-[#00FF87] border border-[#00FF87]/30 tracking-wider">
                      {room.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white/80 border border-white/10">
                      ลำดับที่ {index + 1}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-[#00FF87] text-[#04140D] text-xs font-black flex items-center gap-1.5 shadow-md">
                    <Users className="w-3.5 h-3.5" />
                    <span>ความจุ: {room.capacity} ท่าน</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-[11px] font-bold text-[#00FF87]/80 mb-1 tracking-wider uppercase">
                    {room.roomId}
                  </div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-[#00FF87] transition">
                    {room.name}
                  </h3>

                  <p className="text-xs text-[#E6F4EA]/70 mt-2 leading-relaxed line-clamp-2">
                    {room.recommendedFor}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {room.features?.map((feat, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#061812] border border-[#00FF87]/15 text-[#E6F4EA]/80"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 text-[11px] text-[#00FF87] font-semibold flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{room.pricingRuleDescription}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#00FF87]/10 mt-2">
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">฿{room.pricePerHour}</span>
                      <span className="text-xs text-[#E6F4EA]/50"> /ชั่วโมง</span>
                    </div>
                    <div className="text-[10px] text-[#00FF87] font-semibold mt-0.5">
                      + ค่าอุปกรณ์ ฿{room.equipmentFee ?? 150} (ต่อการจอง)
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="px-5 py-2.5 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] text-xs font-black uppercase tracking-wider transition hover:scale-105 shadow-[0_0_15px_rgba(0,255,135,0.3)] flex items-center gap-1.5"
                  >
                    จองห้องนี้ <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {selectedRoom && (
        <div className="fixed inset-0 bg-[#020D07]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="border border-[#00FF87]/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl bg-[#061812] text-[#E6F4EA]">
            <div className="flex justify-between items-start pb-4 border-b border-[#00FF87]/15 gap-4">
              <div className="flex items-center gap-3.5">
                {selectedRoom.image && (
                  <img 
                    src={selectedRoom.image} 
                    alt={selectedRoom.name} 
                    className="w-16 h-16 rounded-2xl object-cover border border-[#00FF87]/30 flex-shrink-0"
                  />
                )}
                <div>
                  <div className="text-[10px] font-black text-[#00FF87] uppercase tracking-wider">{selectedRoom.roomId}</div>
                  <h3 className="text-lg sm:text-xl font-black text-white">{selectedRoom.name}</h3>
                  <p className="text-xs text-[#E6F4EA]/60 mt-0.5">ความจุ {selectedRoom.capacity} ท่าน • ค่าห้อง ฿{selectedRoom.pricePerHour}/ชม.</p>
                </div>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="text-[#E6F4EA]/60 hover:text-white font-bold text-lg p-1">✕</button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block text-[#00FF87] font-bold mb-1">วันที่ต้องการจอง</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full bg-[#04100C] border border-[#00FF87]/30 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-[#00FF87]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#00FF87] font-bold mb-1">เวลาเริ่มต้น</label>
                  <input 
                    type="time" 
                    value={startHour} 
                    onChange={e => setStartHour(e.target.value)} 
                    className="w-full bg-[#04100C] border border-[#00FF87]/30 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-[#00FF87]"
                  />
                </div>
                <div>
                  <label className="block text-[#00FF87] font-bold mb-1">ระยะเวลาการใช้งาน</label>
                  <select 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                    className="w-full bg-[#04100C] border border-[#00FF87]/30 rounded-xl px-3 py-2.5 text-white font-semibold outline-none focus:border-[#00FF87]">
                    <option value="1">1 ชั่วโมง</option>
                    <option value="2">2 ชั่วโมง</option>
                    <option value="3">3 ชั่วโมง</option>
                    <option value="4">4 ชั่วโมง (ครึ่งวัน)</option>
                    <option value="8">8 ชั่วโมง (เต็มวัน - ลด 20%)</option>
                  </select>
                </div>
              </div>

              {quote && (
                <div className="bg-[#04100C] border border-[#00FF87]/20 rounded-2xl p-4 space-y-2 mt-4">
                  {quote.fullDayDiscount && quote.fullDayDiscount > 0 ? (
                    <>
                      <div className="flex justify-between text-[#E6F4EA]/70">
                        <span>ค่าห้องปกติ ({quote.durationHours} ชม. × ฿{selectedRoom.pricePerHour}):</span>
                        <span className="line-through text-white/50">฿{quote.originalRoomRate}</span>
                      </div>
                      <div className="flex justify-between text-[#00FF87] font-semibold">
                        <span>ส่วนลดจองเต็มวัน (ลด 20%):</span>
                        <span>-฿{quote.fullDayDiscount}</span>
                      </div>
                      <div className="flex justify-between text-[#E6F4EA]/70">
                        <span>ค่าธรรมเนียมอุปกรณ์ AV & Setup:</span>
                        <span className="font-semibold text-white">+฿{selectedRoom.equipmentFee ?? 150}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-[#E6F4EA]/70">
                        <span>ค่าห้อง ({quote.durationHours} ชม. × ฿{selectedRoom.pricePerHour}):</span>
                        <span className="font-semibold text-white">฿{selectedRoom.pricePerHour * quote.durationHours}</span>
                      </div>
                      <div className="flex justify-between text-[#E6F4EA]/70">
                        <span>ค่าธรรมเนียมอุปกรณ์ AV & Setup:</span>
                        <span className="font-semibold text-white">+฿{selectedRoom.equipmentFee ?? 150}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-[#00FF87]">
                    <span>ส่วนลดสมาชิก ({quote.discountRateTier} Tier - {(quote.discountRate * 100).toFixed(0)}%):</span>
                    <span className="font-bold">-฿{quote.discountAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#00FF87]/15">
                    <span>ยอดสุทธิที่ต้องชำระ:</span>
                    <span className="text-[#00FF87] text-xl font-black">฿{quote.totalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setSelectedRoom(null)} 
                className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition text-xs border border-white/20">
                ยกเลิก
              </button>
              <button 
                onClick={handleBookingConfirm} 
                className="w-2/3 py-3 bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] rounded-xl font-black transition shadow-[0_0_20px_rgba(0,255,135,0.4)] text-xs uppercase tracking-wider">
                ยืนยันการจองห้องประชุม
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
