interface Props {
  name: string;
  address?: string;
  query: string;
  naverUrl?: string;
  kakaoUrl?: string;
  className?: string;
}

export function MapButtons({ name, address, query, naverUrl, kakaoUrl, className = "" }: Props) {
  const effectiveQuery =
    query && query.trim().length > 2 ? query : `${name} ${address ?? ""}`.trim();
  const encodedQuery = encodeURIComponent(effectiveQuery);
  const naver = naverUrl ?? `https://map.naver.com/v5/search/${encodedQuery}`;
  const kakao = kakaoUrl ?? `https://map.kakao.com/?q=${encodedQuery}`;
  const navigate = naver;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <a
        href={naver}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white active:bg-green-700"
      >
        Open in Naver Maps
      </a>
      <a
        href={kakao}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-gray-900 active:bg-yellow-500"
      >
        Open in KakaoMap
      </a>
      <a
        href={navigate}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
      >
        Navigeer nu
      </a>
    </div>
  );
}
