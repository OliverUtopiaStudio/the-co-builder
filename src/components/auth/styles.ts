/**
 * Shared style constants for auth pages (login, signup, reset-password).
 * These live here so dark-theme input/label/button styles are defined once.
 */

/** Dark-theme input — white/5 bg, white/10 border, accent on focus */
export const authInputClass =
  "w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent placeholder:text-white/30 text-base transition-colors";

/** Uppercase label — white/50 text, 11px, 2px letter-spacing */
export const authLabelClass =
  "block mb-2 text-[11px] font-normal tracking-[2px] uppercase text-white/50";

/** Primary button — accent bg, full-width, semibold */
export const authButtonClass =
  "w-full py-3.5 bg-accent text-white font-semibold text-[15px] hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

/** Error banner — red-tinted, 2px border-radius */
export const authErrorStyle = {
  borderRadius: 2,
  background: "rgba(239, 68, 68, 0.08)",
  borderColor: "rgba(239, 68, 68, 0.2)",
  color: "rgba(239, 68, 68, 0.9)",
} as const;

/** Success banner — green-tinted, 2px border-radius */
export const authSuccessStyle = {
  borderRadius: 2,
  background: "rgba(74, 222, 128, 0.08)",
  borderColor: "rgba(74, 222, 128, 0.2)",
  color: "rgba(74, 222, 128, 0.9)",
} as const;
