export type PageType = 'home' | 'news' | 'publications' | 'members' | 'contact' | 'login' | 'blog-detail';

export interface LabInfo {
  name: string;
  short_name: string;
  university: string;
  address: string;
  room: string;
  email: string;
  phone: string;
  map_lat: number;
  map_lng: number;
  recruiting: boolean;
  apply_link: string;
  research_areas: Array<{
    title: string;
    icon: string;
    desc: string;
  }>;
}

export interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  body: string;
  link?: string;
  pinned?: boolean;
  author?: string;
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
  categories: string[];
}

export interface MemberTeam {
  code: string;
  name: string;
  image: string;
}

export interface MemberItem {
  id: string;
  name: string;
  professional_level: string;
  role: string;
  role_key: 'mentor' | 'member';
  department: string;
  email: string;
  research_scope: string;
  start_date: string;
  photo: string;
  team: string;
  teams: MemberTeam[];
}

export interface MembersResponse {
  items: MemberItem[];
  total: number;
}

export interface PaperItem {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  type: string;
  year: number;
  volume: string;
  pages: string;
  doi: string;
  if: number | null;
  jcr: string | null;
}

export interface PapersResponse {
  items: PaperItem[];
  total: number;
  page: number;
  limit: number;
}

