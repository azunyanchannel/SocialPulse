import React, { useState } from "react";
import type { Person, StructuredImportPayload } from "../models/types";
import { validateImportPayload } from "../utils/validation";
import { formatDate, formatInteractionType } from "../utils/formatters";

interface ImportMemoryModalProps {
  isOpen: boolean;
  existingPeople: Person[];
  onClose: () => void;
  onConfirmImport: (payload: StructuredImportPayload, existingPerson: Person | null) => void;
}

const SAMPLE_EXISTING_PERSON_JSON = `{
  "schemaVersion": "1.0",
  "person": {
    "name": "陈丹尼 (Daniel Chen)",
    "organization": "阳光手工冰淇淋",
    "role": "主理人",
    "location": "厦门",
    "tags": ["客户", "餐饮"],
    "summary": "在厦门港口附近经营独立手工冰淇淋工坊。",
    "importantFacts": [
      "正在研发秋季新品（糖炒栗子乌龙风味）"
    ]
  },
  "interaction": {
    "occurredAt": "2026-08-28",
    "type": "in-person",
    "notes": "中午到店碰面，品尝了栗子茶风味新品，并探讨了秋季上新计划。",
    "extractedFacts": [
      "秋季新菜单计划于9月中旬发布"
    ]
  }
}`;

const SAMPLE_NEW_PERSON_JSON = `{
  "schemaVersion": "1.0",
  "person": {
    "name": "林雅 (Maya Thorne)",
    "organization": "极光建筑设计事务所",
    "role": "可持续建筑顾问",
    "location": "京都 / 远程",
    "tags": ["合作伙伴", "绿色建筑", "新能源"],
    "summary": "专注于被动式建筑节能改造与智能电网整合方案专家。",
    "importantFacts": [
      "2026可持续城市峰会特邀主讲嘉宾",
      "更习惯邮件中条理分明的事项清单沟通"
    ]
  },
  "interaction": {
    "occurredAt": "2026-08-26",
    "type": "video-call",
    "notes": "经艾琳娜介绍相识，视频探讨了未来生态街区项目的太阳能屋顶数据模型协作。",
    "extractedFacts": [
      "有意在9月初共同审阅能源建模蓝图"
    ]
  }
}`;

export const ImportMemoryModal: React.FC<ImportMemoryModalProps> = ({
  isOpen,
  existingPeople,
  onClose,
  onConfirmImport
}) => {
  const [rawJson, setRawJson] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedPayload, setParsedPayload] = useState<StructuredImportPayload | null>(null);

  if (!isOpen) return null;

  const handleJsonChange = (text: string) => {
    setRawJson(text);
    if (!text.trim()) {
      setValidationError(null);
      setParsedPayload(null);
      return;
    }

    const res = validateImportPayload(text);
    if (res.success) {
      setValidationError(null);
      setParsedPayload(res.data);
    } else {
      setValidationError(res.error);
      setParsedPayload(null);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    handleJsonChange(sampleText);
  };

  // Find exact match by name
  const existingMatchedPerson = parsedPayload
    ? existingPeople.find(
        (p) => p.name.trim().toLowerCase() === parsedPayload.person.name.trim().toLowerCase()
      ) || null
    : null;

  const handleConfirm = () => {
    if (!parsedPayload) return;
    onConfirmImport(parsedPayload, existingMatchedPerson);
    handleClose();
  };

  const handleClose = () => {
    setRawJson("");
    setValidationError(null);
    setParsedPayload(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-container modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="import-modal-title" className="modal-title">
              导入结构化记忆
            </h2>
            <p className="modal-subtitle">
              粘贴由 AI 输出或格式化生成的结构化 JSON 数据（Schema 1.0）进行预览与保存。
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="关闭弹窗"
          >
            ✕
          </button>
        </div>

        <div className="import-modal-body">
          {/* Sample Buttons */}
          <div className="sample-buttons-bar">
            <span className="sample-label">快速示例：</span>
            <button
              type="button"
              className="btn-sample"
              onClick={() => handleLoadSample(SAMPLE_EXISTING_PERSON_JSON)}
            >
              填入示例（已有联系人: 陈丹尼）
            </button>
            <button
              type="button"
              className="btn-sample"
              onClick={() => handleLoadSample(SAMPLE_NEW_PERSON_JSON)}
            >
              填入示例（新联系人: 林雅/Maya）
            </button>
          </div>

          {/* JSON Input Area */}
          <div className="form-group">
            <label htmlFor="json-textarea" className="form-label">
              结构化 JSON 数据
            </label>
            <textarea
              id="json-textarea"
              className={`form-textarea code-textarea ${validationError ? "has-error" : ""}`}
              rows={8}
              placeholder='在此粘贴 JSON，例如 {"schemaVersion": "1.0", "person": {...}, "interaction": {...}}'
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
              autoFocus
            />
          </div>

          {/* Error Banner */}
          {validationError && (
            <div className="import-error-banner">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>数据校验未通过：</strong>
                <p className="error-desc">{validationError}</p>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {parsedPayload && (
            <div className="import-preview-section">
              <div className="preview-heading">
                <span className="preview-title">结构化数据预览</span>
                {existingMatchedPerson ? (
                  <span className="status-badge badge-matched">
                    ℹ️ 发现已有联系人: &quot;{existingMatchedPerson.name}&quot;
                  </span>
                ) : (
                  <span className="status-badge badge-new">
                    ✨ 将创建新联系人: &quot;{parsedPayload.person.name}&quot;
                  </span>
                )}
              </div>

              {existingMatchedPerson && (
                <div className="matched-note-banner">
                  已匹配到系统中存在的联系人 <strong>{existingMatchedPerson.name}</strong>。该条互动记录将直接追加至其档案历史中，不会重复创建联系人卡片。
                </div>
              )}

              <div className="preview-grid">
                {/* Person Preview Card */}
                <div className="preview-card">
                  <div className="preview-card-header">
                    <h4>人物信息 (Person)</h4>
                  </div>
                  <div className="preview-card-content">
                    <div className="preview-name">{parsedPayload.person.name}</div>
                    {(parsedPayload.person.organization || parsedPayload.person.location) && (
                      <div className="preview-meta">
                        {parsedPayload.person.organization && (
                          <span>{parsedPayload.person.organization}</span>
                        )}
                        {parsedPayload.person.organization && parsedPayload.person.location && (
                          <span> · </span>
                        )}
                        {parsedPayload.person.location && (
                          <span>📍 {parsedPayload.person.location}</span>
                        )}
                      </div>
                    )}
                    {parsedPayload.person.role && (
                      <div className="preview-role">职位: {parsedPayload.person.role}</div>
                    )}

                    {parsedPayload.person.summary && (
                      <p className="preview-summary">{parsedPayload.person.summary}</p>
                    )}

                    {parsedPayload.person.tags && parsedPayload.person.tags.length > 0 && (
                      <div className="preview-tags">
                        {parsedPayload.person.tags.map((t, idx) => (
                          <span key={idx} className="tag-pill">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {parsedPayload.person.importantFacts &&
                      parsedPayload.person.importantFacts.length > 0 && (
                        <div className="preview-facts">
                          <strong>关键事实：</strong>
                          <ul>
                            {parsedPayload.person.importantFacts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>

                {/* Interaction Preview Card */}
                <div className="preview-card">
                  <div className="preview-card-header">
                    <h4>互动记录 (Interaction)</h4>
                  </div>
                  <div className="preview-card-content">
                    <div className="preview-interaction-meta">
                      <span className="preview-date">
                        {formatDate(parsedPayload.interaction.occurredAt)}
                      </span>
                      <span className="meta-sep">·</span>
                      <span className="preview-type">
                        {formatInteractionType(parsedPayload.interaction.type).icon}{" "}
                        {formatInteractionType(parsedPayload.interaction.type).label}
                      </span>
                    </div>

                    <p className="preview-notes">{parsedPayload.interaction.notes}</p>

                    {parsedPayload.interaction.extractedFacts &&
                      parsedPayload.interaction.extractedFacts.length > 0 && (
                        <div className="preview-facts">
                          <strong>提取事实：</strong>
                          <ul>
                            {parsedPayload.interaction.extractedFacts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!parsedPayload}
            onClick={handleConfirm}
          >
            确认并保存
          </button>
        </div>
      </div>
    </div>
  );
};
