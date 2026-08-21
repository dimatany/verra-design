/**
 * ЗНАК ЭКОСИСТЕМЫ — один на все продукты (решение владельца 21.08.2026:
 * «такое же лого в PR-приложении, что и на маркетинг-хабе»).
 * Исходник вырос в Metriverra (MihLogoAnimation); имена файлов/классов
 * сохранены ради совместимости анимации.
 */
'use client';

import React from 'react';

/**
 * Animated MIH logo mark (from the brand guide): four modules snap in,
 * connectors draw, the hub lands with a pulse, then the frame draws.
 * The whole mark is ONE color (brand rule: no odd-colored center square) —
 * the hub inherits `color` unless a placement explicitly overrides it.
 * `loop` remounts the SVG every cycle — used by loading screens.
 * Reduced motion → the finished logo renders statically.
 */
export default function MihLogoAnimation({
  size = 120,
  color = 'var(--color-neutral-dark)',
  hubColor,
  loop = false,
  className,
}: Readonly<{
  size?: number;
  color?: string;
  hubColor?: string;
  loop?: boolean;
  className?: string;
}>) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!loop) return;
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, [loop]);

  return (
    <svg
      key={tick}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      style={{ ['--mih-ink' as string]: color, ['--mih-hub' as string]: hubColor ?? color }}
      aria-hidden="true"
    >
      <style>{`
        .mih-module,.mih-hub,.mih-connector,.mih-frame{transform-box:fill-box;transform-origin:center}
        .mih-module{opacity:0;transform:scale(.55);animation:mihModuleIn .22s cubic-bezier(.2,.8,.2,1) forwards}
        .mih-m2{animation-delay:.05s}.mih-m3{animation-delay:.10s}.mih-m4{animation-delay:.15s}
        .mih-connector{stroke-dasharray:40;stroke-dashoffset:40;animation:mihDraw .20s ease-out forwards}
        .mih-c1{animation-delay:.23s}.mih-c2{animation-delay:.28s}.mih-c3{animation-delay:.33s}.mih-c4{animation-delay:.38s}
        .mih-hub{opacity:0;transform:scale(.2);animation:mihHubIn .20s cubic-bezier(.15,.9,.2,1.25) .46s forwards,mihPulse .32s ease-out .67s 1}
        .mih-frame{stroke-dasharray:190;stroke-dashoffset:190;animation:mihDraw .30s ease-out forwards}
        .mih-f1{animation-delay:.58s}.mih-f2{animation-delay:.62s}.mih-f3{animation-delay:.66s}.mih-f4{animation-delay:.70s}
        @keyframes mihModuleIn{to{opacity:1;transform:scale(1)}}
        @keyframes mihDraw{to{stroke-dashoffset:0}}
        @keyframes mihHubIn{to{opacity:1;transform:scale(1)}}
        @keyframes mihPulse{50%{filter:drop-shadow(0 0 18px var(--mih-hub))}}
        @media(prefers-reduced-motion:reduce){.mih-module,.mih-hub,.mih-connector,.mih-frame{animation:none!important;opacity:1;transform:none;stroke-dashoffset:0}}
      `}</style>
      <g fill="none" stroke="var(--mih-ink)" strokeLinecap="round" strokeLinejoin="round">
        <path className="mih-frame mih-f1" d="M96 208V168C96 128.2 128.2 96 168 96H208" strokeWidth={22} />
        <path className="mih-frame mih-f2" d="M304 96H344C383.8 96 416 128.2 416 168V208" strokeWidth={22} />
        <path className="mih-frame mih-f3" d="M416 304V344C416 383.8 383.8 416 344 416H304" strokeWidth={22} />
        <path className="mih-frame mih-f4" d="M208 416H168C128.2 416 96 383.8 96 344V304" strokeWidth={22} />
        <path className="mih-connector mih-c1" d="M256 196V222" strokeWidth={18} />
        <path className="mih-connector mih-c2" d="M290 256H316" strokeWidth={18} />
        <path className="mih-connector mih-c3" d="M256 290V316" strokeWidth={18} />
        <path className="mih-connector mih-c4" d="M196 256H222" strokeWidth={18} />
      </g>
      <g fill="var(--mih-ink)">
        <rect className="mih-module" x={214} y={116} width={84} height={80} rx={22} />
        <rect className="mih-module mih-m2" x={316} y={214} width={80} height={84} rx={22} />
        <rect className="mih-module mih-m3" x={214} y={316} width={84} height={80} rx={22} />
        <rect className="mih-module mih-m4" x={116} y={214} width={80} height={84} rx={22} />
        <circle className="mih-hub" cx={256} cy={256} r={34} fill="var(--mih-hub)" />
      </g>
    </svg>
  );
}

/** Loading state: looping logo build + the usual waiting text. */
export function LogoLoader({ label, size = 64, className }: Readonly<{ label: string; size?: number; className?: string }>) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className ?? ''}`}>
      <MihLogoAnimation size={size} loop />
      <span className="t-data font-bold text-neutral-dark/70 font-sans">{label}</span>
    </div>
  );
}
