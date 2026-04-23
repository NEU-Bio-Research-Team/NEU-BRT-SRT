import type {
  LabInfo,
  MemberItem,
  MembersResponse,
  NewsItem,
  NewsResponse,
  PageType,
  PaperItem,
  PapersResponse,
} from './types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchLab() {
  return fetchJson<LabInfo>('/api/lab');
}

export async function fetchNews(params: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.category) search.set('category', params.category);
  if (params.q) search.set('q', params.q);
  return fetchJson<NewsResponse>(`/api/news?${search.toString()}`);
}

export async function fetchNewsDetail(id: string) {
  return fetchJson<NewsItem>(`/api/news/${encodeURIComponent(id)}`);
}

export async function fetchMembers(params: {
  team?: 'all' | 'bio' | 'finance';
  role?: 'all' | 'mentor' | 'member';
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params.team) search.set('team', params.team);
  if (params.role) search.set('role', params.role);
  if (params.q) search.set('q', params.q);
  return fetchJson<MembersResponse>(`/api/members?${search.toString()}`);
}

export async function fetchPapers(params: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.q) search.set('q', params.q);
  return fetchJson<PapersResponse>(`/api/papers?${search.toString()}`);
}

export async function login(payload: { email: string; password: string }) {
  return fetchJson<{ message: string; user: { email: string } }>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: { name: string; email: string; password: string }) {
  return fetchJson<{ message: string; user: { name: string; email: string } }>('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function formatDateForCard(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB').replace(/\//g, '.');
}

export function getPageFromCategory(category: string): PageType {
  if (category.toLowerCase().includes('publication')) return 'publications';
  return 'news';
}

export function toShortPreview(text: string, limit = 190) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

export function normalizeMemberPhoto(photo: string) {
  if (!photo) return '';
  if (/^https?:\/\//.test(photo)) return photo;
  const trimmed = photo.replace(/^\/+/, '');
  return `/${trimmed}`;
}

export function paperDoiToHref(doi: string) {
  const clean = (doi || '').trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `https://doi.org/${clean}`;
}

export function groupMembers(items: MemberItem[]) {
  const mentors = items.filter((item) => item.role_key === 'mentor');
  const members = items.filter((item) => item.role_key === 'member');
  return { mentors, members };
}

export function groupPapersByYear(items: PaperItem[]) {
  const byYear = new Map<number, PaperItem[]>();
  items.forEach((paper) => {
    const list = byYear.get(paper.year) || [];
    list.push(paper);
    byYear.set(paper.year, list);
  });
  return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
}

