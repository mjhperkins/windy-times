import Parser from "rss-parser";

const FEED_URL = "https://news.michaelperkinsprojects.com/feed/category-3";

export interface Article {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  source: string;
  image?: string;
}

// Configure parser to capture enclosures (images)
type CustomFeed = { image?: { url?: string } };
type CustomItem = { enclosure?: { url?: string }; "media:content"?: { $?: { url?: string } } };
const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: [["enclosure", "enclosure"], ["media:content", "media:content"]],
  },
});

export async function fetchArticles(): Promise<Article[]> {
  const feed = await parser.parseURL(FEED_URL);

  return feed.items.map((item) => ({
    title: item.title || "Untitled",
    link: item.link || "#",
    pubDate: item.pubDate || new Date().toISOString(),
    summary: item.contentSnippet || item.content || "",
    source: (item.categories?.[0] as string) || "Unknown Source",
    // Get image from enclosure or media:content
    image: item.enclosure?.url || item["media:content"]?.$?.url,
  }));
}

export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WindyTimesBot/1.0)",
      },
    });
    clearTimeout(timeout);

    const html = await response.text();

    // Look for og:image meta tag
    const match = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );

    return match?.[1];
  } catch {
    return undefined;
  }
}

export async function fetchArticlesWithImages(
  limit: number = 20
): Promise<Article[]> {
  const articles = await fetchArticles();
  const homepageArticles = articles.slice(0, limit);

  // Images now come from RSS feed enclosures
  // Only fetch og:image as fallback for articles without feed images
  const articlesWithImages = await Promise.all(
    homepageArticles.map(async (article) => {
      if (article.image) {
        // Already have image from feed
        return article;
      }
      // Fallback: fetch og:image for articles without feed images
      const image = await fetchOgImage(article.link);
      return { ...article, image };
    })
  );

  return articlesWithImages;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
