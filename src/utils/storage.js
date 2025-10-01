const STORAGE_KEY = "budgeting-rules-final-v2";

export function loadRules() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
export function saveRules(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
