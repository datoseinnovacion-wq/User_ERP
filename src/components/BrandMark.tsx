import React from "react";

export const BrandMark: React.FC<{ size?: "sm" | "md" | "lg"; showText?: boolean }> = ({ size = "md", showText = false }) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        src="/sistema_erp_logo.png"
        alt="Sistema ERP"
        className={`${
          size === "sm" ? "max-h-10" : size === "lg" ? "max-h-20" : "max-h-14"
        } w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,194,203,0.3)] transition-transform duration-200 hover:scale-105`}
        onError={(e) => {
          // Fallback al logo de Link si no se encontrara
          e.currentTarget.src = "/link_logo.png";
        }}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-wider text-white text-base font-sans drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]">
            SISTEMA ERP
          </span>
          <span className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
            Holding & Gateway
          </span>
        </div>
      )}
    </div>
  );
};
