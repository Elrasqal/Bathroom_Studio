# Bathroom Studio — Project Reference

Version: 0.8 · October 2, 2026 · Studio Explorer aesthetic, quality and laundry cycle checkpoint

Working title only: Bathroom Studio. No final game name has been selected.

## 1. Purpose and authority

This document consolidates the conversation into a durable design and engineering reference for the agent building the project. It records the intended product, proposed implementation, unresolved decisions, and evidence required before declaring success. It is a specification, not a task tracker. Implementation tasks belong in Beads.

At the planning baseline, the user requested planning before implementation and approval of the initial plan. Later instructions authorized implementation, as recorded below. This reference alone does not authorize purchasing services or public deployment. A local prototype now exists; public deployment remains unverified.

Interpret labels consistently:

- **Required:** explicitly requested by the user or the Handshake challenge.
- **Proposed:** an agent recommendation that remains open to revision.
- **Open:** a decision or technical capability that has not been settled or verified.
- **Later:** an extension outside the first technical milestone, not a promise to implement it immediately.

Future user instructions override this baseline. Update the reference when decisions change; do not silently treat suggestions as approved features.

Implementation authorization (September 29, 2026): the user instructed the agent to read this document and begin implementing it. The starting slice is a local shared-towel prototype with a real WebSocket server and SQLite durability. This supersedes the earlier initial-plan approval pause. Public hosting and paid services remain unapproved and unverified. See README.md for the implemented slice and its limitations; actionable work remains in Beads.

Development direction (September 29, 2026): the user requested substantially further development, prioritized reducing lag and input-to-output delay, and asked for a richer bathroom with assessment between manageable milestones. The next local checkpoint adds immediate predicted painting with authoritative reconciliation, append-only durability, distinct exclusively held tools, timed wetting/sponge cleaning, shared lighting, and a furnished scene with instancing and cached shadows. See README.md for measured evidence and remaining limits. This does not establish completion of the full agreed game or public-release stage.

## 2. Mission and product identity

### Creative objects and quality checkpoint (version 0.9)

- Three spare toilet-paper rolls live on the vanity shelves. Open a door, paint the cylindrical wrapping surface, use E to carry, then place on an empty storage marker, a vanity display stand or nearby clear floor. Aim at the wrapping surface and press R / Turn for a quarter turn. Individual roll art, placement and orientation are shared and durable; towel washing leaves them untouched. End caps can be picked up, and the cardboard interiors remain visible.
- The mounted paper holder moves farther along the wall to clear the toilet. Overlapping ceiling strips and fan-blade geometry are removed; walls meet without overlapping upper faces. A consistent pale-green title plate removes the dark strip behind the game name. Display stands and cabinet storage avoid object overlaps, and the waste bin occludes painting targets.
- A geometric 90s instant camera sits on the utility cabinet. After painting a towel or roll, use it to capture that surface; prints alternate between two frames on the bathroom dividing wall. Prints store immutable sequence references, survive source washing/repainting and restart, and do not duplicate stroke records in SQLite. Use a frame to download its 320 × 256 framed PNG. This is a small gallery image, not a full-resolution artwork export.
- Large saved histories restore in ordered slices with a 2 ms target and 48-work-step cap per frame, including sub-stroke spray/brush slices. Partial image uploads are capped at ten per second during restoration. Movement stays responsive during restoration; painting resumes once restoration finishes. Each accepted stroke remains durable before acknowledgement. Dirty roll textures upload only when relevant, and gallery textures update only when a print changes. Existing Fast/Mobile pixel budgets and idle rendering remain in effect.
- Extractor fan uses a newly verified CC0 bathroom-fan recording by yottasounds. Fan and machine audio fades with distance and through the doorway; listener-relative stereo positioning supports headphones. Slow decoding cannot restart a stopped fan. Mute/background/disposal clear effect voices. See AUDIO-CREDITS.md for source and editing credits.
- Room Properties now has Room, Guide, Display and Sound tabs, keyboard arrow navigation, square period chrome and a prominent mouse/headphones recommendation. R / Turn is available as a separate touch button. Narrow-screen title controls and touch status messages have additional clearance.

Evidence: 38 automated tests cover durable roll art/placement/orientation, access/range validation, paint-target identity, cylindrical seams, immutable prints across washing/restart, bounded replay, stereo directions and fan cancellation. A local 180-segment durable-save test measured 2.08 ms median, 3.74 ms p95 and 6.17 ms maximum acceptance. Browser walkthroughs checked roll painting, rotation, pickup/floor placement, camera printing and refresh, menu tabs, title rendering and a 390 × 844 layout without horizontal overflow. A resting Fast view reported zero drawn frames/aim checks per second. Ceiling inspection found zero overlapping coplanar upper faces. A separate in-memory browser fixture completed restoration of 1,000 dense 32-point spray strokes; movement and menu input remained usable, and rendering returned to zero drawn frames at rest. Extreme histories still take minutes to restore; cached artwork checkpoints remain a future improvement. These are local checks; physical-phone speed, a full listening audit and public deployment remain unverified.

Assessment: this round establishes smaller movable canvases and a persistent instant gallery while preserving the browser rendering budget. Next useful work is physical-phone playtesting, more precise painting controls and larger artwork export/checkpoints; unrestricted physics and public-room release remain separate milestones.



Quality/aesthetic checkpoint (version 0.8): the user authorized a major 90s emphasis: sage Internet Explorer / Windows 95 style window chrome, sharp corners and period system fonts, matching world labels, floral borders, venetian blinds, ribbed vanity doors and appliance controls. The utility fixture now has a ceiling suspension. The toilet faces perpendicular to the left wall beside its mounted paper roll; geometry, water/lever and collision/occlusion bounds move together. Shower water leaves the head in all presets, including static streams under reduced motion. Animated steam now covers shower and mirror, with tightly bounded Fast/Mobile counts. Real-time clock hands tick once per second. Recognizable paste packages include flattened bodies, seams, colored labels and caps; other tools gain original geometric details.

The washer and dryer replace the previous washer toggle. The owner’s current towel locks during a finite 20-second wash, stays clean/wet until the dryer is used, then dries for 20 seconds and becomes reusable. Server-authoritative timestamps, generations and per-towel erased-history watermarks preserve the reset across restart and prevent stale replay; other towel artwork remains untouched. Active-machine towels leave the rail during the cycle. Original bath-themed creative additions: soap-dish mint blending and a shared duck-silhouette stamp, inspired by SuchArt’s physical tools and mixing without reusing its assets.

Eight newly verified CC0 Freesound recordings supply soft bare feet on tile, sustained paste/brushing/spray sounds, rubber-duck squeak, flush and machine cues. Painting holds one fading sustained audio source rather than repeated per-frame one-shots. Both machine recordings play a finite 20-second portion, with synchronized seeking and distance attenuation. Existing 73-minute CC BY 4.0 music remains credited. Sources, licensing and modifications are listed in the app, public/audio-manifest.json and AUDIO-CREDITS.md. Twenty-nine automated tests pass, including 20-second boundaries, owner/range authorization, restart reset durability, other-towel isolation, real-time clock advancement, and continuous-audio cancellation after slow decoding. Browser checks confirm the connected preview, visible head-to-floor water, menu credits, new tool details and a 390 × 844 layout without horizontal overflow. This is a local playtest checkpoint; physical-phone measurements, full listening audit, additional paintable surfaces and public deployment remain open.


Connected rooms checkpoint (version 0.7): a decorated dividing wall and broad doorway separate the bathroom from a utility room containing washer, dryer, ironing board, supplies and basket. The bathroom gains a hollow vanity with two hinged doors, a jar/washcloth movable among six fixed storage spots, a movable climbable stool, adjustable towel rail, full-corner shower with gathering curtain and attached pipework/valve, parallel-facing toilet and mounted paper hanger. Cabinet, storage, stool, curtain, rail and washer state are authoritative, range/permission checked and durable. Furniture placement validates accessible floor, fixture clearance and nearby players; occupied stools cannot be carried. Support raises first-person and remote avatars by 0.92 units. Decorative animations respect reduced motion; fixed geometry and prop models are batched and washer motion is capped at ten updates per second in the utility room.

Audio checkpoint: fourteen complete Chris Zabriskie tracks from Cylinders and Thoughtless total 73 minutes 22 seconds, licensed CC BY 4.0 with attribution and modification notes in the app and AUDIO-CREDITS.md. The finite queue never repeats automatically. Kenney interaction samples and thegreatbelow outdoor birds/traffic are CC0; procedural water/fan/hum/duck definitions are original CC0. Runtime assets are local and music streams one track at a time. Only quiet environmental layers repeat. Music, ambience, effects and mute are adjustable; sound starts after a user gesture. Twenty-five automated checks pass for existing gameplay plus furniture durability, movement paths, stool support, revocation, unique finite playlist and streamed audio ranges. Browser inspection checks connected rooms, climbing, washer interaction and music/credit status without console errors. These checks do not establish physical-phone performance, an hour-long listening audit, unrestricted physics or public-release readiness.

Renovation checkpoint (version 0.6): the player viewpoint is 2.15 units high (previously 1.5), with taller tube bodies. The toilet is rotated toward the entry; the bathtub gains complete end rims, a full-height curtain and side panel, with an intentional opening beside the shower controls. A drying rack, slippers, bathing supplies and ceiling beams add detail while retaining static geometry batching. The larger hanging towel exchanges with four physical shelf slots: Studio towel (2.8 × 3.5), Bath sheet (3.2 × 4), Square towel (2.8 × 2.8), and Hand towel (1.6 × 2). Each keeps independent durable artwork and drying time; exchanging is owner-only, range-checked, shared with all viewers, and increments the command generation to reject stale painting. Existing artwork migrates to the Studio towel without deletion. The square canvas uses a matching square texture.

Touch devices default to a remembered Mobile preset (0.55× scale, 360k pixel cap, no shadows or particles). Touch controls have independent finger ownership, capture-loss cleanup, safe-area spacing and a landscape layout. Joining and towel exchanges have short transitions; held tools move while walking/painting and towels settle after hanging, respecting reduced motion. Off-screen towel texture composition/uploads wait until visible; archived strokes are omitted from active-towel snapshots. Twenty automated tests pass, including durable towel exchanges, permissions, stale commands and simultaneous touch cleanup. Browser verification exchanged a towel through the shelf, restored it after refresh, inspected the renovated geometry, and checked a 390 × 844 layout with a 214 × 464 drawing buffer without console errors. Physical phone, captured-mouse and sustained large-artwork performance tests remain open. This is a playable renovation checkpoint, not public-release readiness; painting on curtains, pigment mixing, recoverable disposal, public matching and richer stored-art previews remain future work.

Performance direction (version 0.5): the user explicitly prioritized substantially reducing browser rendering load and lag, including cheaper graphics and fewer pixels. Fast is now the remembered default: 0.7× scale with a 650k pixel cap, no shadows/particles, simpler diffuse materials, lower geometric detail, fixed vertex-color batches, cached narrow aiming tests, idle sleeping with immediate input wakeup, off-screen fog upload deferral and no dynamic texture mipmaps. Balanced and Detailed remain available with bounded pixels/effect rates. Paint resolution, humidity, permissions and durability remain intact. All eighteen automated tests pass. Browser samples showed 896 × 503 resolution at a 1280 × 720 viewport, 17 draw calls, zero idle redraw/aim checks, and approximately 15ms preview / 13ms server acceptance for a saved mark; steady CPU render submission was around 1.5ms. These are local samples, not controlled FPS, GPU, physical input latency or power comparisons. Browser walking, tool pickup/release and remembered presets were verified without console errors. See README.md for budgets, compromises and remaining device tests.

Development checkpoint (version 0.4): continued development adds shared temporary mirror fog tracing, humidity-gated drawing, 45-second refogging, dry-mirror clearing, bounded late-join replay, authoritative mirror range/permission checks, and a persistent exhaust-fan fixture that accelerates drying. The mirror stencil is separate from permanent paint and is deliberately not archived. Physical plaques identify fixtures/supplies; arrow taps support precise movement, separate touch-look release preserves painting, and unrelated metadata no longer rebuilds static shadows. All fifteen automated tests pass. Browser verification walked between fixtures, ran the shower, drew visible fog marks, observed expiration, then stopped the shower and enabled the fan without console errors. Assessment: this is a complete first condensation loop, suitable for human playtesting before adding more surfaces. The mirror backing remains stylized rather than reflective; actual phone/captured-mouse tests, additional painting surfaces, pigment mixing and recoverable resets remain unfinished. This does not establish public-release readiness.

Development direction (October 1, 2026): the user authorized a first-person toothpaste avatar, walking in a larger detailed bathroom, world-based painting tools and settings, varied lighting and steam, with a pause at a playable checkpoint. Version 0.3 adds collision/sliding, bounded synchronized avatar movement, camera/body presence, nearby raycast interactions, physical color tubes/nozzles, a 14 × 15 enclosed room, laundry/storage details, three lighting moods, hot-shower humidity, water/steam particles and visible mirror fog. Painting retains prediction and canonical persistence. Twelve automated tests pass; the local scene and drag-look were visually checked without console errors. Captured-mouse and physical phone end-to-end playtesting remain needed. One towel is still the paintable surface; mirror fog doodling and server-side action reach checks remain unfinished. See README.md for controls and assessment limits.

The Handshake mission is to design, build, test, and ship a reusable multiplayer browser game at a public URL. Players must be able to join with room codes, without logins or app installations, from phones or laptops. The process includes an approved plan and iterative testing and repairs.

The game concept is a compact shared 3D creative sandbox inspired by SuchArt: Creative Space. Its own identity is an oversized bathroom occupied by toothpaste-tube characters. Players decorate bathroom surfaces with colored toothpaste and bathroom-themed tools, visit each other's stations, and collaborate when the artwork owner grants permission.

Use the reference game for the feeling of tangible tools and creative freedom. Create original layouts, models, interface, sounds, and branding; do not depend on copying its assets.

The experience should be enjoyable alone and richer with other people. Painting alone also provides something useful to do when few strangers are online. Scoring, competitive rounds, commissions, and exhibitions are optional future directions, not current requirements.

## 3. Agreed requirements and proposed defaults

| Topic | Status | Baseline |
|---|---|---|
| World | Required | Small 3D bathroom with interactive bathroom fixtures and tools. |
| Characters | Required | Large toothpaste tubes; their labels/logos can be personal artwork. |
| Paint | Required | Colored toothpaste; distinguish painting from spray painting. |
| Surfaces | Required | Bathroom equivalents of canvases, including towels and shower curtains. |
| Interaction | Required | Color mixing, different surface sizes, light switches, cleaning, shared tools. |
| Collaboration | Required | Other players can visit and work on a player's pieces only with permission. |
| Joining | Required | Private room codes and random/public matchmaking. |
| Public access | Required | A bathroom set to public is joinable by strangers without its code. |
| Public wording | Required | Use “Join a bathroom” for public joining. |
| Condensation | Required | Mirror doodling requires sufficient condensation generated by running a hot shower. |
| Destructive reset | User concept | Dispose of artwork through a bin or toilet flush; exact behavior needs approval. |
| Capacity | Proposed | Four players per bathroom initially. |
| Style | Proposed | Bright cartoon bathroom, glossy tiles and chrome, colorful packaging. |
| Precision controls | Proposed | First-person exploration plus a close-up painting mode. |
| Communication | Proposed | Preset expressions initially; open chat/voice deferred. |
| Recovery | Proposed | Same-browser anonymous identity and owner-approved artwork checkpoints. |

The room should feel densely interactive, but visual population does not require every prop to have independent physics. Start with a restrained set of useful interactive objects.

## 4. Player flow

The start screen is game-native and leads directly into play. It should offer creating a bathroom, joining by code, and “Join a bathroom” for public discovery. Avoid a marketing page between the player and these actions.

After choosing a display name, the player receives an anonymous session identity. The game assigns or lets them select an available station. The player can explore, paint, mix, rinse, and view others' work. Visitors request editing access when needed; station owners can grant and revoke it.

Public joining should support a random eligible bathroom without a code. A browsable room list is a proposed additional interface, not an explicit requirement. Show meaningful joining errors: full room, unavailable room, expired code, connection loss, or access denied.

A public-room finder should reserve capacity atomically rather than allowing several simultaneous joins to overfill the room. It may prefer active rooms with available stations before creating new ones. Geography/latency and occupancy are useful initial filters; elaborate skill matching is unnecessary for this sandbox.

If no eligible public room exists, proposed behavior is to offer or create a public bathroom where the player can paint alone while waiting. Do not conceal real players behind undisclosed bots.

## 5. Room visibility and authority

Separate three concepts: website visibility, bathroom discoverability, and artwork editing permission. A public website does not mean every bathroom is public. A public bathroom does not mean every painting is editable.

Proposed room modes:

| Mode | Discovery | Joining |
|---|---|---|
| Code-only | Excluded from public matching | Requires the room code or equivalent invite link. |
| Public | Eligible for stranger matching | No room code required. |

The host controls visibility. Proposed default is code-only to avoid accidental stranger entry. Changing a room to code-only prevents new public discovery; whether existing strangers stay is an open UX decision. Suggested behavior is to keep current guests until the host removes them explicitly.

Room codes are entry credentials, not ownership credentials. Do not include private room details in public listings. Rate-limit guessing and joining attempts.

Define permissions separately for viewing, adding paint, cleaning, moving artwork, using station tools, and destructive reset. A convenient “Allow collaboration” control can grant a bundle of ordinary editing rights. Reset/discard authority should remain with the owner unless explicitly delegated.

Revocation takes effect on the server. In-progress strokes accepted before revocation remain; subsequent stroke segments are rejected. A client interface alone is insufficient enforcement.

Host authority and station ownership are separate. Establish rules for a host disconnecting, host migration, owner departure, rejoining, and abandoned stations before public release. Do not automatically make abandoned artwork freely editable.

## 6. Bathroom objects and tools

| Object | Creative use | Initial technical treatment |
|---|---|---|
| Hanging towel | Personal painting surface | Stable paint coordinates; fabric detail can be visual. |
| Shower curtain | Large collaborative mural | Flat painting surface initially; optional close-up mode. |
| Tile panel | Mosaic or continuous mural | Bounded paintable panel rather than every room tile. |
| Toothpaste tube | Thick squeeze-paint strokes | Surface texture effect; physical raised paste deferred. |
| Toothbrush | Spread, stipple, scrub | Distinct brush masks and wetness-sensitive behavior. |
| Mouthwash spray | Fine colored mist | Stable seeded spray pattern. |
| Sponge | Blend when appropriate; wipe wet paint | Explicit tool mode and clear feedback. |
| Soap dish | Mix colors | Bounded palette state and shared mixing commands. |
| Faucet/shower | Wet and rinse surfaces | Defined interaction zones, not fluid simulation. |
| Mouthwash bottle | Portable cleaning liquid | Local application; cleaning permissions still apply. |
| Mirror | Condensation doodling | Separate fog and doodle layers. |
| Trash bin/toilet | Discard/reset artwork | Server-approved transition plus local animation. |
| Light switch | Shared lighting changes | Low-cost scene lighting states. |
| Tube label | Player-designed wearable art | Flat label editor mapped onto avatar. |

Additional suggestions include rubber-duck stamps, bath-mat texture stamps, toilet-paper repeat prints, a hand dryer to set paint, and a gallery of decorated towels or soap bars. These are later options, not mandatory additions to the first version.

Mirror doodles are distinct from colored toothpaste applied to the mirror. Fog marks should not silently delete persistent colored artwork underneath.

## 7. Paint, wetness, and cleaning

The proposed interaction cycle is squeeze, spread, blend, dry, or wet, scrub, reset. Fresh paste may smear; applying water increases its removability; drying reduces blending. Make each state legible through visual feedback and tool response.

Begin with bounded numerical wetness and paint-state values. Do not attempt molecular pigment simulation, fluid flow, persistent puddles, or fully deformable fabric in the first prototype.

Color mixing needs a deliberately chosen paint-like model. Ordinary screen RGB averaging may fail familiar expectations. Test recognizable mixtures and evaluate a lightweight subtractive approximation; exact physical pigment accuracy is not promised.

Define a maximum canvas resolution and paintable-surface count. Two physical towel sizes need not imply unlimited texture resolution. Large surface counts can exhaust GPU memory even in a small room.

Tool feedback matters: different stroke shapes, sound, size, and coverage should distinguish squeeze paint, toothbrush marks, and spray. Prioritize control and predictability over visual spectacle.

## 8. Hot shower, humidity, and mirror condensation

Required causal chain: players run the shower on hot water; room temperature/humidity rise; sufficient condensation appears on the mirror; players can then doodle in that fog.

Proposed simplified model:

- Shower on/off and temperature setting are server-owned fixture states.
- Running a hot shower increases a bounded humidity/steam value and a simplified temperature value over time.
- Ventilation and an inactive shower gradually reduce humidity. An exhaust fan or window is a later interactive option.
- The mirror's fog amount approaches a target derived from humidity and the mirror's effective temperature.
- Doodling is enabled above a visible condensation threshold.
- Doodles clear fog locally; sustained steam may gradually fog those regions again.
- When the mirror dries, condensation doodles fade. This is intentionally temporary artwork unless a later feature makes prints or saves.

Real condensation depends on surface temperature relative to dew point; the simplified model should convey the right causal story without claiming physical accuracy. Parameters, thresholds, and timing are open playtesting decisions.

Synchronize fixture changes and environmental timestamps. Use server time to advance humidity rather than each player's frame rate. Define what happens when the room has no occupants, the server restarts, or a phone returns from the background.

Shared environmental changes can disrupt another person's drawing. Proposed controls include a station-specific mirror, clear warnings before large changes, and room-owner authority over globally disruptive fixtures. Exact division between communal and personal mirrors remains open.

## 9. Reset, disposal, and recovery

Throwing artwork away or flushing it should be a satisfying world interaction. Use removable artwork objects or a clear discard interaction; large curtains should be rinsed or replaced rather than implausibly shoved into plumbing unless the cartoon treatment intentionally supports it.

A reset is an authoritative operation with an artwork generation number. Commands based on a previous generation must not repaint a newly cleared surface. This handles delayed network messages arriving after a flush.

Before destructive reset, save a recoverable owner checkpoint subject to storage limits. Proposed bin behavior allows retrieval for a brief period. Proposed flush behavior uses a swirl animation and a fresh surface. Determine confirmation and recovery UX through testing.

Do not advertise per-player undo until overlapping collaborative edits can be handled correctly. Rewinding one contribution may alter later strokes, blending, and cleaning. Whole-artwork checkpoint restore is the initial recovery mechanism.

## 10. Proposed architecture

| Layer | Candidate | Responsibility |
|---|---|---|
| Language | TypeScript | Shared command definitions and validation-friendly types. |
| 3D client | Three.js | Scene, avatars, controls, raycasting, paint display. |
| Interface | React | Joining, palettes, permissions, connection states. |
| Room server | Node.js with Colyseus | Authoritative room state, validation, synchronized presence. |
| Transport | Secure WebSockets | Persistent live client/server communication. |
| Persistence | Durable database plus artwork/object storage as needed | Sessions, access grants, ordered edits, checkpoints. |
| Frontend hosting | Sites if suitable | Public URL and browser asset delivery. |

These are candidates, not a verified deployed stack. Choose versions after checking current documentation and the execution environment; preserve a lockfile and avoid unnecessary dependencies.

Colyseus supplies room synchronization/reconnection support. Artwork event ordering, deterministic rendering, durable storage, and permission enforcement require additional design.

Sites is available for publishing, but live room-server support has not been established. Its Cloudflare Worker environment cannot simply be assumed to run a conventional long-lived Node.js game server. A possible alternative is Cloudflare Durable Objects for room coordination, only if the deployment path exposes the necessary bindings. Another path is a separate hosted Node.js server with the frontend on Sites.

Prove secure WebSocket upgrades, idle/connection behavior, restart recovery, storage, public access, and cross-origin controls before committing to a host. Do not treat polling a shared database or browser local storage as a substitute for a room server.

## 11. Shared painting and interaction protocol

Clients submit bounded commands containing object/surface identity, command identity, artwork generation, relevant stroke properties, and coordinates. The server associates them with the authenticated anonymous session; do not trust player or owner IDs supplied in the payload.

The server checks permissions, range/room membership, plausible tool use, coordinate bounds, message size, and rate limits. It assigns accepted operations a canonical sequence. Duplicate command IDs must not apply twice.

The local player receives immediate predicted feedback. Server acceptance establishes the canonical result. Rejected or reordered work must be reconciled without leaving permanent local-only paint.

Use compact stroke batches rather than constantly transmitting complete textures. Spray randomness must use shared seeds or explicit accepted marks. Browser drawing implementations can differ, so ordered commands alone do not guarantee identical pixels. Evaluate a shared rasterization method and authoritative checkpoints; define whether visual convergence or exact pixel equality is required.

Late join/reconnect loads a checkpoint with a sequence watermark, then subsequent accepted operations. Capture the watermark and history consistently so no edits are omitted or duplicated during loading. Checkpoint compaction must not discard history that an in-flight client still needs.

Tool pickup uses exclusive server ownership. Simultaneous grabs resolve once. Disconnects and timeouts release possession safely. Object movement is bounded and validated; initial placement can use kinematic handling rather than expensive synchronized rigid-body physics.

## 12. Identity, persistence, and lifecycle

No player account is required. Use an unguessable anonymous recovery credential, not the display name or room code, to restore a seat and its permissions. Protect credentials in transit and exclude them from logs and room listings.

Proposed initial recovery is on the same browser/device. Clearing browser data or changing devices may lose ownership unless an explicit recovery/export mechanism is added. This limitation must be communicated before players invest heavily in artwork.

Persist acknowledged artwork according to a defined durability contract. To promise recovery of all accepted edits after a crash, durable acceptance must precede acknowledgement, or a proven equivalent mechanism must exist. Otherwise document the possible loss window; do not claim lossless recovery.

Choose artwork retention, room expiration, checkpoint retention, and storage quotas before public release. No permanent cloud archive is promised yet. A downloadable artwork export is useful but remains proposed.

## 13. Public access, bot defense, and abuse

No-login access trades convenience for weaker identity and repeat-offender control. Strong protection is layered mitigation, not a guarantee of eliminating bots or cheating.

Required engineering controls include server-side authorization, validated messages, bounded queues, rate limits, connection/room caps, and protection against arbitrary object access. Proposed bot challenges should run at room creation or suspicious joining activity, with server verification and an accessible retry path.

Use separate limits for joining, movement, painting, and storage. Avoid punishing normal fast drawing. Test malformed payloads, excessive stroke batches, forged permissions, stale artwork generations, and repeated session reconnection.

Public drawings themselves are user-generated content, even without chat. Provide a practical hide/report mechanism and owner removal controls before unrestricted discovery. Reports should preserve a bounded relevant snapshot and identifiers without exposing recovery secrets. Operator review and content policy are open operational decisions.

Preset communication reduces moderation load initially. Open chat and voice would require additional moderation and should not appear as incidental additions.

## 14. Performance and accessibility

Test actual phones early. Targets proposed for measurement: comfortable desktop rendering near 60 frames per second and a usable mobile baseline near 30, with lower-quality settings. These are goals, not established performance claims.

Limit paint resolution, dynamic lights/shadows, transparency layers, spray density, geometry, and per-frame texture uploads. Update dirty surfaces only. Measure GPU memory, initial asset size, bandwidth per active painter, and room-server CPU under sustained painting.

Support keyboard/mouse exploration and touch controls. Close-up painting separates precision strokes from camera movement. Avoid accidental marks during navigation. Preserve usable controls at small viewports and enlarged interface text.

Display connection loss clearly; do not let players mistake unaccepted offline strokes for saved work. Handle suspended mobile tabs, graphics context loss, pointer-lock exit, and reconnect without duplicating avatars.

Include reduced-motion options for steam/flush effects where appropriate. Sound should support interaction, with volume/mute controls, and never be essential to understanding a permission or failure state.

## 15. Implementation stages and evidence

These are milestone definitions, not a markdown task list. Track actionable work in Beads after project association is verified.

| Stage | Scope | Evidence required |
|---|---|---|
| Foundation | Correct repository/tracker; hosting and durable-storage proof | Two independent clients connect to the deployable server; accepted state survives restart. |
| Shared surface | One room, one towel, squeeze tool, permission, reconnect | Concurrent edits converge; late join and refresh restore state; unauthorized commands fail. |
| Bathroom identity | Toothpaste avatars/labels, station layout, brush/spray, tool possession | Tools feel distinct; simultaneous pickup is safe; mobile controls usable. |
| Material interactions | Mixing, wetting, wiping, reset, sizes, light controls | Cleaning honors permissions; reset rejects stale edits; recovery works. |
| Condensation | Hot shower, temperature/humidity, fog doodles | All players observe consistent fog progression and drying; hot-water causality is clear. |
| Public release | Code-free public discovery, bot defenses, moderation, operating limits | Full rooms cannot overfill; private rooms remain undiscoverable; production joins require no account. |

The finished challenge requires the complete agreed experience, not just the first milestone. Small milestones are a way to expose failure early.

## 16. Verification strategy

Use meaningful tests for permission validation, action ordering, duplicate commands, reset generations, and durable replay. Use browser integration tests with independent sessions, not merely two views backed by shared local state.

Manual testing must include laptop and phone, overlapping painting/cleaning, a late join while editing continues, disconnect during a stroke, permission revocation during a stroke, host departure, refresh, server restart, and public/code-only transitions.

Test poor network conditions and backgrounded phones. Measure bandwidth and texture growth during a prolonged session, including checkpoints. Confirm the final public URL from an unauthenticated browser, because a development preview is not evidence of public access.

Distinguish tests actually run from tests planned. Successful builds do not prove synchronized multiplayer, durability, phone usability, or bot resistance.

## 17. Open decisions and dependencies

Before implementation: confirm the correct project directory, Git remote, and Beads association; obtain approval of the starting implementation plan; prove the hosting path.

Before public launch: finalize player capacity, retention/expiration policy, owner recovery, host succession, permission bundles, moderation operations, operating budget, and measured device/browser support.

Gameplay tuning remains open: hot-shower warmup time, fog threshold, drying rate, paint permanence, cleaning strength, mixer behavior, tool supply, communal mirror disruption, and whether disposable artwork resets need confirmation.

No new hosting account, paid subscription, permanent storage promise, or production uptime commitment has been agreed.

## 18. Agent handoff and workflow

At the next implementation session, read this reference, applicable AGENTS.md, and `bd prime`; inspect the actual repository and issue association before creating work. Beads has been accessible with the required filesystem permission, but the inspected queue contained an unrelated latch-cooldown issue. That is not proof of a correct game tracker.

Use Beads for all actionable tracking and `bd remember` for persistent workflow knowledge. Do not create MEMORY.md or duplicate issue status in this reference. Follow the project's required quality gates and Git/Beads remote completion protocol once the actual project and remotes are established. Do not claim a push succeeded without evidence.

Keep user communication concise. Explain consequential tradeoffs in plain language. The user has asked the agent to own technical scrutiny rather than requiring them to choose unfamiliar frameworks. Do not repeatedly ask for routine implementation permissions already authorized; do pause at the requested initial plan approval and any genuinely new expenditure or scope commitment.

## 19. Technical references

Documentation consulted during planning; recheck relevant pages and version-specific behavior before implementation:

- Three.js CanvasTexture: https://threejs.org/docs/pages/CanvasTexture.html
- Three.js WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- Colyseus state synchronization: https://docs.colyseus.io/state
- Colyseus reconnection: https://docs.colyseus.io/room/reconnection
- Colyseus matchmaking: https://docs.colyseus.io/matchmaker
- Cloudflare Workers WebSockets: https://developers.cloudflare.com/workers/runtime-apis/websockets/
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/
- Cloudflare Turnstile server validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

These references support candidate technologies, not a claim that a hosting integration or game feature has already been tested.

## Pattern craft checkpoint (version 0.10)

Four original rubber inserts (duck, bubbles, flower and tile) mount above the utility-room camera. Pick up the shared stamp on the shower shelf, use an insert, and press R / Turn to rotate its impression in quarter turns. Existing paste colors, mixing and nozzle sizes combine with the inserts on towels and spare rolls. Pattern and rotation travel with durable strokes, including gallery snapshots and wrapped paper replay; older duck strokes retain their appearance. Tool ownership still applies.

A SAVE ART tray beside the camera exports the last painted permanent surface as an unframed native-resolution PNG: towels use 512-pixel width with their current aspect ratio, and paper wraps use 384 × 128. Export waits for accepted marks and completed replay. Reload defaults the selection to the current towel. This is a local download, not a cloud archive or a higher-resolution reconstruction.

Visible tool details now share their parent's pickup action, making handles easier to select. Hidden ancestor objects suppress artwork texture uploads. Four static 96 × 96 insert textures add no periodic animation; existing mobile/fast rendering budgets remain. New artwork is original code-drawn geometry, with no additional third-party assets or audio.

Validation: 40 automated checks and syntax checks pass, including invalid-pattern/rotation rejection, shared stroke delivery, legacy defaults, restart persistence and interrupted replay cleanup. Browser walkthrough confirmed visible insert faces, stamp pickup and the export success message; automated download-file inspection was unavailable. Physical phones and dense-history checkpoints remain unverified/unimplemented.

## Tape and laundry checkpoint (version 0.11)

The washer and dryer now have separate door-loading and start controls. Each machine runs for 20 seconds. Collect the washed bundle, carry it to the dryer door, load it and start the second cycle; it returns to the rail clean. Every stage is shared and durable. A start button cannot bypass loading, and towels cannot be exchanged mid-cycle.

The three utility cabinet drawers slide open: VHS cassette, three independently selectable pastel pigments, and creative postcards. Tape atmosphere has Off, Subtle and animated VHS modes in Display settings; the physical cassette toggles playback. A 160 × 90 grain canvas updates at 4 Hz without another 3D rendering pass. Tracking uses faint light bands, never opaque black bars. Static recordings fade in/out intermittently and stop with tape playback, mute or backgrounding.

The window now shows a small animated sky: daylight, sunset and moonlight follow the shared lighting dial; clouds, occasional planes, a single sagging powerline and distant rooftops fill the view. Moon phase follows the real date using an approximate synodic calculation. No location is requested; local moonrise, orientation and altitude are not simulated. The sky texture refreshes every 2 seconds (4 on Mobile) while visible. The mounted lighting dial has mode markings.

Shower water uses independently falling short streaks with acceleration, not full-height static lines. One draw call handles the streaks. The hot-water valve rotates 90 degrees. Small towels have forward shelf targets, the adjustable rail reaches 2.15 units, and the lower bound follows the selected towel height. Swapping to a larger towel automatically lifts the rail sufficiently to keep it above the floor.

Visual audit found and removed 40 upper-region coplanar triangle conflicts in overlapping trim, corner tiles, window crossbars and towel shelving. The camera near plane moved to 0.2; the local third-person body is hidden; gathered curtain panels have clearance. Movement bursts now receive bounded authoritative position correction instead of the Movement too fast error, preserving held movement and view direction.

Audio: 20 full Chris Zabriskie tracks, approximately 106 minutes 24 seconds, without automatic playlist repeat. All existing and new primary audio source pages were rechecked on October 2, 2026 (Pacific time): CC0 effects/ambience and CC BY 4.0 music. Credits and saved license evidence accompany the build.

Validation: 44 automated checks plus syntax checks pass, including the physical laundry sequence, exact 20-second boundaries, restart durability, towel floor limits, bounded falling water, moon-date changes and existing painting/replay tests. Browser walkthrough verified the tape drawer opens, exposes its cassette and toggles the visual filter. Geometry audit reports zero upper-region coplanar conflicts. Browser performance and physical-phone results should be assessed separately; this is not a guarantee of zero flicker on every GPU.

Final browser validation: the washer door loads the towel, its start control begins the countdown, the finished towel can be collected and loaded through the dryer door, and its separate start control runs the second cycle. Room status returned to Laundry ready afterward. The cassette drawer opens and its contents toggle tape playback. Fast profile in the inspected laundry view used 896 × 503 rendering, 49 draw calls and approximately 1.7–1.9 ms CPU render submission; these figures are not GPU timing or a frame-rate guarantee. The 390 × 844 viewport had 390-pixel content width with no horizontal overflow; physical touch-device behavior remains unverified. `data/interaction-inspection.json` confirms clear ray targets for hand/square towels, three drawers and both machine load/start controls.


## Laundry/display quality checkpoint (version 0.13)

See [CHECKPOINT-0.13.md](CHECKPOINT-0.13.md) for UI layering, startup backdrop, visible laundry fabric, six/eight-second drum loops, nighttime audio, the new title graphic and 51-test validation. [HOSTING-RESEARCH.md](HOSTING-RESEARCH.md) compares always-online hosting and records the one-process persistent-storage deployment plan. The supply jar and folded washcloth remain carry/place props only. Fan CC0 source and existing credits are retained; no new audio was downloaded.
