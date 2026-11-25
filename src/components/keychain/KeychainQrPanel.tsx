"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Loader2, QrCode, Save, AlertTriangle, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { KeychainTagWithReports } from "@/lib/keychain-types";

interface KeychainQrPanelProps {
  orderId: string;
  mode: "owner" | "admin";
}

function QrPreview({ url, filename }: { url: string; filename: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toString(url, { type: "svg", margin: 2, width: 220 })
      .then((out) => {
        if (active) setSvg(out);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [url]);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPng = async () => {
    const dataUrl = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className="w-28 h-28 bg-white border border-line rounded-2xl p-1.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <div className="flex gap-1.5">
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={downloadSvg}>
          <Download className="w-3 h-3" /> SVG
        </Button>
        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={() => void downloadPng()}>
          <Download className="w-3 h-3" /> PNG
        </Button>
      </div>
    </div>
  );
}

function OwnerTagCard({
  tag,
  url,
  onSaved,
}: {
  tag: KeychainTagWithReports;
  url: string;
  onSaved: (updated: KeychainTagWithReports) => void;
}) {
  const [displayTitle, setDisplayTitle] = useState(tag.display_title);
  const [ownerMessage, setOwnerMessage] = useState(tag.owner_message);
  const [contactInfo, setContactInfo] = useState(tag.contact_info);
  const [showContact, setShowContact] = useState(tag.show_contact);
  const [isLost, setIsLost] = useState(tag.is_lost);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const unreadCount = tag.reports.filter((r) => !r.is_read).length;

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch(`/api/keychains/${encodeURIComponent(tag.token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_title: displayTitle,
          owner_message: ownerMessage,
          contact_info: contactInfo,
          show_contact: showContact,
          is_lost: isLost,
          mark_read: unreadCount > 0,
        }),
      });
      const data = (await res.json().catch(() => null)) as { tag?: KeychainTagWithReports } | null;
      if (res.ok && data?.tag) {
        onSaved({
          ...data.tag,
          reports: tag.reports.map((r) => ({ ...r, is_read: true })),
        });
        setSavedMsg("Info keychain tersimpan.");
      } else {
        setSavedMsg("Gagal menyimpan.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-[#FFFBF2] p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-4">
        <QrPreview url={url} filename={`qr-${tag.item_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`} />
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-bold text-sm text-brand-blue truncate">{tag.item_name}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline"
            >
              Lihat halaman QR <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <input
            type="text"
            value={displayTitle}
            onChange={(e) => setDisplayTitle(e.target.value)}
            placeholder="Nama barang / tas (mis. Tas Ransel Hitam)"
            maxLength={100}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-blue"
          />

          <textarea
            value={ownerMessage}
            onChange={(e) => setOwnerMessage(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Pesan untuk penemu (mis. Jika ketemu hubungi saya ya, ada imbalan)"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-blue"
          />

          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="Kontak Anda (WA / IG, opsional)"
            maxLength={100}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-blue"
          />

          <div className="flex flex-wrap gap-4 text-xs font-bold text-foreground/75">
            <label className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showContact}
                onChange={(e) => setShowContact(e.target.checked)}
                className="accent-brand-blue"
              />
              Tampilkan kontak di halaman QR
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-red-600">
              <input
                type="checkbox"
                checked={isLost}
                onChange={(e) => setIsLost(e.target.checked)}
                className="accent-red-600"
              />
              <AlertTriangle className="w-3.5 h-3.5" /> Tandai Sedang Hilang
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" size="sm" className="rounded-full gap-1.5" disabled={saving} onClick={() => void handleSave()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan Info QR
            </Button>
            {savedMsg && <span className="text-xs font-bold text-emerald-700">{savedMsg}</span>}
          </div>
        </div>
      </div>

      {/* Laporan Penemuan Masuk */}
      {tag.reports.length > 0 && (
        <div className="pt-3 border-t border-line space-y-2">
          <p className="text-xs font-bold text-brand-orange">
            Laporan Penemuan ({tag.reports.length})
          </p>
          <div className="space-y-2">
            {tag.reports.map((r) => (
              <div key={r.id} className="rounded-xl bg-white border border-line p-3 text-xs space-y-1">
                <div className="flex justify-between gap-2 font-bold">
                  <span>{r.finder_name}</span>
                  <span className="text-foreground/45">
                    {new Date(r.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-brand-blue font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {r.finder_contact}
                </p>
                <p className="text-foreground/75 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> {r.found_location}
                </p>
                {r.notes && <p className="italic text-foreground/60">&ldquo;{r.notes}&rdquo;</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function KeychainQrPanel({ orderId, mode }: KeychainQrPanelProps) {
  const [tags, setTags] = useState<KeychainTagWithReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(mode === "admin");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/keychains?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { tags?: KeychainTagWithReports[] } | null) => {
        if (!cancelled) setTags(data?.tags ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return mode === "admin" ? (
      <div className="text-xs font-medium text-foreground/50 py-2">Memuat kode QR...</div>
    ) : null;
  }

  if (tags.length === 0) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const unreadTotal = tags.reduce((s, t) => s + t.reports.filter((r) => !r.is_read).length, 0);
  const reportsTotal = tags.reduce((s, t) => s + t.reports.length, 0);

  if (mode === "admin") {
    return (
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 md:p-8 shadow-sm mb-6">
        <h2 className="font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5" /> Kode QR Keychain ({tags.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tags.map((tag, idx) => {
            const url = `${origin}/k/${tag.token}`;
            return (
              <div key={tag.id} className="rounded-2xl border border-line bg-[#FFFBF2] p-4 flex items-center gap-4">
                <QrPreview url={url} filename={`${orderId}-qr-${idx + 1}`} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold text-sm text-foreground truncate">{tag.item_name}</p>
                  {tag.display_title && (
                    <p className="text-xs text-foreground/65 truncate">Label: {tag.display_title}</p>
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                  >
                    Buka halaman QR <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => setOpen((v) => !v)}
        >
          <QrCode className="w-4 h-4 text-brand-blue" />
          {open ? "Tutup Info & QR Keychain" : `Kelola Info & QR Keychain (${tags.length})`}
          {unreadTotal > 0 && (
            <span className="ml-1 bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadTotal} temuan baru
            </span>
          )}
          {unreadTotal === 0 && reportsTotal > 0 && (
            <span className="ml-1 text-[10px] font-bold text-foreground/50">
              ({reportsTotal} laporan)
            </span>
          )}
        </Button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {tags.map((tag) => (
            <OwnerTagCard
              key={tag.id}
              tag={tag}
              url={`${origin}/k/${tag.token}`}
              onSaved={(updated) =>
                setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
