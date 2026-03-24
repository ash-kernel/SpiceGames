import React from 'react';

const ICONS = {

  wishlist: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  discover: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={10}/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  library: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  itch: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={2} y={6} width={20} height={14} rx={3}/>
      <line x1={8} y1={6} x2={8} y2={3}/>
      <line x1={16} y1={6} x2={16} y2={3}/>
      <line x1={9} y1={13} x2={11} y2={13}/>
      <line x1={13} y1={13} x2={15} y2={13}/>
      <line x1={10} y1={11} x2={10} y2={15}/>
    </svg>
  ),
  deals: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={19} y1={5} x2={5} y2={19}/>
      <circle cx={6.5} cy={6.5} r={2.5}/>
      <circle cx={17.5} cy={17.5} r={2.5}/>
    </svg>
  ),
  news: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z"/>
      <line x1={18} y1={14} x2={12} y2={14}/>
      <line x1={15} y1={18} x2={12} y2={18}/>
      <rect x={12} y={6} width={6} height={4}/>
    </svg>
  ),
  controller: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
      <line x1={6} y1={12} x2={10} y2={12}/>
      <line x1={8} y1={10} x2={8} y2={14}/>
      <circle cx={15.5} cy={11.5} r={1} fill="currentColor"/>
      <circle cx={17.5} cy={13.5} r={1} fill="currentColor"/>
    </svg>
  ),
  screenshots: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx={12} cy={13} r={4}/>
    </svg>
  ),
  stats: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={18} y1={20} x2={18} y2={10}/>
      <line x1={12} y1={20} x2={12} y2={4}/>
      <line x1={6} y1={20} x2={6} y2={14}/>
      <line x1={2} y1={20} x2={22} y2={20}/>
    </svg>
  ),
  settings: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={3}/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  sysinfo: (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 7C5.5 6.17157 6.17157 5.5 7 5.5H15C16.933 5.5 18.5 7.067 18.5 9V17C18.5 17.8284 17.8284 18.5 17 18.5H7C6.17157 18.5 5.5 17.8284 5.5 17V7Z"/>
      <path d="M9 6V2"/>
      <path d="M9 22V18"/>
      <path d="M15 22V18"/>
      <path d="M22 15L18 15"/>
      <path d="M6 15L2 15"/>
      <path d="M6 9L2 9"/>
      <path d="M15 3V3C16.8638 3 17.7956 3 18.5307 3.30448C19.5108 3.71046 20.2895 4.48915 20.6955 5.46927C21 6.20435 21 7.13623 21 9V9"/>
    </svg>
  ),
};

export const Wishlist   = ICONS.wishlist;
export const Discover   = ICONS.discover;
export const Library    = ICONS.library;
export const Controller = ICONS.controller;
export const Itch       = ICONS.itch;
export const Deals      = ICONS.deals;
export const News       = ICONS.news;
export const Screenshots = ICONS.screenshots;
export const Stats      = ICONS.stats;
export const Settings   = ICONS.settings;
export const SystemInfo = ICONS.sysinfo;