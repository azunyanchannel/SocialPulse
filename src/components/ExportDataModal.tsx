import React, { useState, useMemo } from "react";
import type { AppState, ExportNetworkPayload } from "../models/types";

interface ExportDataModalProps {
  isOpen: boolean;
  appState: AppState;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  appState,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // Generate structured export payload
  const exportPayload: ExportNetworkPayload = useMemo(() => {
    const network = appState.people.map((person) => {
      const personInteractions = appState.interactions
        .filter((i) => i.personId === person.id)
        .sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )
        .map(({ personId: _unused, ...rest }) => rest);

      return {
        ...person,
        interactions: personInteractions
      };
    });

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      summary: {
        totalPeople: appState.people.length,
        totalInteractions: appState.interactions.length
      },
      network
    };
  }, [appState]);

  const jsonString = useMemo(() => {
    return JSON.stringify(exportPayload, null, 2);
  }, [exportPayload]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for clipboard
      const textarea = document.createElement("textarea");
      textarea.value = jsonString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.download = `socialpulse_network_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="export-modal-title" className="modal-title">
              导出人脉数据 (JSON)
            </h2>
            <p className="modal-subtitle">
              完整导出所有人物档案及其历史互动记录，可直接复制提供给 AI Agent 或离线备份。
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="关闭弹窗"
          >
            ✕
          </button>
        </div>

        <div className="export-modal-body">
          {/* Summary Stat Bar */}
          <div className="export-summary-bar">
            <span className="export-stat-badge">
              👥 <strong>{appState.people.length}</strong> 位联系人
            </span>
            <span className="export-stat-badge">
              🗓️ <strong>{appState.interactions.length}</strong> 条互动记录
            </span>
            <span className="export-stat-hint">
              格式：Schema v1.0 聚合人脉网络
            </span>
          </div>

          {/* Code Viewer */}
          <div className="export-code-container">
            <pre className="export-code-block">{jsonString}</pre>
          </div>
        </div>

        <div className="modal-actions export-actions">
          <div className="export-action-left">
            <button
              type="button"
              className={`btn ${copied ? "btn-success" : "btn-primary"}`}
              onClick={handleCopy}
            >
              {copied ? "✅ 已复制到剪贴板！" : "📋 复制 JSON 到剪贴板"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownload}
            >
              💾 下载 JSON 文件
            </button>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
