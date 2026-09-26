'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  CheckCircle2,
  CalendarCheck,
  MapPin,
  Star,
  ChevronRight,
  X,
} from 'lucide-react';

const ROOMS = [
  {
    roomId: 'RM-MTG-KMITL',
    name: 'KMITL Meeting Room',
    fullName: 'ห้องประชุม KMITL Meeting Room',
    location: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง (สจล.)',
    address: 'ลาดกระบัง กรุงเทพมหานคร 10520',
    capacity: 16,
    pricePerHour: 750,
    proPrice: 637.5,
    status: 'AVAILABLE',
    tag: 'ACADEMIC VENUE',
    emoji: '🏛️',
    description:
      'ห้องประชุมระดับพรีเมียมภายในมหาวิทยาลัยเทคโนโลยีชั้นนำ รองรับการประชุมสัมมนาและกิจกรรมทางวิชาการ พร้อมอุปกรณ์ AV ครบครัน ในบรรยากาศวิชาการที่สงบและเป็นส่วนตัว เหมาะสำหรับองค์กรที่ต้องการพื้นที่ประชุมนอกสถานที่คุณภาพสูง',
    features: [
      'จอโปรเจกเตอร์ Full HD ขนาดใหญ่',
      'ระบบเสียง Surround Sound',
      'Video Conference ระบบ Zoom / Teams',
      'ไวท์บอร์ดอิเล็กทรอนิกส์',
      'Wi-Fi Gigabit 1 Gbps',
      'เครื่องปรับอากาศระบบ Inverter',
      'ที่จอดรถฟรีสำหรับผู้ใช้บริการ',
      'บริการเครื่องดื่มต้อนรับ',
    ],
    specs: [
      { icon: '👥', label: 'รองรับ 16 ท่าน' },
      { icon: '🖥️', label: 'Projector Full HD' },
      { icon: '🎙️', label: 'Sound System' },
      { icon: '📶', label: 'Wi-Fi 1 Gbps' },
      { icon: '📷', label: 'Video Conference' },
      { icon: '🚗', label: 'ที่จอดรถฟรี' },
    ],
    gallery: [
      '/images/meeting-room.jpg',
      '/images/executive-strategy-room.jpg',
      '/images/visionary-conference.jpg',
    ],
    reviews: [
      { name: 'ดร. สมชาย วิชาการ', org: 'มหาวิทยาลัยเกษตรศาสตร์', rating: 5, comment: 'ห้องกว้างขวาง อุปกรณ์ครบ ทีมงานบริการดีมาก เหมาะสำหรับสัมมนาระดับองค์กร' },
      { name: 'คุณศิริพร ธุรกิจไทย', org: 'บริษัท ABC จำกัด', rating: 5, comment: 'ประทับใจมากครับ บรรยากาศดี เดินทางสะดวก มีที่จอดรถเพียงพอ' },
    ],
  },
  {
    roomId: 'RM-EXE-KMITL',
    name: 'KMITL Executive Hall',
    fullName: 'ห้องประชุม KMITL Executive Hall',
    location: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง (สจล.)',
    address: 'ลาดกระบัง กรุงเทพมหานคร 10520',
    capacity: 30,
    pricePerHour: 1200,
    proPrice: 1020,
    status: 'AVAILABLE',
    tag: 'PREMIUM HALL',
    emoji: '🏢',
    description:
      'ห้องประชุมขนาดใหญ่สำหรับงานระดับองค์กรและสัมมนาขนาดใหญ่ ตกแต่งด้วยสไตล์ Executive พร้อมระบบเสียงและแสงสว่างระดับมืออาชีพ เหมาะสำหรับการจัดสัมมนา อบรม งานแถลงข่าว หรือกิจกรรมพิเศษที่ต้องการพื้นที่กว้างขวางและสง่างาม',
    features: [
      'จอ LED ขนาด 120 นิ้ว ความละเอียด 4K',
      'ระบบเสียง Premium Surround',
      'Video Conference ระบบ Cisco Webex',
      'โพเดียมสำหรับวิทยากร',
      'Wi-Fi Gigabit 10 Gbps Dedicated',
      'ระบบแสงไฟ Smart Lighting',
      'โซนรับรองแขก (Lounge Area)',
      'บริการ Catering ครบวงจร',
    ],
    specs: [
      { icon: '👥', label: 'รองรับ 30 ท่าน' },
      { icon: '📺', label: 'LED 4K 120 นิ้ว' },
      { icon: '🔊', label: 'Premium Sound' },
      { icon: '📶', label: 'Wi-Fi 10 Gbps' },
      { icon: '🎥', label: 'Cisco Webex' },
      { icon: '🍽️', label: 'Catering บริการ' },
    ],
    gallery: [
      '/images/grand-auditorium.jpg',
      '/images/executive-suite.jpg',
      '/images/summit-boardroom.jpg',
    ],
    reviews: [
      { name: 'คุณวิชัย ผู้บริหาร', org: 'บริษัท TechCorp Thailand', rating: 5, comment: 'ห้องใหญ่มาก บรรยากาศดีเยี่ยม ระบบเสียงระดับมืออาชีพ เหมาะสำหรับงาน Corporate ครับ' },
      { name: 'ดร. มาลี การศึกษา', org: 'กระทรวงศึกษาธิการ', rating: 5, comment: 'จัดสัมมนา 28 คน สะดวกสบายมาก ทีมงานดูแลดีเยี่ยม ประทับใจมากค่ะ' },
    ],
  },
];

export default function KMITLRoomPage() {
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [selectedHours, setSelectedHours] = useState(2);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const ROOM = ROOMS[selectedRoomIndex];
  const totalPrice = ROOM.pricePerHour * selectedHours;

  const handleSelectRoom = (index: number) => {
    setSelectedRoomIndex(index);
    setActiveImage(0);
  };

  const handleBook = () => {
    if (!selectedDate) {
      alert('กรุณาเลือกวันที่จองก่อนครับ');
      return;
    }
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA]">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative pt-6 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#E6F4EA]/50 mb-6">
            <Link href="/" className="hover:text-[#00FF87] transition">หน้าแรก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00FF87] font-semibold">KMITL Room</span>
          </div>

          {/* ── Room Selector Tabs ── */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {ROOMS.map((room, i) => (
              <button
                key={room.roomId}
                type="button"
                onClick={() => handleSelectRoom(i)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${
                  selectedRoomIndex === i
                    ? 'bg-amber-500 border-amber-400 text-[#04100C] shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                    : 'bg-[#061812] border-amber-400/20 text-[#E6F4EA]/70 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                <span>{room.emoji}</span>
                <span>{room.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  selectedRoomIndex === i
                    ? 'bg-[#04100C]/20 text-[#04100C]'
                    : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {room.capacity} ท่าน
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Gallery */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden border border-amber-400/30 shadow-[0_0_40px_rgba(251,191,36,0.1)] h-[380px] lg:h-[440px]">
                <img
                  src={ROOM.gallery[activeImage]}
                  alt={ROOM.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04100C]/60 via-transparent to-transparent" />
                {/* Tag */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold backdrop-blur-md">
                  {ROOM.emoji} {ROOM.tag}
                </div>
                {/* Status */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  พร้อมให้บริการ
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3">
                {ROOM.gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 flex-1 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Room Info + Booking Panel */}
            <div className="lg:col-span-5 space-y-5">
              {/* Room Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">KMITL EXCLUSIVE</span>
                </div>
                <h1 className="text-3xl font-black text-white leading-tight">{ROOM.fullName}</h1>
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00FF87] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#E6F4EA]/70 leading-relaxed">{ROOM.location}</p>
                    <p className="text-[11px] text-[#E6F4EA]/40">{ROOM.address}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-[#E6F4EA]/60 ml-1">5.0 · {ROOM.reviews.length} รีวิว</span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2">
                {ROOM.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#061812] border border-amber-400/15 text-xs text-[#E6F4EA]/80 font-medium">
                    <span>{s.icon}</span> {s.label}
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="p-5 rounded-2xl bg-[#061812] border border-amber-400/20">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <span className="text-3xl font-black text-white">฿{ROOM.pricePerHour.toLocaleString()}</span>
                    <span className="text-xs text-[#E6F4EA]/60"> /ชั่วโมง</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-amber-400 font-semibold">สมาชิก Pro</div>
                    <div className="text-sm font-bold text-amber-300">฿{ROOM.proPrice.toFixed(0)}/ชม.</div>
                  </div>
                </div>

                {/* Duration Picker */}
                <div className="mb-3">
                  <label className="text-xs text-[#E6F4EA]/60 mb-2 block">ระยะเวลา</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 6, 8].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHours(h)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedHours === h
                            ? 'bg-amber-500 text-[#04100C] shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                            : 'bg-white/5 text-[#E6F4EA]/70 hover:bg-white/10'
                        }`}
                      >
                        {h} ชม.
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-amber-400/15 flex items-center justify-between">
                  <div className="text-xs text-[#E6F4EA]/60">รวม {selectedHours} ชม.</div>
                  <div className="text-xl font-black text-white">฿{totalPrice.toLocaleString()}</div>
                </div>
              </div>

              {/* Book Button */}
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#04100C] font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(251,191,36,0.35)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" />
                จองห้อง {ROOM.name}
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-xs text-[#E6F4EA]/50 hover:text-[#E6F4EA]/80 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้าแรก
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Description & Features ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* About */}
            <div>
              <h2 className="text-2xl font-black text-white mb-4">เกี่ยวกับห้องประชุม</h2>
              <p className="text-sm text-[#E6F4EA]/70 leading-relaxed mb-6">{ROOM.description}</p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">ที่ตั้ง</span>
                </div>
                <p className="text-xs text-[#E6F4EA]/70">{ROOM.location}</p>
                <p className="text-xs text-[#E6F4EA]/50 mt-0.5">{ROOM.address}</p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-black text-white mb-4">สิ่งอำนวยความสะดวก</h2>
              <div className="grid grid-cols-1 gap-2">
                {ROOM.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[#061812] border border-[#00FF87]/10">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF87] flex-shrink-0" />
                    <span className="text-sm text-[#E6F4EA]/80">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-white mb-6">รีวิวจากผู้ใช้งาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROOM.reviews.map((r, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#061812] border border-[#00FF87]/10">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#E6F4EA]/80 leading-relaxed mb-4">"{r.comment}"</p>
                <div>
                  <div className="text-xs font-bold text-white">{r.name}</div>
                  <div className="text-[11px] text-[#E6F4EA]/50">{r.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking Modal ── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#061812] border border-amber-400/30 shadow-2xl p-8 relative">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">จองสำเร็จ!</h3>
                <p className="text-sm text-[#E6F4EA]/60">ระบบจะส่งยืนยันไปยังอีเมลของคุณ</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xl">
                    {ROOM.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">จอง {ROOM.name}</h3>
                    <p className="text-xs text-[#E6F4EA]/60">สจล. ลาดกระบัง</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">ชื่อผู้จอง</label>
                    <input
                      type="text"
                      value={memberName}
                      onChange={e => setMemberName(e.target.value)}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-amber-400/60 text-white text-sm outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">อีเมล</label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-amber-400/60 text-white text-sm outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">วันที่</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-amber-400/60 text-white text-sm outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">เวลาเริ่ม</label>
                      <select
                        value={selectedTime}
                        onChange={e => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-amber-400/60 text-white text-sm outline-none transition"
                      >
                        {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">ระยะเวลา</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 6, 8].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHours(h)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedHours === h
                              ? 'bg-amber-500 text-[#04100C]'
                              : 'bg-white/5 text-[#E6F4EA]/70 hover:bg-white/10'
                          }`}
                        >
                          {h} ชม.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-amber-400/15 flex items-center justify-between mb-5">
                  <span className="text-xs text-[#E6F4EA]/60">รวมทั้งหมด ({selectedHours} ชม.)</span>
                  <span className="text-2xl font-black text-white">฿{totalPrice.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={handleBook}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#04100C] font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                >
                  ยืนยันการจอง
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
