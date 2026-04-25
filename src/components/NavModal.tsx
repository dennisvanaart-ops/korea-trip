"use client";

import { useEffect } from "react";

interface Props {
  name: string;
  query: string;
  naverUrl?: string;
  kakaoUrl?: string;
  onClose: () => void;
}

export function NavModal({ name, query, naverUrl, kakaoUrl, onClose }: Props) {
  const effectiveQuery = query && query.trim().length > 2 ? query : name;
  const encoded = encodeURIComponent(effectiveQuery);
  const naver = naverUrl ?? `https://map.naver.com/v5/search/${encoded}`;
  const kakao = kakaoUrl ?? `https://map.kakao.com/?q=${encoded}`;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white px-5 pb-10 pt-4 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />
        <p className="text-lg font-bold text-gray-900 mb-1">{name}</p>
        <p className="text-sm text-gray-400 mb-5">Navigeren</p>

        <div className="space-y-3">
          <a
            href={naver}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#03C75A] px-4 py-4 text-sm font-semibold text-white active:opacity-80"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" fillOpacity="0.3"/>
              <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
            </svg>
            Open in Naver Maps
          </a>

          <a
            href={kakao}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-[#FEE500] px-4 py-4 text-sm font-semibold text-gray-900 active:opacity-80"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.64 1.56 4.97 3.93 6.36L5.97 21l4.16-2.76c.61.09 1.24.14 1.87.14 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" fill="currentColor"/>
            </svg>
            Open in KakaoMap
          </a>

          <a
            href={naver}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <path d="M12 2L12 6M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 14l7 8 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Navigeer nu
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-500 active:bg-gray-50"
        >
          Sluiten
        </button>
      </div>
    </>
  );
}
