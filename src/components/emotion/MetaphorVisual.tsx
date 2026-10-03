import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./metaphor-visual.module.css";

export type MetaphorKind = "bridge" | "bloom" | "flow";

export interface MetaphorVisualProps {
  kind: MetaphorKind;
  className?: string;
  /** A slow, cumulative visual richness signal. Zero is already a complete, healthy scene. */
  growth?: number;
  /** Use for atmospheric backdrops and reflective contexts. */
  quiet?: boolean;
  paused?: boolean;
}

const CONTOURS = Array.from({ length: 19 }, (_, index) => index / 18);
const RIBBON_CONTOURS = Array.from({ length: 17 }, (_, index) => index / 16);

const plum = "var(--emotion-plum, hsl(var(--primary)))";
const coral = "var(--emotion-coral, hsl(var(--connection)))";
const gold = "var(--emotion-gold, hsl(var(--growth)))";
const light = "var(--emotion-light, hsl(var(--background)))";

/**
 * Three behaviors of one material: folded, translucent membranes with fine edges.
 * No score, diagnosis or mood is encoded here. The caller supplies optional earned
 * richness; the artwork remains welcoming at every value.
 */
export function MetaphorVisual({
  kind,
  className,
  growth = 0.15,
  quiet = false,
  paused = false,
}: MetaphorVisualProps) {
  const id = `sparq-material-${useId().replace(/:/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  const richness = Number.isFinite(growth) ? Math.min(1, Math.max(0, growth)) : 0.15;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let inView = true;
    // A single attribute toggles compositor animation; there are no frame updates,
    // timers, or React renders while the material is moving.
    const updateActivity = () => {
      node.dataset.paused = String(paused || !inView || document.hidden);
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        updateActivity();
      },
      { rootMargin: "60px" },
    );
    observer?.observe(node);
    updateActivity();
    document.addEventListener("visibilitychange", updateActivity);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, [paused]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 600 440"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(styles.visual, className)}
      data-metaphor={kind}
      data-quiet={quiet}
      data-paused={paused}
    >
      <defs>
        <linearGradient id={`${id}-plum`} x1="0.18" y1="0.1" x2="0.82" y2="0.95" gradientUnits="objectBoundingBox">
          <stop stopColor={plum} stopOpacity="0.08" />
          <stop offset="0.42" stopColor={plum} stopOpacity="0.55" />
          <stop offset="0.76" stopColor={coral} stopOpacity="0.46" />
          <stop offset="1" stopColor={gold} stopOpacity="0.17" />
        </linearGradient>
        <linearGradient id={`${id}-coral`} x1="0.1" y1="0.1" x2="0.85" y2="0.9" gradientUnits="objectBoundingBox">
          <stop stopColor={gold} stopOpacity="0.12" />
          <stop offset="0.36" stopColor={coral} stopOpacity="0.47" />
          <stop offset="0.73" stopColor={coral} stopOpacity="0.3" />
          <stop offset="1" stopColor={plum} stopOpacity="0.36" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0.3" y1="0.95" x2="0.65" y2="0.1" gradientUnits="objectBoundingBox">
          <stop stopColor={plum} stopOpacity="0.3" />
          <stop offset="0.45" stopColor={coral} stopOpacity="0.25" />
          <stop offset="0.75" stopColor={gold} stopOpacity="0.35" />
          <stop offset="1" stopColor={gold} stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="70" y1="95" x2="500" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor={plum} stopOpacity="0.45" />
          <stop offset="0.4" stopColor={coral} stopOpacity="0.67" />
          <stop offset="0.68" stopColor={gold} stopOpacity="0.72" />
          <stop offset="1" stopColor={plum} stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${id}-thread`} x1="205" y1="200" x2="400" y2="245" gradientUnits="userSpaceOnUse">
          <stop stopColor={plum} stopOpacity="0.3" />
          <stop offset="0.38" stopColor={coral} stopOpacity="0.85" />
          <stop offset="0.62" stopColor={gold} />
          <stop offset="1" stopColor={coral} stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor={light} stopOpacity="0" />
          <stop offset="0.52" stopColor={light} stopOpacity="0.72" />
          <stop offset="1" stopColor={gold} stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${id}-atmosphere`}>
          <stop stopColor={coral} stopOpacity="0.13" />
          <stop offset="0.55" stopColor={gold} stopOpacity="0.05" />
          <stop offset="1" stopColor={gold} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor={plum} stopOpacity="0.1" />
          <stop offset="1" stopColor={plum} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="302" cy="230" rx="274" ry="193" fill={`url(#${id}-atmosphere)`} />
      <ellipse cx="303" cy="369" rx="184" ry="28" fill={`url(#${id}-shadow)`} />
      {kind === "bridge" && <BridgeMaterial id={id} richness={richness} />}
      {kind === "bloom" && <BloomMaterial id={id} richness={richness} />}
      {kind === "flow" && <FlowMaterial id={id} richness={richness} />}
    </svg>
  );
}

function BridgeMaterial({ id, richness }: { id: string; richness: number }) {
  const threads = 3 + Math.floor(richness * 4);
  return (
    <g>
      <g className={styles.fieldLeft}>
        <path d="M218 89C151 65 76 123 81 207C85 296 155 348 225 327C274 312 263 280 231 254C200 228 204 193 235 165C263 139 251 102 218 89Z" fill={`url(#${id}-plum)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.65" opacity="0.66">
          {CONTOURS.map((t) => (
            <path key={t} d={`M${218 - 38 * t} ${89 + 15 * t} C${142 - 39 * t} ${65 + 51 * t} ${62 + 19 * t} ${158 + 64 * t} ${106 + 37 * t} ${264 + 42 * t} C${150 + 35 * t} ${346 - 5 * t} ${236 + 14 * t} ${343 - 43 * t} ${249 - 34 * t} ${285 - 69 * t}`} />
          ))}
        </g>
        <path d="M218 89C254 104 265 138 235 165C204 193 200 228 231 254C264 281 276 311 225 327" stroke={`url(#${id}-light)`} strokeWidth="1.5" />
        <path d="M214 122C188 149 166 178 170 217C175 262 210 276 233 285C255 295 251 309 226 319C203 292 183 267 185 228C186 188 215 156 214 122Z" fill={`url(#${id}-plum)`} opacity="0.38" />
      </g>
      <g className={styles.fieldRight}>
        <path d="M407 100C471 89 525 150 521 220C518 291 473 344 411 340C363 338 339 299 365 268C393 235 403 204 375 173C348 143 369 107 407 100Z" fill={`url(#${id}-coral)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.65" opacity="0.58">
          {CONTOURS.map((t) => (
            <path key={t} d={`M${408 + 31 * t} ${100 + 15 * t} C${485 + 22 * t} ${86 + 76 * t} ${550 - 24 * t} ${210 + 65 * t} ${486 - 32 * t} ${301 + 17 * t} C${455 - 43 * t} ${352 - 2 * t} ${366 - 13 * t} ${351 - 53 * t} ${359 + 35 * t} ${293 - 78 * t}`} />
          ))}
        </g>
        <path d="M407 100C369 107 348 143 375 173C403 204 393 235 365 268C339 299 363 338 411 340" stroke={`url(#${id}-light)`} strokeWidth="1.4" />
        <path d="M404 127C450 156 465 218 440 263C419 302 388 311 387 332C358 317 358 289 378 267C407 235 418 203 401 169C392 153 393 138 404 127Z" fill={`url(#${id}-gold)`} opacity="0.64" />
      </g>
      <g className={styles.connections} stroke={`url(#${id}-thread)`} strokeLinecap="round">
        {Array.from({ length: threads }, (_, index) => {
          const y = 190 + index * (66 / Math.max(threads - 1, 1));
          return (
            <path
              key={index}
              d={`M${217 + index * 3} ${y} C${277 - index * 3} ${y + 32} ${318 + index * 3} ${y - 22} ${388 - index * 2} ${y + 8}`}
              strokeWidth={index === 1 ? 1.3 : 0.75}
              opacity={0.36 + (index % 3) * 0.2}
            />
          );
        })}
      </g>
      <g className={styles.connectionLight} stroke={`url(#${id}-light)`} strokeWidth="1.1" strokeLinecap="round">
        <path d="M241 226C269 233 293 229 311 224" />
        <path d="M308 251C331 248 351 251 376 260" />
      </g>
    </g>
  );
}

function BloomMaterial({ id, richness }: { id: string; richness: number }) {
  return (
    <g>
      <g className={styles.bloomBack}>
        <path d="M296 343C191 332 113 253 131 157C138 119 165 89 203 71C194 143 254 159 291 190C330 222 361 295 296 343Z" fill={`url(#${id}-plum)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.65" opacity="0.5">
          {CONTOURS.map((t) => (
            <path key={t} d={`M${203 - 46 * t} ${71 + 41 * t} C${175 - 75 * t} ${149 + 78 * t} ${329 - 137 * t} ${169 + 170 * t} ${296 - 2 * t} 343`} />
          ))}
        </g>
        <path d="M203 71C194 143 254 159 291 190C330 222 361 295 296 343" stroke={`url(#${id}-light)`} strokeWidth="1.3" />
      </g>
      <g className={styles.bloomOpen}>
        <path d="M286 344C283 269 252 228 268 167C284 106 357 69 430 77C385 110 411 157 406 208C400 270 348 320 286 344Z" fill={`url(#${id}-gold)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.7" opacity="0.53">
          {CONTOURS.map((t) => (
            <path key={t} d={`M${430 - 95 * t} ${77 + 4 * t} C${347 - 66 * t} ${132 + 2 * t} ${474 - 100 * t} ${213 + 61 * t} 286 344`} />
          ))}
        </g>
        <path d="M430 77C385 110 411 157 406 208C400 270 348 320 286 344" stroke={`url(#${id}-light)`} strokeWidth="1.5" />
      </g>
      <g className={styles.bloomMiddle}>
        <path d="M289 346C229 304 204 246 226 193C244 148 288 143 316 97C357 151 357 213 330 256C305 296 294 318 289 346Z" fill={`url(#${id}-coral)`} />
        <g stroke={`url(#${id}-light)`} strokeWidth="0.75" opacity="0.7">
          {CONTOURS.map((t) => (
            <path key={t} d={`M${316 - 34 * t} ${97 + 49 * t} C${361 - 111 * t} ${165 - 14 * t} ${348 - 146 * t} ${226 + 7 * t} 289 346`} />
          ))}
        </g>
        <path d="M316 97C357 151 357 213 330 256C305 296 294 318 289 346" stroke={`url(#${id}-edge)`} strokeWidth="0.9" />
      </g>
      <g opacity={0.2 + richness * 0.5}>
        <path d="M289 346C231 332 188 280 163 215C225 228 230 274 268 292C299 307 300 327 289 346Z" fill={`url(#${id}-coral)`} />
        <path d="M289 346C317 295 346 253 445 222C426 280 351 346 289 346Z" fill={`url(#${id}-gold)`} />
        <path d="M163 215C225 228 230 274 268 292M289 346C317 295 346 253 445 222" stroke={`url(#${id}-light)`} strokeWidth="1" />
      </g>
      <path className={styles.innerLight} d="M289 330C292 274 310 243 304 201C300 176 292 156 295 139C312 165 321 194 319 221C317 268 297 297 289 330Z" fill={`url(#${id}-light)`} opacity="0.7" />
    </g>
  );
}

function FlowMaterial({ id, richness }: { id: string; richness: number }) {
  // More practice gently opens the early turns; both currents always meet again.
  const turbulence = 1 - richness * 0.28;
  return (
    <g>
      <g className={styles.flowBack}>
        <path d="M69 227C97 92 190 70 238 176C275 258 318 302 381 229C420 184 467 147 538 173C464 144 432 227 392 270C327 340 268 306 221 236C176 168 124 130 69 227Z" fill={`url(#${id}-plum)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.7" opacity="0.6">
          {RIBBON_CONTOURS.map((t) => (
            <path key={t} d={`M69 227 C${97 + 27 * t} ${92 + 38 * t * turbulence} ${190 - 14 * t} ${70 + 98 * t} ${238 - 17 * t} ${176 + 60 * t} C${275 - 7 * t} ${258 + 48 * t} ${318 + 9 * t} ${302 + 38 * t} ${381 + 11 * t} ${229 + 41 * t} C${420 + 12 * t} ${184 + 43 * t} ${467 - 3 * t} ${147 - 3 * t} 538 173`} />
          ))}
        </g>
        <path d="M69 227C97 92 190 70 238 176C275 258 318 302 381 229C420 184 467 147 538 173" stroke={`url(#${id}-light)`} strokeWidth="1.3" />
      </g>
      <g className={styles.flowFront}>
        <path d="M68 266C126 337 180 330 229 249C278 166 322 131 375 193C418 245 458 225 538 173C464 254 413 287 360 243C318 208 278 219 240 285C192 369 117 358 68 266Z" fill={`url(#${id}-coral)`} />
        <g stroke={`url(#${id}-edge)`} strokeWidth="0.7" opacity="0.63">
          {RIBBON_CONTOURS.map((t) => (
            <path key={t} d={`M68 266 C${126 - 9 * t} ${337 + 21 * t} ${180 + 12 * t} ${330 + 39 * t * turbulence} ${229 + 11 * t} ${249 + 36 * t} C${278} ${166 + 53 * t} ${322 - 4 * t} ${131 + 77 * t} ${375 - 15 * t} ${193 + 50 * t} C${418 - 5 * t} ${245 + 42 * t} ${458 + 6 * t} ${225 + 29 * t} 538 173`} />
          ))}
        </g>
        <path d="M68 266C126 337 180 330 229 249C278 166 322 131 375 193C418 245 458 225 538 173" stroke={`url(#${id}-light)`} strokeWidth="1.5" />
      </g>
      <path className={styles.innerLight} d="M83 235C141 166 189 183 232 248C281 320 331 318 385 253C426 204 479 158 538 173" stroke={`url(#${id}-gold)`} strokeWidth="5" opacity="0.45" />
      <g className={styles.connectionLight} stroke={`url(#${id}-light)`} strokeWidth="1" strokeLinecap="round">
        <path d="M360 217C414 274 470 230 523 185" />
        <path d="M374 240C421 276 475 232 528 181" />
      </g>
    </g>
  );
}
