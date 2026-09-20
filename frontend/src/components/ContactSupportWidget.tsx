'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Headphones, 
  HelpCircle, 
  CheckCircle2, 
  Smile, 
  MessageSquareHeart,
  PhoneCall
} from 'lucide-react';

export default function ContactSupportWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'ชมเชย' | 'แจ้งปัญหา' | 'ข้อเสนอแนะ'>('ข้อเสนอแนะ');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSender, setFeedbackSender] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // LINE Official URL / Chat link (Default can be configured, e.g. https://line.me/ti/p/@coworking or custom LINE OA link)
  const [lineOfficialUrl, setLineOfficialUrl] = useState('https://line.me/R/ti/p/@coworking');

  useEffect(() => {
    // Check if custom line link is stored
    const saved = localStorage.getItem('lineOfficialUrl');
    if (saved) {
      setLineOfficialUrl(saved);
    }
  }, []);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'สวัสดีครับ ยินดีต้อนรับสู่ Coworking Space Booking System มีอะไรให้เจ้าหน้าที่ช่วยดูแลไหมครับ? 😊',
      time: 'ตอนนี้'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const timeNow = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setInputMsg('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'ขอบคุณสำหรับข้อความครับ เจ้าหน้าที่ได้รับข้อความเรียบร้อยแล้ว หรือติดต่อเร่งด่วนได้ที่ LINE: @coworkingspace หรือโทร 02-123-4567 ครับ',
          time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      setFeedbackSender('');
      setOpenFeedback(false);
    }, 2000);
  };

  return (
    <>
      {/* ── Floating Side Action Buttons (Right-aligned Advice style) ── */}
      <div className="fixed right-4 sm:right-6 bottom-6 z-50 flex flex-col items-center gap-3 select-none">
        
        {/* Expanded Child Icons (Animates in when isExpanded is true) */}
        {isExpanded && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* 1. ปุ่ม "ติชม / แจ้งเรื่อง" สไตล์มาสคอต Advice พร้อม badge */}
            <div className="relative group flex flex-col items-center">
              <button
                onClick={() => {
                  setOpenFeedback(true);
                  setOpenChat(false);
                }}
                title="ติชม / แจ้งเรื่อง"
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 relative flex items-center justify-center cursor-pointer group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]"
              >
                {/* Mascot Inner Face */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-sky-300 to-blue-600 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-1 w-7 h-3.5 border-t-2 border-white/80 rounded-t-full"></div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>
                  <Smile className="w-3 h-3 text-white/90 -mt-0.5" />
                </div>

                {/* Heart bubble */}
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-rose-500 border border-white text-white flex items-center justify-center text-[9px] shadow-sm animate-bounce">
                  ❤️
                </span>
              </button>

              <span className="mt-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold shadow-md tracking-tight whitespace-nowrap border border-white/20">
                ติชม / แจ้งเรื่อง
              </span>
            </div>

            {/* 2. แคปซูลรวม LINE & Facebook (รูปทรงแคปซูลขอบมน Advice Style) */}
            <div className="bg-white rounded-full p-1.5 shadow-2xl border-2 border-sky-400/30 flex flex-col gap-1.5 items-center backdrop-blur-md">
              {/* LINE Official Account Chat Button */}
              <a
                href={lineOfficialUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="แชทกับแอดมินผ่าน LINE Official Account"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#06C755] flex items-center justify-center text-white font-black text-xs shadow-md hover:scale-110 hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.98 1.76 5.6 4.45 7.15-.2.72-.72 2.62-.83 3.01-.13.48.18.47.38.34.15-.1 2.37-1.61 3.33-2.27.87.16 1.76.24 2.67.24 5.52 0 10-3.92 10-8.72S17.52 2 12 2zm-3.6 11.2h-1.6v-5h1.6v5zm3.2 0h-1.6v-5h1.6v5zm3.2 0h-1.6v-5h1.6v5zm3.2 0h-1.6v-5h1.6v5z" />
                </svg>
              </a>

              {/* Facebook Button */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                title="ติดต่อแอดมินผ่าน Facebook"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md hover:scale-110 hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>

            {/* 3. ปุ่ม Live Chat แชทกับเจ้าหน้าที่ในเว็บ */}
            <button
              onClick={() => {
                setOpenChat(!openChat);
                setOpenFeedback(false);
              }}
              title="แชทสดกับเจ้าหน้าที่"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center text-forest-950 font-black shadow-lg hover:scale-110 active:scale-95 transition"
            >
              <MessageCircle className="w-5 h-5 text-forest-950" />
            </button>
          </div>
        )}

        {/* ── Main Trigger Mascot Button (กดแล้วเด้งเปิด / ปิด เมนูติดต่อทั้งหมด) ── */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'ปิดเมนู' : 'ติดต่อเจ้าหน้าที่ / แอดมิน'}
            className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 p-0.5 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative flex items-center justify-center cursor-pointer group hover:shadow-[0_0_25px_rgba(0,255,135,0.6)]"
          >
            {isExpanded ? (
              /* Close (X) icon when open */
              <div className="w-full h-full rounded-full bg-forest-950 flex items-center justify-center text-[#00FF87] border border-[#00FF87]/40 shadow-inner">
                <X className="w-7 h-7 stroke-[3] transition-transform duration-300 rotate-90 group-hover:rotate-180" />
              </div>
            ) : (
              /* Advice Mascot Robot Face */
              <div className="w-full h-full rounded-full bg-gradient-to-b from-cyan-300 via-sky-500 to-teal-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {/* Robot antenna */}
                <div className="absolute top-1 w-1 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
                {/* Eyes */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-cyan-800 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-900"></span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-cyan-800 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-900"></span>
                  </span>
                </div>
                {/* Pink Cheeks */}
                <div className="flex items-center gap-4 mt-0.5">
                  <span className="w-1.5 h-1 rounded-full bg-pink-300/90"></span>
                  <span className="w-1.5 h-1 rounded-full bg-pink-300/90"></span>
                </div>
                {/* Mouth / Badge */}
                <div className="w-3.5 h-1.5 rounded-full bg-yellow-300 mt-0.5 flex items-center justify-center">
                  <span className="w-1.5 h-1 rounded-full bg-teal-800"></span>
                </div>
              </div>
            )}

            {/* Online Green Status Indicator */}
            {!isExpanded && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse shadow-sm"></span>
            )}
          </button>

          {/* Label under mascot */}
          {!isExpanded && (
            <span className="mt-1 px-2 py-0.5 rounded-full bg-[#04100C]/90 text-[#00FF87] text-[10px] font-bold shadow-md tracking-tight border border-[#00FF87]/30 whitespace-nowrap animate-pulse">
              ติดต่อแอดมิน
            </span>
          )}
        </div>

      </div>

      {/* ── Modal 1: กล่องข้อความแชทสดติดต่อเจ้าหน้าที่ (Live Chat Popup) ── */}
      {openChat && (
        <div className="fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-50 w-[92vw] sm:w-[360px] max-h-[520px] rounded-3xl bg-[#071E17]/95 border border-[#00FF87]/30 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-b border-emerald-500/20 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-forest-950 font-black shadow-md">
                  <Headphones className="w-5 h-5 text-forest-950" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white absolute -top-0.5 -right-0.5"></span>
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  ฝ่ายบริการและดูแลระบบ
                </h3>
                <p className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span> พร้อมตอบคำถามทันที
                </p>
              </div>
            </div>
            <button 
              onClick={() => setOpenChat(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[320px] text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#00FF87] to-teal-400 text-forest-950 font-medium rounded-br-none shadow-md'
                      : 'bg-white/10 border border-white/10 text-emerald-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-emerald-100/40 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Channels */}
          <div className="px-4 py-2 bg-forest-950/60 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-emerald-100/60">ช่องทางด่วน:</span>
            <div className="flex gap-2">
              <a href={lineOfficialUrl} target="_blank" rel="noopener noreferrer" className="text-[#06C755] font-bold hover:underline">LINE OA (แชททันที)</a>
              <span className="text-white/20">•</span>
              <a href="tel:021234567" className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5">
                <PhoneCall className="w-3 h-3" /> 02-123-4567
              </a>
            </div>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendChat} className="p-3 bg-forest-950/80 border-t border-emerald-500/20 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              placeholder="พิมพ์ข้อความคุยกับเจ้าหน้าที่..."
              className="flex-1 bg-white/5 border border-emerald-500/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-emerald-100/30 outline-none focus:border-[#00FF87]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00FF87] to-teal-400 hover:brightness-110 text-forest-950 font-bold text-xs flex items-center justify-center transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ── Modal 2: กล่องฟอร์ม "ติชม / แจ้งเรื่อง" (Advice Style Feedback Form) ── */}
      {openFeedback && (
        <div className="fixed right-4 sm:right-6 bottom-24 sm:bottom-28 z-50 w-[92vw] sm:w-[380px] rounded-3xl bg-[#071E17]/95 border border-sky-400/40 backdrop-blur-2xl shadow-2xl p-5 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-sky-400">
                <MessageSquareHeart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black">ศูนย์รับเรื่องติชม / แจ้งปัญหา</h3>
                <p className="text-[10px] text-emerald-100/50">ส่งตรงถึงฝ่ายบริหารและทีมแอดมิน</p>
              </div>
            </div>
            <button
              onClick={() => setOpenFeedback(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {feedbackSubmitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#00FF87] animate-bounce" />
              <h4 className="font-bold text-base text-white">ขอบคุณสำหรับข้อมูลครับ!</h4>
              <p className="text-xs text-emerald-100/70">เจ้าหน้าที่และผู้ดูแลระบบได้รับข้อความแล้ว จะนำไปพัฒนาและปรับปรุงให้ดียิ่งขึ้นครับ</p>
            </div>
          ) : (
            <form onSubmit={handleSendFeedback} className="space-y-3.5 pt-3">
              {/* Type Select */}
              <div>
                <label className="text-[11px] font-bold text-emerald-200/80 block mb-1.5">ประเภทเรื่อง</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ข้อเสนอแนะ', 'แจ้งปัญหา', 'ชมเชย'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                        feedbackType === type
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {type === 'ชมเชย' ? '💖 ' : type === 'แจ้งปัญหา' ? '⚠️ ' : '💡 '}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Name */}
              <div>
                <label className="text-[11px] font-bold text-emerald-200/80 block mb-1">ชื่อหรือเบอร์ติดต่อ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={feedbackSender}
                  onChange={e => setFeedbackSender(e.target.value)}
                  placeholder="เช่น สมชาย หรือ 081-xxx-xxxx"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-sky-400"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold text-emerald-200/80 block mb-1">รายละเอียดข้อความ <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="กรอกข้อความติชม ข้อเสนอแนะ หรือปัญหาที่พบ..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-sky-400 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> ส่งเรื่องถึงผู้ดูแลระบบ
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
