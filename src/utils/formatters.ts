import type { InteractionType } from "../models/types";

export function formatInteractionType(type: InteractionType): { label: string; icon: string } {
  switch (type) {
    case "in-person":
      return { label: "线下碰面", icon: "🤝" };
    case "phone":
      return { label: "电话沟通", icon: "📞" };
    case "message":
      return { label: "即时消息", icon: "💬" };
    case "email":
      return { label: "邮件往来", icon: "✉️" };
    case "video-call":
      return { label: "视频会议", icon: "📹" };
    case "other":
    default:
      return { label: "其他互动", icon: "📝" };
  }
}

export function formatDate(dateString: string): string {
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return `${year}年${month}月${day}日`;
      }
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  } catch {
    // fallback
  }
  return dateString;
}

export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  // Check if Chinese characters are present
  const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed);
  if (hasChinese) {
    if (trimmed.length <= 2) return trimmed;
    // For 3+ characters, take last 2 (common given name initials) or first 2
    return trimmed.slice(-2);
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
