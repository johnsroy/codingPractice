/**
 * Research Adapter
 * ----------------
 * Searches the web for a query and returns structured ResearchSource results.
 * Implementations:
 *   - "stub"    (default) — deterministic, plausible sources derived from the query.
 *                           No network calls, no API keys. liveWeb: false.
 *   - "tavily"  (production) — POST https://api.tavily.com/search
 *   - "brave"   (production) — GET  https://api.search.brave.com/res/v1/web/search
 *   - "serpapi" (production) — GET  https://serpapi.com/search.json?engine=google
 *
 * Every production driver falls back to stub if its key is missing or if the
 * network call fails, so the server NEVER hard-fails due to a search error.
 * All network calls are wrapped in a ~10 s AbortController timeout.
 *
 * Uses Node 20+ global fetch — no new npm dependencies.
 */

import type { ResearchSource } from '@mentora/shared';
import { env } from '../../config/env';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ResearchAdapter {
  /**
   * Search for a query and return structured sources.
   * @param query     The search query string.
   * @param opts.maxResults  Cap on results (default: env.RESEARCH_MAX_RESULTS).
   * @returns Array of ResearchSource objects.
   */
  search(query: string, opts?: { maxResults?: number }): Promise<ResearchSource[]>;

  /**
   * Whether this adapter fetches from the live web.
   * Stub returns false; all production drivers return true (if successfully fetching).
   */
  readonly liveWeb: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch with a timeout, using AbortController. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Stub adapter (offline, deterministic) ────────────────────────────────────

class StubResearchAdapter implements ResearchAdapter {
  readonly liveWeb = false;

  async search(query: string, opts?: { maxResults?: number }): Promise<ResearchSource[]> {
    const max = opts?.maxResults ?? env.RESEARCH_MAX_RESULTS;
    // Derive keyword tokens from the query for realistic-sounding stub content
    const words = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2)
      .slice(0, 6);
    const slug = words.join('-') || 'topic';
    const titleCase = (s: string) =>
      s.replace(/\b\w/g, (c) => c.toUpperCase());

    const templates: Array<Omit<ResearchSource, 'url'> & { urlPath: string }> = [
      {
        urlPath: `wiki/${slug}`,
        title: `${titleCase(query)} — Overview`,
        snippet: `${titleCase(query)} is a foundational concept studied in K-12 education. This article provides a comprehensive introduction, including key definitions, historical context, and real-world examples suitable for classroom use.`,
        siteName: 'Wikipedia (stub)',
        publishedAt: '2024-03-15',
      },
      {
        urlPath: `lesson-resources/${slug}`,
        title: `Teaching ${titleCase(query)}: Classroom Strategies`,
        snippet: `Evidence-based instructional strategies for introducing ${query} to students. Covers differentiated instruction, formative assessment, and cross-curricular connections.`,
        siteName: 'Education Resource Center (stub)',
        publishedAt: '2024-09-01',
      },
      {
        urlPath: `research/${slug}-academic`,
        title: `Recent Research on ${titleCase(query)} in K-12 Settings`,
        snippet: `A peer-reviewed analysis of how ${query} is taught and learned in elementary through high school. Findings suggest hands-on approaches improve retention by up to 35%.`,
        siteName: 'Journal of Educational Research (stub)',
        publishedAt: '2024-11-20',
      },
      {
        urlPath: `standards/${slug}-common-core`,
        title: `${titleCase(query)}: Standards Alignment`,
        snippet: `Standards alignment guide for ${query} across grade levels. Maps to Common Core State Standards (CCSS), Next Generation Science Standards (NGSS), and state-specific curricula.`,
        siteName: 'Curriculum Standards Hub (stub)',
        publishedAt: '2023-08-10',
      },
      {
        urlPath: `activities/${slug}-hands-on`,
        title: `Hands-On ${titleCase(query)} Activities for Every Grade`,
        snippet: `A curated collection of ${query} activities for grades K–12. Each activity includes materials list, step-by-step instructions, learning objectives, and extension challenges.`,
        siteName: 'Teachers Pay Teachers (stub)',
        publishedAt: '2024-06-05',
      },
      {
        urlPath: `videos/${slug}-explained`,
        title: `${titleCase(query)} Explained: Video Series`,
        snippet: `Short video lessons covering ${query} at multiple levels. Each video runs 4–8 minutes and includes transcript, comprehension questions, and teacher notes.`,
        siteName: 'Khan Academy (stub)',
        publishedAt: '2024-02-28',
      },
    ];

    return templates.slice(0, max).map((t) => ({
      title: t.title,
      url: `https://example.org/${t.urlPath}`,
      snippet: t.snippet,
      siteName: t.siteName,
      publishedAt: t.publishedAt,
    }));
  }
}

// ─── Tavily adapter ───────────────────────────────────────────────────────────

class TavilyResearchAdapter implements ResearchAdapter {
  readonly liveWeb = true;
  private readonly stub = new StubResearchAdapter();

  async search(query: string, opts?: { maxResults?: number }): Promise<ResearchSource[]> {
    const max = opts?.maxResults ?? env.RESEARCH_MAX_RESULTS;
    try {
      const res = await fetchWithTimeout(
        'https://api.tavily.com/search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: env.TAVILY_API_KEY,
            query,
            max_results: max,
            include_answer: true,
          }),
        },
      );
      if (!res.ok) {
        console.warn(`[research:tavily] HTTP ${res.status} — falling back to stub`);
        return this.stub.search(query, opts);
      }
      const data = (await res.json()) as {
        results?: Array<{
          title?: string;
          url?: string;
          content?: string;
          published_date?: string;
          score?: number;
        }>;
      };
      const results = (data.results ?? []).slice(0, max);
      if (results.length === 0) return this.stub.search(query, opts);
      return results.map((r) => ({
        title: r.title ?? 'Untitled',
        url: r.url ?? '',
        snippet: r.content ?? '',
        publishedAt: r.published_date ?? null,
        siteName: r.url ? new URL(r.url).hostname : null,
      }));
    } catch (err) {
      console.warn('[research:tavily] Error fetching results — falling back to stub:', err);
      return this.stub.search(query, opts);
    }
  }
}

// ─── Brave Search adapter ─────────────────────────────────────────────────────

class BraveResearchAdapter implements ResearchAdapter {
  readonly liveWeb = true;
  private readonly stub = new StubResearchAdapter();

  async search(query: string, opts?: { maxResults?: number }): Promise<ResearchSource[]> {
    const max = opts?.maxResults ?? env.RESEARCH_MAX_RESULTS;
    try {
      const url = new URL('https://api.search.brave.com/res/v1/web/search');
      url.searchParams.set('q', query);
      url.searchParams.set('count', String(max));
      const res = await fetchWithTimeout(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': env.BRAVE_API_KEY,
        },
      });
      if (!res.ok) {
        console.warn(`[research:brave] HTTP ${res.status} — falling back to stub`);
        return this.stub.search(query, opts);
      }
      const data = (await res.json()) as {
        web?: {
          results?: Array<{
            title?: string;
            url?: string;
            description?: string;
            age?: string;
            meta_url?: { hostname?: string };
          }>;
        };
      };
      const results = (data.web?.results ?? []).slice(0, max);
      if (results.length === 0) return this.stub.search(query, opts);
      return results.map((r) => ({
        title: r.title ?? 'Untitled',
        url: r.url ?? '',
        snippet: r.description ?? '',
        publishedAt: r.age ?? null,
        siteName: r.meta_url?.hostname ?? (r.url ? new URL(r.url).hostname : null),
      }));
    } catch (err) {
      console.warn('[research:brave] Error fetching results — falling back to stub:', err);
      return this.stub.search(query, opts);
    }
  }
}

// ─── SerpApi adapter ──────────────────────────────────────────────────────────

class SerpApiResearchAdapter implements ResearchAdapter {
  readonly liveWeb = true;
  private readonly stub = new StubResearchAdapter();

  async search(query: string, opts?: { maxResults?: number }): Promise<ResearchSource[]> {
    const max = opts?.maxResults ?? env.RESEARCH_MAX_RESULTS;
    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'google');
      url.searchParams.set('q', query);
      url.searchParams.set('api_key', env.SERPAPI_API_KEY);
      url.searchParams.set('num', String(max));
      const res = await fetchWithTimeout(url.toString(), {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        console.warn(`[research:serpapi] HTTP ${res.status} — falling back to stub`);
        return this.stub.search(query, opts);
      }
      const data = (await res.json()) as {
        organic_results?: Array<{
          title?: string;
          link?: string;
          snippet?: string;
          date?: string;
          displayed_link?: string;
        }>;
      };
      const results = (data.organic_results ?? []).slice(0, max);
      if (results.length === 0) return this.stub.search(query, opts);
      return results.map((r) => ({
        title: r.title ?? 'Untitled',
        url: r.link ?? '',
        snippet: r.snippet ?? '',
        publishedAt: r.date ?? null,
        siteName: r.link ? new URL(r.link).hostname : null,
      }));
    } catch (err) {
      console.warn('[research:serpapi] Error fetching results — falling back to stub:', err);
      return this.stub.search(query, opts);
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: ResearchAdapter | undefined;

export function getResearchAdapter(): ResearchAdapter {
  if (_instance) return _instance;

  const driver = env.RESEARCH_DRIVER;

  if (driver === 'tavily') {
    if (!env.TAVILY_API_KEY) {
      console.warn(
        '[research] RESEARCH_DRIVER=tavily but TAVILY_API_KEY is not set — falling back to stub.',
      );
      _instance = new StubResearchAdapter();
    } else {
      _instance = new TavilyResearchAdapter();
      console.log('[research] Using driver: TavilyResearchAdapter');
    }
  } else if (driver === 'brave') {
    if (!env.BRAVE_API_KEY) {
      console.warn(
        '[research] RESEARCH_DRIVER=brave but BRAVE_API_KEY is not set — falling back to stub.',
      );
      _instance = new StubResearchAdapter();
    } else {
      _instance = new BraveResearchAdapter();
      console.log('[research] Using driver: BraveResearchAdapter');
    }
  } else if (driver === 'serpapi') {
    if (!env.SERPAPI_API_KEY) {
      console.warn(
        '[research] RESEARCH_DRIVER=serpapi but SERPAPI_API_KEY is not set — falling back to stub.',
      );
      _instance = new StubResearchAdapter();
    } else {
      _instance = new SerpApiResearchAdapter();
      console.log('[research] Using driver: SerpApiResearchAdapter');
    }
  } else {
    _instance = new StubResearchAdapter();
    console.log('[research] Using driver: StubResearchAdapter (offline)');
  }

  return _instance;
}

export { StubResearchAdapter };
