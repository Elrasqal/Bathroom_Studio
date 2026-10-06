# Always-online multiplayer hosting

Researched October 4, 2026. Recommendation: move the existing authoritative Node/WebSocket server to one always-running managed service with persistent storage. Browsers connect to its HTTPS address and WSS socket; your computer can be switched off. The game already synchronizes separate players and public room discovery, so this step is deployment rather than a multiplayer-engine rewrite.

## Practical options

| Option | Fit for this prototype | Tradeoff |
| --- | --- | --- |
| Paid Render web service + persistent disk | Direct fit for Node, WebSockets and the existing SQLite database; paid compute does not idle-sleep. | Disk-backed services have deployment interruptions and cannot scale across multiple instances sharing that disk. |
| Railway Hobby + persistent volume, Serverless disabled | Direct fit for a continuously running service and SQLite; Hobby starts at $5/month with $5 included resource usage. | CPU, memory, storage and music-download bandwidth affect the bill; $5 is not a guaranteed total. |
| A small VPS with HTTPS proxy and persistent disk | Full control over the same one-process setup. | You maintain operating-system updates, certificates, monitoring and backups. |

Render supports persistent WebSockets and heartbeat/reconnect patterns: [WebSocket documentation](https://render.com/docs/websocket). Paid services support [persistent disks](https://render.com/docs/disks), and [paid compute does not spin down](https://render.com/docs/faq). Its [free tier](https://render.com/docs/free) sleeps after 15 minutes without inbound traffic, takes approximately a minute to wake, and loses local SQLite files on restarts; that combination is unsuitable for durable shared artwork.

Railway documents [persistent volumes](https://docs.railway.com/volumes/reference), [optional Serverless sleeping](https://docs.railway.com/deployments/serverless), and [current plans and usage pricing](https://docs.railway.com/pricing/plans). Disable Serverless for immediate availability. A volume supports the existing SQLite approach, but use one replica. Hobby's included usage covers the first $5; measured usage above that is billed additionally.

## Deployment shape

1. Package Node 24.14 or newer, the locked dependencies, server.js and public assets. Keep music/effect recordings and their credits with the build. Do not put local ownership recovery keys or the live database into the source image.
2. Run one process/replica, with HOST=0.0.0.0 and the host-assigned PORT. Mount a persistent volume and set DATABASE to a file on it, such as /var/lib/bathroom-studio/studio.sqlite. Set ORIGIN to the exact final HTTPS website origin. Use /health as the service health check.
3. Serve assets, /rooms and /socket from that same public origin. The client already chooses WSS on HTTPS. The server already has WebSocket ping/pong checks and SIGTERM shutdown handling; client reconnection recovers durable artwork.
4. Either begin with new cloud rooms or migrate a consistent SQLite backup. Never copy only studio.sqlite while an active WAL contains pending writes. Make a proper SQLite backup or shut down the local process before transferring the database. Uploading existing artwork requires a separate deliberate migration step.
5. Before opening public access, test two independent browsers/devices, concurrent room joins, room capacity, paint convergence, a 20-second laundry cycle, label persistence and reconnect after a deployment/restart. Check both database backups and restore procedures. Add address-based abuse limits, logs and moderation controls for a broader public release.

The server currently supports four live artists per room and an overall connection cap. Preserve the single authoritative process initially: independently replicated servers would have different room lists, tool ownership and SQLite state. For growth, partition rooms across authoritative workers, use a shared directory/session store, and move durable metadata/artwork to managed shared storage. Routing must keep each room on one worker, with explicit reconnect/handoff logic. Streaming music may justify separate asset/CDN hosting once traffic warrants it.

## Room host versus server host

Cloud hosting keeps the game service online independently of your PC. A bathroom is currently publicly listed only while its owner is connected. If your own browser closes, your saved bathroom remains durable but its listing disappears; other players can still create and host their own rooms on the cloud service. Permanently open ownerless rooms would be a separate design change with additional moderation and permissions decisions.

No account, paid service, deployment or public URL has been created. A hosting account, budget and deployment destination are still needed before publication.
