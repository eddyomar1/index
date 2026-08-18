export interface Project {
  id: string;
  owner_id?: string | null;
  title: string;
  description: string;
  project_type: string;
  demo_url: string | null;
  repo_url: string | null;
  image_path: string | null;
  image_alt?: string | null;
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectInput {
  title: string;
  description: string;
  project_type: string;
  demo_url: string | null;
  repo_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
  published: boolean;
}
