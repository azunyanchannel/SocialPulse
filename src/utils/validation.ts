import type { StructuredImportPayload, InteractionType } from "../models/types";

const VALID_INTERACTION_TYPES: InteractionType[] = [
  "in-person",
  "phone",
  "message",
  "email",
  "video-call",
  "other"
];

export type ValidationResult =
  | { success: true; data: StructuredImportPayload }
  | { success: false; error: string };

export function validateImportPayload(rawInput: string): ValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { success: false, error: "请粘贴 JSON 数据。" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    return {
      success: false,
      error: `JSON 语法解析失败: ${err instanceof Error ? err.message : "无效的 JSON 格式"}`
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { success: false, error: "JSON 根节点必须是一个对象。" };
  }

  const obj = parsed as Record<string, unknown>;

  // 1. schemaVersion validation
  if (obj.schemaVersion !== "1.0") {
    return {
      success: false,
      error: `无效的 schemaVersion: 必须为 "1.0"，当前值为 ${
        typeof obj.schemaVersion === "string" ? `"${obj.schemaVersion}"` : String(obj.schemaVersion)
      }`
    };
  }

  // 2. person validation
  if (!obj.person || typeof obj.person !== "object" || Array.isArray(obj.person)) {
    return { success: false, error: '缺少或无效的 "person" 对象。' };
  }

  const personObj = obj.person as Record<string, unknown>;
  if (typeof personObj.name !== "string" || !personObj.name.trim()) {
    return { success: false, error: "person.name 为必填项且不能为空。" };
  }

  // 3. interaction validation
  if (!obj.interaction || typeof obj.interaction !== "object" || Array.isArray(obj.interaction)) {
    return { success: false, error: '缺少或无效的 "interaction" 对象。' };
  }

  const interactionObj = obj.interaction as Record<string, unknown>;
  if (typeof interactionObj.occurredAt !== "string" || !interactionObj.occurredAt.trim()) {
    return { success: false, error: 'interaction.occurredAt 为必填日期字段（例如 "2026-08-28"）。' };
  }

  if (
    typeof interactionObj.type !== "string" ||
    !VALID_INTERACTION_TYPES.includes(interactionObj.type as InteractionType)
  ) {
    return {
      success: false,
      error: `interaction.type 必须是以下之一: ${VALID_INTERACTION_TYPES.join(", ")}。当前收到: "${interactionObj.type}"`
    };
  }

  if (typeof interactionObj.notes !== "string" || !interactionObj.notes.trim()) {
    return { success: false, error: "interaction.notes 为必填内容且不能为空。" };
  }

  // Sanitize optional fields
  const tags = Array.isArray(personObj.tags)
    ? personObj.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : undefined;

  const importantFacts = Array.isArray(personObj.importantFacts)
    ? personObj.importantFacts.filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    : undefined;

  const extractedFacts = Array.isArray(interactionObj.extractedFacts)
    ? interactionObj.extractedFacts.filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    : undefined;

  const cleanPayload: StructuredImportPayload = {
    schemaVersion: "1.0",
    person: {
      name: personObj.name.trim(),
      organization: typeof personObj.organization === "string" ? personObj.organization.trim() : undefined,
      role: typeof personObj.role === "string" ? personObj.role.trim() : undefined,
      location: typeof personObj.location === "string" ? personObj.location.trim() : undefined,
      tags,
      summary: typeof personObj.summary === "string" ? personObj.summary.trim() : undefined,
      importantFacts
    },
    interaction: {
      occurredAt: interactionObj.occurredAt.trim(),
      type: interactionObj.type as InteractionType,
      notes: interactionObj.notes.trim(),
      extractedFacts
    }
  };

  return { success: true, data: cleanPayload };
}
