"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Testimonial {
  id: number;
  customer_name: string;
  product_name: string;
  message: string;
  image_path: string;
  image_url: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

const EMPTY_FORM = {
  customer_name: "",
  product_name: "",
  message: "",
  sort_order: 0,
  is_published: true,
};

export default function AdminTestimoniPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (type: "ok" | "err", text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  /** Muat ulang daftar testimoni (dipakai setelah tambah/ubah/hapus). */
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showAlert("err", data?.message || "Gagal memuat testimoni.");
      } else {
        setItems(data?.testimonials ?? []);
      }
    } catch {
      showAlert("err", "Tidak dapat menghubungi server.");
    }
  }, []);

  /**
   * Pemuatan awal.
   *
   * setState sengaja dipanggil dari dalam callback `.then()` — bukan langsung
   * di body effect — supaya tidak dianggap setState sinkron saat render
   * (aturan react-hooks/set-state-in-effect).
   */
  useEffect(() => {
    let active = true;

    fetch("/api/testimonials")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) {
          showAlert("err", data?.message || "Gagal memuat testimoni.");
        } else {
          setItems(data?.testimonials ?? []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        showAlert("err", "Tidak dapat menghubungi server.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFile(null);
    setPreview("");
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setForm({
      customer_name: t.customer_name,
      product_name: t.product_name ?? "",
      message: t.message,
      sort_order: t.sort_order ?? 0,
      is_published: t.is_published,
    });
    setFile(null);
    setPreview(t.image_url ?? "");
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    if (picked.size > 5 * 1024 * 1024) {
      setFormError("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(picked.type)) {
      setFormError("Format gambar harus JPG, PNG, WEBP, atau GIF.");
      e.target.value = "";
      return;
    }

    setFormError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.customer_name.trim()) return setFormError("Nama pembeli wajib diisi.");
    // Isi testimoni opsional — screenshot/foto biasanya sudah memuat ceritanya.
    // Gambar wajib saat menambah. Saat mengubah, gambar lama boleh dipertahankan.
    if (!file && !preview) {
      return setFormError("Gambar testimoni wajib diunggah.");
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.set("customer_name", form.customer_name.trim());
      body.set("product_name", form.product_name.trim());
      body.set("message", form.message.trim());
      body.set("sort_order", String(form.sort_order));
      body.set("is_published", String(form.is_published));
      if (file) body.set("image", file);

      const res = await fetch(
        editingId ? `/api/testimonials/${editingId}` : "/api/testimonials",
        { method: editingId ? "PATCH" : "POST", body }
      );
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError(data?.message || "Gagal menyimpan testimoni.");
        return;
      }

      showAlert("ok", editingId ? "Testimoni diperbarui." : "Testimoni ditambahkan.");
      resetForm();
      await load();
    } catch {
      setFormError("Tidak dapat menghubungi server.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !t.is_published }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showAlert("err", data?.message || "Gagal mengubah status.");
        return;
      }
      await load();
      showAlert("ok", t.is_published ? "Testimoni disembunyikan." : "Testimoni diterbitkan.");
    } catch {
      showAlert("err", "Tidak dapat menghubungi server.");
    }
  };

  const handleDelete = async (t: Testimonial) => {
    const yakin = window.confirm(
      `Hapus testimoni dari "${t.customer_name}"? Gambar di public/testimoni/ juga ikut dihapus.`
    );
    if (!yakin) return;

    try {
      const res = await fetch(`/api/testimonials/${t.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showAlert("err", data?.message || "Gagal menghapus.");
        return;
      }
      showAlert("ok", "Testimoni dihapus.");
      if (editingId === t.id) resetForm();
      await load();
    } catch {
      showAlert("err", "Tidak dapat menghubungi server.");
    }
  };

  const inputClass =
    "w-full h-11 px-3.5 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium text-sm transition-colors bg-white";


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-brand-blue mb-2">
          Kelola Testimoni
        </h1>
        <p className="text-foreground/60 font-medium text-sm">
          Unggah gambar testimoni dari pembeli. Gambar disimpan di{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
            public/testimoni/
          </code>{" "}
          — terpisah dari gambar shop di{" "}
          <code className="bg-gray-100 px-1 rounded text-xs">public/catalog/</code>.
        </p>
      </div>

      {alert && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
            alert.type === "ok"
              ? "bg-green-50 text-green-700 border-2 border-green-200"
              : "bg-red-50 text-red-600 border-2 border-red-200"
          }`}
        >
          {alert.type === "ok" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {alert.text}
        </div>
      )}

      {/* ── FORM TAMBAH / UBAH ───────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 mb-10 shadow-sm"
      >
        <h2 className="font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
          {editingId ? "Ubah Testimoni" : "Tambah Testimoni"}
        </h2>

        {formError && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold border-2 border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1.5 uppercase tracking-wide">
              Nama Pembeli *
            </label>
            <input
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className={inputClass}
              placeholder="cth: Kak Sinta"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1.5 uppercase tracking-wide">
              Produk (opsional)
            </label>
            <input
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              className={inputClass}
              placeholder="cth: Custom Keychain"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/70 mb-1.5 uppercase tracking-wide">
              Urutan Tampil (besar di atas)
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) || 0 })
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Isi testimoni (opsional) */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-foreground/70 mb-1.5 uppercase tracking-wide">
            Isi Testimoni (opsional)
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
            className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium text-sm bg-white resize-y"
            placeholder="Boleh dikosongkan bila gambar sudah memuat isi percakapan."
          />
        </div>


        {/* Upload gambar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-foreground/70 mb-1.5 uppercase tracking-wide">
              Gambar Testimoni *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl gap-2 h-11"
              >
                <Upload className="w-4 h-4" />
                {preview ? "Ganti Gambar" : "Pilih Gambar"}
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="rounded-xl gap-2 h-11 text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                  Hapus Pilihan
                </Button>
              )}
            </div>
            <p className="text-xs text-foreground/50 font-medium mt-2">
              JPG, PNG, WEBP, atau GIF · maksimal 5 MB. Disimpan ke{" "}
              <code className="bg-gray-100 px-1 rounded">public/testimoni/</code>.
            </p>
            {file && (
              <p className="text-xs text-brand-blue font-bold mt-1 truncate">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>

          <div className="sm:col-span-1">
            {preview ? (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-brand-blue-light bg-[#FFFBF2]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Pratinjau gambar testimoni"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-1">
                <Upload className="w-6 h-6 opacity-40" />
                <span className="text-xs font-medium">Belum ada gambar</span>
              </div>
            )}
          </div>
        </div>

        {/* Status terbit */}
        <label className="mt-5 flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            className="w-4 h-4 accent-[#5B7DB1]"
          />
          <span className="text-sm font-bold text-foreground/70">
            Tampilkan di halaman publik <code className="text-xs">/testimoni</code>
          </span>
        </label>

        {/* Aksi */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button type="submit" disabled={saving} className="rounded-xl gap-2 h-11">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Testimoni"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="rounded-xl h-11"
            >
              Batal
            </Button>
          )}
        </div>
      </form>


      {/* ── DAFTAR TESTIMONI ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-brand-blue">
            Daftar Testimoni ({items.length})
          </h2>
          <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">
            {items.filter((t) => t.is_published).length} terbit ·{" "}
            {items.filter((t) => !t.is_published).length} disembunyikan
          </span>
        </div>

        {loading ? (
          <div className="py-14 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-3" />
            <p className="text-sm text-foreground/50 font-medium">Memuat...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-foreground/50 font-medium text-sm">
              Belum ada testimoni. Tambahkan lewat formulir di atas.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((t) => (
              <li key={t.id} className="py-4 flex flex-col sm:flex-row gap-4">
                {/* Gambar */}
                <div className="w-full sm:w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 border-brand-blue-light bg-[#FFFBF2] relative">
                  {t.image_url ? (
                    <Image
                      src={t.image_url}
                      alt={`Gambar testimoni ${t.customer_name}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium text-center px-1">
                      Tanpa gambar
                    </div>
                  )}
                </div>

                {/* Isi */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-foreground">
                      {t.customer_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {t.is_published ? "TERBIT" : "DRAFT"}
                    </span>
                    {t.sort_order !== 0 && (
                      <span className="text-[10px] font-bold text-foreground/40">
                        urutan {t.sort_order}
                      </span>
                    )}
                  </div>

                  {t.product_name && (
                    <p className="text-xs text-foreground/50 font-medium mb-1">
                      {t.product_name}
                    </p>
                  )}

                  <p className="text-sm text-foreground/70 font-medium line-clamp-3 whitespace-pre-line">
                    {t.message}
                  </p>

                  {t.image_path && (
                    <p className="text-[10px] text-foreground/35 font-mono mt-1 truncate">
                      public/testimoni/{t.image_path}
                    </p>
                  )}
                </div>

                {/* Aksi */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(t)}
                    className="rounded-lg gap-1.5 h-9 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublish(t)}
                    className="rounded-lg gap-1.5 h-9 text-xs"
                  >
                    {t.is_published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Sembunyikan
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Terbitkan
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(t)}
                    className="rounded-lg gap-1.5 h-9 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

