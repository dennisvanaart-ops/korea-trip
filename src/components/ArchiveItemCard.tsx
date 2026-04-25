"use client";

import { useEffect, useRef, useState } from "react";
import type { ArchiveItem } from "@/lib/archive/storage";
import { createObjectURL, revokeObjectURL } from "@/lib/archive/imageUtils";

interface Props {
  item: ArchiveItem;
  onDelete: (id: string) => void;
  onUpdate: (item: ArchiveItem) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ArchiveItemCard({ item, onDelete, onUpdate }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.type === "note" ? (item.data as string) : "");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (item.type === "image" && item.data instanceof Blob) {
      const url = createObjectURL(item.data);
      urlRef.current = url;
      setImgUrl(url);
    }
    return () => {
      if (urlRef.current) revokeObjectURL(urlRef.current);
    };
  }, [item]);

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(item.id);
  }

  function handleSaveEdit() {
    onUpdate({ ...item, data: editText });
    setEditing(false);
  }

  return (
    <>
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {item.type === "image" ? "Foto" : "Notitie"}
            </span>
            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
          </div>
          <div className="flex gap-2">
            {item.type === "note" && !editing && (
              <button
                onClick={() => { setEditing(true); setConfirmDelete(false); }}
                className="text-xs text-gray-400 active:text-gray-600 px-2 py-1"
              >
                Bewerk
              </button>
            )}
            <button
              onClick={handleDelete}
              className={[
                "text-xs px-2 py-1 rounded",
                confirmDelete
                  ? "bg-red-100 text-red-700 font-semibold"
                  : "text-gray-400 active:text-red-600",
              ].join(" ")}
            >
              {confirmDelete ? "Zeker?" : "Verwijder"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-400 px-2 py-1"
              >
                Annuleer
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          {item.type === "image" && imgUrl && (
            <button
              onClick={() => setLightbox(true)}
              className="block w-full"
              aria-label="Bekijk afbeelding op volledig scherm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={item.metadata?.fileName ?? "Foto"}
                className="w-full rounded-lg object-cover max-h-64"
                loading="lazy"
              />
              {item.metadata?.fileName && (
                <p className="mt-1.5 text-xs text-gray-400 truncate">{item.metadata.fileName}</p>
              )}
            </button>
          )}

          {item.type === "note" && (
            editing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white active:bg-gray-700"
                  >
                    Opslaan
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditText(item.data as string); }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"
                  >
                    Annuleer
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {item.data as string}
              </p>
            )
          )}
        </div>
      </div>

      {lightbox && imgUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={item.metadata?.fileName ?? "Foto"}
            className="max-w-full max-h-full rounded-lg object-contain"
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold w-10 h-10 flex items-center justify-center"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
