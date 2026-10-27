const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function toApiMessages(messages) {
    return [
        {
            role: "system",
            content: "You are a helpful and precise assistant. If you do not know something, say so clearly.",
        },
        ...messages.map((message) => ({
            role: message.role === "ai" ? "assistant" : "user",
            content: message.content,
        })),
    ];
}

export async function generateResponse(messages) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);

    try {
        const response = await fetch(process.env.GROQ_API_URL || GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: toApiMessages(messages),
                temperature: 0.2,
            }),
            signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(`Groq API returned ${response.status}: ${body.error?.message || "request failed"}`);
        }

        const content = body.choices?.[0]?.message?.content;
        if (typeof content !== "string" || !content.trim()) {
            throw new Error("Groq returned an empty response");
        }

        return content.trim();
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Groq API timed out after 16 seconds");
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

function fallbackChatTitle(message) {
    const cleaned = message.trim().replace(/\s+/g, " ");
    const words = cleaned.split(" ").slice(0, 7).join(" ");
    return words.length > 48 ? `${words.slice(0, 48).trim()}…` : words || "New conversation";
}

export async function generateChatTitle(message) {
    const fallback = fallbackChatTitle(message);

    if (!process.env.GROQ_API_KEY) {
        return fallback;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(process.env.GROQ_API_URL || GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0.1,
                max_tokens: 18,
                messages: [
                    {
                        role: "system",
                        content: "Create a concise, specific conversation title from the user's message. Return only 3 to 6 words, in title case, with no punctuation, quotes, or prefix.",
                    },
                    { role: "user", content: message.trim() },
                ],
            }),
            signal: controller.signal,
        });
        const body = await response.json().catch(() => ({}));
        const title = body.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, "");

        if (!response.ok || !title) {
            return fallback;
        }

        return title.slice(0, 60);
    } catch {
        return fallback;
    } finally {
        clearTimeout(timeout);
    }
}
