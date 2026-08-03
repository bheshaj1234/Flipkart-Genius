import React from 'react';

export default function FlipkartLogo({ theme, className = "h-7 w-7", textClass = "text-xl" }) {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Yellow Bag Icon SVG */}
      <div className="shrink-0 flex items-center justify-center">
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rounded Yellow Square Bag */}
          <rect x="5" y="5" width="90" height="90" rx="24" fill="#FFE500" />
          {/* Blue Speed lines and 'f' */}
          <path d="M32 54.5H46V46.5C46 39.5 51.5 34 58.5 34H72V46.5H64C61.5 46.5 60 48 60 50.5V54.5H72L70 66.5H60V90H46V66.5H32V54.5Z" fill="#1A55E3" />
          {/* Speed lines */}
          <path d="M21 57H32" stroke="#1A55E3" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 63H28" stroke="#1A55E3" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 69H29" stroke="#1A55E3" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      {/* Brand Text */}
      <span className={`font-extrabold italic tracking-tight font-sans ${textClass} ${
        theme === 'dark' ? 'text-white' : 'text-[#2874F0]'
      }`}>
        Flipkart
      </span>
    </div>
  );
}
