# Windy Times

Wind energy news frontend. An Astro static site that consumes the AusWindNews RSS feed and presents articles in a clean editorial layout.

## Stack

- **Framework**: Astro (static site generation), TypeScript
- **Styling**: Tailwind CSS
- **Serving**: nginx (built static files)
- **Deployment**: Docker via Coolify

## Live Deployment

- **URL**: https://windytimes.michaelperkinsprojects.com
- **Server**: `root@news.michaelperkinsprojects.com`
- **Container**: `gw0w0o8k0gog4skc8ckwwgkc-*` (nginx)
- **Coolify**: manual deploy required after push (no auto-deploy)
- **GitHub**: https://github.com/mjhperkins/windy-times

## Database

None. Content is fetched from the AusWindNews RSS feed at build time (and at runtime via Astro's SSR if applicable).

**Depends on**: AusWindNews (`news.michaelperkinsprojects.com`) must be running. The feed URL is hardcoded in `src/lib/feed.ts`:

```
https://news.michaelperkinsprojects.com/feed/windy-times
```

## Environment Variables

None required. The feed URL points to the live production AusWindNews instance, which is used for both local development and production builds.

## Local Development

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production build
npm run preview   # preview production build
```

The local dev server will fetch live articles from the production AusWindNews feed.

## Notes

- Images come from RSS feed enclosures; fallback to `og:image` scraping for articles without feed images
- `src/lib/feed.ts` contains all feed-fetching and formatting logic
- Email newsletter templates are in `brevo-snippets.html` / `windy-times-brevo-template.html` (Brevo/Sendinblue)

## See Also

`~/Documents/Projects/PROJECTS_OVERVIEW.md` — server, all container IDs, cross-project dependencies
