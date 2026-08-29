import React, { useState, useMemo } from "react";
import type { AppState, ExportNetworkPayload } from "../models/types";
import { getInitials } from "../utils/formatters";

interface ExportDataModalProps {
  isOpen: boolean;
  appState: AppState;
  onClose: () => void;
}

interface ExportDataContentProps {
  appState: AppState;
  onClose: () => void;
}

const ExportDataContent: React.FC<ExportDataContentProps> = ({
  appState,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    appState.people.map((p) => p.id)
  );

  // Toggle single person selection
  const handleTogglePerson = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all people
  const handleSelectAll = () => {
    setSelectedIds(appState.people.map((p) => p.id));
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Generate structured export payload based on selected people
  const exportPayload: ExportNetworkPayload = useMemo(() => {
    const selectedPeople = appState.people.filter((p) => selectedIds.includes(p.id));

    const network = selectedPeople.map((person) => {
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

    const totalInteractions = network.reduce(
      (sum, p) => sum + p.interactions.length,
      0
    );

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      summary: {
        totalPeople: network.length,
        totalInteractions
      },
      network
    };
  }, [appState, selectedIds]);

  const jsonString = useMemo(() => {
    if (selectedIds.length === 0) return "";
    return JSON.stringify(exportPayload, null, 2);
  }, [exportPayload, selectedIds]);

  const handleCopy = async () => {
    if (!jsonString) return;
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
    if (!jsonString) return;
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

  const allSelected =
    appState.people.length > 0 && selectedIds.length === appState.people.length;

  return (
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
            勾选需要导出的人物档案与互动记录，可复制喂给外部 AI Agent 或离线保存。
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
        {/* Person Selection Area */}
        <div className="export-selector-section">
          <div className="export-selector-header">
            <div className="selector-title">
              <span>勾选要导出的人物：</span>
              <span className="selector-count-badge">
                已选 {selectedIds.length} / {appState.people.length} 人
              </span>
            </div>
            <div className="selector-actions">
              <button
                type="button"
                className="btn-link-action"
                onClick={handleSelectAll}
                disabled={allSelected}
              >
                全选
              </button>
              <span className="selector-sep">·</span>
              <button
                type="button"
                className="btn-link-action"
                onClick={handleDeselectAll}
                disabled={selectedIds.length === 0}
              >
                清空
              </button>
            </div>
          </div>

          <div className="export-person-checkbox-list">
            {appState.people.map((person) => {
              const isChecked = selectedIds.includes(person.id);
              const interactionCount = appState.interactions.filter(
                (i) => i.personId === person.id
              ).length;

              return (
                <label
                  key={person.id}
                  className={`export-person-checkbox-item ${
                    isChecked ? "checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="export-checkbox-input"
                    checked={isChecked}
                    onChange={() => handleTogglePerson(person.id)}
                  />
                  <div className="export-checkbox-avatar">
                    {getInitials(person.name)}
                  </div>
                  <div className="export-checkbox-info">
                    <span className="export-checkbox-name">{person.name}</span>
                    {(person.organization || person.role) && (
                      <span className="export-checkbox-org">
                        {person.role && <span>{person.role}</span>}
                        {person.role && person.organization && <span> · </span>}
                        {person.organization && <span>{person.organization}</span>}
                      </span>
                    )}
                  </div>
                  <span className="export-checkbox-meta">
                    {interactionCount} 条互动
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Summary Stat Bar */}
        <div className="export-summary-bar">
          <span className="export-stat-badge">
            👥 <strong>{exportPayload.summary.totalPeople}</strong> 位联系人
          </span>
          <span className="export-stat-badge">
            🗓️ <strong>{exportPayload.summary.totalInteractions}</strong> 条互动记录
          </span>
          <span className="export-stat-hint">
            格式：Schema v1.0 聚合人脉网络
          </span>
        </div>

        {/* Code Viewer */}
        {selectedIds.length === 0 ? (
          <div className="export-empty-notice">
            <span className="empty-icon">☝️</span>
            <p>请在上方列表中至少勾选 1 位需要导出的人物</p>
          </div>
        ) : (
          <div className="export-code-container">
            <pre className="export-code-block">{jsonString}</pre>
          </div>
        )}
      </div>

      <div className="modal-actions export-actions">
        <div className="export-action-left">
          <button
            type="button"
            className={`btn ${copied ? "btn-success" : "btn-primary"}`}
            onClick={handleCopy}
            disabled={selectedIds.length === 0}
          >
            {copied
              ? "✅ 已复制到剪贴板！"
              : `📋 复制选中数据 (${selectedIds.length}人)`}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
            disabled={selectedIds.length === 0}
          >
            💾 下载 JSON 文件
          </button>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
};

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  appState,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <ExportDataContent appState={appState} onClose={onClose} />
    </div>
  );
};
