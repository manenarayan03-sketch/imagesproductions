"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ============================================================
   Clay decorative components — pure CSS/SVG, no 3D libs.
   Toned-down editorial style: architectural radii, deep royal
   blue bodies with a single warm-gold edge highlight from the
   top-left. Two layered shadows max. Sculptural, never cute.
   ============================================================ */

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const clayBaseShadow =
  "0 1px 1px rgba(255,255,255,0.12) inset, " +
  "0 -10px 22px rgba(8,8,11,0.55) inset, " +
  "0 14px 30px -10px rgba(20,43,101,0.45), " +
  "0 4px 10px -4px rgba(8,8,11,0.5)";

const claySoftShadow =
  "0 1px 1px rgba(255,255,255,0.12) inset, " +
  "0 -6px 14px rgba(8,8,11,0.45) inset, " +
  "0 10px 22px -8px rgba(8,8,11,0.55)";

const goldEdge =
  "linear-gradient(135deg, rgba(214,173,96,0.5) 0%, rgba(214,173,96,0) 32%)";

type DivMotion = HTMLMotionProps<"div">;

function useReduced() {
  const v = useReducedMotion();
  return !!v;
}

/* -------- ClayCamera -------- */
export function ClayCamera({
  className,
  size = 180,
  float = true,
}: {
  className?: string;
  size?: number;
  float?: boolean;
}) {
  const reduce = useReduced();
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size * 0.86 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        animate={
          float && !reduce ? { y: [0, -6, 0], rotate: [-0.4, 0.4, -0.4] } : undefined
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Body */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[14%] rounded-xl"
          style={{
            width: size * 0.86,
            height: size * 0.56,
            background:
              "linear-gradient(160deg, rgba(20,43,101,0.92), rgba(8,8,11,0.98))",
            boxShadow: `${clayBaseShadow}, ${goldEdge}`,
            border: "1px solid rgba(214,173,96,0.28)",
          }}
        />
        {/* Top prism */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[6%] rounded-t-lg rounded-b"
          style={{
            width: size * 0.34,
            height: size * 0.18,
            background:
              "linear-gradient(160deg, rgba(20,43,101,0.95), rgba(8,8,11,0.98))",
            boxShadow: `${claySoftShadow}, ${goldEdge}`,
            border: "1px solid rgba(214,173,96,0.24)",
          }}
        />
        {/* Lens outer ring */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[28%] rounded-full"
          style={{
            width: size * 0.5,
            height: size * 0.5,
            background:
              "radial-gradient(circle at 32% 28%, rgba(214,173,96,0.22), rgba(20,43,101,0.95) 48%, rgba(8,8,11,0.98) 80%)",
            boxShadow:
              "0 1px 1px rgba(255,255,255,0.18) inset, 0 -8px 18px rgba(8,8,11,0.55) inset, 0 10px 22px -8px rgba(8,8,11,0.55)",
            border: "1px solid rgba(214,173,96,0.36)",
          }}
        />
        {/* Lens inner glass */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[38%] rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            background:
              "radial-gradient(circle at 32% 28%, rgba(65,105,225,0.42), rgba(8,8,11,0.96) 88%)",
            boxShadow:
              "0 0 0 1px rgba(214,173,96,0.32) inset, 0 -4px 12px rgba(8,8,11,0.55) inset",
          }}
        />
        {/* Lens highlight */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[40%] rounded-full"
          style={{
            width: size * 0.07,
            height: size * 0.07,
            background:
              "radial-gradient(circle, rgba(248,245,239,0.7), rgba(248,245,239,0) 70%)",
            marginLeft: -size * 0.08,
          }}
        />
        {/* Shutter */}
        <div
          className="absolute right-[10%] top-[18%] rounded-full"
          style={{
            width: size * 0.08,
            height: size * 0.08,
            background:
              "radial-gradient(circle at 30% 30%, rgba(214,173,96,0.95), rgba(184,137,58,0.55) 70%, rgba(8,8,11,0.9))",
            boxShadow: "0 3px 8px rgba(0,0,0,0.45)",
          }}
        />
        {/* Brand line */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[14%] text-[9px] tracking-[0.4em] uppercase font-heading"
          style={{ color: "rgba(214,173,96,0.6)" }}
        >
          Images
        </div>
      </motion.div>
    </div>
  );
}

/* -------- ClayFilmReel (rotates on hover) -------- */
export function ClayFilmReel({
  className,
  size = 140,
  float = true,
}: {
  className?: string;
  size?: number;
  float?: boolean;
}) {
  const reduce = useReduced();
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          float && !reduce
            ? { y: [0, -5, 0], rotate: hover ? 360 : 0 }
            : hover
              ? { rotate: 360 }
              : undefined
        }
        transition={{
          y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          rotate: {
            duration: hover ? 6 : 0.6,
            repeat: hover ? Infinity : 0,
            ease: "linear",
          },
        }}
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(214,173,96,0.16), rgba(20,43,101,0.92) 50%, rgba(8,8,11,0.98))",
          boxShadow: `${clayBaseShadow}, ${goldEdge}`,
          border: "1px solid rgba(214,173,96,0.32)",
        }}
      >
        {/* Perforation holes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = size * 0.4;
          const cx = 50 + (Math.cos(angle) * r) / size * 100;
          const cy = 50 + (Math.sin(angle) * r) / size * 100;
          return (
            <div
              key={i}
              className="absolute rounded-[2px]"
              style={{
                width: size * 0.05,
                height: size * 0.05,
                left: `${cx}%`,
                top: `${cy}%`,
                transform: "translate(-50%, -50%)",
                background: "rgba(8,8,11,0.95)",
                boxShadow: "0 0 0 1px rgba(214,173,96,0.18)",
              }}
            />
          );
        })}
        {/* Center hub */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.26,
            height: size * 0.26,
            background:
              "radial-gradient(circle at 30% 26%, rgba(214,173,96,0.78), rgba(184,137,58,0.55) 60%, rgba(8,8,11,0.9))",
            boxShadow:
              "0 0 0 2px rgba(8,8,11,0.55), 0 -3px 10px rgba(8,8,11,0.5) inset",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.05,
            height: size * 0.05,
            background: "rgba(8,8,11,0.95)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* -------- ClayPhotoFrame (subtle tilt, parallax) -------- */
export function ClayPhotoFrame({
  className,
  size = 200,
  float = true,
  children,
}: {
  className?: string;
  size?: number;
  float?: boolean;
  children?: React.ReactNode;
}) {
  const reduce = useReduced();
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size * 1.15, perspective: 800 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          transform: "rotateY(-10deg) rotateX(4deg)",
          transformStyle: "preserve-3d",
          background:
            "linear-gradient(160deg, rgba(20,43,101,0.85), rgba(8,8,11,0.95))",
          borderRadius: 8,
          boxShadow: `${clayBaseShadow}, ${goldEdge}`,
          border: "1px solid rgba(214,173,96,0.42)",
        }}
        animate={
          float && !reduce
            ? { y: [0, -6, 0], rotateZ: [-0.8, 0.8, -0.8] }
            : undefined
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner mat */}
        <div
          className="absolute inset-[10%] rounded overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(65,105,225,0.22), rgba(20,43,101,0.32) 50%, rgba(8,8,11,0.7))",
            boxShadow: "inset 0 0 18px rgba(8,8,11,0.55)",
          }}
        >
          {children ?? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="font-heading text-[9px] tracking-[0.42em] uppercase"
                style={{ color: "rgba(214,173,96,0.7)" }}
              >
                Empty
                <br />
                Frame
              </div>
            </div>
          )}
        </div>
        {/* Gold mat border */}
        <div
          className="absolute inset-[8%] rounded pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(214,173,96,0.42)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* -------- ClayLens (concentric rings) -------- */
export function ClayLens({
  className,
  size = 160,
  float = true,
}: {
  className?: string;
  size?: number;
  float?: boolean;
}) {
  const reduce = useReduced();
  const rings = [0.92, 0.74, 0.56, 0.38];
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={float && !reduce ? { y: [0, -5, 0] } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {rings.map((r, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: size * r,
              height: size * r,
              background:
                i % 2 === 0
                  ? "radial-gradient(circle at 30% 28%, rgba(214,173,96,0.12), rgba(20,43,101,0.85) 50%, rgba(8,8,11,0.96))"
                  : "radial-gradient(circle at 30% 28%, rgba(214,173,96,0.42), rgba(184,137,58,0.28) 60%, rgba(8,8,11,0.95))",
              boxShadow:
                "0 1px 1px rgba(255,255,255,0.12) inset, 0 -4px 12px rgba(8,8,11,0.5) inset, 0 6px 16px -6px rgba(0,0,0,0.5)",
              border: "1px solid rgba(214,173,96,0.2)",
            }}
          />
        ))}
        {/* Glass center */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.2,
            height: size * 0.2,
            background:
              "radial-gradient(circle at 30% 26%, rgba(65,105,225,0.55), rgba(20,43,101,0.65) 55%, rgba(8,8,11,0.98))",
            boxShadow: "0 0 12px rgba(65,105,225,0.4)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: size * 0.035,
            height: size * 0.035,
            transform: "translate(-120%, -200%)",
            background:
              "radial-gradient(circle, rgba(248,245,239,0.85), rgba(248,245,239,0) 70%)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* -------- ClayAperture (animated blades) -------- */
export function ClayAperture({
  className,
  size = 130,
}: {
  className?: string;
  size?: number;
}) {
  const reduce = useReduced();
  const blades = 6;
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(214,173,96,0.14), rgba(20,43,101,0.85) 50%, rgba(8,8,11,0.95))",
          boxShadow: `${clayBaseShadow}, ${goldEdge}`,
          border: "1px solid rgba(214,173,96,0.32)",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: blades }).map((_, i) => {
          const angle = (i / blades) * 360;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 origin-center"
              style={{
                width: size * 0.4,
                height: size * 0.4,
                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                transformOrigin: "bottom center",
                background:
                  "linear-gradient(180deg, rgba(214,173,96,0.32), rgba(20,43,101,0.55) 60%, rgba(8,8,11,0.95))",
                clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                opacity: 0.8,
              }}
            />
          );
        })}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 0.18,
            height: size * 0.18,
            background:
              "radial-gradient(circle at 30% 26%, rgba(65,105,225,0.62), rgba(20,43,101,0.55) 55%, rgba(8,8,11,0.98))",
            boxShadow: "0 0 12px rgba(65,105,225,0.45)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* -------- ClayPlayButton (film play icon) -------- */
export function ClayPlayButton({
  className,
  size = 96,
  float = true,
}: {
  className?: string;
  size?: number;
  float?: boolean;
}) {
  const reduce = useReduced();
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <motion.div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle at 30% 28%, rgba(214,173,96,0.16), rgba(20,43,101,0.92) 48%, rgba(8,8,11,0.98))",
          boxShadow: `${clayBaseShadow}, ${goldEdge}`,
          border: "1px solid rgba(214,173,96,0.42)",
        }}
        animate={float && !reduce ? { y: [0, -4, 0] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
      >
        <svg
          width={size * 0.34}
          height={size * 0.34}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginLeft: size * 0.04 }}
        >
          <path
            d="M6 4.5v15c0 .85.93 1.37 1.66.92l11.13-7.5a1.1 1.1 0 0 0 0-1.84L7.66 3.58A1.1 1.1 0 0 0 6 4.5z"
            fill="rgba(214,173,96,0.92)"
            stroke="rgba(248,245,239,0.32)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </div>
  );
}

/* -------- ClayTriangle (decorative triangle accent) -------- */
export function ClayTriangle({
  className,
  size = 70,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          background:
            "linear-gradient(160deg, rgba(20,43,101,0.85), rgba(8,8,11,0.95))",
          boxShadow: `0 10px 22px -6px rgba(0,0,0,0.5), ${goldEdge}`,
          border: "1px solid rgba(214,173,96,0.32)",
        }}
      />
    </div>
  );
}

/* -------- ClayOrb — small ambient glow orb -------- */
export function ClayOrb({
  className,
  size = 80,
  color = "royal",
  float = true,
}: {
  className?: string;
  size?: number;
  color?: "royal" | "violet" | "gold" | "electric";
  float?: boolean;
}) {
  const reduce = useReduced();
  const gradients: Record<string, string> = {
    royal:
      "radial-gradient(circle at 30% 28%, rgba(248,245,239,0.22), rgba(65,105,225,0.55) 45%, rgba(20,43,101,0.95))",
    violet:
      "radial-gradient(circle at 30% 28%, rgba(248,245,239,0.2), rgba(109,40,217,0.45) 45%, rgba(20,43,101,0.95))",
    gold:
      "radial-gradient(circle at 30% 28%, rgba(248,245,239,0.3), rgba(214,173,96,0.55) 50%, rgba(184,137,58,0.85))",
    electric:
      "radial-gradient(circle at 30% 28%, rgba(248,245,239,0.22), rgba(65,105,225,0.65) 45%, rgba(8,8,11,0.95))",
  };
  return (
    <motion.div
      className={cn("rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: gradients[color],
        boxShadow: `0 0 ${size * 0.32}px rgba(${
          color === "gold"
            ? "214,173,96"
            : color === "violet"
              ? "109,40,217"
              : "65,105,225"
        }, 0.22), ${clayBaseShadow}`,
        border: "1px solid rgba(214,173,96,0.2)",
      }}
      animate={float && !reduce ? { y: [0, -6, 0] } : undefined}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    />
  );
}

/* -------- Convenience icon key -> clay component -------- */
export function ClayServiceIcon({
  icon,
  className,
  size = 56,
}: {
  icon: string;
  className?: string;
  size?: number;
}) {
  const common = { size, className, float: false };
  switch (icon) {
    case "camera":
      return <ClayCamera {...common} />;
    case "film":
      return <ClayFilmReel {...common} />;
    case "edit":
      return <ClayLens {...common} size={size} />;
    case "event":
      return <ClayAperture className={className} size={size} />;
    case "portrait":
      return <ClayPhotoFrame {...common} />;
    case "corporate":
      return <ClayPlayButton {...common} />;
    case "product":
      return <ClayOrb {...common} color="gold" />;
    case "social":
      return <ClayOrb {...common} color="violet" />;
    default:
      return <ClayOrb {...common} color="royal" />;
  }
}
