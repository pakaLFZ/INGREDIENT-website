"use client";

import { useState, useEffect, useRef } from "react";
import detectionData from "./image-4_contours.json";

const COLOR_PALETTE = ["#B8860B", "#FAFAD2", "#FBC901", "#FFB302", "#AA6B39"];

interface CellData {
  cell_id: number;
  contours: number[][][];
  bbox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
}

interface DetectionData {
  rbc: CellData[];
  wbc: CellData[];
}

const data = detectionData as DetectionData;

function getRandomColor(seed: number): string {
  return COLOR_PALETTE[seed % COLOR_PALETTE.length];
}

function getRandomSubset<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function BloodCellViewer() {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize] = useState({ width: 256, height: 256 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleBoxes, setVisibleBoxes] = useState<{ cell: CellData; type: "rbc" | "wbc" }[]>([]);
  const [boxOpacity, setBoxOpacity] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{ cell: CellData; type: "rbc" | "wbc" } | null>(null);
  const [fadingCell, setFadingCell] = useState<{ cell: CellData; type: "rbc" | "wbc" } | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const allCells = [
      ...data.rbc.map(cell => ({ cell, type: "rbc" as const })),
      ...data.wbc.map(cell => ({ cell, type: "wbc" as const }))
    ];

    const getNewBoxes = (excludeList: { cell: CellData; type: "rbc" | "wbc" }[]) => {
      const excludeIds = new Set(
        excludeList.map(item => `${item.type}-${item.cell.cell_id}`)
      );
      const availableCells = allCells.filter(
        item => !excludeIds.has(`${item.type}-${item.cell.cell_id}`)
      );
      return getRandomSubset(availableCells, 2, 3);
    };

    let currentBoxes: { cell: CellData; type: "rbc" | "wbc" }[] = [];

    const runCycle = () => {
      const newBoxes = getNewBoxes(currentBoxes);
      currentBoxes = newBoxes;

      setVisibleBoxes(newBoxes);
      setBoxOpacity(0);

      setTimeout(() => {
        setBoxOpacity(1);
      }, 50);

      setTimeout(() => {
        setBoxOpacity(0);
      }, 4550);
    };

    if (!hoveredCell && !fadingCell) {
      runCycle();
      cycleTimeoutRef.current = setInterval(runCycle, 6500);
    }

    return () => {
      if (cycleTimeoutRef.current) {
        clearInterval(cycleTimeoutRef.current);
        cycleTimeoutRef.current = null;
      }
    };
  }, [hoveredCell, fadingCell]);

  const handleMouseEnter = (cell: CellData, type: "rbc" | "wbc") => {
    if (cycleTimeoutRef.current) {
      clearInterval(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    setHoveredCell({ cell, type });
    setFadingCell(null);
  };

  const handleMouseLeave = () => {
    if (hoveredCell) {
      setFadingCell(hoveredCell);
      setHoveredCell(null);

      fadeTimeoutRef.current = setTimeout(() => {
        setFadingCell(null);
      }, 2000);
    }
  };

  const scaleX = containerSize.width / imageSize.width;
  const scaleY = containerSize.height / imageSize.height;

  const renderBoundingBox = (cell: CellData, type: "rbc" | "wbc") => {
    const { bbox } = cell;
    const x = bbox.x_min * scaleX;
    const y = bbox.y_min * scaleY;
    const width = (bbox.x_max - bbox.x_min) * scaleX;
    const height = (bbox.y_max - bbox.y_min) * scaleY;
    const color = type === "rbc" ? "#ff0000" : "#0000ff";
    const label = type.toUpperCase();

    const labelWidth = 30;
    const labelHeight = 16;

    const isVisible = visibleBoxes.some(
      item => item.cell.cell_id === cell.cell_id && item.type === type
    );

    if (!isVisible) return null;

    const currentOpacity = (hoveredCell || fadingCell) ? 0 : boxOpacity;

    return (
      <g
        key={`box-${type}-${cell.cell_id}`}
        style={{
          transition: "opacity 0.5s ease",
          opacity: currentOpacity
        }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        <rect
          x={x}
          y={y}
          width={labelWidth}
          height={labelHeight}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
        <text
          x={x + labelWidth / 2}
          y={y + labelHeight / 2}
          fill="white"
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  const renderContour = (cell: CellData, type: "rbc" | "wbc") => {
    const contour = cell.contours[0];
    if (!contour || contour.length === 0) return null;

    const scaledPoints = contour
      .map(([x, y]) => `${x * scaleX},${y * scaleY}`)
      .join(" ");

    const fillColor = type === "rbc" ? getRandomColor(cell.cell_id) : "#ffffff";

    const isHovered = hoveredCell?.cell.cell_id === cell.cell_id && hoveredCell?.type === type;

    const fillOpacity = isHovered ? 1 : 0;

    return (
      <polygon
        key={`contour-${type}-${cell.cell_id}`}
        points={scaledPoints}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke="none"
        style={{
          transition: "fill-opacity 0.2s ease-in-out",
          cursor: "pointer",
          pointerEvents: "auto"
        }}
        onMouseEnter={() => handleMouseEnter(cell, type)}
        onMouseLeave={handleMouseLeave}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square min-w-[150px] rounded-[2.5%] overflow-hidden"
    >
      <img
        src="/image-4.png"
        alt="Blood cells"
        className="absolute inset-0 w-full h-full object-contain rounded-[10px]"
      />
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ pointerEvents: "none" }}
      >
        {data.rbc.map((cell) => renderContour(cell, "rbc"))}
        {data.wbc.map((cell) => renderContour(cell, "wbc"))}
        {data.rbc.map((cell) => renderBoundingBox(cell, "rbc"))}
        {data.wbc.map((cell) => renderBoundingBox(cell, "wbc"))}
      </svg>
    </div>
  );
}
