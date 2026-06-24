'use client'

import { motion } from 'framer-motion'

export default function CoffeeShopAnimation() {
  return (
    <div className="relative w-full max-w-[340px] h-[260px] mx-auto flex items-center justify-center select-none pointer-events-none">
      {/* Background Glow */}
      <div className="absolute w-[220px] h-[220px] bg-amber-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Main Coffee Shop SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl overflow-visible"
      >
        {/* Styling for inline animations */}
        <style>{`
          @keyframes steam {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-40px) scale(1.3); opacity: 0; }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 2px #F59E0B) drop-shadow(0 0 6px #F59E0B); }
            50% { filter: drop-shadow(0 0 4px #F59E0B) drop-shadow(0 0 12px #F59E0B); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(1deg); }
          }
          @keyframes drip {
            0% { transform: translateY(0); opacity: 0; }
            30% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(24px); opacity: 0; }
          }
          .steam-1 { animation: steam 4s infinite linear; transform-origin: center bottom; }
          .steam-2 { animation: steam 4s infinite linear; animation-delay: 1.5s; transform-origin: center bottom; }
          .steam-3 { animation: steam 4s infinite linear; animation-delay: 2.8s; transform-origin: center bottom; }
          .neon-glow { animation: glow 3s infinite ease-in-out; }
          .shop-awning { animation: sway 5s infinite ease-in-out; transform-origin: top center; }
          .coffee-drip { animation: drip 2.5s infinite ease-in; }
        `}</style>

        {/* Coffee Shop Ground / Platform */}
        <path d="M40 250 H360 V260 H40 Z" fill="#3E2723" opacity="0.15" />
        <rect x="50" y="240" width="300" height="10" rx="5" fill="#5D4037" />

        {/* Shop Main Building Structure */}
        <rect
          x="70"
          y="110"
          width="260"
          height="130"
          rx="8"
          fill="#F5E6D3"
          stroke="#3E2723"
          strokeWidth="4"
        />

        {/* Inside Cafe Backdrop (Warm Glow) */}
        <rect x="85" y="125" width="230" height="105" rx="4" fill="#FFF8E7" />

        {/* Coffee Bar Counter */}
        <rect
          x="85"
          y="195"
          width="230"
          height="35"
          fill="#EAD9CB"
          stroke="#3E2723"
          strokeWidth="3"
        />

        {/* Coffee Espresso Machine on Counter */}
        <g transform="translate(110, 160)">
          <rect
            x="0"
            y="0"
            width="45"
            height="35"
            rx="3"
            fill="#9E9E9E"
            stroke="#3E2723"
            strokeWidth="3"
          />
          <rect x="8" y="12" width="29" height="16" fill="#E0E0E0" />
          {/* Coffee Portafilter */}
          <line x1="22" y1="28" x2="22" y2="35" stroke="#3E2723" strokeWidth="3" />
          <line x1="22" y1="35" x2="35" y2="35" stroke="#3E2723" strokeWidth="3" />

          {/* Coffee Drip */}
          <circle cx="22" cy="30" r="2.5" fill="#3E2723" className="coffee-drip" />
        </g>

        {/* Floating Coffee Cup on Bar Counter */}
        <g transform="translate(240, 175)">
          {/* Cup body */}
          <path d="M0 0 H25 L21 18 C20 21 17 22 12.5 22 C8 22 5 21 4 18 Z" fill="#3E2723" />
          {/* Cup handle */}
          <path d="M23 4 C27 4 27 12 23 12" stroke="#3E2723" strokeWidth="2.5" fill="none" />
          {/* Saucer */}
          <ellipse
            cx="12.5"
            cy="22"
            rx="16"
            ry="3.5"
            fill="#EAD9CB"
            stroke="#3E2723"
            strokeWidth="2"
          />

          {/* Steam Elements */}
          <path
            d="M8 -6 Q12 -16 8 -26"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="steam-1"
          />
          <path
            d="M13 -8 Q9 -20 13 -32"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="steam-2"
          />
          <path
            d="M17 -5 Q21 -14 17 -22"
            stroke="#5D4037"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="steam-3"
          />
        </g>

        {/* Neon Sign Board */}
        <g transform="translate(150, 45)">
          <rect
            x="0"
            y="0"
            width="100"
            height="40"
            rx="8"
            fill="#212121"
            stroke="#3E2723"
            strokeWidth="3"
          />
          {/* Hanging Chains */}
          <line x1="20" y1="0" x2="20" y2="-20" stroke="#3E2723" strokeWidth="2.5" />
          <line x1="80" y1="0" x2="80" y2="-20" stroke="#3E2723" strokeWidth="2.5" />
          {/* Neon Logo / Text */}
          <text
            x="50"
            y="26"
            fill="#F59E0B"
            fontSize="13"
            fontWeight="900"
            textAnchor="middle"
            className="neon-glow font-black"
          >
            ☕ MAZAJ
          </text>
        </g>

        {/* Shop Awning (Striped Roof) */}
        <g className="shop-awning">
          {/* Awning Main */}
          <path
            d="M60 110 L80 80 H320 L340 110 Z"
            fill="#3E2723"
            stroke="#3E2723"
            strokeWidth="3"
          />
          {/* Stripes */}
          <path d="M87 80 L95 110 H125 L110 80 Z" fill="#FAF8F5" />
          <path d="M142 80 L145 110 H175 L165 80 Z" fill="#FAF8F5" />
          <path d="M198 80 L195 110 H225 L220 80 Z" fill="#FAF8F5" />
          <path d="M254 80 L245 110 H275 L275 80 Z" fill="#FAF8F5" />
          <path d="M302 80 L295 110 H320 L320 80 Z" fill="#FAF8F5" />

          {/* Awning Valance (Wavy Bottom) */}
          <path
            d="M60 110 Q70 120 80 110 Q90 120 100 110 Q110 120 120 110 Q130 120 140 110 Q150 120 160 110 Q170 120 180 110 Q190 120 200 110 Q210 120 220 110 Q230 120 240 110 Q250 120 260 110 Q270 120 280 110 Q290 120 300 110 Q310 120 320 110 Q330 120 340 110 V115 H60 Z"
            fill="#3E2723"
          />
        </g>

        {/* Floating Coffee Beans around the Shop */}
        <g transform="translate(0, 0)">
          {/* Bean 1 */}
          <motion.path
            d="M320 70 C320 65 325 60 330 60 C335 60 335 68 330 70 C325 72 320 75 320 70 Z"
            fill="#5D4037"
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Bean 2 */}
          <motion.path
            d="M60 160 C60 155 65 150 70 150 C75 150 75 158 70 160 C65 162 60 165 60 160 Z"
            fill="#3E2723"
            animate={{ y: [0, -12, 0], rotate: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          {/* Bean 3 */}
          <motion.path
            d="M340 190 C340 185 345 180 350 180 C355 180 355 188 350 190 C345 192 340 195 340 190 Z"
            fill="#5D4037"
            animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </g>
      </svg>
    </div>
  )
}
