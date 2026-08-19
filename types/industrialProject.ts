export interface IndustrialProject {
  id: string;
  title: string;
  summary: string;
  role: string | null;
  year: string | null;
  image_path: string;
  image_alt: string;
  tags: string[];
}

export interface IndustrialImage {
  image_path: string;
  image_alt: string;
}
