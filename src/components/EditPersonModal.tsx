import React, { useState } from "react";
import type { Person } from "../models/types";

interface EditPersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onSavePerson: (updatedPerson: Person) => void;
}

interface EditPersonFormProps {
  person: Person;
  onClose: () => void;
  onSavePerson: (updatedPerson: Person) => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({
  person,
  onClose,
  onSavePerson
}) => {
  const [name, setName] = useState(person.name || "");
  const [organization, setOrganization] = useState(person.organization || "");
  const [role, setRole] = useState(person.role || "");
  const [location, setLocation] = useState(person.location || "");
  const [tagsInput, setTagsInput] = useState(person.tags ? person.tags.join(", ") : "");
  const [summary, setSummary] = useState(person.summary || "");
  const [importantFactsInput, setImportantFactsInput] = useState(
    person.importantFacts ? person.importantFacts.join("\n") : ""
  );
  const [error, setError] = useState("");

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

    const updatedPerson: Person = {
      ...person,
      name: trimmedName,
      organization: organization.trim() || undefined,
      role: role.trim() || undefined,
      location: location.trim() || undefined,
      tags,
      summary: summary.trim() || undefined,
      importantFacts,
      updatedAt: new Date().toISOString()
    };

    onSavePerson(updatedPerson);
    onClose();
  };

  return (
    <div
      className="modal-container"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-person-title"
    >
      <div className="modal-header">
        <h2 id="edit-person-title" className="modal-title">
          编辑人物档案
        </h2>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="关闭弹窗"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="edit-person-name" className="form-label">
            姓名 <span className="required-mark">*</span>
          </label>
          <input
            id="edit-person-name"
            type="text"
            className="form-input"
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
            <label htmlFor="edit-person-org" className="form-label">
              所属机构 / 公司
            </label>
            <input
              id="edit-person-org"
              type="text"
              className="form-input"
              placeholder="例如：阳光手工冰淇淋"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          <div className="form-group flex-1">
            <label htmlFor="edit-person-role" className="form-label">
              职位 / 头衔
            </label>
            <input
              id="edit-person-role"
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
            <label htmlFor="edit-person-location" className="form-label">
              所在城市 / 地区
            </label>
            <input
              id="edit-person-location"
              type="text"
              className="form-input"
              placeholder="例如：厦门"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group flex-1">
            <label htmlFor="edit-person-tags" className="form-label">
              标签（逗号分隔）
            </label>
            <input
              id="edit-person-tags"
              type="text"
              className="form-input"
              placeholder="例如：客户, 餐饮, 合作伙伴"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-person-summary" className="form-label">
            人物概述 / 简介
          </label>
          <textarea
            id="edit-person-summary"
            className="form-textarea"
            rows={3}
            placeholder="简要概括TA是谁、主要背景或关联..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-person-facts" className="form-label">
            关键记忆点（每行一条重要事实）
          </label>
          <textarea
            id="edit-person-facts"
            className="form-textarea"
            rows={3}
            placeholder="每行输入一条重要事实..."
            value={importantFactsInput}
            onChange={(e) => setImportantFactsInput(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            保存修改
          </button>
        </div>
      </form>
    </div>
  );
};

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  isOpen,
  person,
  onClose,
  onSavePerson
}) => {
  if (!isOpen || !person) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <EditPersonForm
        key={person.id}
        person={person}
        onClose={onClose}
        onSavePerson={onSavePerson}
      />
    </div>
  );
};
