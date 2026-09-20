'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CalendarClock, CheckCircle2, Clock3, RefreshCw, ShieldCheck, XCircle, Settings } from 'lucide-react';

interface Booking {
  bookingId: string;
  memberId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: string;
  totalPrice: number;
  createdAt?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [adminMemberId, setAdminMemberId] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPendingBookings = async (memberId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/admin/${memberId}/bookings/pending`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'ไม่สามารถโหลดคำขอจองได้');
      setBookings(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'ไม่สามารถเชื่อมต่อระบบได้' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('currentMember');
    if (!saved) {
      router.replace('/login');
      return;
    }

    try {
      const member = JSON.parse(saved);
      if (member.admin !== true) {
        router.replace('/dashboard');
        return;
      }
      setAdminMemberId(member.memberId);
      loadPendingBookings(member.memberId);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  const approveBooking = async (bookingId: string) => {
    setProcessingId(bookingId);
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMemberId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'ไม่สามารถอนุมัติการจองได้');
      setBookings(current => current.filter(booking => booking.bookingId !== bookingId));
      setMessage({ type: 'success', text: `อนุมัติการจอง ${data.bookingId} เรียบร้อยแล้ว` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'ไม่สามารถอนุมัติการจองได้' });
    } finally {
      setProcessingId(null);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setProcessingId(bookingId);
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMemberId, reason: 'ไม่อนุมัติโดยผู้ดูแลระบบ' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'ไม่สามารถยกเลิกการจองได้');
      setBookings(current => current.filter(booking => booking.bookingId !== bookingId));
      setMessage({ type: 'success', text: `ยกเลิกคำขอจอง ${data.bookingId} เรียบร้อยแล้ว` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || 'ไม่สามารถยกเลิกการจองได้' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 text-emerald-50 bg-green-mesh">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-amber-300/80">Admin Console</p>
                <h1 className="text-2xl font-black text-white">อนุมัติการจองห้อง</h1>
              </div>
            </div>
            <p className="text-sm text-emerald-100/55 mt-3">ตรวจสอบคำขอจองก่อนยืนยันสิทธิ์การใช้ห้อง</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/settings"
              className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center gap-2 transition"
            >
              <Settings className="w-4 h-4 text-cyan-400" /> ตั้งค่า LINE & ระบบ
            </Link>
            <button
              onClick={() => adminMemberId && loadPendingBookings(adminMemberId)}
              disabled={loading}
              title="รีเฟรชรายการ"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรชรายการ
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="glass-panel rounded-3xl p-16 text-center text-emerald-100/50">กำลังโหลดคำขอจอง...</div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400/50 mb-4" />
            <p className="text-white font-bold">ไม่มีคำขอจองที่รออนุมัติ</p>
            <p className="text-sm text-emerald-100/45 mt-2">รายการใหม่จะแสดงที่หน้านี้เมื่อมีผู้ใช้จองห้อง</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.bookingId} className="glass-panel rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-white">{booking.bookingId}</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-bold">PENDING</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-emerald-100/65">
                    <span>สมาชิก: <strong className="text-emerald-200">{booking.memberId}</strong></span>
                    <span>ห้อง: <strong className="text-emerald-200">{booking.roomId}</strong></span>
                    <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-emerald-400" />{new Date(booking.startTime).toLocaleString('th-TH')}</span>
                    <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-emerald-400" />{booking.durationHours} ชั่วโมง</span>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-5">
                  <div className="text-right">
                    <p className="text-[11px] text-emerald-100/45">ยอดสุทธิ</p>
                    <p className="text-lg font-black text-emerald-400">฿{booking.totalPrice}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cancelBooking(booking.bookingId)}
                      disabled={processingId === booking.bookingId}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      {processingId === booking.bookingId ? 'กำลังดำเนินการ...' : 'ปฏิเสธ/ยกเลิก'}
                    </button>
                    <button
                      onClick={() => approveBooking(booking.bookingId)}
                      disabled={processingId === booking.bookingId}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 text-xs font-black flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {processingId === booking.bookingId ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">กลับไปหน้าจองห้อง</Link>
        </div>
      </main>
    </div>
  );
}
