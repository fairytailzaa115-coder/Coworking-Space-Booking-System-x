import React from 'react';

export interface BankOption {
  id: string;
  name: string;
  code: string;
  accountNumber: string;
  accountName: string;
  color: string;
  badgeColor: string;
  dotColor: string;
  logoLetter: string;
  bgHex: string;
  textColor: string;
  svgType: 'kbank' | 'scb' | 'bbl' | 'ktb' | 'ttb' | 'bay' | 'gsb';
}

export const BANK_OPTIONS: BankOption[] = [
  {
    id: 'kbank',
    name: 'ธนาคารกสิกรไทย (Kasikornbank)',
    code: 'KBANK',
    accountNumber: '123-4-56789-0',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-emerald-950/90 to-[#005A32]/40 border-emerald-500/30 text-emerald-400',
    badgeColor: 'bg-[#138f2d] text-white border-emerald-400/40',
    dotColor: 'bg-[#138f2d]',
    logoLetter: 'K',
    bgHex: '#138f2d',
    textColor: '#ffffff',
    svgType: 'kbank'
  },
  {
    id: 'scb',
    name: 'ธนาคารไทยพาณิชย์ (Siam Commercial Bank)',
    code: 'SCB',
    accountNumber: '456-7-89012-3',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-purple-950/90 to-[#4E2A84]/40 border-purple-500/30 text-purple-300',
    badgeColor: 'bg-[#4E2A84] text-white border-purple-400/40',
    dotColor: 'bg-[#9063cd]',
    logoLetter: 'SCB',
    bgHex: '#4E2A84',
    textColor: '#ffffff',
    svgType: 'scb'
  },
  {
    id: 'bbl',
    name: 'ธนาคารกรุงเทพ (Bangkok Bank)',
    code: 'BBL',
    accountNumber: '789-0-12345-6',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-blue-950/90 to-[#1e3f8a]/40 border-blue-500/30 text-blue-300',
    badgeColor: 'bg-[#1e3f8a] text-white border-blue-400/40',
    dotColor: 'bg-[#2563eb]',
    logoLetter: 'BBL',
    bgHex: '#1e3f8a',
    textColor: '#ffffff',
    svgType: 'bbl'
  },
  {
    id: 'ktb',
    name: 'ธนาคารกรุงไทย (Krungthai Bank)',
    code: 'KTB',
    accountNumber: '012-3-45678-9',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-sky-950/90 to-[#00A3E0]/40 border-sky-500/30 text-sky-300',
    badgeColor: 'bg-[#00A3E0] text-white border-sky-400/40',
    dotColor: 'bg-[#00A3E0]',
    logoLetter: 'KTB',
    bgHex: '#00A3E0',
    textColor: '#ffffff',
    svgType: 'ktb'
  },
  {
    id: 'ttb',
    name: 'ธนาคารทหารไทยธนชาต (ttb)',
    code: 'TTB',
    accountNumber: '321-9-87654-3',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-blue-950/90 to-[#002d63]/40 border-blue-400/30 text-blue-200',
    badgeColor: 'bg-[#002d63] text-white border-blue-300/40',
    dotColor: 'bg-[#f05a22]',
    logoLetter: 'ttb',
    bgHex: '#002d63',
    textColor: '#ffffff',
    svgType: 'ttb'
  },
  {
    id: 'bay',
    name: 'ธนาคารกรุงศรีอยุธยา (Krungsri Bank)',
    code: 'BAY',
    accountNumber: '654-3-21098-7',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-amber-950/90 to-[#785b28]/40 border-amber-500/30 text-amber-300',
    badgeColor: 'bg-[#FEC431] text-[#4a3500] border-amber-400/40 font-black',
    dotColor: 'bg-[#FEC431]',
    logoLetter: 'BAY',
    bgHex: '#FEC431',
    textColor: '#4a3500',
    svgType: 'bay'
  },
  {
    id: 'gsb',
    name: 'ธนาคารออมสิน (Government Savings Bank)',
    code: 'GSB',
    accountNumber: '987-6-54321-0',
    accountName: 'บมจ Coworking Space Booking System',
    color: 'from-pink-950/90 to-[#eb1985]/40 border-pink-500/30 text-pink-300',
    badgeColor: 'bg-[#eb1985] text-white border-pink-400/40',
    dotColor: 'bg-[#eb1985]',
    logoLetter: 'GSB',
    bgHex: '#eb1985',
    textColor: '#ffffff',
    svgType: 'gsb'
  }
];
