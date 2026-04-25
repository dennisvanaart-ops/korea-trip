"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchiveItem } from "@/lib/archive/storage";
import { deleteItem, getItemsByDate, saveItem, updateItem } from "@/lib/archive/storage";
import { compressImage } from "@/lib/archive/imageUtils";
import { ArchiveItemCard } from "./ArchiveItemCard";

interface Props {
  date: string;
}

export function DayArchive({ date }: Props) {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const stored = await getItemsByDate(date);
      setItems(stored);
    } catch {
      setError("Archief kon niet worden geladen.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  async function handleImageFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        const item: ArchiveItem = {
          id: `${date}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date,
          type: "image",
          createdAt: new Date().toISOString(),
          data: compressed,
          metadata: { fileName: file.name, mimeType: "image/jpeg" },
        };
        await saveItem(item);
      }
      await load();
    } catch (e) {
      setError("Opslaan mislukt. Mogelijk onvoldoende opslagruimte.");
      console.error(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveNote() {
    const text = noteText.trim();
    if (!text) return;
    try {
      const item: ArchiveItem = {
        id: `${date}-note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date,
        type: "note",
        createdAt: new Date().toISOString(),
        data: text,
      };
      await saveItem(item);
      setNoteText("");
      setShowNoteInput(false);
      await load();
    } catch {
      setError("Notitie opslaan mislukt.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Verwijderen mislukt.");
    }
  }

  async function handleUpdate(updated: ArchiveItem) {
    try {
      await updateItem(updated);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch {
      setError("Bijwerken mislukt.");
    }
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
        Dagarchief
      </h2>

      {/* Privacy notice */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 mb-4 text-xs text-gray-500 leading-relaxed">
        Dit archief wordt lokaal op dit apparaat opgeslagen en wordt niet automatisch gedeeld.
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? "Bezig…" : "Foto toevoegen"}
        </button>
        <button
          onClick={() => { setShowNoteInput((v) => !v); setNoteText(""); }}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 active:bg-gray-50"
        >
          {showNoteInput ? "Annuleer" : "Notitie toevoegen"}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
      />

      {/* Note input */}
      {showNoteInput && (
        <div className="space-y-2 mb-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Schrijf een notitie, herinnering of opmerking…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            autoFocus
          />
          <button
            onClick={handleSaveNote}
            disabled={!noteText.trim()}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white active:bg-gray-700 disabled:opacity-40"
          >
            Opslaan
          </button>
        </div>
      )}

      {/* Items */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">Laden…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Nog niets opgeslagen voor deze dag.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ArchiveItemCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
