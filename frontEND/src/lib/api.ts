const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  full_name?: string | null;
  is_active: boolean;
  role: string;
}

export interface UserCreate {
  username: string;
  full_name?: string;
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  password?: string;
  is_active?: boolean;
  role?: string;
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

function parseDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return 'Daxil olmaq alınmadı';
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  } catch (e) {
    const msg = e instanceof TypeError ? 'Backendə qoşula bilinmədi. Serverin (port 8001) işlədiyini yoxlayın.' : String(e);
    throw new Error(msg);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = res.status === 401 ? (parseDetail(data.detail) || 'İstifadəçi adı və ya şifrə səhvdir') : parseDetail(data.detail);
    throw new Error(message);
  }

  return data as LoginResponse;
}

export async function fetchMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('İstifadəçi məlumatları alına bilmədi');
  }
  return res.json();
}

export async function fetchUsers(token: string): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error('İstifadəçiləri yükləmək alınmadı');
  }
  return res.json();
}

export async function createUser(token: string, data: UserCreate): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'İstifadəçi yaratmaq alınmadı');
  }
  return res.json();
}

export async function updateUserApi(token: string, id: number, data: UserUpdate): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'İstifadəçini yeniləmək alınmadı');
  }
  return res.json();
}

export async function deleteUserApi(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail || 'İstifadəçini silmək alınmadı');
  }
}

