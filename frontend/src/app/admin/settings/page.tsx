'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Key,
  Bell,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ShieldAlert,
  Send,
  HelpCircle,
  Clock,
  Check,
  X,
  Wrench,
  Package,
  Inbox,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface LineSettings {
  settingKey: string;
  channelToken: string;
  notifyToken: string;
  sendMode: 'BROADCAST' | 'PUSH';
  targetUserIds: string;
  enabled: boolean;
  notifyOnNewBooking: boolean;
  notifyOnStatusChange: boolean;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState<LineSettings>({
    settingKey: 'DEFAULT',
    channelToken: '',
    notifyToken: '',
    sendMode: 'BROADCAST',
    targetUserIds: '',
    enabled: true,
    notifyOnNewBooking: true,
    notifyOnStatusChange: true
  });

  // Status notification toggles for UI matching user design
  const [statusTriggers, setStatusTriggers] = useState({
    pending: false,
    confirmed: true,
    inProgress: false,
    waitingParts: false,
    completed: true,
    cancelled: false
  });

  const [webhookUrl, setWebhookUrl] = useState('http://localhost:8080/api/v1/line/webhook');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/v1/line/webhook`);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('currentMember');
    if (!saved) {
      router.replace('/login');
      return;
    }

    try {
      const member = JSON.parse(saved);
      if (!member.admin) {
        router.replace('/dashboard');
        return;
      }
      setIsAdmin(true);
      fetchSettings();
    } catch {
      router.replace('/login');
    }
    // Load custom LINE OA link
    const savedLineUrl = localStorage.getItem('lineOfficialUrl');
    if (savedLineUrl) {
      setLineChatUrl(savedLineUrl);
    }
  }, [router]);

  const [lineChatUrl, setLineChatUrl] = useState('https://line.me/R/ti/p/@coworking');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/settings/line');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          settingKey: data.settingKey || 'DEFAULT',
          channelToken: data.channelToken || '',
          notifyToken: data.notifyToken || '',
          sendMode: data.sendMode || 'BROADCAST',
          targetUserIds: data.targetUserIds || '',
          enabled: data.enabled !== undefined ? data.enabled : true,
          notifyOnNewBooking: data.notifyOnNewBooking !== undefined ? data.notifyOnNewBooking : true,
          notifyOnStatusChange: data.notifyOnStatusChange !== undefined ? data.notifyOnStatusChange : true
        });
      }
    } catch (err) {
      console.warn('Backend offline, loaded default settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/v1/admin/settings/line', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('บันทึกการตั้งค่าไม่สำเร็จ');
      const data = await res.json();
      // Save LINE Official Chat URL
      localStorage.setItem('lineOfficialUrl', lineChatUrl.trim());

      setFeedback({ type: 'success', text: 'บันทึกการตั้งค่า LINE สำเร็จเรียบร้อยแล้ว' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTestStatus('กำลังส่งทดสอบ...');
    try {
      const res = await fetch('/api/v1/admin/settings/line/test', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus('✅ ทดสอบสำเร็จ! ' + data.message);
      } else {
        setTestStatus('❌ ทดสอบไม่สำเร็จ: ' + (data.message || 'Error'));
      }
    } catch (err: any) {
      setTestStatus('❌ ไม่สามารถเชื่อมต่อ API ได้: ' + err.message);
    }
    setTimeout(() => setTestStatus(null), 5000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020D07] flex items-center justify-center text-emerald-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF87]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04100C] text-[#E6F4EA] selection:bg-[#00FF87] selection:text-[#04100C]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-[#00FF87]/20 flex items-center justify-center text-[#00FF87] transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-cyan-400">ADMINISTRATOR SETTINGS</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white">ตั้งค่าช่องทาง LINE & การแจ้งเตือน</h1>
              </div>
            </div>
            <p className="text-xs text-[#E6F4EA]/60 mt-2 ml-13">
              จัดการเชื่อมต่อ LINE Official Account (Broadcast/Push) ส่งข้อมูลการจองห้องตรงถึง LINE ของผู้ใช้งาน
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-[#06C755]/15 hover:bg-[#06C755]/25 border border-[#06C755]/40 text-[#06C755] text-xs font-black transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> ทดสอบระบบ LINE
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={'mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ' + (
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            )}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {testStatus && (
          <div className="mb-6 p-4 rounded-2xl bg-[#06C755]/15 border border-[#06C755]/30 text-emerald-200 text-xs font-bold">
            {testStatus}
          </div>
        )}

        {/* 2-Column Responsive Layout as shown in Reference Image */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): LINE Channel Settings & Notification Conditions */}
          <div className="lg:col-span-8 space-y-8">
            {/* Box 1: ตั้งค่าช่องทาง LINE */}
            <div className="nature-glass-card rounded-3xl p-6 sm:p-8 border border-[#00FF87]/20 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#00FF87]/15">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-black text-white">ตั้งค่าช่องทาง LINE</h2>
                </div>
                <span className="text-[11px] font-bold text-[#E6F4EA]/50">
                  {settings.channelToken ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                    </span>
                  ) : (
                    'ยังไม่ได้ตั้งค่า'
                  )}
                </span>
              </div>

              {/* LINE Official Account Chat URL (สำหรับปุ่มติดต่อแอดมิน) */}
              <div>
                <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-2">
                  ลิงก์แชท LINE Official Account (สำหรับปุ่มแชทหน้าเว็บ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={lineChatUrl}
                    onChange={e => setLineChatUrl(e.target.value)}
                    placeholder="https://line.me/R/ti/p/@yourlineoa หรือ https://lin.ee/xxxx"
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-[#E6F4EA]/30 focus:outline-none focus:border-[#00FF87] transition font-mono"
                  />
                </div>
                <p className="text-[11px] text-[#00FF87]/70 mt-1">
                  * เมื่อผู้ใช้คลิกปุ่ม LINE ที่มุมขวาล่าง จะเด้งเปิดหน้าต่างแชทของ LINE Official นี้ทันที (เช่น https://line.me/R/ti/p/@lineid หรือ https://lin.ee/...)
                </p>
              </div>

              {/* LINE Channel Access Token */}
              <div>
                <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-2">
                  LINE Channel Access Token (Long-lived)
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={settings.channelToken}
                    onChange={e => setSettings({ ...settings, channelToken: e.target.value })}
                    placeholder="วาง Channel Access Token จาก LINE Developers Console..."
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-[#E6F4EA]/30 pr-12 focus:outline-none focus:border-[#00FF87] transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#E6F4EA]/50 hover:text-white p-1"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Send Mode & User IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-2">
                    รูปแบบการส่ง
                  </label>
                  <select
                    value={settings.sendMode}
                    onChange={e => setSettings({ ...settings, sendMode: e.target.value as any })}
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00FF87] transition"
                  >
                    <option value="BROADCAST">📢 Broadcast (ส่งให้ทุกคนที่เป็นเพื่อนกับ Bot)</option>
                    <option value="PUSH">🎯 Push (ส่งให้ User ที่ระบุ / User ID)</option>
                  </select>
                </div>

                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-2">
                    LINE User/Group IDs (สำหรับ Push Mode)
                  </label>
                  <input
                    type="text"
                    disabled={settings.sendMode !== 'PUSH'}
                    value={settings.targetUserIds}
                    onChange={e => setSettings({ ...settings, targetUserIds: e.target.value })}
                    placeholder={settings.sendMode === 'PUSH' ? 'U1234..., U5678... (คั่นด้วยจุลภาค)' : 'โหมด Broadcast ไม่จำเป็นต้องระบุ'}
                    className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-[#E6F4EA]/30 focus:outline-none focus:border-[#00FF87] transition disabled:opacity-30 disabled:cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Webhook URL for LINE Developers Console */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    🌐 Webhook URL (สำหรับนำไปใส่ใน LINE Developers Console)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    POST Webhook
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#04100C] p-2.5 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-200 select-all">
                    {webhookUrl}
                  </code>
                </div>
                <p className="text-[11px] text-cyan-100/60 leading-relaxed">
                  * เมื่อนำ Webhook URL นี้ไปใส่ใน LINE Developers Console และเปิดใช้งาน <b>Use Webhook: ON</b> ข้อความที่ผู้ใช้หรือแอดมินพิมพ์ใน LINE จะถูกส่งกลับมาแสดงในหน้าต่างแชทของเว็บไซต์แบบ 2-Way ทันที
                </p>
              </div>

              {/* Optional: LINE Notify Token fallback */}
              <div>
                <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-1.5">
                  LINE Notify Token (ตัวเลือกเสริม / Fallback)
                </label>
                <input
                  type="text"
                  value={settings.notifyToken}
                  onChange={e => setSettings({ ...settings, notifyToken: e.target.value })}
                  placeholder="ใส่ Token ของ LINE Notify (ถ้ามี)..."
                  className="w-full bg-[#04100C] border border-[#00FF87]/25 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-[#E6F4EA]/30 focus:outline-none focus:border-[#00FF87] transition font-mono"
                />
              </div>
            </div>

            {/* Box 2: เงื่อนไขการแจ้งเตือน */}
            <div className="nature-glass-card rounded-3xl p-6 sm:p-8 border border-[#00FF87]/20 shadow-xl space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#00FF87]/15">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">เงื่อนไขการแจ้งเตือน</h2>
              </div>

              {/* Master Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-[#00FF87]/15">
                <div>
                  <h3 className="text-xs font-black text-white">เปิดการแจ้งเตือน LINE</h3>
                  <p className="text-[11px] text-[#E6F4EA]/60 mt-0.5">เปิด/ปิดการส่งแจ้งเตือนผ่าน LINE ทั้งหมด</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-5 h-5 accent-[#00FF87] rounded cursor-pointer"
                />
              </div>

              {/* New Booking Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-[#00FF87]/15">
                <div>
                  <h3 className="text-xs font-black text-white">แจ้งเตือนเมื่อมีคำขอใหม่</h3>
                  <p className="text-[11px] text-[#E6F4EA]/60 mt-0.5">ส่ง LINE ทันทีเมื่อมีสมาชิกหรือ User จองห้องใหม่เข้ามา</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewBooking}
                  onChange={e => setSettings({ ...settings, notifyOnNewBooking: e.target.checked })}
                  className="w-5 h-5 accent-[#00FF87] rounded cursor-pointer"
                />
              </div>

              {/* Status Change Toggles */}
              <div>
                <label className="block text-xs font-bold text-[#E6F4EA]/80 mb-3">
                  สถานะที่ต้องการแจ้งเตือน (เมื่อเปลี่ยนสถานะการจอง)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* รอรับเรื่อง */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.pending ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.pending}
                      onChange={e => setStatusTriggers({ ...statusTriggers, pending: e.target.checked })}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Inbox className="w-4 h-4 text-amber-400" /> รอรับเรื่อง
                    </div>
                  </label>

                  {/* รับเรื่องแล้ว */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.confirmed ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.confirmed}
                      onChange={e => setStatusTriggers({ ...statusTriggers, confirmed: e.target.checked })}
                      className="accent-blue-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Clock className="w-4 h-4 text-blue-400" /> รับเรื่องแล้ว
                    </div>
                  </label>

                  {/* กำลังดำเนินการ */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.inProgress ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.inProgress}
                      onChange={e => setStatusTriggers({ ...statusTriggers, inProgress: e.target.checked })}
                      className="accent-purple-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Wrench className="w-4 h-4 text-purple-400" /> กำลังดำเนินการ
                    </div>
                  </label>

                  {/* รอชิ้นส่วน */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.waitingParts ? 'bg-orange-500/10 border-orange-500/40 text-orange-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.waitingParts}
                      onChange={e => setStatusTriggers({ ...statusTriggers, waitingParts: e.target.checked })}
                      className="accent-orange-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Package className="w-4 h-4 text-orange-400" /> รอชิ้นส่วน
                    </div>
                  </label>

                  {/* เสร็จสิ้น */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.completed ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.completed}
                      onChange={e => setStatusTriggers({ ...statusTriggers, completed: e.target.checked })}
                      className="accent-emerald-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Check className="w-4 h-4 text-emerald-400" /> เสร็จสิ้น
                    </div>
                  </label>

                  {/* ยกเลิก */}
                  <label className={'p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ' + (statusTriggers.cancelled ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-white/[0.02] border-white/10 text-[#E6F4EA]/60')}>
                    <input
                      type="checkbox"
                      checked={statusTriggers.cancelled}
                      onChange={e => setStatusTriggers({ ...statusTriggers, cancelled: e.target.checked })}
                      className="accent-rose-400 w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <X className="w-4 h-4 text-rose-400" /> ยกเลิก
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#00FF87]/15 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): ธีมการแจ้งเตือน & คำแนะนำ */}
          <div className="lg:col-span-4 space-y-6">
            {/* Box 3: ธีมการแจ้งเตือน */}
            <div className="nature-glass-card rounded-3xl p-6 border border-[#00FF87]/20 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#00FF87]/15">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <div>
                  <h3 className="text-sm font-black text-white">ธีมการแจ้งเตือน</h3>
                  <p className="text-[10px] text-[#E6F4EA]/60">สีและไอคอนสำหรับแต่ละสถานะใน Flex Message</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* 1. รอรับเรื่อง */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black uppercase">NEW</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">รอรับเรื่อง</p>
                      <p className="text-[9px] text-[#E6F4EA]/40">New Request</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-amber-500 shadow-sm"></span>
                </div>

                {/* 2. รับเรื่องแล้ว */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">🤝</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">รับเรื่องแล้ว</p>
                      <p className="text-[9px] text-[#E6F4EA]/40">Accepted</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-blue-500 shadow-sm"></span>
                </div>

                {/* 3. กำลังดำเนินการ */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">กำลังดำเนินการ</p>
                      <p className="text-[9px] text-[#E6F4EA]/40">In Progress</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-purple-500 shadow-sm"></span>
                </div>

                {/* 4. รอชิ้นส่วน */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">รอชิ้นส่วน</p>
                      <p className="text-[9px] text-[#E6F4EA]/40">Waiting Parts</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-orange-500 shadow-sm"></span>
                </div>

                {/* 5. เสร็จสิ้น */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300 leading-tight">เสร็จสิ้น</p>
                      <p className="text-[9px] text-emerald-400/60">Completed</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-emerald-500 shadow-sm"></span>
                </div>

                {/* 6. ยกเลิก */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <div>
                      <p className="text-xs font-bold text-rose-300 leading-tight">ยกเลิก</p>
                      <p className="text-[9px] text-rose-400/60">Cancelled</p>
                    </div>
                  </div>
                  <span className="w-4 h-4 rounded bg-slate-400 shadow-sm"></span>
                </div>
              </div>
            </div>

            {/* Box 4: คำแนะนำ */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-900/90 via-purple-950/80 to-blue-900/90 border border-indigo-500/30 shadow-xl space-y-3 text-white">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">คำแนะนำ</h3>
              </div>
              <ul className="text-[11px] space-y-2 text-indigo-100/90 leading-relaxed list-disc list-inside">
                <li><span className="font-bold text-white">Broadcast:</span> ผู้ใช้ต้อง Add บอทเป็นเพื่อนก่อนจึงจะได้รับข้อความการจองห้อง</li>
                <li><span className="font-bold text-white">Push:</span> ต้องมี User ID จากการ webhook ของ LINE</li>
                <li><span className="font-bold text-white">Flex Message:</span> รองรับเฉพาะ LINE app เท่านั้น</li>
                <li><span className="font-bold text-white">Logging:</span> ทุกการแจ้งเตือนถูกบันทึกไว้ด้านล่างใน Server Log</li>
              </ul>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
