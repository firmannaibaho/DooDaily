"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Loader2, Send } from "lucide-react";

export function FoundReportForm({ token }: { token: string }) {
  const [finderName, setFinderName] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!finderName.trim() || !finderContact.trim() || !foundLocation.trim()) {
      setError("Nama, kontak, dan lokasi temuan wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/keychains/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          finder_name: finderName.trim(),
          finder_contact: finderContact.trim(),
          found_location: foundLocation.trim(),
          notes: notes.trim(),
          website,
        }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(data?.message || "Gagal mengirim laporan. Coba lagi.");
        return;
      }
      setSent(true);
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 text-center space-y-2">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
        <p className="font-bold text-emerald-800">Terima kasih banyak sudah melapor!</p>
        <p className="text-xs font-medium text-emerald-700/80">
          Laporan penemuan sudah dikirim ke pemilik barang. Semoga kebaikan Anda dibalas berlipat ganda. 🙏
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot tersembunyi untuk bot spam */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label className="block text-xs font-bold text-foreground/70 mb-1">
          Nama Anda <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={finderName}
          onChange={(e) => setFinderName(e.target.value)}
          placeholder="Misal: Budi"
          maxLength={80}
          required
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-foreground/70 mb-1">
          Kontak yang bisa dihubungi (WA / HP / IG) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={finderContact}
          onChange={(e) => setFinderContact(e.target.value)}
          placeholder="Misal: 0812xxxx atau @username"
          maxLength={100}
          required
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-foreground/70 mb-1">
          Lokasi Ditemukan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={foundLocation}
          onChange={(e) => setFoundLocation(e.target.value)}
          placeholder="Misal: Perpustakaan USU Lt. 2 / Kantin"
          maxLength={200}
          required
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-foreground/70 mb-1">
          Catatan Tambahan (opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Misal: Barang dititipkan di pos satpam"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium focus:outline-none focus:border-brand-blue"
        />
      </div>

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full rounded-full gap-2">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Kirim Laporan Penemuan
          </>
        )}
      </Button>
    </form>
  );
}
