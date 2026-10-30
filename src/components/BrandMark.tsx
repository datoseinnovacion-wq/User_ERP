import React from "react";

export const BrandMark: React.FC<{ size?: "sm" | "md" | "lg"; showText?: boolean }> = ({
  size = "md",
  showText = false,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        src="/link_logo.png"
        alt="Link 1.720 Agentes Aduanales S.A."
        className={`${
          size === "sm" ? "max-h-10" : size === "lg" ? "max-h-20" : "max-h-14"
        } w-auto object-contain transition-transform duration-200 hover:scale-105`}
        onError={(e) => {
          e.currentTarget.src = "/sistema_erp_logo.png";
        }}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-slate-900 text-sm">
            Link 1.720
          </span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            Agentes Aduanales
          </span>
        </div>
      )}
    </div>
  );
};
