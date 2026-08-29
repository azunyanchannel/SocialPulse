import React from "react";
import type { Person } from "../models/types";
import { getInitials } from "../utils/formatters";

interface PeopleListProps {
  people: Person[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const PeopleList: React.FC<PeopleListProps> = ({
  people,
  selectedPersonId,
  onSelectPerson,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportModal,
  onOpenExportModal,
  theme,
  onToggleTheme
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-row">
          <div className="brand">
            <div className="brand-logo">SP</div>
            <div>
              <h1 className="brand-title">SocialPulse</h1>
              <p className="brand-tagline">记住重要的人与相遇的瞬间</p>
            </div>
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === "dark" ? "切换至浅色模式" : "切换至暗色模式"}
            aria-label="切换主题颜色"
          >
            {theme === "dark" ? "☀️ 浅色" : "🌙 暗色"}
          </button>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            title="手动添加新人物"
          >
            <span className="btn-icon">+</span> 添加人物
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenImportModal}
            title="导入结构化记忆 JSON"
          >
            <span className="btn-icon">📥</span> 导入
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenExportModal}
            title="导出整个人脉与互动数据 (JSON)"
          >
            <span className="btn-icon">📤</span> 导出
          </button>
        </div>
      </div>

      <div className="search-box-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索姓名、机构、标签或城市..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              title="清除搜索"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="people-list-scroll">
        <div className="list-meta">
          <span>{people.length} 位联系人</span>
          {searchQuery && <span className="filtered-hint">（已筛选）</span>}
        </div>

        {people.length === 0 ? (
          <div className="empty-list-state">
            <p className="empty-text">未找到匹配的联系人</p>
            {searchQuery ? (
              <button
                type="button"
                className="btn-link"
                onClick={() => onSearchChange("")}
              >
                清除搜索条件
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={onOpenAddModal}
              >
                添加第一位人物
              </button>
            )}
          </div>
        ) : (
          <ul className="people-list">
            {people.map((person) => {
              const isSelected = person.id === selectedPersonId;
              return (
                <li key={person.id}>
                  <button
                    type="button"
                    className={`person-card ${isSelected ? "selected" : ""}`}
                    onClick={() => onSelectPerson(person.id)}
                  >
                    <div className="person-card-avatar">
                      {getInitials(person.name)}
                    </div>
                    <div className="person-card-content">
                      <div className="person-card-header">
                        <strong className="person-name">{person.name}</strong>
                      </div>

                      {(person.organization || person.role) && (
                        <div className="person-card-org">
                          {person.role && <span>{person.role}</span>}
                          {person.role && person.organization && <span> · </span>}
                          {person.organization && <span>{person.organization}</span>}
                        </div>
                      )}

                      {person.tags && person.tags.length > 0 && (
                        <div className="person-card-tags">
                          {person.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="tag-pill">
                              #{tag}
                            </span>
                          ))}
                          {person.tags.length > 3 && (
                            <span className="tag-pill more-pill">
                              +{person.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};
