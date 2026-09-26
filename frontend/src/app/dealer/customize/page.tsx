'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Building2,
  DoorClosed,
  DollarSign,
  Users,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Phone,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Camera,
  X,
  Lock,
  Eye
} from 'lucide-react';

interface Room {
  roomId: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  imageUrl?: string;
  status: string;
  workspaceId?: string;
  equipmentFee?: number;
}

interface DealerData {
  memberId: string;
  dealerName: string;
  email: string;
  phone: string;
  spaceName: string;
  spaceLocation: string;
  workspaceId: string;
  roomId: string;
  workspace?: {
    workspaceId: string;
    name: string;
    location: string;
    openingHours?: string;
  };
  rooms?: Room[];
  primaryRoom?: Room;
}

const PRESET_IMAGES = [
  { label: 'Creative Huddle', url: '/images/creative-huddle.jpg' },
  { label: 'Focus Pod Room', url: '/images/focus-pod.jpg' },
  { label: 'Meeting Room Pro', url: '/images/meeting-room.jpg' },
  { label: 'Executive Strategy', url: '/images/executive-strategy-room.jpg' },
  { label: 'Summit Boardroom', url: '/images/summit-boardroom.jpg' },
  { label: 'Visionary Conference', url: '/images/visionary-conference.jpg' },
  { label: 'Grand Auditorium', url: '/images/grand-auditorium.jpg' },
  { label: 'Individual Pod', url: '/images/individual-pod.jpg' }
];

export default function DealerCustomizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingSpace, setSavingSpace] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dealer Profile & Space State
  const [memberId, setMemberId] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [spaceName, setSpaceName] = useState('');
  const [spaceLocation, setSpaceLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  // Rooms List
  const [rooms, setRooms] = useState<Room[]>([]);

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [currentEditingRoom, setCurrentEditingRoom] = useState<Room | null>(null);

  // Add Room Form State
  const [newRoomName, setNewRoomName] = useState('');
  const [newPricePerHour, setNewPricePerHour] = useState(350);
  const [newCapacity, setNewCapacity] = useState(6);
  const [newImageUrl, setNewImageUrl] = useState('/images/meeting-room.jpg');

  // Edit Room Form State
  const [editRoomName, setEditRoomName] = useState('');
  const [editPricePerHour, setEditPricePerHour] = useState(350);
  const [editCapacity, setEditCapacity] = useState(6);
  const [editStatus, setEditStatus] = useState('AVAILABLE');

  // Edit Photo Form State
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Dealer Space & Rooms
  const fetchDealerSpace = async (mId: string) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/dealer/${mId}/space`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลพื้นที่ของ Dealer ได้');
      const data: DealerData = await res.json();

      setMemberId(data.memberId);
      setDealerName(data.dealerName || '');
      setSpaceName(data.spaceName || data.workspace?.name || 'พื้นที่ของฉัน');
      setSpaceLocation(data.spaceLocation || data.workspace?.location || '');
      setPhone(data.phone || '');
      setWorkspaceId(data.workspaceId || '');

      const rList = data.rooms && data.rooms.length > 0
        ? data.rooms
        : data.primaryRoom
        ? [data.primaryRoom]
        : [];

      setRooms(rList);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem('currentMember');
    if (!raw) {
      router.replace('/login');
      return;
    }

    try {
      const member = JSON.parse(raw);
      const isDealer = member.memberType === 'DEALER' || member.role === 'DEALER';
      if (!isDealer && !member.admin) {
        router.replace('/dashboard');
        return;
      }
      fetchDealerSpace(member.memberId);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // Handle Save Workspace / Space Information
  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    setSavingSpace(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/v1/dealer/${memberId}/space`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceName, spaceLocation, phone })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'บันทึกข้อมูลพื้นที่ไม่สำเร็จ');
      }

      // Update LocalStorage currentMember
      const raw = localStorage.getItem('currentMember');
      if (raw) {
        const cur = JSON.parse(raw);
        localStorage.setItem(
          'currentMember',
          JSON.stringify({
            ...cur,
            spaceName,
            spaceLocation,
            phone
          })
        );
        window.dispatchEvent(new Event('memberUpdated'));
      }

      setStatusMessage({
        type: 'success',
        text: 'บันทึกข้อมูลพื้นที่และที่ตั้งลง PostgreSQL สำเร็จแล้ว'
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setSavingSpace(false);
    }
  };

  // Handle Add New Room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    setActionLoading(true);
    try {
      const payload = {
        name: newRoomName.trim() || `${spaceName} Meeting Room`,
        pricePerHour: newPricePerHour,
        capacity: newCapacity,
        imageUrl: newImageUrl,
        status: 'AVAILABLE'
      };

      const res = await fetch(`/api/v1/dealer/${memberId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'เพิ่มห้องประชุมไม่สำเร็จ');
      }

      const createdRoom: Room = await res.json();
      setRooms(prev => [...prev, createdRoom]);
      setShowAddRoomModal(false);

      // Reset Form
      setNewRoomName('');
      setNewPricePerHour(350);
      setNewCapacity(6);
      setNewImageUrl('/images/meeting-room.jpg');

      setStatusMessage({
        type: 'success',
        text: `สร้างห้องประชุมใหม่ "${createdRoom.name}" (${createdRoom.roomId}) บันทึกลง PostgreSQL สำเร็จแล้ว!`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเพิ่มห้อง' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Room Modal
  const openEditModal = (room: Room) => {
    setCurrentEditingRoom(room);
    setEditRoomName(room.name);
    setEditPricePerHour(Number(room.pricePerHour));
    setEditCapacity(room.capacity);
    setEditStatus(room.status || 'AVAILABLE');
    setShowEditRoomModal(true);
  };

  // Handle Submit Edit Room
  const handleSaveEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditingRoom || !memberId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/rooms/${currentEditingRoom.roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerMemberId: memberId,
          name: editRoomName.trim(),
          pricePerHour: editPricePerHour,
          capacity: editCapacity,
          status: editStatus
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'แก้ไขข้อมูลห้องไม่สำเร็จ');
      }

      const updated: Room = await res.json();
      setRooms(prev => prev.map(r => r.roomId === updated.roomId ? { ...r, ...updated } : r));
      setShowEditRoomModal(false);

      setStatusMessage({
        type: 'success',
        text: `อัปเดตข้อมูลห้อง "${updated.name}" เรียบร้อยแล้ว`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการแก้ไขห้อง' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Photo Modal
  const openPhotoModal = (room: Room) => {
    setCurrentEditingRoom(room);
    setEditPhotoUrl(room.imageUrl || '/images/meeting-room.jpg');
    setShowEditPhotoModal(true);
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const base64 = event.target?.result as string;
      if (isNew) {
        setNewImageUrl(base64);
      } else {
        setEditPhotoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit Edit Photo
  const handleSavePhoto = async () => {
    if (!currentEditingRoom || !memberId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/rooms/${currentEditingRoom.roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerMemberId: memberId,
          imageUrl: editPhotoUrl
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'แก้ไขรูปภาพไม่สำเร็จ');
      }

      setRooms(prev =>
        prev.map(r => (r.roomId === currentEditingRoom.roomId ? { ...r, imageUrl: editPhotoUrl } : r))
      );
      setShowEditPhotoModal(false);

      setStatusMessage({
        type: 'success',
        text: `เปลี่ยนรูปภาพห้อง "${currentEditingRoom.name}" สำเร็จและบันทึกลง PostgreSQL แล้ว`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการบันทึกรูปภาพ' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Room
  const handleDeleteRoom = async (roomId: string, rName: string) => {
    if (rooms.length <= 1) {
      alert('คุณต้องมีห้องประชุมอย่างน้อย 1 ห้องในพื้นที่ของคุณ');
      return;
    }

    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${rName}" (${roomId}) ออกจากระบบ?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/dealer/${memberId}/rooms/${roomId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'ลบห้องไม่สำเร็จ');
      }

      setRooms(prev => prev.filter(r => r.roomId !== roomId));
      setStatusMessage({
        type: 'success',
        text: `ลบห้อง "${rName}" เรียบร้อยแล้ว`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการลบห้อง' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 text-emerald-50 bg-green-mesh selection:bg-emerald-500 selection:text-forest-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> แดชบอร์ด
          </Link>
          <span className="text-emerald-100/30">/</span>
          <span className="text-xs text-emerald-100/60 font-semibold">Dealer Account & Space Management</span>
        </div>

        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dealer Partner Portal • จัดการบัญชี & พื้นที่</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                จัดการบัญชี Dealer และพื้นที่ห้องประชุมของฉัน
              </h1>
              <p className="text-sm text-emerald-100/65 max-w-2xl leading-relaxed">
                คุณสามารถปรับแต่งข้อมูลพื้นที่ ทำเลที่ตั้ง และ<strong>เพิ่มห้องประชุมได้มากกว่า 1 ห้อง</strong> พร้อมทั้งอัปโหลดหรือแก้ไขรูปภาพห้องประชุมได้ตามต้องการ โดยข้อมูลจะถูกบันทึกลงใน PostgreSQL ทันที
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => memberId && fetchDealerSpace(memberId)}
                disabled={loading || actionLoading}
                className="px-4 py-2.5 rounded-xl bg-forest-900/80 hover:bg-forest-800 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                title="รีเฟรชข้อมูลจากระบบ"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                รีเฟรช
              </button>
            </div>
          </div>

          {/* Security / Isolation Notice */}
          <div className="mt-6 pt-5 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>ระบบรักษาความปลอดภัย:</strong> คุณมีสิทธิ์จัดการเฉพาะพื้นที่{' '}
                <span className="text-emerald-300 font-mono font-bold bg-forest-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {workspaceId || 'N/A'}
                </span>{' '}
                และห้องประชุมในสังกัดของคุณเท่านั้น
              </span>
            </div>
            <div className="text-emerald-100/50">
              Dealer ID: <span className="font-mono text-emerald-300">{memberId}</span> ({dealerName})
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold transition animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-200'
                : 'bg-rose-500/15 border border-rose-500/35 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {loading ? (
          <div className="glass-panel p-16 rounded-3xl text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-emerald-100/60">กำลังโหลดข้อมูลพื้นที่และห้องประชุมของคุณจาก PostgreSQL...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: Workspace & Location Info Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20">
              <form onSubmit={handleSaveSpace} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">ข้อมูลพื้นที่และสถานที่ (Workspace Details)</h2>
                      <p className="text-xs text-emerald-100/50">ระบุชื่อ Co-working Space และทำเลที่ตั้งที่จะแสดงในระบบให้ลูกค้าเห็น</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSpace}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
                  >
                    <Save className={`w-3.5 h-3.5 ${savingSpace ? 'animate-spin' : ''}`} />
                    {savingSpace ? 'กำลังบันทึก...' : 'บันทึกข้อมูลพื้นที่'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5">
                      ชื่อพื้นที่ของคุณ (Space / Co-working Name) *
                    </label>
                    <input
                      type="text"
                      value={spaceName}
                      onChange={e => setSpaceName(e.target.value)}
                      required
                      placeholder="เช่น KMITL Co-working Space, Mii Meeting Center"
                      className="w-full px-4 py-2.5 rounded-xl bg-forest-900/90 border border-emerald-500/30 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> ที่อยู่ / ทำเลที่ตั้ง (Location) *
                    </label>
                    <input
                      type="text"
                      value={spaceLocation}
                      onChange={e => setSpaceLocation(e.target.value)}
                      required
                      placeholder="เช่น อาคารพระเทพฯ ลาดกระบัง กรุงเทพฯ"
                      className="w-full px-4 py-2.5 rounded-xl bg-forest-900/90 border border-emerald-500/30 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-emerald-200 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> เบอร์โทรติดต่อ
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className="w-full px-4 py-2.5 rounded-xl bg-forest-900/90 border border-emerald-500/30 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Section 2: Meeting Rooms List & Multi-Room Management */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <DoorClosed className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>ห้องประชุมในพื้นที่ของคุณ</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {rooms.length} ห้อง
                      </span>
                    </h2>
                    <p className="text-xs text-emerald-100/50">คุณสามารถเพิ่มห้องประชุมได้หลายห้อง ปรับแต่งราคา ความจุ และเปลี่ยนรูปภาพได้อิสระ</p>
                  </div>
                </div>

                {/* Add Room Button */}
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#22FF96] text-forest-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-[#00FF87]/20 transition hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มห้องประชุมใหม่
                </button>
              </div>

              {/* Rooms Grid */}
              {rooms.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-forest-900/50 border border-emerald-500/15">
                  <DoorClosed className="w-12 h-12 mx-auto text-emerald-400/40 mb-3" />
                  <p className="text-white font-bold">ยังไม่มีห้องประชุมในพื้นที่ของคุณ</p>
                  <p className="text-xs text-emerald-100/50 mt-1 mb-4">กดปุ่มด้านบนเพื่อเพิ่มห้องประชุมห้องแรกของคุณ</p>
                  <button
                    type="button"
                    onClick={() => setShowAddRoomModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-forest-950 text-xs font-bold"
                  >
                    + เพิ่มห้องประชุมแรก
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map(room => (
                    <div
                      key={room.roomId}
                      className="rounded-2xl overflow-hidden border border-emerald-500/20 bg-forest-900/80 hover:border-emerald-500/40 transition group flex flex-col justify-between shadow-lg"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-forest-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={room.imageUrl || '/images/meeting-room.jpg'}
                          alt={room.name}
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/images/meeting-room.jpg';
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/20 to-transparent"></div>

                        {/* Status Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md border ${
                              room.status === 'AVAILABLE'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {room.status === 'AVAILABLE' ? '🟢 พร้อมให้บริการ' : '🟡 ปิดปรับปรุง'}
                          </span>
                        </div>

                        {/* Edit Photo Quick Button */}
                        <button
                          type="button"
                          onClick={() => openPhotoModal(room)}
                          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition"
                          title="แก้ไขรูปภาพ"
                        >
                          <Camera className="w-3 h-3 text-emerald-400" />
                          เปลี่ยนรูป
                        </button>

                        <div className="absolute bottom-2 left-3 right-3">
                          <span className="text-[10px] font-mono text-emerald-300/80 bg-forest-950/80 px-1.5 py-0.5 rounded">
                            {room.roomId}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white line-clamp-1">{room.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-emerald-100/70">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-emerald-400" />
                              {room.capacity} ท่าน
                            </span>
                            <span className="flex items-center gap-1 font-bold text-emerald-300">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                              ฿{room.pricePerHour}/ชม.
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-emerald-500/15 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            className="flex-1 py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-700 border border-emerald-500/20 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Edit2 className="w-3 h-3 text-emerald-400" />
                            แก้ไขข้อมูล
                          </button>
                          <button
                            type="button"
                            onClick={() => openPhotoModal(room)}
                            className="py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-700 border border-emerald-500/20 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            title="เปลี่ยนรูปภาพ"
                          >
                            <ImageIcon className="w-3 h-3 text-teal-400" />
                            รูปภาพ
                          </button>
                          {rooms.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRoom(room.roomId, room.name)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition"
                              title="ลบห้องนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 1: Add New Meeting Room                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-[#020D07]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl bg-forest-900 text-emerald-50 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black text-white">เพิ่มห้องประชุมใหม่</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="text-emerald-100/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">ชื่อห้องประชุม *</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  required
                  placeholder="เช่น Executive Boardroom B, Innovation Pod 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">ราคาเช่า (บาท/ชม.) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newPricePerHour}
                    onChange={e => setNewPricePerHour(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">ความจุ (คน) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={newCapacity}
                    onChange={e => setNewCapacity(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Photo selection */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-2">เลือกรูปภาพห้องประชุม:</label>

                {/* Upload or Preset */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    อัปโหลดรูปจากเครื่อง
                  </button>
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileUpload(e, true)}
                  />
                  <span className="text-[10px] text-emerald-100/50">PNG, JPG, WEBP (สูงสุด 5MB)</span>
                </div>

                {/* Preset thumbnails */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_IMAGES.slice(0, 4).map(item => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => setNewImageUrl(item.url)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                        newImageUrl === item.url ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-forest-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newImageUrl || '/images/meeting-room.jpg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-white">
                    รูปตัวอย่าง
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-[#00FF87] hover:bg-[#22FF96] text-forest-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00FF87]/20 transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {actionLoading ? 'กำลังสร้างห้อง...' : 'ยืนยันเพิ่มห้อง'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-xs font-bold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 2: Edit Meeting Room Info                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showEditRoomModal && currentEditingRoom && (
        <div className="fixed inset-0 bg-[#020D07]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl bg-forest-900 text-emerald-50">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">แก้ไขข้อมูลห้องประชุม</h3>
                  <p className="text-[10px] text-emerald-100/50 font-mono">{currentEditingRoom.roomId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditRoomModal(false)}
                className="text-emerald-100/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoom} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">ชื่อห้องประชุม *</label>
                <input
                  type="text"
                  value={editRoomName}
                  onChange={e => setEditRoomName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">ราคาเช่า (บาท/ชม.) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={editPricePerHour}
                    onChange={e => setEditPricePerHour(Math.max(0, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-200 mb-1">ความจุ (คน) *</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={editCapacity}
                    onChange={e => setEditCapacity(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">สถานะห้อง</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="AVAILABLE">🟢 พร้อมให้บริการ (AVAILABLE)</option>
                  <option value="MAINTENANCE">🟡 ปิดปรับปรุงชั่วคราว (MAINTENANCE)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditRoomModal(false)}
                  className="px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-xs font-bold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL 3: Edit Room Photo (Upload / Preset / URL)             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {showEditPhotoModal && currentEditingRoom && (
        <div className="fixed inset-0 bg-[#020D07]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl bg-forest-900 text-emerald-50 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">แก้ไขรูปภาพห้องประชุม</h3>
                  <p className="text-[10px] text-emerald-100/50">{currentEditingRoom.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPhotoModal(false)}
                className="text-emerald-100/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5">
              {/* Current Preview */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> ตัวอย่างรูปภาพปัจจุบัน:
                </label>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-emerald-500/30 bg-forest-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editPhotoUrl || '/images/meeting-room.jpg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Upload Button */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5">
                  วิธีที่ 1: อัปโหลดรูปภาพใหม่จากเครื่องของคุณ
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-forest-950/60 hover:bg-forest-950 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  เลือกไฟล์รูปภาพจากคอมพิวเตอร์ (PNG, JPG, WEBP สูงสุด 5MB)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFileUpload(e, false)}
                />
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1.5">
                  วิธีที่ 2: หรือเลือกจากคลังภาพห้องประชุมมาตรฐาน
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map(item => {
                    const isSel = editPhotoUrl === item.url;
                    return (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => setEditPhotoUrl(item.url)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                          isSel ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom URL */}
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  วิธีที่ 3: หรือระบุ URL รูปภาพเอง
                </label>
                <input
                  type="text"
                  value={editPhotoUrl}
                  onChange={e => setEditPhotoUrl(e.target.value)}
                  placeholder="https://... หรือ /images/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-forest-950/80 border border-emerald-500/30 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {actionLoading ? 'กำลังบันทึกลง PostgreSQL...' : 'บันทึกรูปภาพ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPhotoModal(false)}
                  className="px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-xs font-bold"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
