import { validateImportPayload } from "../src/utils/validation";

/**
 * Cloudflare Worker entrypoint.
 *
 * - `POST /api/extract`  : natural language → SocialPulse Schema 1.0 import JSON (Workers AI)
 * - everything else      : served from the static Vite build (`dist/`) via the ASSETS binding
 */

interface Env {
  AI: { run(model: string, inputs: Record<string, unknown>): Promise<unknown> };
  ASSETS: Fetcher;
  /** Optional override via wrangler.jsonc `vars` or the Dashboard; falls back to DEFAULT_AI_MODEL. */
  AI_MODEL?: string;
}

const DEFAULT_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const MAX_INPUT_CHARS = 2000;

const INTERACTION_TYPES = ["in-person", "phone", "message", "email", "video-call", "other"];

// Mirrors StructuredImportPayload in src/models/types.ts
const IMPORT_JSON_SCHEMA = {
  type: "object",
  properties: {
    schemaVersion: { type: "string", enum: ["1.0"] },
    person: {
      type: "object",
      properties: {
        name: { type: "string" },
        organization: { type: ["string", "null"] },
        role: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
        tags: { type: "array", items: { type: "string" } },
        summary: { type: ["string", "null"] },
        importantFacts: { type: "array", items: { type: "string" } }
      },
      required: ["name", "organization", "role", "location", "tags", "summary", "importantFacts"]
    },
    interaction: {
      type: "object",
      properties: {
        occurredAt: { type: "string", description: "YYYY-MM-DD" },
        type: { type: "string", enum: INTERACTION_TYPES },
        notes: { type: "string" },
        extractedFacts: { type: "array", items: { type: "string" } }
      },
      required: ["occurredAt", "type", "notes", "extractedFacts"]
    }
  },
  required: ["schemaVersion", "person", "interaction"]
};

function buildSystemPrompt(today: string): string {
  return `你是 SocialPulse 的人脉互动记录整理助手。把用户提供的一段自然语言记录整理成结构化 JSON。

规则：
1. 只整理用户明确说过的内容，不得推测、补写或创造细节。
2. 未知信息使用 null（字符串字段）或空数组（数组字段）。
3. person.name 是对方的称呼或姓名，必须填写。
4. person.importantFacts 放关于这个人的长期稳定事实（工作、偏好、背景），每条一句话。
5. interaction.notes 是这次互动的简要摘要（1-2 句）。
6. interaction.extractedFacts 放这次互动中提到的具体事项、计划或约定，每条一句话。
7. interaction.occurredAt 必须是 YYYY-MM-DD；若用户没有说明日期，使用今天：${today}。"下个月"、"下周" 这类相对时间不要换算成日期，保留为文字写进 extractedFacts。
8. interaction.type 只能是 in-person、phone、message、email、video-call、other 之一；吃饭、见面、碰面属于 in-person，未说明时用 other。
9. tags 使用 1-4 个简短关键词（例如公司名、关系类型、兴趣）。
10. 文字字段使用与用户输入相同的语言。
11. 只输出 JSON，不要 Markdown、code fence 或任何解释。`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function stripCodeFence(text: string): string {
  return text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

/**
 * Workers AI text models return either `{ response: string | object }` (Llama etc.)
 * or an OpenAI-style `{ choices: [{ message: { content } }] }` (GLM etc.). Handle both.
 */
function extractModelObject(result: unknown): unknown {
  let raw: unknown = result;
  if (result && typeof result === "object") {
    const r = result as { response?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
    if ("response" in r) {
      raw = r.response;
    } else if (Array.isArray(r.choices) && r.choices.length > 0) {
      raw = r.choices[0]?.message?.content ?? null;
    }
  }
  if (raw === null || raw === undefined || raw === "") {
    throw new Error("模型没有返回内容（可能是 max_tokens 不足或模型不支持结构化输出）。");
  }
  if (typeof raw === "string") {
    return JSON.parse(stripCodeFence(raw));
  }
  return raw;
}

async function handleExtract(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  let text: unknown;
  let clientToday: unknown;
  try {
    ({ text, today: clientToday } = (await request.json()) as { text?: unknown; today?: unknown });
  } catch {
    return json({ error: "请求体必须是 JSON，例如 {\"text\": \"...\"}" }, 400);
  }

  if (typeof text !== "string" || !text.trim()) {
    return json({ error: "缺少 text 字段或内容为空。" }, 400);
  }
  if (text.length > MAX_INPUT_CHARS) {
    return json({ error: `输入过长，请控制在 ${MAX_INPUT_CHARS} 字以内。` }, 400);
  }

  if (!env.AI) {
    return json({ error: "Workers AI binding \"AI\" 未配置。" }, 500);
  }

  // Prefer the browser's local date (user may be in a different timezone than the edge).
  const today =
    typeof clientToday === "string" && /^\d{4}-\d{2}-\d{2}$/.test(clientToday)
      ? clientToday
      : new Date().toISOString().slice(0, 10);
  const model = env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;

  let modelObject: unknown;
  try {
    const result = await env.AI.run(model, {
      messages: [
        { role: "system", content: buildSystemPrompt(today) },
        { role: "user", content: text.trim() }
      ],
      response_format: {
        type: "json_schema",
        json_schema: IMPORT_JSON_SCHEMA
      },
      max_tokens: 4096
    });
    modelObject = extractModelObject(result);
  } catch (err) {
    return json(
      { error: "AI 整理失败，请稍后再试或改用手动粘贴 JSON。", details: err instanceof Error ? err.message : String(err) },
      502
    );
  }

  // Normalise then run the exact same validator the frontend uses for manual paste.
  if (modelObject && typeof modelObject === "object" && !Array.isArray(modelObject)) {
    (modelObject as Record<string, unknown>).schemaVersion = "1.0";
  }
  const validation = validateImportPayload(JSON.stringify(modelObject));
  if (!validation.success) {
    return json({ error: `AI 回传的数据不符合 Schema 1.0：${validation.error}`, raw: modelObject }, 502);
  }

  return json({ success: true, payload: validation.data, model });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/extract") {
      return handleExtract(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
