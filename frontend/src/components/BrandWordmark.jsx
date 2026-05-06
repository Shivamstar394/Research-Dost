import React from "react";
import { motion } from "framer-motion";

function SmileO() {
  return (
    <span className="smile-o" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
        <path
          d="M8.5 14c1.1 1.6 2.4 2.4 3.5 2.4S14.4 15.6 15.5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function BrandWordmark({ animate = true, className = "" }) {
  const dirs = [
    { x: 0, y: -18 },
    { x: -18, y: 0 },
    { x: 18, y: 0 },
    { x: 0, y: 18 },
  ];

  // Research + space + D + (smile as o) + st
  const letters = [
    ..."Research".split(""),
    "\u00A0", // non-breaking space so gap is always visible
    "D",
    { smile: true },
    ..."st".split(""),
  ];

  return (
    <motion.span
      className={`brand-animated ${className}`}
      initial={animate ? "hidden" : false}
      animate={animate ? "show" : false}
    >
      {letters.map((ch, i) => {
        if (typeof ch === "object" && ch.smile) {
          return (
            <motion.span
              key={i}
              className="brand-letter"
              custom={i}
              variants={{
                hidden: (idx) => ({
                  opacity: 0,
                  x: dirs[idx % 4].x,
                  y: dirs[idx % 4].y,
                  filter: "blur(8px)",
                }),
                show: (idx) => ({
                  opacity: 1,
                  x: 0,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    delay: idx * 0.03,
                    type: "spring",
                    stiffness: 450,
                    damping: 28,
                  },
                }),
              }}
            >
              <SmileO />
            </motion.span>
          );
        }

        return (
          <motion.span
            key={i}
            className="brand-letter"
            custom={i}
            variants={{
              hidden: (idx) => ({
                opacity: 0,
                x: dirs[idx % 4].x,
                y: dirs[idx % 4].y,
                filter: "blur(8px)",
              }),
              show: (idx) => ({
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  delay: idx * 0.03,
                  type: "spring",
                  stiffness: 450,
                  damping: 28,
                },
              }),
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </motion.span>
  );
}