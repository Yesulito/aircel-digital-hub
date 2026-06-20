"use client";

import React from 'react';

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] p-4 text-center">
      <h1 className="text-3xl font-serif text-[#1B4332] mb-4">You are offline</h1>
      <p className="text-[#111827] mb-8">It looks like you don&apos;t have an internet connection. Please check your network and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-[#1B4332] text-white px-6 py-2 rounded-2xl shadow-md hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}
