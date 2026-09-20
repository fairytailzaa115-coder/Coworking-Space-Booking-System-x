'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Coffee,
  Wifi,
  Clock,
  Award,
  Leaf
} from 'lucide-react';

const SERVICES_CARDS = [
  {
    title: 'Smart Meeting Rooms',
    subtitle: 'ห้องประชุมอัจฉริยะ 2 - 40 ท่าน',
    desc: 'พร้อมระบบจอสัมผัส 4K Interactive, กล้อง AI Tracking อัตโนมัติ, ระบบกรองอากาศบริสุทธิ์ PM2.5 และ Acoustic Wall ดูดซับเสียงสะท้อน',
    features: ['จอ 4K / Laser Projector 120 นิ้ว', 'AI Video Conference', 'ไวท์บอร์ดอัจฉริยะ', 'เครื่องฟอกอากาศระดับ Medical Grade'],
    icon: Sparkles,
    tag: '7 รูปแบบห้อง',
    image: '/images/meeting-room.jpg'
  },
  {
    title: 'Solar Hot Desk',
    subtitle: 'โต๊ะทำงานส่วนตัวพลังงานแสงอาทิตย์',
    desc: 'โต๊ะทำงานส่วนตัวในบรรยากาศสวนจำลองร่มรื่น ขับเคลื่อนด้วยระบบโซลาร์เซลล์ 100% สัญญาณ Wi-Fi 6 ความเร็วสูง 1 Gbps พร้อมปลั๊ก Fast Charge ทุกที่นั่ง',
    features: ['พลังงานแสงอาทิตย์ 100%', 'เก้าอี้ Ergonomic Herman Miller', 'Wi-Fi 6 1000 Mbps', 'ปลั๊กไฟ & USB Type-C Fast Charge'],
    icon: Zap,
    tag: 'ยืดหยุ่นรายชั่วโมง',
    image: '/images/hot-desk-room.jpg'
  },
  {
    title: 'Private Office Suites',
    subtitle: 'ออฟฟิศส่วนตัวสำหรับทีมงาน 4 ท่าน',
    desc: 'พื้นที่ทำงานแบบส่วนตัว ปลดล็อกด้วยระบบ Face ID ไร้สัมผัส ควบคุมอุณหภูมิและวัดระดับ CO2 อัจฉริยะ ให้ทีมของคุณโฟกัสกับงานได้อย่างเต็มที่',
    features: ['Biometric Face ID ไร้สัมผัส', 'ระบบควบคุมอุณหภูมิส่วนตัว', 'ตู้เซฟและล็อคเกอร์นิรภัย', 'บริการรับ-ส่งพัสดุและจดหมาย'],
    icon: Building2,
    tag: 'ความเป็นส่วนตัวสูงสุด',
    image: '/images/executive-suite.jpg'
  },
  {
    title: 'Acoustic Sound Pods',
    subtitle: 'ตู้เก็บเสียงส่วนตัวสำหรับการโทรและอัดเสียง',
    desc: 'ตู้โทรศัพท์และตู้ประชุมเดี่ยว กระจกนิรภัย 2 ชั้น บุฉนวน Acoustic Foam ตัดเสียงรบกวนภายนอกได้ถึง 45dB เหมาะสำหรับโทรคุยงานสำคัญ หรืออัด Podcast',
    features: ['เก็บเสียง Soundproof 45dB', 'ไฟวงแหวน Studio Light สำหรับ Video Call', 'พัดลมระบายอากาศเงียบสนิท', 'โต๊ะปรับระดับนั่ง-ยืน'],
    icon: ShieldCheck,
    tag: 'Soundproof 45dB',
    image: '/images/soundproof-booth.jpg'
  }
];

const AMENITIES = [
  { icon: Coffee, title: 'Organic Coffee Bar', desc: 'กาแฟสดออร์แกนิกและชาสมุนไพรฟรีตลอดวัน' },
  { icon: Wifi, title: 'Gigabit Fiber Wi-Fi', desc: 'อินเทอร์เน็ตไฟเบอร์ 1 Gbps เสถียรและปลอดภัย' },
  { icon: Clock, title: '24/7 Access', desc: 'เปิดให้บริการตลอด 24 ชั่วโมง สแกนใบหน้าเข้าได้ตลอดเวลา' },
  { icon: Award, title: 'Eco Certification', desc: 'อาคารประหยัดพลังงานระดับ LEED Platinum และ Zero Emission' }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA] selection:bg-[#00FF87] selection:text-[#04100C]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-16 pb-20 border-b border-[#00FF87]/15 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-[#00FF87]/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse" />
            OUR COMPREHENSIVE WORKSPACE SERVICES
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            บริการพื้นที่ทำงาน & สิ่งอำนวยความสะดวก
          </h1>
          <p className="text-sm sm:text-base text-[#E6F4EA]/70 max-w-2xl mx-auto leading-relaxed">
            เลือกสรรบริการพื้นที่ทำงานที่ตอบโจทย์ทุกความต้องการ ตั้งแต่โต๊ะทำงานเดี่ยว ห้องประชุมอัจฉริยะ ไปจนถึงห้องประชุมใหญ่ระดับ Auditorium
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/calendar"
              className="px-6 py-3 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,135,0.35)] transition hover:scale-105 inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> ดูปฏิทินสถานะห้องว่าง (Calendar)
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-[#00FF87]/30 transition inline-flex items-center gap-2"
            >
              จองห้องทันที <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Detailed Cards */}
      <section className="py-20 border-b border-[#00FF87]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#00FF87] uppercase tracking-widest">SMART SOLUTIONS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              โซลูชันพื้นที่ทำงานเพื่ออนาคต
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES_CARDS.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className="nature-glass-card rounded-[32px] overflow-hidden border border-[#00FF87]/20 hover:border-[#00FF87]/50 transition duration-300 group flex flex-col justify-between"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04100C] via-[#04100C]/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-[#04100C]/90 text-[#00FF87] border border-[#00FF87]/40 shadow-lg backdrop-blur-md">
                        {srv.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">{srv.title}</h3>
                          <div className="text-xs text-[#00FF87] font-semibold">{srv.subtitle}</div>
                        </div>
                      </div>

                      <p className="text-sm text-[#E6F4EA]/70 mt-3 leading-relaxed">
                        {srv.desc}
                      </p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {srv.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-[#E6F4EA]/85">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-[#00FF87]/15 flex items-center justify-between">
                      <Link
                        href="/calendar"
                        className="text-xs font-bold text-[#00FF87] hover:underline flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> เช็กวันว่างในปฏิทิน
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-4 py-2 rounded-xl bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-black text-xs uppercase tracking-wider transition hover:scale-105 inline-flex items-center gap-1.5"
                      >
                        จองพื้นที่นี้ <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 border-b border-[#00FF87]/15 bg-[#061812]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black text-[#00FF87] uppercase tracking-widest">ALL-INCLUSIVE AMENITIES</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              สิ่งอำนวยความสะดวกครบวงจร
            </h2>
            <p className="text-xs sm:text-sm text-[#E6F4EA]/60">
              ทุกการจองพื้นที่รวมบริการระดับพรีเมียมโดยไม่มีค่าใช้จ่ายแฝง
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AMENITIES.map((am, idx) => {
              const Icon = am.icon;
              return (
                <div
                  key={idx}
                  className="nature-glass-card rounded-3xl p-6 border border-[#00FF87]/15 hover:border-[#00FF87]/40 transition text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87] mx-auto">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-black text-white">{am.title}</h3>
                  <p className="text-xs text-[#E6F4EA]/70 leading-relaxed">
                    {am.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities Strip */}
      <section className="py-14 border-t border-[#00FF87]/15 bg-[#04100C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#00FF87]">100%</div>
              <div className="text-xs text-white font-bold">Solar Powered</div>
              <div className="text-[11px] text-[#E6F4EA]/60">พลังงานสะอาดแสงอาทิตย์</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#00FF87]">10+</div>
              <div className="text-xs text-white font-bold">Smart Spaces</div>
              <div className="text-[11px] text-[#E6F4EA]/60">รูปแบบห้องและพื้นที่ครบครัน</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#00FF87]">Zero</div>
              <div className="text-xs text-white font-bold">Double Booking</div>
              <div className="text-[11px] text-[#E6F4EA]/60">ระบบ Concurrency Lock ปลอดภัย</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-[#00FF87]">24/7</div>
              <div className="text-xs text-white font-bold">Biometric Access</div>
              <div className="text-[11px] text-[#E6F4EA]/60">สแกนใบหน้าเข้าใช้งานได้ตลอดเวลา</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
