import { NextResponse } from "next/server";

// Aggregate GitHub public events (PushEvent) into daily commit counts.
// Unauthenticated: rate limit ~60 req/hour. Good enough for portfolio.
// Optionally add a GITHUB_TOKEN and send Authorization header for higher limits.

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user") || "thaytoiyeucoay";
  const days = Math.min(parseInt(searchParams.get("days") || "90", 10) || 90, 365);

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days + 1);
  const sinceKey = toDateKey(sinceDate);

  // Prepare empty series for each day
  const series: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(sinceDate);
    d.setDate(sinceDate.getDate() + i);
    series[toDateKey(d)] = 0;
  }

  try {
    // GitHub events API returns up to ~300 events across 3 pages (per_page=100) for recent activity
    const pages = [1, 2, 3];
    for (const page of pages) {
      const url = `https://api.github.com/users/${user}/events/public?per_page=100&page=${page}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github+json',
        },
        // Cache at edge briefly to avoid hammering
        next: { revalidate: 60 * 30 },
      });
      if (!res.ok) break;
      const events = await res.json();
      if (!Array.isArray(events) || events.length === 0) break;

      for (const ev of events) {
        if (ev?.type !== 'PushEvent') continue;
        const dateKey = String(ev?.created_at ?? '').slice(0, 10);
        if (!dateKey || dateKey < sinceKey) continue;
        const commits = Array.isArray(ev?.payload?.commits) ? ev.payload.commits.length : 0;
        if (series[dateKey] != null) series[dateKey] += commits;
      }
    }

    const data = Object.entries(series).map(([date, commits]) => ({ date, commits }));
    return NextResponse.json({ user, days, data });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch commits', details: String(e) }, { status: 500 });
  }
}
