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

const MII_SPACE = {
  roomId: 'RM-MTG-MII',
  name: 'Mii Space',
  fullName: 'ห้องประชุม Mii Space',
  location: 'ห้องประชุมโรงแรม บางนา-ศรีนครินทร์',
  address: 'ถนนศรีนครินทร์ บางนา กรุงเทพมหานคร 10260',
  capacity: 10,
  pricePerHour: 550,
  proPrice: 467.5,
  status: 'AVAILABLE',
  image: '/images/executive-suite.jpg',
  tag: 'HOTEL VENUE',
  description:
    'ห้องประชุมระดับโรงแรมสุดพรีเมียมย่านบางนา-ศรีนครินทร์ รองรับการประชุมทางธุรกิจระดับมืออาชีพ ตกแต่งอย่างหรูหราด้วยเฟอร์นิเจอร์คุณภาพสูง พร้อมบริการอาหารว่างและเครื่องดื่มโรงแรม เหมาะสำหรับการประชุม สัมภาษณ์ และการเจรจาธุรกิจระดับ Executive',
  features: [
    'จอ LED ขนาด 65 นิ้ว 4K Ultra HD',
    'ระบบ Video Conference ครบชุด',
    'ไมโครโฟนไร้สาย Wireless Mic',
    'กระดานไวท์บอร์ดแม่เหล็ก',
    'Wi-Fi ความเร็วสูง 500 Mbps',
    'บริการอาหารว่างและเครื่องดื่ม',
    'ที่จอดรถโรงแรมสำหรับผู้ใช้บริการ',
    'บริการต้อนรับจาก Concierge',
  ],
  specs: [
    { icon: '👥', label: 'รองรับ 10 ท่าน' },
    { icon: '🖥️', label: 'LED 65" 4K' },
    { icon: '🎙️', label: 'Wireless Mic' },
    { icon: '📶', label: 'Wi-Fi 500 Mbps' },
    { icon: '☕', label: 'บริการเครื่องดื่ม' },
    { icon: '🚗', label: 'ที่จอดรถฟรี' },
  ],
  gallery: [
    '/images/executive-suite.jpg',
    '/images/meeting-room.jpg',
    '/images/soundproof-booth.jpg',
  ],
  reviews: [
    { name: 'คุณวิชัย พาณิชย์', org: 'บริษัท XYZ Group', rating: 5, comment: 'ห้องสวยงามมาก บรรยากาศเป็นมืออาชีพ เหมาะสำหรับการประชุมระดับ Executive สุดๆ' },
    { name: 'คุณพิมพ์ใจ สตาร์ทอัพ', org: 'Startup Thailand', rating: 5, comment: 'บริการดีเยี่ยม อาหารว่างอร่อย ทีมงานเอาใจใส่ดีมาก จะกลับมาใช้บริการอีกแน่นอน' },
  ],
};

export default function MiiSpacePage() {
  const [selectedHours, setSelectedHours] = useState(2);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const totalPrice = MII_SPACE.pricePerHour * selectedHours;

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

      {/* ── Hero ── */}
      <section className="relative pt-6 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#E6F4EA]/50 mb-6">
            <Link href="/" className="hover:text-[#00FF87] transition">หน้าแรก</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-teal-400 font-semibold">Mii Space</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Gallery */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative rounded-3xl overflow-hidden border border-teal-400/30 shadow-[0_0_40px_rgba(45,212,191,0.1)] h-[380px] lg:h-[440px]">
                <img
                  src={MII_SPACE.gallery[activeImage]}
                  alt="Mii Space"
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04100C]/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold backdrop-blur-md">
                  🏨 {MII_SPACE.tag}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  พร้อมให้บริการ
                </div>
              </div>
              <div className="flex gap-3">
                {MII_SPACE.gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-20 flex-1 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.4)]' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info + Booking */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-black text-teal-400 uppercase tracking-widest">MII SPACE EXCLUSIVE</span>
                <h1 className="text-3xl font-black text-white leading-tight mt-1">{MII_SPACE.fullName}</h1>
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00FF87] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#E6F4EA]/70 leading-relaxed">{MII_SPACE.location}</p>
                    <p className="text-[11px] text-[#E6F4EA]/40">{MII_SPACE.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-teal-400 text-teal-400" />
                ))}
                <span className="text-xs text-[#E6F4EA]/60 ml-1">5.0 · {MII_SPACE.reviews.length} รีวิว</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {MII_SPACE.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#061812] border border-teal-400/15 text-xs text-[#E6F4EA]/80 font-medium">
                    <span>{s.icon}</span> {s.label}
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-[#061812] border border-teal-400/20">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <span className="text-3xl font-black text-white">฿{MII_SPACE.pricePerHour.toLocaleString()}</span>
                    <span className="text-xs text-[#E6F4EA]/60"> /ชั่วโมง</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-teal-400 font-semibold">สมาชิก Pro</div>
                    <div className="text-sm font-bold text-teal-300">฿{MII_SPACE.proPrice.toFixed(0)}/ชม.</div>
                  </div>
                </div>
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
                            ? 'bg-teal-500 text-[#04100C] shadow-[0_0_12px_rgba(45,212,191,0.4)]'
                            : 'bg-white/5 text-[#E6F4EA]/70 hover:bg-white/10'
                        }`}
                      >
                        {h} ชม.
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-teal-400/15 flex items-center justify-between">
                  <div className="text-xs text-[#E6F4EA]/60">รวม {selectedHours} ชม.</div>
                  <div className="text-xl font-black text-white">฿{totalPrice.toLocaleString()}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="w-full py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#04100C] font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" />
                จองห้อง Mii Space
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
            <div>
              <h2 className="text-2xl font-black text-white mb-4">เกี่ยวกับห้องประชุม</h2>
              <p className="text-sm text-[#E6F4EA]/70 leading-relaxed mb-6">{MII_SPACE.description}</p>
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-bold text-teal-300">ที่ตั้ง</span>
                </div>
                <p className="text-xs text-[#E6F4EA]/70">{MII_SPACE.location}</p>
                <p className="text-xs text-[#E6F4EA]/50 mt-0.5">{MII_SPACE.address}</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-4">สิ่งอำนวยความสะดวก</h2>
              <div className="grid grid-cols-1 gap-2">
                {MII_SPACE.features.map((f, i) => (
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
            {MII_SPACE.reviews.map((r, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#061812] border border-[#00FF87]/10">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
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
          <div className="w-full max-w-md rounded-3xl bg-[#061812] border border-teal-400/30 shadow-2xl p-8 relative">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">จองสำเร็จ!</h3>
                <p className="text-sm text-[#E6F4EA]/60">ระบบจะส่งยืนยันไปยังอีเมลของคุณ</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-xl">🏨</div>
                  <div>
                    <h3 className="text-lg font-black text-white">จอง Mii Space</h3>
                    <p className="text-xs text-[#E6F4EA]/60">บางนา-ศรีนครินทร์</p>
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-teal-400/60 text-white text-sm outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">อีเมล</label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-teal-400/60 text-white text-sm outline-none transition"
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
                        className="w-full px-3 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-teal-400/60 text-white text-sm outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#E6F4EA]/60 block mb-1.5">เวลาเริ่ม</label>
                      <select
                        value={selectedTime}
                        onChange={e => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#04100C] border border-[#00FF87]/20 focus:border-teal-400/60 text-white text-sm outline-none transition"
                      >
                        {['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'].map(t => (
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
                              ? 'bg-teal-500 text-[#04100C]'
                              : 'bg-white/5 text-[#E6F4EA]/70 hover:bg-white/10'
                          }`}
                        >
                          {h} ชม.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-teal-400/15 flex items-center justify-between mb-5">
                  <span className="text-xs text-[#E6F4EA]/60">รวมทั้งหมด ({selectedHours} ชม.)</span>
                  <span className="text-2xl font-black text-white">฿{totalPrice.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={handleBook}
                  className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#04100C] font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.3)]"
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
