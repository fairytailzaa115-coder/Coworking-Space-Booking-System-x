import React from 'react';
import Link from 'next/link';
import { Leaf, Heart, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-500/10 bg-forest-950/80 pt-16 pb-12 text-emerald-100/60 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-emerald-500/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-forest-950">
                <Leaf className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Coworking Space <span className="text-emerald-400 font-semibold">Booking System</span>
              </span>
            </div>
            <p className="text-emerald-100/60 leading-relaxed">
              แพลตฟอร์มจองพื้นที่ทำงานยุคใหม่ ออกแบบภายใต้แนวคิด Green Tech ผสานเทคโนโลยีประหยัดพลังงาน IoT และระบบ Concurrency-Safe Zero Double Booking
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">บริการพื้นที่</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition">Hot Desk รายชั่วโมง</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition">ห้องประชุม Smart Meeting Room</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition">Private Office ส่วนตัว</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition">Acoustic Sound Pod</Link></li>
            </ul>
          </div>

          {/* Technology & Architecture */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">สถาปัตยกรรมระบบ</h4>
            <ul className="space-y-2">
              <li>Next.js 14 App Router + Tailwind</li>
              <li>Java Spring Boot 3 (OOP Engine)</li>
              <li>PostgreSQL Concurrency Lock</li>
              <li>Strategy Pattern Membership</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">ติดต่อเรา</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Interchange 21, Level 24, Asoke, Bangkok</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /><a href="mailto:contact@ecospace.tech" className="hover:text-emerald-400 transition-colors" data-cfemail="disabled">{'contact@ecospace.tech'}</a></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> 02-123-4567 (24/7 Support)</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-emerald-100/40">
          <p>© 2026 Coworking Space Booking System. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-emerald-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-emerald-400">Terms of Service</Link>
            <Link href="#" className="hover:text-emerald-400">System Architecture</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
