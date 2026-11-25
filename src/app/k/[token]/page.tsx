import Link from "next/link";
import { AlertTriangle, KeyRound, MessageCircleHeart, Phone } from "lucide-react";
import { keychainQueries } from "@/lib/db";
import { FoundReportForm } from "./FoundReportForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function PublicKeychainPage({ params }: Props) {
  const { token } = await params;
  const tag = await keychainQueries.findByToken(token);

  if (!tag) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-brand-blue-light p-8 text-center space-y-3 shadow-sm">
          <KeyRound className="w-12 h-12 text-foreground/25 mx-auto" />
          <h1 className="font-display text-2xl text-brand-blue">Keychain Tidak Ditemukan</h1>
          <p className="text-sm font-medium text-foreground/60">
            Kode QR ini tidak terdaftar atau sudah tidak aktif.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 text-sm font-bold text-brand-blue hover:underline"
          >
            Kembali ke Doodaily Art
          </Link>
        </div>
      </div>
    );
  }

  const title = tag.display_title.trim() || tag.item_name.trim() || "Keychain Doodaily";
  const showContact = (tag.show_contact || tag.is_lost) && tag.contact_info.trim().length > 0;

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Kartu Informasi Keychain */}
        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light/50 px-3 py-1 rounded-full">
              Doodaily Smart Keychain
            </span>
            {tag.is_lost && (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> Dilaporkan Hilang
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-2xl text-foreground">{title}</h1>
            <p className="text-xs font-medium text-foreground/50 mt-1">
              Jika Anda menemukan tas atau barang yang terpasang keychain ini, silakan isi form di bawah agar pemilik bisa langsung menghubungi Anda.
            </p>
          </div>

          {tag.owner_message.trim() && (
            <div className="rounded-2xl bg-[#FFFBF2] border border-brand-orange/30 p-4 space-y-1">
              <p className="text-[11px] font-bold text-brand-orange flex items-center gap-1">
                <MessageCircleHeart className="w-3.5 h-3.5" /> Pesan Pemilik
              </p>
              <p className="text-sm font-medium text-foreground/80 whitespace-pre-wrap">
                {tag.owner_message}
              </p>
            </div>
          )}

          {showContact && (
            <div className="rounded-2xl bg-brand-blue-light/25 border border-brand-blue/20 p-3.5 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-blue shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-foreground/50">Kontak Pemilik</p>
                <p className="text-sm font-bold text-brand-blue break-all">{tag.contact_info}</p>
              </div>
            </div>
          )}
        </div>

        {/* Form Saya Menemukan Keychain Ini */}
        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-display text-xl text-brand-blue">
              Saya Menemukan Keychain Ini
            </h2>
            <p className="text-xs font-medium text-foreground/55 mt-0.5">
              Isi kontak dan lokasi temuan agar pemilik bisa segera menjemput barangnya.
            </p>
          </div>

          <FoundReportForm token={tag.token} />
        </div>
      </div>
    </div>
  );
}
