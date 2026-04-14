import type { Document } from './database.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface Rank {
  id: number;
  rank: string;
}

export interface Section {
  id: number;
  section?: string | null;
}

export interface DocumentReceiver {
  id: number;
  full_name?: string | null;
  department?: string | null;
}

function getAuthHeaders(token: string | null) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchDocuments(token: string): Promise<Document[]> {
  const res = await fetch(`${API_BASE_URL}/documents`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Sənədləri yükləmək alınmadı');
  }
  return res.json();
}

export async function createDocumentApi(
  token: string,
  data: Partial<Document>,
): Promise<Document> {
  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'Sənəd yaratmaq alınmadı');
  }
  return res.json();
}

export async function updateDocumentApi(
  token: string,
  id: number,
  data: Partial<Document>,
): Promise<Document> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'Sənədi yeniləmək alınmadı');
  }
  return res.json();
}

export async function deleteDocumentApi(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'Sənədi silmək alınmadı');
  }
}

export async function fetchRanks(token: string): Promise<Rank[]> {
  const res = await fetch(`${API_BASE_URL}/lookups/ranks`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Rütbələri yükləmək alınmadı');
  }
  return res.json();
}

export async function fetchSections(token: string): Promise<Section[]> {
  const res = await fetch(`${API_BASE_URL}/lookups/sections`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Ünvan sahiblərini yükləmək alınmadı');
  }
  return res.json();
}

export async function fetchReceivers(token: string): Promise<DocumentReceiver[]> {
  const res = await fetch(`${API_BASE_URL}/lookups/receivers`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('Qəbul edənləri yükləmək alınmadı');
  }
  return res.json();
}

