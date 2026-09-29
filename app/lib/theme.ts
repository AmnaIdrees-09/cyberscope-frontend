export const theme = {
  page: "relative min-h-screen bg-black text-yellow-50",
  container: "relative z-10 max-w-6xl mx-auto px-6 py-16",
  title: "text-5xl font-bold mb-2 text-yellow-500 font-mono tracking-wide",
  tagline: "text-yellow-700 mb-10 font-mono text-sm",

  input:
    "flex-1 bg-black/70 backdrop-blur border border-yellow-800 rounded-lg px-4 py-3 text-yellow-50 placeholder-yellow-900 font-mono focus:outline-none focus:border-yellow-500 focus:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-shadow",
  button:
    "bg-yellow-600 hover:bg-yellow-500 text-black disabled:bg-neutral-800 disabled:text-neutral-500 px-6 py-3 rounded-lg font-bold font-mono transition-colors",
  buttonGhost:
    "border border-yellow-700 text-yellow-500 hover:bg-yellow-950 disabled:opacity-50 px-5 py-2.5 rounded-lg font-bold font-mono transition-colors",

  card: "bg-black/70 backdrop-blur border border-yellow-800 rounded-xl p-5 shadow-[0_0_40px_rgba(212,175,55,0.08)]",
  cardIndex: "text-yellow-800 font-mono text-xs",
  cardTitle: "text-sm font-bold text-yellow-500 font-mono uppercase tracking-widest",
  label: "text-xs text-yellow-700 font-mono uppercase tracking-widest",
  text: "text-yellow-100",
  muted: "text-yellow-800 text-sm",
  value: "font-mono text-xs text-yellow-600 break-all",
  divider: "border-yellow-900",
  link: "text-yellow-500 underline hover:text-yellow-400",
  skeleton: "rounded bg-yellow-900/30",
  tile: "border border-yellow-900 rounded-lg p-2",
  barTrack: "h-1.5 w-full rounded bg-neutral-900",
  barFill: "h-1.5 rounded bg-yellow-500",
  chip: "inline-block px-2 py-0.5 rounded border border-yellow-800 text-yellow-600 font-mono text-xs",
  chipWarn:
    "inline-block px-2 py-0.5 rounded border border-orange-800 text-orange-400 font-mono text-xs",
  errorText: "text-red-400 text-sm font-mono",
  errorBox:
    "bg-red-950/80 border border-red-800 text-red-300 rounded-lg p-4 font-mono text-sm",

  badgeBase:
    "px-2 py-0.5 rounded text-xs font-mono font-bold flex-shrink-0 border",
  badge: {
    critical: "bg-red-950 text-red-400 border-red-800",
    warning: "bg-orange-950 text-orange-400 border-orange-800",
    info: "bg-neutral-900 text-yellow-500 border-yellow-700",
  },

  statCritical: "text-red-400",
  statWarning: "text-orange-400",
  statInfo: "text-yellow-500",
} as const;