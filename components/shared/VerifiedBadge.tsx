import React from "react";

interface VerifiedBadgeProps {
  showLabel?: boolean;
}

export default function VerifiedBadge({ showLabel = false }: VerifiedBadgeProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="relative w-5 h-5 flex items-center justify-center bg-success rounded-full border border-accent">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      {showLabel && (
        <span className="text-success text-xs font-bold uppercase tracking-wider">Verified Landlord</span>
      )}
    </div>
  );
}
