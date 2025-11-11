export interface Resume {
  id: number;
  filename: string;
  file_path: string | null;  // Path to stored resume file
  raw_text: string | null;
  keywords: string | null;
  created_at: string;
  user_id: number;
}

export interface CareerPortal {
  id: number;
  name: string;
  url: string;
  company_name: string | null;
  company_email: string | null;  // Email for sending applications
  industry: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  company_size: string | null;
  tier: number;
  salary_min: number | null;
  salary_max: number | null;
  notes: string | null;
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  career_portal_id: number | null;
  job_title: string;
  company_name: string;
  application_date: string;
  status: string;
  interview_date: string | null;
  interview_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

export interface ApplicationInsights {
  total_applications: number;
  interview_rate: number;
  active_interviews: number;
  avg_interview_rating: number | null;
  status_breakdown: Record<string, number>;
  top_companies: Array<{ name: string; count: number }>;
  recommendations: string[];
}

