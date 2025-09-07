export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
  imageUrl?: string;
}

export interface AnalyzedNews extends NewsItem {
  isInspiring: boolean;
  score: number;
  category: string;
  reason: string;
}

export interface RSSFeed {
  name: string;
  url: string;
  category: string;
} 