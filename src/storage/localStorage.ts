import type { AppState } from "../models/types";
import { initialAppState } from "../data/demoData";

const STORAGE_KEY = "socialpulse_state_zh_v1";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveState(initialAppState);
      return initialAppState;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.people) && Array.isArray(parsed.interactions)) {
      return parsed as AppState;
    }
  } catch (error) {
    console.error("Failed to load state from localStorage, using initial demo data:", error);
  }

  saveState(initialAppState);
  return initialAppState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}
