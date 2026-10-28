import React from "react";

export const BrandMark: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/link_logo.png"
        alt="LINK 1.720 Agentes Aduanales S.A."
        className={`${size === "sm" ? "max-h-12" : size === "lg" ? "max-h-24" : "max-h-16"} w-auto object-contain transition-transform duration-200 hover:scale-105`}
        onError={(e) => {
          // Fallback SVG if image is not loaded
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
};
