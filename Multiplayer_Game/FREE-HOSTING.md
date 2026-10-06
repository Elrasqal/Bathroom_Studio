# Free hosting for Bathroom Studio

Checked October 4, 2026. No account was created and nothing was deployed.

The website also needs its multiplayer server and durable saved artwork. Uploading only the public folder to a static host does not run the current Node/WebSocket backend.

| Choice | Setup and maintenance | Important limitation |
| --- | --- | --- |
| Render Free web service | Closest fit for the existing Node server; managed hosting and automatic deployments reduce ongoing work. | Sleeps after 15 minutes without inbound traffic; waking takes about a minute. Local SQLite saves disappear on spin-down, restart or redeployment. Suitable for a temporary demo, not durable player artwork as currently implemented. |
| Cloudflare Workers Free + static assets + SQLite-backed Durable Objects | Best candidate for a small persistent multiplayer game without maintaining a computer or operating system. | Requires an initial backend port and quota-aware design. It cannot run the existing server unchanged. |

My recommendation is Cloudflare if persistent, free public play is the priority. Keep the browser game, serve its static assets directly, put each authoritative room in a Durable Object, and use a directory object for public room discovery. Replace Node WebSocket handling and node:sqlite access with Durable Object APIs. Use WebSocket hibernation and alarms instead of always-running timers. Test restart recovery, drawing traffic and public-room listing before publishing. This is a proposed next step, not an implemented migration.

Cloudflare currently makes static asset requests free and unlimited with normal static-asset routing. Workers Free allows 100,000 requests/day and limited CPU per invocation. SQLite-backed Durable Objects are available on Free, with 100,000 requests/day, 13,000 GB-seconds/day of duration, 5 million row reads/day, 100,000 row writes/day and 5 GB total storage. Exceeding Durable Object Free limits causes operations to fail; the free tier is not unlimited. Frequent painting events need batching and measured load before promising player capacity.

There is no verified zero-change, free, durable option among these choices for the current local SQLite server. Render is the quickest demo route; Cloudflare involves more initial development but less ongoing server upkeep. A free provider address avoids buying a domain. Providers can change their plans.

Primary sources:

- [Render Free services: sleep, wake time, ephemeral files and quotas](https://render.com/docs/free)
- [Cloudflare Workers pricing and free static assets](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Durable Objects Free availability and quotas](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Cloudflare static asset hosting](https://developers.cloudflare.com/workers/static-assets/)

The earlier HOSTING-RESEARCH.md compares paid direct-deployment options. This report addresses the subsequent preference for free hosting.
