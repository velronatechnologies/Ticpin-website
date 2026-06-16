"use client";

import React from "react";

interface TicketCategory {
  name: string;
  price?: number;
  capacity?: number;
  image_url?: string;
  has_image?: boolean;
}

interface VisualMapProps {
  categories: TicketCategory[];
  counts: Record<number, number>;
  selectedZoneName: string | null;
  handleZoneClick: (zoneKey: string) => void;
  getZoneStyle: (zoneKey: string, baseStyle: any) => any;
  getZoneQuantity: (zoneKey: string) => number;
  getZonePrice: (zoneKey: string) => string;
  getAvailable: (cat: TicketCategory) => number;
  add: (i: number) => void;
  remove: (i: number) => void;
  zoneStyles: any;
}

export function MobileVisualMap({
  categories,
  counts,
  selectedZoneName,
  handleZoneClick,
  getZoneStyle,
  getZoneQuantity,
  getZonePrice,
  getAvailable,
  add,
  remove,
  zoneStyles,
}: VisualMapProps) {
  return (
    <div
      className="w-full max-w-[480px] mx-auto bg-white flex flex-col gap-[10px] p-4 select-none shrink-0"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* STAGE */}
      <div
        className="rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid font-extrabold text-[20px] uppercase tracking-wider transition-all duration-300"
        style={{
          backgroundColor: "#d9d9d9",
          borderColor: "#686868",
          color: "#686868",
        }}
      >
        STAGE
      </div>

      {/* VIP FANPIT & RAMP */}
      <div className="flex gap-[3px]">
        <button
          onClick={() => handleZoneClick("VIP FANPIT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP FANPIT", zoneStyles.FANPIT)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP FANPIT
            {getZoneQuantity("VIP FANPIT") > 0 && (
              <span className="bg-[#208102] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP FANPIT")}
              </span>
            )}
          </div>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP FANPIT")}
          </div>
        </button>

        <div
          className="w-[90px] rounded-[10px] py-[12px] px-[4px] text-center border-2 border-solid flex flex-col items-center justify-center select-none"
          style={{
            backgroundColor: zoneStyles.RAMP.background,
            borderColor: zoneStyles.RAMP.borderColor,
            color: zoneStyles.RAMP.color,
          }}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            RAMP
          </div>
        </div>

        <button
          onClick={() => handleZoneClick("VIP FANPIT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP FANPIT", zoneStyles.FANPIT)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP FANPIT
            {getZoneQuantity("VIP FANPIT") > 0 && (
              <span className="bg-[#208102] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP FANPIT")}
              </span>
            )}
          </div>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP FANPIT")}
          </div>
        </button>
      </div>

      {/* MIP */}
      <button
        onClick={() => handleZoneClick("MIP")}
        className="w-full rounded-[10px] py-[12px] px-[16px] mt-[70px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
        style={getZoneStyle("MIP", zoneStyles.MIP)}
      >
        <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
          MIP
          {getZoneQuantity("MIP") > 0 && (
            <span className="bg-[#81024E] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
              {getZoneQuantity("MIP")}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: "block",
            margin: "6px auto 0 auto",
            opacity: 0.95,
          }}
        >
          <path d="M18 20V10H6v10M12 10V4M6 14h12" />
        </svg>
        <div className="text-[13px] mt-[6px] font-bold">
          {getZonePrice("MIP")}
        </div>
      </button>

      {/* VIP */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("VIP")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP", zoneStyles.VIP)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP
            {getZoneQuantity("VIP") > 0 && (
              <span className="bg-[#240281] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("VIP")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP", zoneStyles.VIP)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP
            {getZoneQuantity("VIP") > 0 && (
              <span className="bg-[#240281] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP")}
          </div>
        </button>
      </div>

      {/* PLATINUM */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("PLATINUM LEFT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("PLATINUM LEFT", zoneStyles.PLATINUM)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            PLATINUM LEFT
            {getZoneQuantity("PLATINUM LEFT") > 0 && (
              <span className="bg-[#025B81] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("PLATINUM LEFT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("PLATINUM")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("PLATINUM RIGHT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("PLATINUM RIGHT", zoneStyles.PLATINUM)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            PLATINUM RIGHT
            {getZoneQuantity("PLATINUM RIGHT") > 0 && (
              <span className="bg-[#025B81] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("PLATINUM RIGHT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("PLATINUM")}
          </div>
        </button>
      </div>

      {/* GOLD */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("GOLD LEFT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("GOLD LEFT", zoneStyles.GOLD)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            GOLD LEFT
            {getZoneQuantity("GOLD LEFT") > 0 && (
              <span className="bg-[#817202] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("GOLD LEFT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("GOLD")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("GOLD RIGHT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("GOLD RIGHT", zoneStyles.GOLD)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            GOLD RIGHT
            {getZoneQuantity("GOLD RIGHT") > 0 && (
              <span className="bg-[#817202] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("GOLD RIGHT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("GOLD")}
          </div>
        </button>
      </div>

      {/* Zone Selection detail/counter */}
      {selectedZoneName ? (
        <div className="w-full mt-4 bg-zinc-50 border border-zinc-200 rounded-[10px] p-3 animate-in fade-in duration-200">
          {(() => {
            const primaryZone = selectedZoneName.split(" ")[0].toUpperCase();
            const foundIndex = categories.findIndex((c) => {
              const cName = c.name.toUpperCase();
              return (
                cName.includes(primaryZone) ||
                primaryZone.includes(cName) ||
                (primaryZone === "VIP" && cName === "VIP PASS") ||
                (primaryZone === "PLATINUM" && cName === "PLATINUM PASS") ||
                (primaryZone === "GOLD" && cName === "GOLD PASS") ||
                (primaryZone === "MIP" && cName === "MIP PASS")
              );
            });
            const actualIndex = foundIndex !== -1 ? foundIndex : 0;
            const cat = categories[actualIndex];
            const available = getAvailable(cat);
            const isSoldOut = available === 0;
            const current = counts[actualIndex] ?? 0;

            return (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-semibold text-black">
                    {cat.name}
                  </span>
                  <span className="text-[15px] font-bold text-black">
                    ₹{cat.price ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-[#686868]">
                    {isSoldOut
                      ? "Sold out"
                      : `${available} ticket(s) left`}
                  </span>
                  <div>
                    {isSoldOut ? (
                      <span className="text-[12px] text-red-500 font-bold">
                        SOLD OUT
                      </span>
                    ) : current === 0 ? (
                      <button
                        onClick={() => add(actualIndex)}
                        className="w-[86px] h-[34px] bg-black text-white rounded-[5px] flex items-center justify-center hover:bg-zinc-800 active:scale-[0.98] transition-all font-bold uppercase tracking-wider text-[12px]"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-black text-white px-2 py-1 rounded-[5px] text-[12px] font-medium">
                        <button
                          onClick={() => remove(actualIndex)}
                          className="px-1 font-bold"
                        >
                          -
                        </button>
                        <span>{current}</span>
                        {current < available && (
                          <button
                            onClick={() => add(actualIndex)}
                            className="px-1 font-bold"
                          >
                            +
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

export function DesktopVisualMap({
  categories,
  counts,
  selectedZoneName,
  handleZoneClick,
  getZoneStyle,
  getZoneQuantity,
  getZonePrice,
  getAvailable,
  add,
  remove,
  zoneStyles,
}: VisualMapProps) {
  return (
    <div
      className="w-full max-w-[480px] mx-auto bg-white flex flex-col gap-[10px] p-4 select-none shrink-0"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* STAGE */}
      <div
        className="rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid font-extrabold text-[20px] uppercase tracking-wider transition-all duration-300"
        style={{
          backgroundColor: "#d9d9d9",
          borderColor: "#686868",
          color: "#686868",
        }}
      >
        STAGE
      </div>

      {/* VIP FANPIT & RAMP */}
      <div className="flex gap-[3px]">
        <button
          onClick={() => handleZoneClick("VIP FANPIT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP FANPIT", zoneStyles.FANPIT)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP FANPIT
            {getZoneQuantity("VIP FANPIT") > 0 && (
              <span className="bg-[#208102] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP FANPIT")}
              </span>
            )}
          </div>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP FANPIT")}
          </div>
        </button>

        <div
          className="w-[90px] rounded-[10px] py-[12px] px-[4px] text-center border-2 border-solid flex flex-col items-center justify-center select-none"
          style={{
            backgroundColor: zoneStyles.RAMP.background,
            borderColor: zoneStyles.RAMP.borderColor,
            color: zoneStyles.RAMP.color,
          }}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            RAMP
          </div>
        </div>

        <button
          onClick={() => handleZoneClick("VIP FANPIT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP FANPIT", zoneStyles.FANPIT)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP FANPIT
            {getZoneQuantity("VIP FANPIT") > 0 && (
              <span className="bg-[#208102] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP FANPIT")}
              </span>
            )}
          </div>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP FANPIT")}
          </div>
        </button>
      </div>

      {/* MIP */}
      <button
        onClick={() => handleZoneClick("MIP")}
        className="w-full rounded-[10px] py-[12px] px-[16px] mt-[70px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
        style={getZoneStyle("MIP", zoneStyles.MIP)}
      >
        <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
          MIP
          {getZoneQuantity("MIP") > 0 && (
            <span className="bg-[#81024E] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
              {getZoneQuantity("MIP")}
            </span>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: "block",
            margin: "6px auto 0 auto",
            opacity: 0.95,
          }}
        >
          <path d="M18 20V10H6v10M12 10V4M6 14h12" />
        </svg>
        <div className="text-[13px] mt-[6px] font-bold">
          {getZonePrice("MIP")}
        </div>
      </button>

      {/* VIP */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("VIP")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP", zoneStyles.VIP)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP
            {getZoneQuantity("VIP") > 0 && (
              <span className="bg-[#240281] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("VIP")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("VIP", zoneStyles.VIP)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            VIP
            {getZoneQuantity("VIP") > 0 && (
              <span className="bg-[#240281] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("VIP")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("VIP")}
          </div>
        </button>
      </div>

      {/* PLATINUM */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("PLATINUM LEFT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("PLATINUM LEFT", zoneStyles.PLATINUM)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            PLATINUM LEFT
            {getZoneQuantity("PLATINUM LEFT") > 0 && (
              <span className="bg-[#025B81] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("PLATINUM LEFT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("PLATINUM")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("PLATINUM RIGHT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("PLATINUM RIGHT", zoneStyles.PLATINUM)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            PLATINUM RIGHT
            {getZoneQuantity("PLATINUM RIGHT") > 0 && (
              <span className="bg-[#025B81] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("PLATINUM RIGHT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("PLATINUM")}
          </div>
        </button>
      </div>

      {/* GOLD */}
      <div className="flex gap-[10px]">
        <button
          onClick={() => handleZoneClick("GOLD LEFT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("GOLD LEFT", zoneStyles.GOLD)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            GOLD LEFT
            {getZoneQuantity("GOLD LEFT") > 0 && (
              <span className="bg-[#817202] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("GOLD LEFT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("GOLD")}
          </div>
        </button>
        <button
          onClick={() => handleZoneClick("GOLD RIGHT")}
          className="flex-1 rounded-[10px] py-[12px] px-[16px] text-center border-2 border-solid transition-all duration-300 active:scale-95 cursor-pointer flex flex-col items-center justify-center"
          style={getZoneStyle("GOLD RIGHT", zoneStyles.GOLD)}
        >
          <div className="font-extrabold text-[20px] leading-tight flex items-center justify-center gap-1.5 w-full">
            GOLD RIGHT
            {getZoneQuantity("GOLD RIGHT") > 0 && (
              <span className="bg-[#817202] text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-black shrink-0">
                {getZoneQuantity("GOLD RIGHT")}
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              display: "block",
              margin: "6px auto 0 auto",
              opacity: 0.95,
            }}
          >
            <path d="M18 20V10H6v10M12 10V4M6 14h12" />
          </svg>
          <div className="text-[13px] mt-[6px] font-bold">
            {getZonePrice("GOLD")}
          </div>
        </button>
      </div>

      {/* Interactive Selection Panel */}
      {selectedZoneName ? (
        <div className="w-full mt-3 bg-[#FAF6F6] border border-[#AEAEAE]/40 rounded-[12px] p-3 animate-in slide-in-from-bottom-2 duration-200">
          {(() => {
            const primaryZone = selectedZoneName.split(" ")[0].toUpperCase();
            const foundIndex = categories.findIndex((c) => {
              const cName = c.name.toUpperCase();
              return (
                cName.includes(primaryZone) ||
                primaryZone.includes(cName) ||
                (primaryZone === "VIP" && cName === "VIP PASS") ||
                (primaryZone === "PLATINUM" && cName === "PLATINUM PASS") ||
                (primaryZone === "GOLD" && cName === "GOLD PASS") ||
                (primaryZone === "MIP" && cName === "MIP PASS")
              );
            });
            const actualIndex = foundIndex !== -1 ? foundIndex : 0;
            const cat = categories[actualIndex];
            const available = getAvailable(cat);
            const isSoldOut = available === 0;
            const current = counts[actualIndex] ?? 0;

            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Selected Section
                    </span>
                    <h4
                      className="text-[16px] font-semibold text-black uppercase"
                      style={{ fontFamily: "var(--font-anek-latin)" }}
                    >
                      {cat.name}
                    </h4>
                  </div>
                  <span
                    className="text-[18px] font-black text-black"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    ₹{cat.price ?? 0}
                  </span>
                </div>
                <div className="w-full h-[0.5px] bg-zinc-200"></div>
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs text-[#686868] font-medium"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    {isSoldOut
                      ? "No seats available"
                      : available === Infinity
                        ? "Seats available"
                        : `${available} seat${available === 1 ? "" : "s"} available`}
                  </p>

                  <div className="flex flex-col items-center justify-center shrink-0">
                    {isSoldOut ? (
                      <div className="w-[86px] h-[34px] bg-red-100 rounded-[5px] flex items-center justify-center">
                        <span className="text-[12px] text-red-600 font-semibold uppercase">
                          Full
                        </span>
                      </div>
                    ) : current === 0 ? (
                      <button
                        onClick={() => add(actualIndex)}
                        className="w-[86px] h-[34px] bg-black text-white rounded-[5px] flex items-center justify-center hover:bg-zinc-800 active:scale-[0.98] transition-all font-bold uppercase tracking-wider text-[12px]"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="w-[86px] h-[34px] bg-black rounded-[5px] flex items-center justify-between px-2 text-white">
                        <button
                          onClick={() => remove(actualIndex)}
                          className="text-[18px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform"
                        >
                          -
                        </button>
                        <span className="text-[14px] font-bold">
                          {current}
                        </span>
                        <button
                          onClick={() => add(actualIndex)}
                          disabled={current >= available}
                          className="text-[16px] leading-none hover:text-[#D9D9D9] cursor-pointer active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}
