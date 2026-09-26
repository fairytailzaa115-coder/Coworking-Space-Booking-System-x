'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ShieldCheck,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  X,
  CreditCard,
  DoorClosed,
  Sparkles,
  Check
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface RoomCustomization {
  id: string;
  title: string;
  price: number;
  proPrice: number;
  image: string; // path or base64
  originalImage: string;
  originalPrice: number;
  originalProPrice: number;
}

interface MembershipTierCustomization {
  id: 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  tag: string;
  price: number;
  originalPrice: number;
  quotaText: string;
  originalQuotaText: string;
  discountRate: number; // e.g. 0.15 for 15%
  originalDiscountRate: number;
  description: string;
  features: string[];
}

const LOCAL_STORAGE_KEY = 'adminPageCustomization';
const MEMBERSHIP_STORAGE_KEY = 'adminMembershipCustomization';

// Default room data (ต้องตรงกับ catalog ทั้ง 10 ห้อง)
const defaultRooms: RoomCustomization[] = [
  // ── Individual Workspaces ──
  {
    id: 'RM-HOT-101',
    title: 'Hot Desk Alpha #12 (Solar Powered)',
    price: 80,
    proPrice: 68,
    image: '/images/hot-desk-room.jpg',
    originalImage: '/images/hot-desk-room.jpg',
    originalPrice: 80,
    originalProPrice: 68,
  },
  {
    id: 'RM-PHN-401',
    title: 'Acoustic Sound Pod #1 (Private)',
    price: 50,
    proPrice: 42.50,
    image: '/images/soundproof-booth.jpg',
    originalImage: '/images/soundproof-booth.jpg',
    originalPrice: 50,
    originalProPrice: 42.50,
  },
  // ── Meeting Rooms ──
  {
    id: 'RM-MTG-101',
    title: 'Focus Pod Meeting Room (Compact)',
    price: 180,
    proPrice: 153,
    image: '/images/individual-pod.jpg',
    originalImage: '/images/individual-pod.jpg',
    originalPrice: 180,
    originalProPrice: 153,
  },
  {
    id: 'RM-MTG-102',
    title: 'Creative Huddle Room',
    price: 250,
    proPrice: 212.50,
    image: '/images/creative-huddle.jpg',
    originalImage: '/images/creative-huddle.jpg',
    originalPrice: 250,
    originalProPrice: 212.50,
  },
  {
    id: 'RM-MTG-202',
    title: 'Synergy Brainstorming Lab',
    price: 350,
    proPrice: 297.50,
    image: '/images/meeting-room.jpg',
    originalImage: '/images/meeting-room.jpg',
    originalPrice: 350,
    originalProPrice: 297.50,
  },
  {
    id: 'RM-MTG-201',
    title: 'Summit Smart Boardroom (8-P)',
    price: 450,
    proPrice: 382.50,
    image: '/images/summit-boardroom.jpg',
    originalImage: '/images/summit-boardroom.jpg',
    originalPrice: 450,
    originalProPrice: 382.50,
  },
  // ── Private Office ──
  {
    id: 'RM-OFF-301',
    title: 'Executive Eco Suite Alpha',
    price: 600,
    proPrice: 510,
    image: '/images/executive-suite.jpg',
    originalImage: '/images/executive-suite.jpg',
    originalPrice: 600,
    originalProPrice: 510,
  },
  // ── Large Conference ──
  {
    id: 'RM-MTG-301',
    title: 'Executive Strategy Room',
    price: 650,
    proPrice: 552.50,
    image: '/images/executive-strategy-room.jpg',
    originalImage: '/images/executive-strategy-room.jpg',
    originalPrice: 650,
    originalProPrice: 552.50,
  },
  {
    id: 'RM-MTG-302',
    title: 'Visionary Conference Hall',
    price: 950,
    proPrice: 807.50,
    image: '/images/visionary-conference.jpg',
    originalImage: '/images/visionary-conference.jpg',
    originalPrice: 950,
    originalProPrice: 807.50,
  },
  {
    id: 'RM-MTG-401',
    title: 'Grand Auditorium & Town Hall',
    price: 1800,
    proPrice: 1530,
    image: '/images/grand-auditorium.jpg',
    originalImage: '/images/grand-auditorium.jpg',
    originalPrice: 1800,
    originalProPrice: 1530,
  },
];

const defaultMemberships: MembershipTierCustomization[] = [
  {
    id: 'BASIC',
    name: 'Basic Eco',
    tag: 'FREE / เริ่มต้น',
    price: 0,
    originalPrice: 0,
    quotaText: 'โควตาจอง 20 ชม./เดือน',
    originalQuotaText: 'โควตาจอง 20 ชม./เดือน',
    discountRate: 0,
    originalDiscountRate: 0,
    description: 'สำหรับบุคคลทั่วไปและผู้ใช้งานเริ่มต้น',
    features: ['จองพื้นที่ล่วงหน้า 7 วัน', 'WiFi ความเร็วสูง 500 Mbps', 'ชา & กาแฟดริปออร์แกนิก']
  },
  {
    id: 'PRO',
    name: 'Pro Tech',
    tag: 'RECOMMENDED / ยอดนิยม',
    price: 100,
    originalPrice: 100,
    quotaText: 'ส่วนลด 15% ทุกห้อง • โควตา 80 ชม.',
    originalQuotaText: 'ส่วนลด 15% ทุกห้อง • โควตา 80 ชม.',
    discountRate: 0.15,
    originalDiscountRate: 0.15,
    description: 'สำหรับฟรีแลนซ์และมือโปร ทำงานคล่องตัว',
    features: ['ส่วนลด 15% ห้องประชุม & Hot Desk', 'จองพื้นที่ล่วงหน้า 30 วัน', 'WiFi 6E 1 Gbps Solar Fast', 'Specialty Espresso Bar ไม่อั้น']
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tag: 'VIP / องค์กร',
    price: 150,
    originalPrice: 150,
    quotaText: 'ส่วนลด 30% ทุกห้อง • โควตา Unlimited',
    originalQuotaText: 'ส่วนลด 30% ทุกห้อง • โควตา Unlimited',
    discountRate: 0.30,
    originalDiscountRate: 0.30,
    description: 'สำหรับทีมงาน องค์กร และสตาร์ตอัป',
    features: ['ส่วนลดสูงสุด 30% ทุกห้องและ Suite', 'สิทธิ์เข้าใช้งาน 24/7 Smart Keycard', 'บริการ Concierge และเอกสาร e-Tax']
  }
];

export default function AdminCustomizePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'membership'>('rooms');
  
  const [rooms, setRooms] = useState<RoomCustomization[]>(defaultRooms);
  const [memberships, setMemberships] = useState<MembershipTierCustomization[]>(defaultMemberships);
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewRoom, setPreviewRoom] = useState<RoomCustomization | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Auth check ──
  useEffect(() => {
    const saved = localStorage.getItem('currentMember');
    if (!saved) { router.replace('/login'); return; }
    try {
      const member = JSON.parse(saved);
      if (!member.admin) { router.replace('/dashboard'); return; }
      setIsAdmin(true);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // ── Load saved customizations (from Database & LocalStorage) ──
  useEffect(() => {
    if (!isAdmin) return;

    // Load from backend API first (PostgreSQL)
    const loadFromApi = async () => {
      // 1. Memberships from PostgreSQL
      try {
        const memRes = await fetch('/api/v1/memberships');
        if (memRes.ok) {
          const dbMemberships: Array<{ tier: string; priceMonthly: number; discountRate?: number; maxMonthlyHours?: number }> = await memRes.json();
          if (Array.isArray(dbMemberships) && dbMemberships.length > 0) {
            setMemberships(prev => prev.map(def => {
              const found = dbMemberships.find(m => m.tier.toUpperCase() === def.id.toUpperCase());
              return found
                ? {
                    ...def,
                    price: Number(found.priceMonthly),
                    discountRate: found.discountRate !== undefined ? Number(found.discountRate) : def.discountRate,
                    originalPrice: Number(found.priceMonthly)
                  }
                : def;
            }));
          }
        }
      } catch (err) {
        // Fallback to localStorage if API is unreachable
        const savedMem = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
        if (savedMem) {
          try {
            const parsedMem = JSON.parse(savedMem) as Record<string, { price: number; quotaText?: string; discountRate?: number }>;
            setMemberships(defaultMemberships.map(def => {
              const savedTier = parsedMem[def.id];
              return savedTier
                ? {
                    ...def,
                    price: savedTier.price ?? def.price,
                    quotaText: savedTier.quotaText ?? def.quotaText,
                    discountRate: savedTier.discountRate ?? def.discountRate
                  }
                : def;
            }));
          } catch { /* ignore */ }
        }
      }

      // 2. Rooms from PostgreSQL
      try {
        const roomRes = await fetch('/api/v1/workspaces/WS-ASOKE/rooms');
        if (roomRes.ok) {
          const dbRooms: Array<{ roomId: string; pricePerHour: number; imageUrl?: string }> = await roomRes.json();
          if (Array.isArray(dbRooms) && dbRooms.length > 0) {
            setRooms(prev => prev.map(def => {
              const found = dbRooms.find(r => r.roomId === def.id);
              if (found) {
                const pr = Number(found.pricePerHour);
                const img = found.imageUrl || def.image;
                return {
                  ...def,
                  price: pr,
                  proPrice: Math.round(pr * 0.85 * 100) / 100,
                  image: img,
                  originalPrice: pr,
                  originalProPrice: Math.round(pr * 0.85 * 100) / 100,
                  originalImage: img
                };
              }
              return def;
            }));
          }
        }
      } catch (err) {
        // Fallback to localStorage
        const savedRooms = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedRooms) {
          try {
            const parsed = JSON.parse(savedRooms) as RoomCustomization[];
            setRooms(defaultRooms.map(def => {
              const savedRoom = parsed.find(r => r.id === def.id);
              return savedRoom
                ? { ...def, price: savedRoom.price, proPrice: savedRoom.proPrice, image: savedRoom.image }
                : def;
            }));
          } catch { /* ignore */ }
        }
      }
    };

    loadFromApi();
  }, [isAdmin]);

  // ── Detect changes ──
  useEffect(() => {
    const roomsChanged = rooms.some(r =>
      r.price !== r.originalPrice ||
      r.proPrice !== r.originalProPrice ||
      r.image !== r.originalImage
    );
    const memChanged = memberships.some(m =>
      m.price !== m.originalPrice ||
      m.quotaText !== m.originalQuotaText ||
      m.discountRate !== m.originalDiscountRate
    );
    setHasChanges(roomsChanged || memChanged);
  }, [rooms, memberships]);

  // ── Save to Database & LocalStorage ──
  const handleSave = async () => {
    try {
      // 1. Save to LocalStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));

      const memMap: Record<string, { price: number; quotaText: string; discountRate: number }> = {};
      memberships.forEach(m => {
        memMap[m.id] = {
          price: m.price,
          quotaText: m.quotaText,
          discountRate: m.discountRate
        };
      });
      localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(memMap));

      // 2. Persist Memberships to PostgreSQL via Backend API
      await Promise.all(
        memberships.map(m =>
          fetch(`/api/v1/memberships/${m.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceMonthly: m.price,
              discountRate: m.discountRate
            })
          }).catch(e => console.error('Failed to update membership in DB:', e))
        )
      );

      // 3. Persist Rooms to PostgreSQL via Backend API
      await Promise.all(
        rooms.map(r =>
          fetch(`/api/v1/rooms/${r.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pricePerHour: r.price,
              imageUrl: r.image
            })
          }).catch(e => console.error('Failed to update room in DB:', e))
        )
      );

      setFeedback({ type: 'success', text: '✅ บันทึกการตั้งค่าลงฐานข้อมูล PostgreSQL สำเร็จแล้ว ข้อมูลจะคงอยู่ถาวรแม้เปิดผ่าน Cloudflare URL ใหม่' });
      setHasChanges(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ type: 'error', text: '❌ ไม่สามารถบันทึกได้ อาจเนื่องจากการเชื่อมต่อ' });
    }
  };

  // ── Reset to defaults ──
  const handleResetAll = () => {
    if (activeTab === 'rooms') {
      if (!confirm('รีเซ็ตราคาและรูปห้องทั้งหมดกลับเป็นค่าเริ่มต้น?')) return;
      setRooms(defaultRooms.map(r => ({ ...r })));
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setFeedback({ type: 'success', text: '🔄 รีเซ็ตข้อมูลห้องกลับค่าเริ่มต้นเรียบร้อย' });
    } else {
      if (!confirm('รีเซ็ตราคาและเงื่อนไข Membership ทั้งหมดกลับเป็นค่าเริ่มต้น?')) return;
      setMemberships(defaultMemberships.map(m => ({ ...m })));
      localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
      setFeedback({ type: 'success', text: '🔄 รีเซ็ตราคา Membership กลับค่าเริ่มต้นเรียบร้อย' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  // ── Handle room price change ──
  const handlePriceChange = (id: string, field: 'price' | 'proPrice', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: num } : r));
  };

  // ── Handle membership change ──
  const handleMembershipPriceChange = (id: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    setMemberships(prev => prev.map(m => m.id === id ? { ...m, price: num } : m));
  };

  const handleMembershipQuotaChange = (id: string, value: string) => {
    setMemberships(prev => prev.map(m => m.id === id ? { ...m, quotaText: value } : m));
  };

  const handleMembershipDiscountChange = (id: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 100) return;
    setMemberships(prev => prev.map(m => m.id === id ? { ...m, discountRate: num / 100 } : m));
  };

  // ── Handle image upload ──
  const handleImageUpload = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: '❌ กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', text: '❌ ขนาดไฟล์ต้องไม่เกิน 5 MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setRooms(prev => prev.map(r => r.id === id ? { ...r, image: base64 } : r));
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  };

  // ── Reset single room image ──
  const handleResetImage = (id: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, image: r.originalImage } : r));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-forest-950 text-emerald-50 flex items-center justify-center">
        <div className="text-emerald-100/50 text-sm">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-950 text-emerald-50 bg-green-mesh pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-violet-300/80">Admin Console</p>
                <h1 className="text-2xl font-black text-white">จัดการหน้าเว็บไซต์</h1>
              </div>
            </div>
            <p className="text-sm text-emerald-100/55 mt-3">แก้ไขราคาห้อง รูปภาพ และราคาแพ็กเกจสมาชิก Membership</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> กลับหน้า Admin
            </Link>
            <button
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" /> รีเซ็ตแท็บนี้
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-forest-950 text-xs font-black flex items-center gap-2 transition shadow-[0_0_20px_rgba(0,255,135,0.3)]"
            >
              <Save className="w-4 h-4" />
              {hasChanges ? 'บันทึกการเปลี่ยนแปลง' : 'ไม่มีการเปลี่ยนแปลง'}
            </button>
          </div>
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {feedback.text}
          </div>
        )}

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-3 p-1.5 bg-black/40 border border-emerald-500/20 rounded-2xl mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'rooms'
                ? 'bg-emerald-500 text-forest-950 shadow-lg'
                : 'text-emerald-100/60 hover:text-white'
            }`}
          >
            <DoorClosed className="w-4 h-4" />
            ราคาและรูปภาพห้อง ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'membership'
                ? 'bg-emerald-500 text-forest-950 shadow-lg'
                : 'text-emerald-100/60 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            ราคา Membership ({memberships.length})
          </button>
        </div>

        {/* ── Info Banner ── */}
        <div className="mb-6 p-4 rounded-2xl bg-violet-500/8 border border-violet-500/20 text-xs text-violet-200/70 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
          <span>การเปลี่ยนแปลงจะมีผลทันทีที่กด <strong className="text-violet-300">บันทึกการเปลี่ยนแปลง</strong> และหน้าเว็บหลัก/หน้าชำระเงินจะแสดงราคาใหม่ทันที</span>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB 1: ROOMS CUSTOMIZATION
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <div className="space-y-5">
            {rooms.map((room) => (
              <div key={room.id} className="glass-panel rounded-3xl overflow-hidden border border-emerald-500/20">
                <div className="flex flex-col lg:flex-row">

                  {/* Image Section */}
                  <div className="lg:w-72 relative flex-shrink-0">
                    <div className="h-52 lg:h-full min-h-[200px] relative overflow-hidden bg-black/30">
                      <img
                        src={room.image}
                        alt={room.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Image action buttons */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                        {/* Upload */}
                        <label
                          htmlFor={`img-upload-${room.id}`}
                          className="flex-1 py-2 rounded-xl bg-violet-500/80 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition backdrop-blur-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          อัปโหลดรูปใหม่
                        </label>
                        <input
                          id={`img-upload-${room.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputRefs.current[room.id] = el; }}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(room.id, file);
                            e.target.value = '';
                          }}
                        />

                        {/* Preview */}
                        <button
                          onClick={() => setPreviewRoom(room)}
                          className="py-2 px-3 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition backdrop-blur-sm border border-white/15"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset image */}
                        {room.image !== room.originalImage && (
                          <button
                            onClick={() => handleResetImage(room.id)}
                            title="คืนรูปเดิม"
                            className="py-2 px-3 rounded-xl bg-rose-500/70 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center transition backdrop-blur-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Changed badge */}
                      {room.image !== room.originalImage && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                          รูปใหม่
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider mb-1">
                          {room.id.startsWith('RM-HOT') ? '🖥️ Hot Desk'
                            : room.id.startsWith('RM-PHN') ? '🔇 Phone Booth'
                            : room.id.startsWith('RM-OFF') ? '🏢 Private Office'
                            : room.id.startsWith('RM-MTG-101') || room.id.startsWith('RM-MTG-102') ? '🤝 Meeting Room (Small)'
                            : room.id.startsWith('RM-MTG-20') ? '📋 Meeting Room (Medium)'
                            : room.id.startsWith('RM-MTG-30') ? '🎤 Conference Hall'
                            : room.id.startsWith('RM-MTG-40') ? '🏟️ Grand Auditorium'
                            : 'Room'}
                        </p>
                        <h3 className="text-base font-black text-white">{room.title}</h3>
                        <p className="text-[11px] text-emerald-100/40 font-mono mt-0.5">ID: {room.id}</p>
                      </div>
                      {(room.price !== room.originalPrice || room.proPrice !== room.originalProPrice) && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          ราคาเปลี่ยน
                        </span>
                      )}
                    </div>

                    {/* Price Edit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Normal Price */}
                      <div>
                        <label className="block text-xs font-bold text-emerald-300/70 mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          ราคาปกติ (บาท/ชั่วโมง)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">฿</span>
                          <input
                            type="number"
                            min="0"
                            step="0.50"
                            value={room.price}
                            onChange={e => handlePriceChange(room.id, 'price', e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-white text-sm font-bold transition"
                          />
                        </div>
                        {room.price !== room.originalPrice && (
                          <p className="mt-1.5 text-[10px] text-amber-400/80">
                            เดิม: ฿{room.originalPrice} → ใหม่: ฿{room.price}
                          </p>
                        )}
                      </div>

                      {/* Pro Price */}
                      <div>
                        <label className="block text-xs font-bold text-violet-300/70 mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          ราคาสมาชิก Pro (บาท/ชั่วโมง)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400 font-bold text-sm">฿</span>
                          <input
                            type="number"
                            min="0"
                            step="0.50"
                            value={room.proPrice}
                            onChange={e => handlePriceChange(room.id, 'proPrice', e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 text-white text-sm font-bold transition"
                          />
                        </div>
                        {room.proPrice !== room.originalProPrice && (
                          <p className="mt-1.5 text-[10px] text-amber-400/80">
                            เดิม: ฿{room.originalProPrice} → ใหม่: ฿{room.proPrice}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick presets */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] text-emerald-100/40 font-bold">ตั้งค่าเร็ว:</span>
                      {[
                        { label: 'คืนค่าเดิม', action: () => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, price: r.originalPrice, proPrice: r.originalProPrice } : r)) },
                        { label: 'Pro = 85%', action: () => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, proPrice: Math.round(r.price * 0.85 * 100) / 100 } : r)) },
                        { label: 'Pro = 80%', action: () => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, proPrice: Math.round(r.price * 0.80 * 100) / 100 } : r)) },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          onClick={preset.action}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 text-[10px] font-bold transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: MEMBERSHIP PRICING CUSTOMIZATION
           ══════════════════════════════════════════════════════════ */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memberships.map((tier) => (
                <div
                  key={tier.id}
                  className={`nature-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between border ${
                    tier.id === 'PRO'
                      ? 'border-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,0.2)] bg-[#082219]'
                      : 'border-emerald-500/20'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tier.tag}
                      </span>
                      {tier.price !== tier.originalPrice && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md">
                          ราคาแก้ไข
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">{tier.name}</h3>
                    <p className="text-xs text-emerald-100/60 mt-1">{tier.description}</p>

                    {/* Price Input Form */}
                    <div className="my-6 space-y-4 pt-4 border-t border-emerald-500/20">
                      <div>
                        <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          ราคาค่าสมาชิก (บาท/เดือน)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">฿</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={tier.price}
                            onChange={e => handleMembershipPriceChange(tier.id, e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white text-base font-black transition"
                          />
                        </div>
                        {tier.price !== tier.originalPrice && (
                          <p className="mt-1 text-[10px] text-amber-400">
                            เดิม: ฿{tier.originalPrice.toLocaleString()} → ใหม่: ฿{tier.price.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Quota / Highlight text */}
                      <div>
                        <label className="block text-xs font-bold text-emerald-300/80 mb-1.5">
                          ข้อความโควตา / ไฮไลต์
                        </label>
                        <input
                          type="text"
                          value={tier.quotaText}
                          onChange={e => handleMembershipQuotaChange(tier.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white text-xs font-semibold"
                        />
                      </div>

                      {/* Discount Rate % */}
                      <div>
                        <label className="block text-xs font-bold text-emerald-300/80 mb-1.5">
                          อัตราส่วนลดจองห้อง (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={Math.round(tier.discountRate * 100)}
                            onChange={e => handleMembershipDiscountChange(tier.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none text-white text-xs font-semibold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Features preview */}
                    <div className="space-y-2 pt-4 border-t border-emerald-500/15">
                      <p className="text-[11px] font-bold text-emerald-100/50 uppercase">สิทธิประโยชน์:</p>
                      <ul className="space-y-2 text-xs text-emerald-100/80">
                        {tier.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reset single tier button */}
                  <div className="mt-6 pt-4 border-t border-emerald-500/15">
                    <button
                      type="button"
                      onClick={() => setMemberships(prev => prev.map(m => m.id === tier.id ? { ...m, price: m.originalPrice, quotaText: m.originalQuotaText, discountRate: m.originalDiscountRate } : m))}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition border border-white/10"
                    >
                      คืนค่าเริ่มต้นของ {tier.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation box */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/80 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white mb-1">การเปลี่ยนแปลงราคา Membership จะส่งผลต่อ:</p>
                <ul className="list-disc list-inside space-y-1 text-emerald-200/70">
                  <li><strong>หน้าแรก (Landing Page)</strong>: แสดงราคาแพ็กเกจสมาชิกทั้ง 3 ระดับ และข้อความสิทธิประโยชน์ใหม่ทันที</li>
                  <li><strong>หน้าชำระเงิน (/payment)</strong>: ยอดเงินที่ต้องชำระของแพ็กเกจ Pro และ Enterprise จะปรับตามราคาใหม่ที่ตั้งไว้โดยอัตโนมัติ</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Save Bar ── */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#061812]/95 border border-emerald-500/30 shadow-[0_0_40px_rgba(0,255,135,0.2)] backdrop-blur-xl">
            <span className="text-sm text-emerald-300 font-semibold">มีการเปลี่ยนแปลงที่ยังไม่บันทึก</span>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 text-xs font-black flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> บันทึกเดี๋ยวนี้
            </button>
          </div>
        )}
      </main>

      {/* ── Image Preview Modal ── */}
      {previewRoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewRoom(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={previewRoom.image}
              alt={previewRoom.title}
              className="w-full h-auto max-h-[80vh] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-white font-black text-lg">{previewRoom.title}</p>
              <p className="text-emerald-400 font-bold text-sm">฿{previewRoom.price}/ชม. · Pro ฿{previewRoom.proPrice}</p>
            </div>
            <button
              onClick={() => setPreviewRoom(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
