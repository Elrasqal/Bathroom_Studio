# Bathroom Studio

## Pattern craft checkpoint (version 0.10)

Four original rubber inserts (duck, bubbles, flower and tile) mount above the utility-room camera. Pick up the shared stamp on the shower shelf, use an insert, and press R / Turn to rotate its impression in quarter turns. Existing paste colors, mixing and nozzle sizes combine with the inserts on towels and spare rolls. Pattern and rotation travel with durable strokes, including gallery snapshots and wrapped paper replay; older duck strokes retain their appearance. Tool ownership still applies.

A SAVE ART tray beside the camera exports the last painted permanent surface as an unframed native-resolution PNG: towels use 512-pixel width with their current aspect ratio, and paper wraps use 384 × 128. Export waits for accepted marks and completed replay. Reload defaults the selection to the current towel. This is a local download, not a cloud archive or a higher-resolution reconstruction.

Visible tool details now share their parent's pickup action, making handles easier to select. Hidden ancestor objects suppress artwork texture uploads. Four static 96 × 96 insert textures add no periodic animation; existing mobile/fast rendering budgets remain. New artwork is original code-drawn geometry, with no additional third-party assets or audio.

Validation: 40 automated checks and syntax checks pass, including invalid-pattern/rotation rejection, shared stroke delivery, legacy defaults, restart persistence and interrupted replay cleanup. Browser walkthrough confirmed visible insert faces, stamp pickup and the export success message; automated download-file inspection was unavailable. Physical phones and dense-history checkpoints remain unverified/unimplemented.

## Creative objects and quality checkpoint (version 0.9)

- Three spare toilet-paper rolls live on the vanity shelves. Open a door, paint the cylindrical wrapping surface, use E to carry, then place on an empty storage marker, a vanity display stand or nearby clear floor. Aim at the wrapping surface and press R / Turn for a quarter turn. Individual roll art, placement and orientation are shared and durable; towel washing leaves them untouched. End caps can be picked up, and the cardboard interiors remain visible.
- The mounted paper holder moves farther along the wall to clear the toilet. Overlapping ceiling strips and fan-blade geometry are removed; walls meet without overlapping upper faces. A consistent pale-green title plate removes the dark strip behind the game name. Display stands and cabinet storage avoid object overlaps, and the waste bin occludes painting targets.
- A geometric 90s instant camera sits on the utility cabinet. After painting a towel or roll, use it to capture that surface; prints alternate between two frames on the bathroom dividing wall. Prints store immutable sequence references, survive source washing/repainting and restart, and do not duplicate stroke records in SQLite. Use a frame to download its 320 × 256 framed PNG. This is a small gallery image, not a full-resolution artwork export.
- Large saved histories restore in ordered slices with a 2 ms target and 48-work-step cap per frame, including sub-stroke spray/brush slices. Partial image uploads are capped at ten per second during restoration. Movement stays responsive during restoration; painting resumes once restoration finishes. Each accepted stroke remains durable before acknowledgement. Dirty roll textures upload only when relevant, and gallery textures update only when a print changes. Existing Fast/Mobile pixel budgets and idle rendering remain in effect.
- Extractor fan uses a newly verified CC0 bathroom-fan recording by yottasounds. Fan and machine audio fades with distance and through the doorway; listener-relative stereo positioning supports headphones. Slow decoding cannot restart a stopped fan. Mute/background/disposal clear effect voices. See AUDIO-CREDITS.md for source and editing credits.
- Room Properties now has Room, Guide, Display and Sound tabs, keyboard arrow navigation, square period chrome and a prominent mouse/headphones recommendation. R / Turn is available as a separate touch button. Narrow-screen title controls and touch status messages have additional clearance.

Evidence: 38 automated tests cover durable roll art/placement/orientation, access/range validation, paint-target identity, cylindrical seams, immutable prints across washing/restart, bounded replay, stereo directions and fan cancellation. A local 180-segment durable-save test measured 2.08 ms median, 3.74 ms p95 and 6.17 ms maximum acceptance. Browser walkthroughs checked roll painting, rotation, pickup/floor placement, camera printing and refresh, menu tabs, title rendering and a 390 × 844 layout without horizontal overflow. A resting Fast view reported zero drawn frames/aim checks per second. Ceiling inspection found zero overlapping coplanar upper faces. A separate in-memory browser fixture completed restoration of 1,000 dense 32-point spray strokes; movement and menu input remained usable, and rendering returned to zero drawn frames at rest. Extreme histories still take minutes to restore; cached artwork checkpoints remain a future improvement. These are local checks; physical-phone speed, a full listening audit and public deployment remain unverified.

Assessment: this round establishes smaller movable canvases and a persistent instant gallery while preserving the browser rendering budget. Next useful work is physical-phone playtesting, more precise painting controls and larger artwork export/checkpoints; unrestricted physics and public-room release remain separate milestones.


## Studio Explorer quality checkpoint (version 0.8)

- Sage Internet Explorer / Windows 95 style chrome, square corners, Tahoma/MS Sans Serif font stack, and matching world labels. Both rooms gain period wallpaper borders, ribbed blinds, cabinet faces and appliance control strips. The laundry light now hangs from a ceiling mount.
- Toilet relocated against the left wall, facing perpendicular into the bathroom beside the paper holder, with matching collision/interaction bounds. Water streams leave the actual showerhead, including Fast/Mobile and reduced-motion views. Moving steam is distributed between shower and mirror.
- Six colored toothpaste packages now have flattened bodies, colored labels, crimped seams and caps. More detailed toothbrush, spray bottle, porous sponge and eyed rubber duck. Blend your loaded paste with the soap-dish color (starts mint; retains the previously loaded color); pick up the duck stamp beside the sponge to paint duck silhouettes.
- Owner uses the washer to clean the hanging towel: 20 seconds washing, then a wet stage awaiting the dryer, then 20 seconds drying. Painting/exchange wait until the cycle finishes. Other stored towels keep their artwork. Completion and erased history survive restart; old strokes remain archived in SQLite but are omitted from active replay.
- Wall clock hands follow real server-adjusted time, updating once per second. Machine motion remains capped at 10 Hz in view; Mobile/Fast keep their existing pixel caps and no shadows, with only 8/12 steam particles and 6/8 water streaks. Reduced motion keeps water visible as static streams.
- Eight new CC0 recordings, softened tile footsteps, sustained painting audio, duck/flush cues and finite machine recordings. See AUDIO-CREDITS.md and the source links in Room Properties. Existing CC BY 4.0 music retains attribution.

Validation: 29 automated checks pass, including sustained audio/late decode cancellation. Wash/dry boundary, owner/range checks, stale edits, reconnect/restart durability and other-towel isolation are covered by automated tests. Browser preview checked visible shower water, new menu/credits and tool details. Final browser checks: connected reload without console errors, visible water with an open curtain on Fast/reduced motion, primary audio credits, recognizable paste packages, the relocated toilet and door-mounted trim. A 390 × 844 layout has no horizontal overflow; Room Properties stays within x=12–378. The shower view sampled 33 draw calls / 15,532 triangles and 1.1 ms CPU render submission before the final small-tool batching pass; these are local samples, not GPU/FPS benchmarks. Physical-phone performance and a complete listening audit remain open.



## Connected rooms renovation (version 0.7)

The bathroom and utility room now have a dividing wall, a wide doorway, two-sided trim, signs, hooks, a clock and a laundry pegboard. The washer, new dryer, ironing board and basket occupy the utility room. The bathroom uses stronger sage, moss and pale green finishes, with a full-corner shower tray, privacy panel, gathering curtain, supported pipework and an attached valve. The toilet faces parallel to the vanity and the paper roll has a wall bracket and axle.

Use **E / Use** on either vanity door to swing it open. Inside is a hollow cabinet with shelves and plumbing. Carry the jar or washcloth to a glowing storage spot, then use it to place the item; **Q** returns it to its stored location. Storage is deliberately constrained to six clear positions rather than unrestricted physics. Cabinet movement asks players to step out of the door's path.

Use the stool's side to carry it. Aim down at nearby clear floor and use E to place it. Use its top while close to climb; the camera smoothly rises by 0.92 units. Walk off to step down. Occupied stools cannot be picked up, and placements cannot cross walls, overlap fixtures or cover players. The owner can raise/lower the towel rail using its two wall buttons (4.35–5.7 units). Cabinets, stored items, stool position, curtain, washer and rail height synchronize and survive server restart. Carried possessions release on disconnect/revocation.

Animations include hinged doors, gathering shower curtain/rings, sliding rail/towel, carried and placed objects, viewpoint ascent/descent, washer drum, paper pull, duck wobble and a flush lever/water dip. Reduced-motion preferences suppress decorative movement. The washer updates at most ten times a second and only from the utility room. Fixed geometry and the individual animated prop models remain batched; idle rendering and the existing pixel budgets remain in effect.

Sound starts on an interaction after joining. The vanity radio pauses/resumes music; after all tracks finish, using it explicitly restarts the playlist. **20 complete ambient tracks total 106 minutes 24 seconds without automatic repeat**, served locally one at a time. Quiet outdoor birds/traffic, procedural water/fan/electrical hum, footsteps and interaction effects accompany actions. Music, ambience, effects and mute controls are under Room & settings. Music is Chris Zabriskie's CC BY 4.0; Kenney samples and outdoor ambience are CC0. See [AUDIO-CREDITS.md](AUDIO-CREDITS.md) for attribution, source links and modifications. Outdoor ambience and procedural environmental layers repeat; the music does not. Audio assets add roughly 77 MB of music to the project, with lazy playback and streamed byte-range responses.

Verification at this checkpoint: 25 automated tests pass, including new movement/path obstacles, stool support/placement, durable furnishing state, permission revocation and audio ranges/finite playlist. Browser walkthroughs checked the connected rooms, stool ascent, washer control, music status and credits without console errors. Physical-phone testing, listening through the entire playlist, and unrestricted movable-object physics remain unverified or future work. This remains a local prototype.

A growing implementation of `bathroom-studio-reference.md`: a furnished original 3D bathroom, first-person toothpaste avatars, four stored painting towels with one hanging at a time, private room codes, four reserved anonymous seats, collaboration grants, reconnect, and durable ordered strokes.

## Renovation checkpoint (version 0.6)

The player viewpoint rises from 1.5 to 2.15 world units. The complete toilet turns toward the entrance. The shower gains bathtub end rims, a full-height curtain and side panel; the right-hand opening exposes the controls. A drying rack, slippers, bathing bottles and ceiling beams fill out the room using the existing static batching.

Walk to the **TOWEL LIBRARY** near the middle-right of the bathroom, aim at a folded towel and use **E / Use**. The current artwork is stored automatically and the selected artwork is hung. The empty slot identifies the currently hanging towel. Four durable canvases have stable identities: Studio towel (2.8 × 3.5), Bath sheet (3.2 × 4), Square towel (2.8 × 2.8), and Hand towel (1.6 × 2). The original artwork is preserved on the enlarged Studio towel. Square towels also use square painting textures. Dampness follows its towel, rather than transferring to the next one.

Only the owner may exchange artworks, within reach of the shelf. All connected artists receive the exchange. A new command generation rejects strokes left over from the previous towel, while accepted artwork remains stored. Snapshots include the active towel's strokes; the server keeps the complete durable history. Twenty tests cover restart recovery, separate towel artwork, permissions, stale commands, movement, paint, fog, performance budgets and independent touch-finger cleanup.

Touch devices start with **Mobile**: 0.55× scale, at most 360,000 pixels, no shadows; a few steam particles/water streaks. Preferences remain remembered. Portrait/landscape controls respect device safe areas; separate touch fingers own walking, looking and painting. A 390 × 844 browser layout rendered at 214 × 464 in the Mobile preset without console errors. This validates layout and pixel budgeting, not physical phone speed or gestures. Painting command IDs also work without the secure-context-only UUID API, useful for local network testing. The server still binds to localhost by default; a phone needs a reachable server before it can join.

Short joining/exchange transitions, a hanging-towel settling animation and held-tool movement explain actions while respecting reduced-motion preferences. Animation stops at rest. Off-screen towel composition/texture uploads wait until visible. The browser shelf exchange and refresh recovery were checked. Physical phone and captured-mouse playtesting, sustained large histories, paintable curtains, pigment mixing and recoverable disposal remain for later checkpoints.

## Run

Requires Node 24.14 or newer.

```sh
npm ci
npm start
```

Open http://localhost:3000. Create a bathroom, then join its code in a different browser or private window. Each browser keeps a secret ownership credential. The same browser can refresh to return; another tab using that credential replaces its previous connection. You now occupy a toothpaste avatar in first person. The towel owner grants or revokes visitor access through **Room & settings**.

Painting appears immediately as a local preview. The server orders, validates, and durably saves each segment before acknowledging it. Rejected previews disappear; disconnect, revoked permission, or a fresh snapshot clears unsaved work without removing accepted artwork. The connection badge distinguishes marks still saving from saved paint. Refresh restores the current room from session storage. Losing browser storage loses ownership; disconnected seats remain reserved in this milestone.

Walk to the vanity for the toothbrush, colored toothpaste tubes and three nozzle sizes. The sponge is on the bath stool; mouthwash spray is on the cabinet in the expanded storage area. Aim and press **E** to use an object within reach. Shared tools have exclusive server-enforced possession and return to their original locations after disconnect or permission revocation. A pending pickup is visibly marked; painting with it waits for confirmed possession. Use the faucet to dampen the towel before sponge cleaning. Dampness decreases over sixty seconds according to server time. This is a simple cleaning rule, not fluid simulation or pigment blending.

**WASD / arrow keys** walk with collision and sliding around furniture. **Enter first-person** captures the mouse; **Escape** releases it. If capture is unavailable, drag the view to look. Hold the left mouse button while captured, or **Space**, to paint the towel under the crosshair. **Q** returns the shared tool to its original place. On touch devices use the movement pad, drag elsewhere to look, and use the Paint / Use buttons. Touch controls are implemented but physical phone testing remains outstanding.

The enclosed bathroom is 14 × 15 world units, with ceiling, trim, tiled walls, folded towels, a laundry machine, storage shelves, radiator and changing area. Your own tube body is visible when looking down; a nozzle or held tool is visible ahead. Other players' toothpaste avatars move with interpolated network presence. The host can use the back-wall switch for room lamps, the right-wall control for daylight / sunset / moonlight, and the orange bath control to run a hot shower. Physical plaques identify the shower, extractor, mirror and painting supplies. Arrow taps now make precise small steps between animation frames.

## Condensation loop (version 0.4)

Run the **HOT SHOWER** valve at the bath. Timestamp-based humidity rises, producing soft steam, streaks, room haze and mirror fog. After roughly five seconds with the fan off, the mirror becomes drawable. Walk to the vanity, aim up at the mirror and hold click / Space to trace clear paths through condensation. This uses the same immediate local prediction as painting, with shared server-accepted marks. Collaboration permissions apply; mirror coordinates and actual player-to-mark distance are checked by the server. Late joiners see the remaining marks.

Mirror marks gradually refog over **45 seconds** and disappear when humidity drops below 20%. They are temporary and are not written to the artwork database; a server restart removes them. The connection badge distinguishes these from saved towel paint. A separate stencil leaves permanent toothpaste artwork untouched. The mirror has a stylized backing, not a live reflection of the room.

Use the **EXTRACTOR** switch on the back wall to run the fan. It speeds drying and reduces humidity even with the shower running. Shower and fan settings survive restart, while environmental progress is computed from timestamps rather than frame count. A status line in Room & settings shows shower, humidity and fan state. Steam and rotor motion are suppressed for reduced-motion preferences. Fast now includes a small bounded particle budget. The touch Paint button keeps painting when the separate look finger is lifted.

## Responsiveness

### Performance pass (version 0.5)

**Fast is now the default**, with remembered display preferences under Room & settings → Performance & display. Only the 3D image is scaled down; the interface and original 512 × 640 artwork stay sharp.

| Preset | Maximum scale relative to CSS pixels | Pixel budget | Shadows | Steam / water streaks |
|---|---:|---:|---|---|
| Mobile | 0.55× | 360,000 | Off | 8 steam / 6 streaks at 8 Hz |
| Fast | 0.7× | 650,000 | Off | 12 steam / 8 streaks at 10 Hz |
| Balanced | 1× | 1,200,000 | Off | 24 steam / 12 streaks, up to 20 updates/s |
| Detailed | 1.5× | 2,200,000 | Cached 512px shadow map | 64 steam / 36 streaks, up to 30 updates/s |

Scale is additionally bounded by device pixel ratio and pixel budget. At the tested 1280 × 720 viewport, Fast produced an **896 × 503** drawing buffer: approximately **51% fewer pixels** than a 1× full-resolution image and **88% fewer** than the previous 2× high-DPI setting. These are pixel-count reductions, not measured frame-rate or energy savings.

Multisample antialiasing is disabled; simpler diffuse materials replace physically based shaders; rounded props and towel folds use fewer triangles. Most opaque fixed props and colored tile instances are baked into one vertex-colored mesh. This greatly reduces draw calls but can submit some off-screen geometry; splitting batches into zones is a future option if the world grows. Dynamic tools, lights and painting surfaces remain separate. Fast also omits one local light.

Aiming checks now share one cached result, refreshed only when camera/aspect or fixture placement changes. They test actual interactibles and painting surfaces against simple blocking volumes rather than repeatedly traversing decorative geometry. Idle frames sleep between 100ms polls, with input/network events waking the next animation frame immediately. Held movement/painting and remote avatar interpolation keep animation-frame cadence. Hidden tabs and lost graphics contexts suspend the loop. Particle updates are throttled and shower effects are omitted at distance. Fog fades at 5 / 8 / 10 updates per second by preset and its texture uploads are deferred while off-screen. Dynamic paint/fog textures skip mipmap regeneration.

The tested Fast view used **17 draw calls** and about **11,316 triangles**. After movement/painting, the local panel reported approximately **1.5ms CPU render submission**, **15ms preview submission**, and **13ms server acceptance** for a sample mark. Idle observations showed **0 redraws/s and 0 aiming checks/s**. These are local samples, not controlled before/after FPS measurements, GPU timings, physical display latency, phone benchmarks or power measurements. Initial shader compilation and preset changes can still take longer; the render-cost counter waits for warmup.

The first-person aim feeds a local preview on the next available animation frame, independently of server acceptance. Small stroke batches are sent about every 32 ms while drawing, rather than waiting for release or a long stroke. Predictions and send buffers are bounded; excessively slow connections pause painting instead of accumulating an unbounded backlog. Brush and spray raster work also has a fixed per-segment budget, with reproducible spray seeds. Movement updates are sent at most about 12 times per second; local movement does not wait for acknowledgement.

Saved ink is cached separately from predictions, and the paint texture is uploaded only after changes. Fixed geometry is combined by vertex color or compatible material. Shadows, when enabled, are cached; unchanged scenes skip GPU redraws. Avatar objects are retained across ordinary metadata updates. Presence, permission, tool, and fixture updates do not resend artwork history. Ordinary metadata changes preserve cached shadows unless lighting or tool placement changes. The fixed 512 × 360 fog stencil updates immediately for input and at most ten times per second for fading; accepted temporary history is capped at 512 segments of 32 points each.

Previous version 0.2 measurements on this Windows development machine with 180 three-point stroke segments and SQLite FULL durability on a local temporary disk: server acceptance median **2.26 ms**, 95th percentile **7.94 ms**, maximum **18.88 ms**. Its browser test with **1,500 ms** artificially added to server responses showed visible unsaved paint and about **5–10 ms** local preview submission versus about **1,523–1,549 ms** server acceptance. That earlier scene used **37 draw calls** in the measured view. These numbers have not been re-established for the expanded first-person scene and are not production or phone guarantees. Preview submission measures CPU time through submitting the render; it does not measure display scanout or hardware input latency. Frame cadence reports animation-loop timing, and idle scenes deliberately do not redraw.

```sh
node scripts/benchmark.js
node scripts/latency-preview.js
```

The optional latency proxy listens on localhost:3001 and requires the real game on port 3000. It adds 1.5 seconds to ordered server responses and is for local testing only; stop it when finished.

## Verification

```sh
npm test
npm run check
```

Eighteen tests cover pixel-budget limits, static batching/transforms/UVs/instance colors, immediate wake from idle/hidden suspension, first-person input/focus clearing and simultaneous touch actions, collision/no tunneling, humidity/fan continuity, shared movement, movement validation, fixture permissions/restart persistence, mirror access/range/coordinates, late-join replay, duplicates, revocation, drying/refogging, temporary stencil isolation, and durable painting. Version 0.5 browser checks confirmed preset switching, remembered Fast on refresh, immediate movement/painting after idle, a visible saved towel mark, toothbrush pickup/release with aiming-cache invalidation, zero idle redraw/aim checks, and no console errors. Version 0.4 browser checks exercised the shower/mirror/fan loop. Captured-mouse control and physical phone play still need human playtesting. Prior versions verified brush/spray, sponge cleaning, guest permissions and delayed responses.

## Server and storage

The prototype uses Three.js and a small Node/WebSocket room server instead of adopting all proposed frameworks immediately. SQLite is built into the required Node version. Room metadata and append-only stroke rows are separate; each stroke's durable write precedes acceptance. Artwork is bounded to 12,000 stroke segments per towel. Existing artwork migrates transactionally on first startup. Secret recovery credentials are stored as hashes and excluded from snapshots. Rendering is ordered Canvas2D and aims for visual convergence; exact cross-browser pixel equality is unverified.

Local database: `data/studio.sqlite`. Keep this file and its SQLite WAL on a persistent disk. A restart on the same disk retains rooms; disk loss does not. This is a single-process prototype. Full artwork replay still happens on join/reconnect; checkpoint compaction is the next performance concern for long sessions. Multiple independently owned stations/surfaces, paint-like mixing/blending, recoverable reset, avatar label artwork, sound, public matching/moderation and measured phone support remain later milestones. Walking positions are bounded, collision-checked and speed-limited on the server. The client enforces interaction/painting reach and occlusion; the server additionally checks mirror-mark reach, while command-level spatial enforcement for towel strokes, tool pickup and fixtures remains outstanding. Player positions are transient; reconnect respawns safely near the towel.

For a conventional Node host, set `HOST=0.0.0.0`, `PORT`, `DATABASE` to a persistent-disk path, and `ORIGIN` to the exact HTTPS website origin. Terminate TLS at a WebSocket-capable reverse proxy and route `/socket` to this server. Browser clients automatically use WSS for HTTPS pages. No production host or paid service is configured. The current join limiter and quotas are prototype defenses; unrestricted public discovery needs stronger address-based controls and moderation before release.

## Project tracking

Use this folder's Beads database (prefix `bathroom`). The earlier inherited tracker at the user home is unrelated. The project's `.git` directory is empty and metadata writes have been denied. Explicit project-only Git checks report that it is not a repository; ordinary Git discovery falls back to an unrelated home repository. Automatic approval review rejected pull/rebase and push for that reason. Do not operate on the home repository as a substitute. No project Git remote has been supplied; delivery requires establishing a usable project repository and a verified destination.

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
