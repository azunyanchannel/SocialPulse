import React, { useState } from "react";
import type { Person } from "../models/types";
import { generateId } from "../utils/id";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPerson: (newPerson: Person) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onAddPerson
}) => {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [summary, setSummary] = useState("");
  const [importantFactsInput, setImportantFactsInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("姓名不能为空。");
      return;
    }

    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const importantFacts = importantFactsInput
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const now = new Date().toISOString();
    const newPerson: Person = {
      id: generateId("person"),
      name: trimmedName,
      organization: organization.trim() || undefined,
      role: role.trim() || undefined,
      location: location.trim() || undefined,
      tags,
      summary: summary.trim() || undefined,
      importantFacts,
      createdAt: now,
      updatedAt: now
    };

    onAddPerson(newPerson);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setOrganization("");
    setRole("");
    setLocation("");
    setTagsInput("");
    setSummary("");
    setImportantFactsInput("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-person-title"
      >
        <div className="modal-header">
          <h2 id="add-person-title" className="modal-title">
            添加新人物
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="关闭弹窗"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="person-name" className="form-label">
              姓名 <span className="required-mark">*</span>
            </label>
            <input
              id="person-name"
              type="text"
              className="form-input"
              placeholder="例如：陈丹尼"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="person-org" className="form-label">
                所属机构 / 公司
              </label>
              <input
                id="person-org"
                type="text"
                className="form-input"
                placeholder="例如：阳光手工冰淇淋"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="person-role" className="form-label">
                职位 / 头衔
              </label>
              <input
                id="person-role"
                type="text"
                className="form-input"
                placeholder="例如：主理人 & 研发主厨"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="person-location" className="form-label">
                所在城市 / 地区
              </label>
              <input
                id="person-location"
                type="text"
                className="form-input"
                placeholder="例如：厦门"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="person-tags" className="form-label">
                标签（支持逗号分隔）
              </label>
              <input
                id="person-tags"
                type="text"
                className="form-input"
                placeholder="例如：客户, 餐饮, 合作伙伴"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="person-summary" className="form-label">
              人物概述 / 简介
            </label>
            <textarea
              id="person-summary"
              className="form-textarea"
              rows={2}
              placeholder="简要概括TA是谁、主要背景或关联..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="person-facts" className="form-label">
              关键记忆点（每行一条重要事实）
            </label>
            <textarea
              id="person-facts"
              className="form-textarea"
              rows={2}
              placeholder="例如：习惯在上午11点前沟通&#10;有一对上小学的双胞胎女儿"
              value={importantFactsInput}
              onChange={(e) => setImportantFactsInput(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存人物
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
