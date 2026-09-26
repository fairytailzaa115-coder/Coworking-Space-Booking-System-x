'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Leaf, 
  ArrowUpRight, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  BatteryCharging, 
  CheckCircle2, 
  ArrowRight,
  MonitorPlay,
  Layers,
  Wind,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2
} from 'lucide-react';

export default function LandingPage() {
  // ── Slideshow state ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Room dropdown state ──
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Admin customization state ──
  const [customData, setCustomData] = useState<Record<string, { price: number; proPrice: number; image: string }>>({});
  const [membershipCustom, setMembershipCustom] = useState<Record<string, { price: number; quotaText?: string; discountText?: string }>>({
    BASIC: { price: 0, quotaText: 'โควตาจอง 20 ชม./เดือน' },
    PRO: { price: 100, quotaText: 'ส่วนลด 15% ทุกห้อง • โควตา 80 ชม.' },
    ENTERPRISE: { price: 150, quotaText: 'ส่วนลด 30% ทุกห้อง • โควตา Unlimited' }
  });

  // Load admin customization from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminPageCustomization');
      if (saved) {
        const parsed = JSON.parse(saved) as Array<{ id: string; price: number; proPrice: number; image: string }>;
        const map: Record<string, { price: number; proPrice: number; image: string }> = {};
        parsed.forEach(r => { map[r.id] = { price: r.price, proPrice: r.proPrice, image: r.image }; });
        setCustomData(map);
      }
    } catch { /* ignore */ }

    try {
      const savedMem = localStorage.getItem('adminMembershipCustomization');
      if (savedMem) {
        const parsedMem = JSON.parse(savedMem);
        setMembershipCustom(prev => ({ ...prev, ...parsedMem }));
      }
    } catch { /* ignore */ }
  }, []);

  // ── Dynamic Workspaces & Dealer Rooms ──
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [roomList, setRoomList] = useState<any[]>([]);

  useEffect(() => {
    const loadSpacesAndRooms = async () => {
      try {
        const [wsRes, rmRes, memRes] = await Promise.all([
          fetch('/api/v1/workspaces').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/v1/rooms').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/v1/memberships').then(r => r.ok ? r.json() : []).catch(() => [])
        ]);
        if (Array.isArray(wsRes)) setWorkspaceList(wsRes);
        if (Array.isArray(rmRes)) setRoomList(rmRes);
        if (Array.isArray(memRes) && memRes.length > 0) {
          setMembershipCustom(prev => {
            const next = { ...prev };
            memRes.forEach((m: any) => {
              const tier = m.tier?.toUpperCase();
              if (tier && next[tier]) {
                next[tier] = { ...next[tier], price: Number(m.priceMonthly) };
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.warn('Failed to load workspaces, rooms or memberships:', err);
      }
    };
    loadSpacesAndRooms();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoomDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const slides = [
    {
      image: customData['RM-MTG-201']?.image ?? customData['slide-meeting']?.image ?? '/images/summit-boardroom.jpg',
      badge: '● ระบบ AI Video Conference & ผนังมอสส์ธรรมชาติ',
      tag: 'PREMIUM ROOM',
      available: true,
      title: 'Summit Smart Boardroom (8-P)',
      desc: 'สัมผัสประสบการณ์ประชุมระดับผู้บริหารท่ามกลางทัศนียภาพป่าไม้ ผนังต้นไม้ฟอกอากาศลด CO2 ให้สมองปลอดโปร่ง พร้อมหน้าจอสัมผัส Interactive 4K รองรับ Zoom, Teams และ Google Meet',
      specs: [
        { icon: '👥', label: 'รองรับ 8 ท่าน' },
        { icon: '🖥️', label: 'Dual 4K Displays' },
        { icon: '💨', label: 'Air Quality Sensor' },
        { icon: '📶', label: '1 Gbps Fiber WiFi' },
      ],
      price: customData['RM-MTG-201']?.price ?? customData['slide-meeting']?.price ?? 450,
      proPrice: customData['RM-MTG-201']?.proPrice ?? customData['slide-meeting']?.proPrice ?? 382.50,
    },
    {
      image: customData['RM-OFF-301']?.image ?? customData['slide-executive']?.image ?? '/images/executive-suite.jpg',
      badge: '● Biometric Security & HEPA Air Filtration',
      tag: 'PRIVATE SUITE',
      available: true,
      title: 'Executive Eco Suite Alpha (4-6P)',
      desc: 'ห้องทำงานส่วนตัวสำหรับทีม ความปลอดภัยด้วยระบบสแกนใบหน้า ควบคุมอุณหภูมิอัตโนมัติ และระบบกรองอากาศ HEPA Filter ระดับการแพทย์ เหมาะสำหรับทีมที่ต้องการความเป็นส่วนตัวสูงสุด',
      specs: [
        { icon: '👥', label: 'รองรับ 4-6 ท่าน' },
        { icon: '🔒', label: 'Face ID Lock' },
        { icon: '🌡️', label: 'Smart Thermostat' },
        { icon: '📶', label: '1 Gbps Fiber WiFi' },
      ],
      price: customData['RM-OFF-301']?.price ?? customData['slide-executive']?.price ?? 600,
      proPrice: customData['RM-OFF-301']?.proPrice ?? customData['slide-executive']?.proPrice ?? 510,
    },
    {
      image: customData['RM-HOT-101']?.image ?? customData['slide-hotdesk']?.image ?? '/images/hot-desk-room.jpg',
      badge: '● พลังงานแสงอาทิตย์ 100% & Fast-Charge Ports',
      tag: 'HOT DESK',
      available: true,
      title: 'Hot Desk Solar Pod (Individual)',
      desc: 'โต๊ะทำงานส่วนตัวท่ามกลางธรรมชาติจำลอง ใช้ไฟพลังงานแสงอาทิตย์ 100% พร้อมพอร์ต Fast-Charge ทุกจุด และ WiFi 6E ความเร็วสูงสุด เหมาะกับฟรีแลนซ์และนักเขียนโค้ด',
      specs: [
        { icon: '👤', label: '1 ท่าน' },
        { icon: '⚡', label: 'Fast-Charge 140W' },
        { icon: '☀️', label: 'Solar Power 100%' },
        { icon: '📶', label: 'WiFi 6E 2 Gbps' },
      ],
      price: customData['RM-HOT-101']?.price ?? customData['slide-hotdesk']?.price ?? 80,
      proPrice: customData['RM-HOT-101']?.proPrice ?? customData['slide-hotdesk']?.proPrice ?? 68,
    },
    {
      image: customData['RM-PHN-401']?.image ?? customData['slide-soundproof']?.image ?? '/images/soundproof-booth.jpg',
      badge: '● กระจกนิรภัย 2 ชั้น & Acoustic Foam',
      tag: 'PHONE BOOTH',
      available: true,
      title: 'Acoustic Sound Pod #1 (Private)',
      desc: 'ตู้เก็บเสียงกระจกนิรภัย 2 ชั้น บุด้วย Acoustic Foam คุณภาพสูง เหมาะสำหรับการคุยโทรศัพท์งานสำคัญ สัมภาษณ์ออนไลน์ หรือ Podcast Recording อย่างเป็นส่วนตัวสมบูรณ์แบบ',
      specs: [
        { icon: '👤', label: '1 ท่าน' },
        { icon: '🔇', label: 'Soundproof 45dB' },
        { icon: '🎙️', label: 'Podcast Ready' },
        { icon: '📶', label: 'WiFi 500 Mbps' },
      ],
      price: customData['RM-PHN-401']?.price ?? customData['slide-soundproof']?.price ?? 50,
      proPrice: customData['RM-PHN-401']?.proPrice ?? customData['slide-soundproof']?.proPrice ?? 42.50,
    },
  ];

  const roomsList = [
    {
      id: 'RM-MTG-201',
      title: 'Smart Meeting Room (8-P)',
      category: 'Meeting & Conference',
      desc: 'ห้องประชุมระบบ Eco-Smart ผนังต้นไม้ฟอกอากาศ จอสัมผัส 4K พร้อมระบบ AI Video Conference และระบบควบคุม CO2 ต่ำ',
      price: customData['RM-MTG-201']?.price ?? customData['slide-meeting']?.price ?? 450,
      capacity: 'สูงสุด 8 ท่าน',
      badge: 'พร้อมอุปกรณ์ AV เต็มรูปแบบ',
      image: customData['RM-MTG-201']?.image ?? customData['slide-meeting']?.image ?? '/images/summit-boardroom.jpg'
    },
    {
      id: 'RM-HOT-101',
      title: 'Hot Desk Solar Pod',
      category: 'Individual Workspace',
      desc: 'โต๊ะทำงานส่วนตัวท่ามกลางธรรมชาติจำลอง ใช้ไฟพลังงานแสงอาทิตย์ 100% พร้อมพอร์ต Fast-Charge และ WiFi 6E',
      price: customData['RM-HOT-101']?.price ?? customData['slide-hotdesk']?.price ?? 80,
      capacity: '1 ท่าน',
      badge: 'ลด 20% เมื่อจอง 8 ชม.+',
      image: customData['RM-HOT-101']?.image ?? customData['slide-hotdesk']?.image ?? '/images/hot-desk-room.jpg'
    },
    {
      id: 'RM-OFF-301',
      title: 'Executive Eco Suite Alpha',
      category: 'Private Office Hub',
      desc: 'ห้องทำงานส่วนตัวสำหรับทีม 4-6 ท่าน ความปลอดภัยด้วยการสแกนใบหน้าและระบบกรองอากาศ Hepa Filter ระดับการแพทย์',
      price: customData['RM-OFF-301']?.price ?? customData['slide-executive']?.price ?? 600,
      capacity: '4-6 ท่าน',
      badge: 'ส่วนลด 25% เมื่อจอง 24 ชม.+',
      image: customData['RM-OFF-301']?.image ?? customData['slide-executive']?.image ?? '/images/executive-suite.jpg'
    },
    {
      id: 'RM-PHN-401',
      title: 'Acoustic Sound Pod #1',
      category: 'Private Booth',
      desc: 'ตู้เก็บเสียงกระจกนิรภัย 2 ชั้น เหมาะสำหรับการคุยโทรศัพท์งานสำคัญหรือสัมภาษณ์ออนไลน์อย่างเป็นส่วนตัว',
      price: customData['RM-PHN-401']?.price ?? customData['slide-soundproof']?.price ?? 50,
      capacity: '1 ท่าน',
      badge: 'คิดราคาตามช่วงเวลาจริง',
      image: customData['RM-PHN-401']?.image ?? customData['slide-soundproof']?.image ?? '/images/soundproof-booth.jpg'
    }
  ];

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);

  // Auto-play every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];



  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA] selection:bg-[#00FF87] selection:text-[#04100C]">
      <Navbar />

      {/* =========================================================================
          HERO SECTION (Matching Reference: Big "TECH NATURE" + Glowing Floating Nodes)
         ========================================================================= */}
      <section className="relative pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden border-b border-[#00FF87]/15">
        
        {/* Background Ambience & Gradient Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#00FF87]/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-extrabold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping"></span>
                The Intersection of Technology and Nature
              </div>

              {/* Big TECH NATURE Title */}
              <div className="space-y-0">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none">
                  TECH
                </h1>
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#00FF87] tracking-tight leading-none drop-shadow-[0_0_35px_rgba(0,255,135,0.4)]">
                  NATURE
                </h1>
              </div>

              <p className="text-sm sm:text-base text-[#E6F4EA]/70 max-w-lg leading-relaxed pt-2">
                From energy-saving devices to green architecture, we're dedicated to preserving the planet while enhancing everyday life. Join us in building a harmonious balance between nature and workspace.
              </p>

              {/* Buttons matching reference */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="px-8 py-3.5 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,135,0.4)] transition hover:scale-105">
                  Get Started
                </Link>
                <Link 
                  href="/#rooms" 
                  className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition">
                  Read More
                </Link>
              </div>

              {/* Room Selection Dropdown */}
              <div className="pt-2" ref={dropdownRef}>
                <p className="text-xs text-[#E6F4EA]/60 mb-2 font-semibold uppercase tracking-wider">เลือกห้องประชุมที่ต้องการจอง</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoomDropdownOpen(prev => !prev)}
                    className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#061812] border border-[#00FF87]/30 hover:border-[#00FF87]/70 text-white text-sm font-bold transition-all shadow-lg min-w-[240px]"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#00FF87]" />
                      เลือกห้องประชุม
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#00FF87] transition-transform duration-200 ${roomDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {roomDropdownOpen && (
                    <div className="absolute top-full mt-2 left-0 z-50 w-full sm:w-[360px] max-h-[420px] overflow-y-auto rounded-2xl border border-[#00FF87]/30 bg-[#061812] shadow-[0_8px_32px_rgba(0,0,0,0.7)] p-2 space-y-1">
                      {/* Section 1: Official Hubs */}
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00FF87]/70">
                        พื้นที่หลัก / ศูนย์การศึกษา
                      </div>

                      {/* KMITL Room */}
                      <button
                        type="button"
                        onClick={() => { setRoomDropdownOpen(false); router.push('/kmitl-room'); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-amber-500/10 hover:border-amber-400/30 border border-transparent transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-base flex-shrink-0">
                          🏛️
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">KMITL Room</div>
                          <div className="text-[10px] text-[#E6F4EA]/60 truncate">สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง</div>
                          <div className="text-[10px] text-amber-400 font-semibold mt-0.5">฿750/ชม. · 16 ท่าน</div>
                        </div>
                      </button>

                      {/* Mii Space */}
                      <button
                        type="button"
                        onClick={() => { setRoomDropdownOpen(false); router.push('/mii-space'); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-teal-500/10 hover:border-teal-400/30 border border-transparent transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-base flex-shrink-0">
                          🏨
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">Mii Space Hotel</div>
                          <div className="text-[10px] text-[#E6F4EA]/60 truncate">ห้องประชุมโรงแรม บางนา-ศรีนครินทร์</div>
                          <div className="text-[10px] text-teal-400 font-semibold mt-0.5">฿550/ชม. · 10 ท่าน</div>
                        </div>
                      </button>

                      {/* Victor Club */}
                      <button
                        type="button"
                        onClick={() => { setRoomDropdownOpen(false); router.push('/dashboard?roomId=RM-MTG-VICTOR-FYI'); }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-400/30 border border-transparent transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-base flex-shrink-0">
                          🏢
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">Victor Club</div>
                          <div className="text-[10px] text-[#E6F4EA]/60 truncate">FYI Center Meeting Room</div>
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">฿200/ชม. · 12 ท่าน</div>
                        </div>
                      </button>

                      {workspaceList.filter(ws => ws.workspaceId !== 'WS-ASOKE' && ws.workspaceId !== 'WS-KMITL' && ws.workspaceId !== 'WS-MII').length > 0 && (
                        workspaceList
                          .filter(ws => ws.workspaceId !== 'WS-ASOKE' && ws.workspaceId !== 'WS-KMITL' && ws.workspaceId !== 'WS-MII')
                          .map(ws => {
                            const wsRooms = roomList.filter(r => r.workspaceId === ws.workspaceId);
                            if (wsRooms.length === 0) {
                              return (
                                <button
                                  key={ws.workspaceId}
                                  type="button"
                                  onClick={() => { setRoomDropdownOpen(false); router.push(`/rooms`); }}
                                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-teal-500/10 hover:border-teal-400/30 border border-transparent transition-all text-left group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-base flex-shrink-0">
                                    🏢
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">{ws.name}</div>
                                    <div className="text-[10px] text-[#E6F4EA]/60 truncate">{ws.location}</div>
                                  </div>
                                </button>
                              );
                            }

                            return wsRooms.map(rm => (
                              <button
                                key={rm.roomId}
                                type="button"
                                onClick={() => {
                                  setRoomDropdownOpen(false);
                                  router.push(`/dashboard?roomId=${rm.roomId}`);
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-teal-500/10 hover:border-teal-400/30 border border-transparent transition-all text-left group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-base flex-shrink-0">
                                  🏢
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                                    {rm.name}
                                  </div>
                                  <div className="text-[10px] text-[#E6F4EA]/60 truncate">
                                    {ws.name} • {ws.location}
                                  </div>
                                  <div className="text-[10px] text-teal-400 font-semibold mt-0.5">
                                    ฿{rm.pricePerHour}/ชม. · รองรับ {rm.capacity} ท่าน
                                  </div>
                                </div>
                              </button>
                            ));
                          })
                      )}

                      {/* View All Rooms Footer */}
                      <div className="pt-2 mt-1 border-t border-[#00FF87]/20">
                        <button
                          type="button"
                          onClick={() => { setRoomDropdownOpen(false); router.push('/rooms'); }}
                          className="w-full py-2 px-3 text-center text-xs font-extrabold text-[#00FF87] hover:bg-[#00FF87]/15 rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <span>ดูห้องประชุมทั้งหมด</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-feature line */}
              <div className="pt-4 border-t border-[#00FF87]/15 flex items-center gap-3 text-xs text-[#E6F4EA]/60">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00FF87]"></div>
                <span>Pioneering green tech for eco-conscious living and smart coworking</span>
              </div>
            </div>

            {/* Right Column: Terrarium & Floating Interactive Nodes (Exact Reference Look) */}
            <div className="lg:col-span-6 relative">
              
              {/* Main Hero Showcase Card */}
              <div className="relative rounded-[32px] overflow-hidden border border-[#00FF87]/30 shadow-[0_0_50px_rgba(0,255,135,0.15)] group">
                <img 
                  src="/images/hero-bg.jpg" 
                  alt="Green Tech Terrarium Ecosystem" 
                  className="w-full h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04100C] via-transparent to-black/20"></div>

                {/* Floating Card 1: 578M+ Clients Active (Top Right) */}
                <div className="absolute top-5 right-5 nature-glass-card rounded-2xl p-3 px-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#00FF87] flex items-center justify-center text-[#04140D] font-black text-[10px]">AK</div>
                    <div className="w-7 h-7 rounded-full bg-teal-400 flex items-center justify-center text-[#04140D] font-black text-[10px]">ST</div>
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-[10px]">+</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white leading-tight">578M +</div>
                    <div className="text-[10px] text-[#00FF87]/80 leading-tight">Clients Active</div>
                  </div>
                </div>

                {/* Floating Card 2: Green Innovation (Middle Overlay) */}
                <div className="absolute bottom-6 left-6 right-6 nature-glass-card rounded-2xl p-4.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">Green Innovation</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87]"></span>
                    </div>
                    <p className="text-[11px] text-[#E6F4EA]/70">Join us in building harmonious balance between nature & tech</p>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="w-9 h-9 rounded-xl bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] flex items-center justify-center shadow-lg transition">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED ROOM: SMART MEETING ROOM SHOWCASE (With Real Photo)
         ========================================================================= */}
      <section id="rooms" className="py-20 lg:py-28 relative border-b border-[#00FF87]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-black text-[#00FF87] uppercase tracking-widest">SMART SPACES & ROOMS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                ห้องประชุมและพื้นที่ทำงานชีวภาพ (Biophilic Meeting Room)
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,135,0.3)] transition flex items-center gap-1.5">
                จองพื้นที่ทำงานและห้องประชุมทั้งหมด <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Big Featured Meeting Room Hero Card with Slider Controls */}
          <div className="nature-glass-card rounded-[36px] overflow-hidden border border-[#00FF87]/30 grid grid-cols-1 lg:grid-cols-12 gap-0 mb-8 relative group/card">
            
            {/* Real Meeting Room Image & Slide overlay */}
            <div className="lg:col-span-7 relative h-[380px] lg:h-[490px] overflow-hidden bg-black/40">
              <img 
                key={slide.image}
                src={slide.image} 
                alt={slide.title} 
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isTransitioning ? 'opacity-40 scale-105' : 'opacity-100 scale-100'
                }`}
              />
              
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04100C]/80 via-transparent to-[#04100C]/30" />

              {/* Tag Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#04100C]/85 backdrop-blur-md border border-[#00FF87]/40 text-[#00FF87] text-xs font-bold shadow-lg">
                {slide.badge}
              </div>

              {/* Slider Counter */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
                {currentSlide + 1} / {slides.length}
              </div>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#04100C]/75 hover:bg-[#00FF87] text-white hover:text-[#04100C] border border-[#00FF87]/30 flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xl opacity-90 hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#04100C]/75 hover:bg-[#00FF87] text-white hover:text-[#04100C] border border-[#00FF87]/30 flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-xl opacity-90 hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === idx 
                        ? 'w-6 h-2 bg-[#00FF87] shadow-[0_0_10px_#00FF87]' 
                        : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Room Details & Pricing */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between bg-[#061812]/95 border-t lg:border-t-0 lg:border-l border-[#00FF87]/20">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-[#00FF87] uppercase tracking-wider">{slide.tag}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
                    AVAILABLE NOW
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white min-h-[4rem] flex items-center">
                  {slide.title}
                </h3>
                <p className="text-xs text-[#E6F4EA]/70 mt-2 leading-relaxed min-h-[4.5rem]">
                  {slide.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6 text-xs text-[#E6F4EA]/80">
                  {slide.specs.map((item, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-[#04100C] border border-[#00FF87]/15 flex items-center gap-2 font-medium">
                      <span className="text-sm">{item.icon}</span> {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#00FF87]/15 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-white">฿{slide.price}</span>
                  <span className="text-xs text-[#E6F4EA]/60"> /ชั่วโมง</span>
                  <div className="text-[11px] text-[#00FF87] font-semibold mt-0.5">
                    สมาชิก Pro ลดเหลือ ฿{slide.proPrice.toFixed(2)}
                  </div>
                </div>

                <Link 
                  href="/dashboard" 
                  className="px-6 py-3 rounded-full bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,135,0.4)] transition hover:scale-105">
                  จองห้องนี้ทันที
                </Link>
              </div>

            </div>

          </div>

          {/* Quick Select Slide Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`p-2.5 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                  currentSlide === idx
                    ? 'bg-[#00FF87]/15 border-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.2)]'
                    : 'bg-[#061812]/70 border-[#00FF87]/15 hover:border-[#00FF87]/40'
                }`}
              >
                <div className="w-14 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <div className={`text-xs font-black truncate ${currentSlide === idx ? 'text-[#00FF87]' : 'text-white'}`}>
                    {s.title.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-[#E6F4EA]/50 font-semibold">
                    ฿{s.price}/ชม.
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Grid of other rooms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomsList.filter(r => r.id !== 'RM-MTG-201').map((room) => (
              <div key={room.id} className="nature-glass-card rounded-3xl overflow-hidden flex flex-col justify-between group">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#04100C]/80 backdrop-blur-md text-[10px] font-bold text-[#00FF87] border border-[#00FF87]/30">
                    {room.capacity}
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">{room.title}</h4>
                    <p className="text-xs text-[#E6F4EA]/60 leading-relaxed mb-4">{room.desc}</p>
                    <div className="text-[11px] font-bold text-[#00FF87] bg-[#00FF87]/10 p-2.5 rounded-xl border border-[#00FF87]/20 mb-4">
                      ✨ {room.badge}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#00FF87]/15 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">฿{room.price}</span>
                      <span className="text-xs text-[#E6F4EA]/60"> /ชม.</span>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 rounded-full bg-[#00FF87]/20 hover:bg-[#00FF87] text-[#00FF87] hover:text-[#04140D] text-xs font-bold transition">
                      จองพื้นที่
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          MEMBERSHIP PRICING (Strategy Pattern Highlight)
         ========================================================================= */}
      <section id="pricing" className="py-20 border-b border-[#00FF87]/15 bg-[#061812]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-black text-[#00FF87] uppercase tracking-widest">MEMBERSHIP TIERS</span>
            <h2 className="text-3xl font-extrabold text-white">แพ็กเกจสมาชิกเพื่อสิทธิประโยชน์สูงสุด</h2>
            <p className="text-xs text-[#E6F4EA]/60">เลือกแผนที่เหมาะกับคุณ พร้อมรับส่วนลดค่าจองห้องประชุมทันที</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Basic */}
            <div className="nature-glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Basic Eco</h3>
                <p className="text-xs text-[#E6F4EA]/60 mt-1">สำหรับบุคคลทั่วไปและผู้ใช้งานเริ่มต้น</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">฿{membershipCustom.BASIC?.price?.toLocaleString() ?? '0'}</span>
                  <span className="text-xs text-[#E6F4EA]/60"> {membershipCustom.BASIC?.price === 0 ? '/สมัครฟรี' : '/เดือน'}</span>
                  <div className="text-xs font-bold text-[#00FF87] mt-1">{membershipCustom.BASIC?.quotaText || 'โควตาจอง 20 ชม./เดือน'}</div>
                </div>
                <ul className="space-y-3 text-xs text-[#E6F4EA]/80 pt-4 border-t border-[#00FF87]/15">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> จองพื้นที่ล่วงหน้า 7 วัน</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> WiFi ความเร็วสูง 500 Mbps</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> ชา & กาแฟดริปออร์แกนิก</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 rounded-full text-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition">
                สมัครฟรี
              </Link>
            </div>

            {/* Pro - Highlighted */}
            <div className="nature-glass-card rounded-3xl p-8 border-[#00FF87] shadow-[0_0_35px_rgba(0,255,135,0.25)] flex flex-col justify-between relative scale-105 bg-[#082219]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00FF87] text-[#04140D] text-[10px] font-black uppercase tracking-wider">
                RECOMMENDED
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Pro Tech</h3>
                <p className="text-xs text-[#E6F4EA]/60 mt-1">สำหรับฟรีแลนซ์และมือโปร</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">฿{membershipCustom.PRO?.price?.toLocaleString() ?? '100'}</span>
                  <span className="text-xs text-[#E6F4EA]/60"> /เดือน</span>
                  <div className="text-xs font-bold text-[#00FF87] mt-1">{membershipCustom.PRO?.quotaText || 'ส่วนลด 15% ทุกห้อง • โควตา 80 ชม.'}</div>
                </div>
                <ul className="space-y-3 text-xs text-[#E6F4EA]/90 pt-4 border-t border-[#00FF87]/20">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> ส่วนลด 15% ห้องประชุม & Hot Desk</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> จองพื้นที่ล่วงหน้า 30 วัน</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> WiFi 6E 1 Gbps Solar Fast</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> Specialty Espresso Bar ไม่อั้น</li>
                </ul>
              </div>
              <Link href="/payment?tier=PRO" className="mt-8 w-full py-3.5 rounded-full text-center text-xs font-black bg-[#00FF87] hover:bg-[#22FF96] text-[#04140D] shadow-lg transition">
                สมัครสมาชิก Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="nature-glass-card rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <p className="text-xs text-[#E6F4EA]/60 mt-1">สำหรับทีมงาน องค์กร และสตาร์ตอัป</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">฿{membershipCustom.ENTERPRISE?.price?.toLocaleString() ?? '150'}</span>
                  <span className="text-xs text-[#E6F4EA]/60"> /เดือน</span>
                  <div className="text-xs font-bold text-[#00FF87] mt-1">{membershipCustom.ENTERPRISE?.quotaText || 'ส่วนลด 30% ทุกห้อง • โควตา Unlimited'}</div>
                </div>
                <ul className="space-y-3 text-xs text-[#E6F4EA]/80 pt-4 border-t border-[#00FF87]/15">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> ส่วนลดสูงสุด 30% ทุกห้องและ Suite</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> สิทธิ์เข้าใช้งาน 24/7 Smart Keycard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#00FF87]" /> บริการ Concierge และเอกสาร e-Tax</li>
                </ul>
              </div>
              <Link href="/payment?tier=ENTERPRISE" className="mt-8 w-full py-3.5 rounded-full text-center text-xs font-black bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-lg shadow-purple-500/25 transition">
                สมัครสมาชิก Enterprise
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
