import { initialAnnouncements } from "../data/announcements";
import { initialNews } from "../data/news";
import { lessons } from "../data/lessons";
import type {
  Announcement,
  BackendAnnouncementItem,
  BackendNewsItem,
  BackendProgramItem,
  Lesson,
  NewsArticle,
} from "../types";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157)}...`;
}

export function mapNewsItems(items: BackendNewsItem[]): NewsArticle[] {
  if (!items.length) {
    return initialNews;
  }

  return items.map((item, index) => {
    const fallback = initialNews[index % initialNews.length];
    const content = item.content?.trim() || fallback.content;

    return {
      id: item.id,
      title: item.title,
      date: formatDate(item.createdAt),
      image: item.imageUrl || fallback.image,
      excerpt: buildExcerpt(content) || fallback.excerpt,
      content,
    };
  });
}

export function mapAnnouncementItems(items: BackendAnnouncementItem[]): Announcement[] {
  if (!items.length) {
    return initialAnnouncements;
  }

  return items.map((item, index) => {
    const fallback = initialAnnouncements[index % initialAnnouncements.length];

    return {
      id: item.id,
      title: item.title,
      date: formatDate(item.createdAt),
      priority: fallback.priority,
      content: item.content?.trim() || fallback.content,
    };
  });
}

export function mapProgramItems(items: BackendProgramItem[]): Lesson[] {
  if (!items.length) {
    return lessons;
  }

  return items.map((item, index) => {
    const fallback = lessons[index % lessons.length];
    const description = item.description?.trim() || fallback.description;

    return {
      ...fallback,
      title: item.name,
      description,
      detailedExplanation: item.description?.trim()
        ? `${item.name}\n\n${description}`
        : fallback.detailedExplanation,
      duration: item.isActive ? fallback.duration : `${fallback.duration} • Paused`,
    };
  });
}
