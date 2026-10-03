export const theme = {
  page: "relative min-h-screen bg-black text-slate-200",
  container: "relative z-10 max-w-6xl mx-auto px-6 py-16",
  title: "text-4xl sm:text-5xl font-bold mb-2 text-yellow-500 tracking-tight",
  tagline: "text-slate-400 mb-10 text-sm",

  input:
    "flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors",
  button:
    "bg-yellow-500 hover:bg-yellow-400 text-black disabled:bg-zinc-800 disabled:text-zinc-500 px-6 py-3 rounded-lg font-semibold transition-colors",
  buttonGhost:
    "bg-zinc-950 border border-zinc-700 text-yellow-500 hover:bg-zinc-900 disabled:opacity-50 px-5 py-2.5 rounded-lg font-semibold transition-colors",

  card: "bg-zinc-950 border border-zinc-800 rounded-xl p-5",
  cardIndex: "text-zinc-600 font-mono text-xs",
  cardTitle: "text-sm font-semibold text-yellow-500 uppercase tracking-wide",
  label: "text-xs text-zinc-500 uppercase tracking-wide font-medium",
  text: "text-slate-200",
  muted: "text-zinc-500 text-sm",
  value: "font-mono text-xs text-zinc-300 break-all",
  divider: "border-zinc-800",
  link: "text-yellow-500 underline hover:text-yellow-400",
  skeleton: "rounded bg-zinc-800",
  tile: "border border-zinc-800 bg-zinc-900 rounded-lg p-2",
  barTrack: "h-1.5 w-full rounded bg-zinc-800",
  barFill: "h-1.5 rounded bg-yellow-500",
  chip: "inline-block px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 font-mono text-xs",
  chipWarn:
    "inline-block px-2 py-0.5 rounded border border-amber-700 bg-amber-950 text-amber-400 font-mono text-xs",
  errorText: "text-red-400 text-sm",
  errorBox: "bg-red-950 border border-red-800 text-red-300 rounded-lg p-4 text-sm",

  badgeBase: "px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 border",
  badge: {
    critical: "bg-red-950 text-red-400 border-red-800",
    warning: "bg-amber-950 text-amber-400 border-amber-800",
    info: "bg-zinc-900 text-yellow-500 border-zinc-700",
  },

  statCritical: "text-red-400",
  statWarning: "text-amber-400",
  statInfo: "text-yellow-500",
} as const;