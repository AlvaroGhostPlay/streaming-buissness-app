// models/hero.ts
export interface Hero {
  imageUrlMobile: string;
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;   // 👈 usa imageUrl (no imageKey)
  ctaUrl?: string;
}
