import React, { useEffect, useRef } from "react";

/**
 * Animated DNA double helix (slow + smooth)
 * - Gentle wave-like motion
 * - Glowing dots + connecting rungs
 * - Purple gradient theme
 */
export default function DNA({ width = 360, height = 520 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const helixHeight = 400;
    const numPairs = 20;
    const amplitude = 60;
    const speed = 0.005; // ✅ much slower than before

    const colors = ["#CDB3FF", "#A477FF", "#7A4BFF", "#8D5CF6"];

    function drawDNA(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numPairs; i++) {
        const progress = (i / numPairs) * Math.PI * 2;
        const offset = time * speed + progress;

        // Y position (spaced along helix height)
        const y = centerY + (i - numPairs / 2) * (helixHeight / numPairs);

        // X positions for left/right strands (slow wave shift)
        const wave = Math.sin(offset) * amplitude;
        const xLeft = centerX - wave;
        const xRight = centerX + wave;

        const size = 5 + Math.cos(offset) * 1.5; // subtle size pulse
        const rungColor = colors[i % colors.length];

        // rung line
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xRight, y);
        ctx.strokeStyle = rungColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // left dot
        ctx.beginPath();
        ctx.arc(xLeft, y, size, 0, Math.PI * 2);
        ctx.fillStyle = "#A477FF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#CDB3FF";
        ctx.fill();

        // right dot
        ctx.beginPath();
        ctx.arc(xRight, y, size, 0, Math.PI * 2);
        ctx.fillStyle = "#7A4BFF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#8D5CF6";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(drawDNA);
    }

    animationFrameId = requestAnimationFrame(drawDNA);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: "block",
        margin: "0 auto",
        background: "transparent",
      }}
    />
  );
}
