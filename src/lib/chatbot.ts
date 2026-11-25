import { userIdOf, type SessionUser } from "./api-guard";
import type { ChatMessage, ChatThread } from "./chat-types";
import {
  buildContext,
  HANDOFF_ASK_MESSAGE,
  HANDOFF_MESSAGE,
  isConfirmHandoff,
  isPromptInjection,
  MAX_BOT_REPLY_LENGTH,
  needsHandoff,
  OFF_TOPIC_OR_ABUSE_REPLY,
} from "./chatbot-prompt";
import { chatQueries, orderQueries } from "./db";

let warnedMissingKey = false;

function readIntEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function stripLatestUserMessage(history: ChatMessage[], latestUserBody: string): ChatMessage[] {
  return history.length > 0 &&
    history[history.length - 1].sender_role === "user" &&
    history[history.length - 1].body === latestUserBody
    ? history.slice(0, -1)
    : history;
}

/** Hitung jumlah balasan bot berturut-turut di akhir riwayat (mengabaikan pesan user terbaru). */
function countTrailingBotReplies(prior: ChatMessage[]): number {
  let count = 0;
  for (let i = prior.length - 1; i >= 0; i -= 1) {
    if (prior[i].sender_role !== "bot") break;
    count += 1;
  }
  return count;
}

/** Ekstrak teks balasan dari respons JSON standar maupun chunk SSE (`data: {...}`). */
function extractReplyText(rawText: string): string | null {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("data:")) {
    let out = "";
    for (const line of trimmed.split(/\r?\n/)) {
      const s = line.trim();
      if (!s.startsWith("data:") || s === "data: [DONE]") continue;
      try {
        const chunk = JSON.parse(s.slice(5).trim()) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
        };
        out += chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content ?? "";
      } catch {
        /* abaikan chunk rusak */
      }
    }
    return out.trim() || null;
  }

  const cleanJson = trimmed.replace(/\s*data:\s*\[DONE\]\s*$/, "");
  try {
    const data = JSON.parse(cleanJson) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    console.error("chatbot: invalid JSON from provider:", cleanJson.slice(0, 200));
    return null;
  }
}

/**
 * Balasan otomatis untuk pesan user.
 * Selalu mengembalikan `null` saat gagal agar pengiriman pesan user tidak ikut gagal.
 */
export async function maybeAnswer(
  thread: ChatThread,
  user: SessionUser,
  body: string
): Promise<ChatMessage | null> {
  if (process.env.CHATBOT_ENABLED !== "1") return null;

  const apiKey = process.env.CHAT_API_KEY?.trim();
  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn("chatbot: CHATBOT_ENABLED=1 tetapi CHAT_API_KEY kosong; bot dilewati.");
    }
    return null;
  }

  if (thread.status !== "open" || thread.bot_paused) return null;

  try {
    const maxReplies = readIntEnv("CHATBOT_MAX_REPLIES", 6);
    const maxContext = readIntEnv("CHATBOT_MAX_CONTEXT_MESSAGES", 10);
    const history = await chatQueries.listMessages(thread.id, { limit: maxContext + maxReplies + 2 });
    const prior = stripLatestUserMessage(history, body);

    if (countTrailingBotReplies(prior) >= maxReplies) {
      await chatQueries.setBotPaused(thread.id, true);
      return null;
    }

    const lastPrior = prior[prior.length - 1];
    if (lastPrior?.sender_role === "bot" && lastPrior.body === HANDOFF_ASK_MESSAGE && isConfirmHandoff(body)) {
      await chatQueries.setBotPaused(thread.id, true);
      return await chatQueries.sendMessage(thread.id, null, "bot", HANDOFF_MESSAGE);
    }

    if (needsHandoff(body)) {
      return await chatQueries.sendMessage(thread.id, null, "bot", HANDOFF_ASK_MESSAGE);
    }

    if (isPromptInjection(body)) {
      return await chatQueries.sendMessage(thread.id, null, "bot", OFF_TOPIC_OR_ABUSE_REPLY);
    }

    const uid = userIdOf(user);
    const recentOrders = await orderQueries.findByUserId(uid);
    const order =
      thread.kind === "order" && thread.order_id
        ? recentOrders.find((o) => o.order_id === thread.order_id) ?? null
        : null;

    const baseUrl = (
      process.env.CHAT_API_BASE_URL?.trim() || "https://generativelanguage.googleapis.com/v1beta/openai"
    ).replace(/\/+$/, "");
    const model = process.env.CHAT_MODEL?.trim() || "gemini-2.5-flash";
    const timeoutMs = readIntEnv("CHATBOT_TIMEOUT_MS", 45000);

    const messages = buildContext({
      thread,
      history,
      newBody: body,
      userName: user.name ?? undefined,
      order,
      recentOrders,
      maxHistory: maxContext,
    });

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 350,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`chatbot: provider HTTP ${res.status}:`, errText.slice(0, 300));
      return null;
    }

    const rawReply = extractReplyText(await res.text());
    if (!rawReply) return null;

    const reply = rawReply.slice(0, MAX_BOT_REPLY_LENGTH);
    return await chatQueries.sendMessage(thread.id, null, "bot", reply);
  } catch (error) {
    console.error("chatbot.maybeAnswer error:", error);
    return null;
  }
}
