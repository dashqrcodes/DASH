"use client";

type Props = {
  photoUrl: string;
  qrUrl: string;
  accentColor?: string | null;
};

function buildBadgeStyle(color?: string | null) {
  if (!color) {
    return {
      background: 'rgba(255,255,255,0.35)',
      borderColor: 'rgba(255,255,255,0.6)',
    } as const;
  }

  return {
    background: `${color}33`,
    borderColor: color,
    boxShadow: `0 6px 18px ${color}55`,
  } as const;
}

export default function AcrylicMockup({ photoUrl, qrUrl, accentColor }: Props) {
  const badgeStyle = buildBadgeStyle(accentColor);

  return (
    <div className="relative h-[420px] w-[300px] rounded-[18px] border border-white/20 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="relative h-full w-full overflow-hidden rounded-[12px] border border-white/10 bg-black">
        <img
          src={photoUrl}
          alt="Acrylic mockup"
          className="h-full w-full rounded-[12px] object-cover"
        />
        <img
          src={qrUrl}
          alt="QR code"
          className="absolute bottom-3 left-3 h-[24px] w-[24px] rounded-[6px] border p-[2px]"
          style={badgeStyle}
        />
      </div>
    </div>
  );
}
