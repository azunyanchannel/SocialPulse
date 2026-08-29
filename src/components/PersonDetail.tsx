import React, { useState } from "react";
import type { Person, Interaction } from "../models/types";
import { formatInteractionType, formatDate, getInitials } from "../utils/formatters";

interface PersonDetailProps {
  person: Person | null;
  interactions: Interaction[];
  onOpenImportModal: () => void;
  onOpenEditModal: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
}

export const PersonDetail: React.FC<PersonDetailProps> = ({
  person,
  interactions,
  onOpenImportModal,
  onOpenEditModal,
  onDeletePerson
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!person) {
    return (
      <main className="detail-panel empty-detail-state">
        <div className="empty-placeholder">
          <div className="placeholder-icon">👥</div>
          <h2>未选择人物</h2>
          <p>请从左侧列表选择一位人物，或添加新的人物联系人。</p>
        </div>
      </main>
    );
  }

  // Sort interactions newest first
  const sortedInteractions = [...interactions].sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });

  const handleConfirmDelete = () => {
    onDeletePerson(person.id);
    setShowDeleteConfirm(false);
  };

  return (
    <main className="detail-panel">
      {/* Profile Header Card */}
      <section className="profile-header-card">
        <div className="profile-top-row">
          <div className="profile-avatar">{getInitials(person.name)}</div>
          <div className="profile-title-area">
            <h2 className="profile-name">{person.name}</h2>
            <div className="profile-meta-line">
              {person.role && <span className="profile-role">{person.role}</span>}
              {person.role && person.organization && <span className="meta-sep">·</span>}
              {person.organization && (
                <span className="profile-org">{person.organization}</span>
              )}
              {(person.role || person.organization) && person.location && (
                <span className="meta-sep">·</span>
              )}
              {person.location && (
                <span className="profile-location">📍 {person.location}</span>
              )}
            </div>
          </div>

          {/* Profile Actions: Edit & Delete */}
          <div className="profile-action-buttons">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => onOpenEditModal(person)}
              title="编辑此人档案信息"
            >
              ✏️ 编辑资料
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger-outline"
              onClick={() => setShowDeleteConfirm(true)}
              title="删除此人物及其互动历史"
            >
              🗑️ 删除
            </button>
          </div>
        </div>

        {person.tags && person.tags.length > 0 && (
          <div className="profile-tags-row">
            {person.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill tag-pill-accent">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {person.summary && (
          <div className="profile-summary">
            <p>{person.summary}</p>
          </div>
        )}
      </section>

      {/* Important Facts Section */}
      {person.importantFacts && person.importantFacts.length > 0 && (
        <section className="detail-section facts-section">
          <h3 className="section-title">
            <span className="section-icon">💡</span> 关键事实与重要记忆
          </h3>
          <ul className="facts-list">
            {person.importantFacts.map((fact, idx) => (
              <li key={idx} className="fact-item">
                <span className="fact-bullet">✦</span>
                <span className="fact-text">{fact}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Interaction History Section */}
      <section className="detail-section history-section">
        <div className="section-header-row">
          <h3 className="section-title">
            <span className="section-icon">🗓️</span> 互动历史
            <span className="count-pill">{sortedInteractions.length}</span>
          </h3>
          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={onOpenImportModal}
          >
            + 导入记忆
          </button>
        </div>

        {sortedInteractions.length === 0 ? (
          <div className="empty-history-card">
            <p>暂无关于 {person.name} 的互动记录。</p>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onOpenImportModal}
            >
              导入记忆 JSON
            </button>
          </div>
        ) : (
          <div className="interactions-timeline">
            {sortedInteractions.map((interaction) => {
              const typeInfo = formatInteractionType(interaction.type);
              return (
                <article key={interaction.id} className="interaction-card">
                  <div className="interaction-header">
                    <div className="interaction-badge">
                      <span className="badge-icon">{typeInfo.icon}</span>
                      <span className="badge-label">{typeInfo.label}</span>
                    </div>
                    <time
                      dateTime={interaction.occurredAt}
                      className="interaction-date"
                    >
                      {formatDate(interaction.occurredAt)}
                    </time>
                  </div>

                  <div className="interaction-body">
                    <p className="interaction-notes">{interaction.notes}</p>
                  </div>

                  {interaction.extractedFacts &&
                    interaction.extractedFacts.length > 0 && (
                      <div className="interaction-extracted-facts">
                        <span className="extracted-label">提取的事实要点：</span>
                        <ul className="extracted-list">
                          {interaction.extractedFacts.map((fact, fIdx) => (
                            <li key={fIdx} className="extracted-item">
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="modal-container modal-sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="modal-header">
              <h2 id="delete-dialog-title" className="modal-title text-danger">
                确认删除人物
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDeleteConfirm(false)}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <div className="delete-modal-body">
              <p className="delete-warning-text">
                您确定要删除联系人 <strong>「{person.name}」</strong> 吗？
              </p>
              <p className="delete-subtext">
                此操作将同时彻底删除该人物名下的 <strong>{sortedInteractions.length}</strong> 条互动记录，且不可撤销。
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
