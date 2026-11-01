import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3ProgressTrackerProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  courseId: string;
}

export const D3ProgressTracker: React.FC<D3ProgressTrackerProps> = ({
  progress,
  size = 110,
  strokeWidth = 9,
  courseId,
}) => {
  const containerRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const svg = d3.select(containerRef.current);
    svg.selectAll("*").remove(); // Smooth cleanup for hot reloading / dynamic changes

    const radius = size / 2;
    const innerRadius = radius - strokeWidth;
    const outerRadius = radius;

    // Center g element
    const g = svg
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);

    // Define unique key gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", `progress-grad-${courseId}`)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    // Amber gold start
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F59E0B");

    // Secondary emerald/lime shade end
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#A3E635");

    // Track arc
    const backgroundArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    g.append("path")
      .attr("d", backgroundArc as any)
      .attr("class", "fill-slate-100 dark:fill-slate-800/80")
      .style("opacity", 0.5);

    // Dynamic Foreground arc
    const foregroundPath = g
      .append("path")
      .attr("fill", `url(#progress-grad-${courseId})`)
      .attr("class", "transition-all duration-300 pointer-events-none")
      .style("filter", "drop-shadow(0px 2px 4px rgba(245,158,11,0.15))");

    // Typography counter group
    const textGroup = g.append("g").attr("text-anchor", "middle");

    const percentText = textGroup
      .append("text")
      .attr("dy", "0.33em")
      .attr("class", "text-lg font-black font-mono fill-slate-900 dark:fill-white tracking-tighter")
      .text("0%");

    // Safe clamped target angle
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const targetAngle = (clampedProgress / 100) * 2 * Math.PI;

    // Transition parameters
    const animDuration = 1400;
    const animEase = d3.easeCubicOut;

    foregroundPath
      .transition()
      .duration(animDuration)
      .ease(animEase)
      .attrTween("d", function () {
        const interpolate = d3.interpolate(0, targetAngle);
        return function (t: number) {
          const customArc = d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(interpolate(t))
            .cornerRadius(4);
          return customArc({} as any) || "";
        };
      });

    // Spline numbers transition
    percentText
      .transition()
      .duration(animDuration)
      .ease(animEase)
      .tween("text", function () {
        const interpolate = d3.interpolate(0, clampedProgress);
        return function (t: number) {
          d3.select(this).text(`${Math.round(interpolate(t))}%`);
        };
      });
  }, [progress, size, strokeWidth, courseId]);

  return (
    <div 
      className="relative flex flex-col items-center justify-center p-3 bg-slate-50/40 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-2xs group hover:border-amber-500/10 transition-colors"
      id={`d3-progress-wrapper-${courseId}`}
    >
      <svg
        ref={containerRef}
        width={size}
        height={size}
        className="transform -rotate-90 select-none overflow-visible transition-transform duration-500 group-hover:scale-102"
        id={`d3-svg-element-${courseId}`}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[8px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase mt-12 tracking-widest leading-none">
          ACTIVE
        </span>
      </div>
    </div>
  );
};
