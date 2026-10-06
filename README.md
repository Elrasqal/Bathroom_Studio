[ReadMe.md](https://github.com/user-attachments/files/33082729/ReadMe.md)
<p align="center">
  <img src="Multiplayer_Game/public/art/bathroom-studio-title.png" alt="Bathroom Studio" width="440">
</p>

# Bathroom Studio

A multiplayer painting sandbox set in a small 3D bathroom. Walk around as a toothpaste tube, paint on towels and spare toilet-paper rolls, and invite friends to work beside you. The adjoining laundry room has a washer, dryer, instant camera, and drawers of art supplies, all wrapped in a sage-green, 1990s desktop interface.

This repository contains the **version 0.15.0 Node.js prototype**. It runs locally or on a server with persistent storage. Room state and accepted artwork are saved in SQLite. The separate hosted edition described in older project notes is not included in this checkout.

[Install and run](#install-and-run) · [Controls](#controls) · [Multiplayer](#rooms-and-multiplayer) · [Server setup](#server-configuration) · [Development](#development-and-checks) · [Credits](#credits-and-license-status)

## Inside the studio

- Paint with toothpaste, a toothbrush, mouthwash spray, or a rubber stamp. Mix colors in the soap dish and choose duck, bubble, flower, or tile stamp inserts.
- Keep separate drawings on four towels and three movable paper rolls. Wet a towel before cleaning with the sponge, or put it through the laundry cycle.
- Capture artwork with the instant camera, display it in two wall frames, and download PNGs. Crop a piece of your work into a label for your toothpaste avatar.
- Share a room with up to four connected artists. Use private room codes or opt into the server's public room list.
- Open cabinets, carry props, climb a stool, and adjust the towel rail. Run the shower to fog the mirror, trace temporary marks, then clear the steam with the fan.
- Choose daylight, sunset, or moonlight, adjust the VHS effect, and listen to 20 locally served ambient music tracks totaling about 106 minutes.

## Requirements and technical specifications

| Component | Requirement or implementation |
| --- | --- |
| Server runtime | Node.js **24.14 or newer**, with npm |
| Browser | WebGL 2, JavaScript modules, Canvas 2D, WebSocket, Web Audio, and browser storage |
| Input | Keyboard and mouse recommended; touch buttons and a movement pad are included |
| Client | Plain JavaScript, HTML, and CSS; Three.js `0.186.1` |
| Networking | Node HTTP server and `ws` `8.22.0`; WebSocket endpoint at `/socket` |
| Storage | Built-in `node:sqlite`, WAL journal mode, `synchronous=FULL` |
| Build step | None; the server serves the browser modules and installed Three.js files directly |
| Accounts | Anonymous browser recovery keys; no email or password registration |
| Runtime services | No external database service, music account, or API key required |

There is no established minimum CPU, RAM, or GPU specification. Physical-phone performance and cross-browser pixel equality have not been verified. Mouse and headphones are recommended for the current prototype.

## Install and run

Clone the repository and install the locked dependencies from the application directory:

```sh
git clone https://github.com/Elrasqal/Bathroom_Studio.git
cd Bathroom_Studio/Multiplayer_Game
npm ci
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. Keep the terminal running while playing; press `Ctrl+C` to stop the server. The first launch creates `Multiplayer_Game/data/studio.sqlite` automatically.

If you downloaded the repository as a ZIP, extract it and open a terminal in its `Multiplayer_Game` folder before running `npm ci` and `npm start`.

Use the server URL rather than opening `public/index.html` as a file. The game needs its server for assets, room connections, and saved artwork. Uploading only `public/` to a static host will not run it.

### Your first drawing

1. Enter a name and choose **Create a bathroom**. Leave the public-room checkbox unchecked for a private room.
2. Select **Enter first-person** to capture the mouse. Walk up to the hanging towel.
3. Hold the left mouse button or `Space` to paint. Aim at a paste color or a tool and press `E` to use it.
4. Open **Room & settings** to copy the room code and allow a guest to collaborate.
5. Use the **SAVE ART** tray beside the camera in the utility room to download your last painted towel or roll. Wait for pending marks and artwork restoration to finish first.

The in-game **Guide** tab explains object interactions and the laundry sequence.

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Walk | `W`, `A`, `S`, `D` or arrow keys | Direction buttons or movement pad |
| Look | Move the captured mouse; drag the view if capture is unavailable | Drag the LOOK pad |
| Paint | Hold left click while captured, or hold `Space` | Hold **Paint** |
| Use / pick up / place | `E` | **Use** |
| Put down a tool or return a carried prop | `Q` | **Put down** |
| Rotate a stamp or targeted paper roll | `R` | **Turn** |
| Release the captured mouse | `Esc` | Not applicable |
| Change settings | **Room & settings** | **Room & settings** |

Aim at an object and move within reach before using it. Put a paper roll down before painting it. Release the stamp before trying to rotate a roll, since **Turn** rotates the held stamp first.

Display settings let you choose automatic, desktop, or touch controls and switch between touch movement buttons and the pad. If you get stuck behind furniture, use **Return to the central aisle** in the Room tab.

## Rooms and multiplayer

All players must connect to the same running server. A room code on one server does not identify a room on another.

Private rooms use six-character codes and reserve four artist identities for returning players. The owner controls collaboration grants, towel changes, laundry, and several room fixtures. Shared tools can be held by one artist at a time and are released on disconnect.

Public listing is optional. A listed room appears in this server's directory while its owner is online. The owner can name it, disable public guest painting, remove guests, or make it private again. Making a room private removes its listing; guests already inside stay connected. Rooms that have been public can retain up to 64 artist identities, but still allow only four artists online at once.

Your browser stores its recovery key in local storage. Keep that browser's site data to retain your identity and ownership. Different browser profiles, devices, ports, or hostnames have separate storage. There is no account-based recovery flow. For a two-player local test, use separate browser profiles; opening another tab with the same identity replaces that identity's earlier connection.

Room codes and anonymous identity controls are prototype access mechanisms. The server has message limits, origin checks, and permission validation, but public operation still needs abuse controls and moderation beyond the current implementation.

## Artwork, saves, and exports

Accepted strokes are written to SQLite before the server acknowledges them. Room fixtures, towel selection, laundry progress, gallery prints, and avatar labels also survive a restart when the database is retained. Movement, held tools, and temporary mirror marks are transient.

| Surface or output | Resolution / behavior |
| --- | --- |
| Studio towel, bath sheet, and hand towel | Each has a separate 512 × 640 painting canvas |
| Square towel | 512 × 512 painting canvas |
| Three spare paper rolls | Separate 384 × 128 wrapping canvases |
| SAVE ART tray | Unframed PNG of the last painted towel or roll at native resolution; defaults to the current towel after reload |
| Instant camera and wall frames | Two saved snapshots; interacting with a frame downloads a 320 × 256 framed PNG |
| FRAME LABEL | Cropped artwork applied to your avatar; the saved snapshot survives washing its source |

The owner can exchange towels without losing the drawings stored on the others. Laundry cleans only the selected towel: load the washer, start its 20-second cycle, collect the wet bundle, load the dryer, and start its 20-second cycle. Paper-roll artwork and saved snapshots remain separate.

Washing removes marks from active towel replay; old stroke records remain in the database for historical references. There is no artwork history browser or undo/recovery interface. Export anything you want to keep before washing.

### Backing up a studio

The default database is `Multiplayer_Game/data/studio.sqlite`. Stop the server before copying the database and any remaining SQLite sidecar files as a backup. A live database backup requires a SQLite-aware procedure; copying only the main file while WAL writes are active can miss recent work.

Keep the `data/` directory on durable storage and outside version control. A PNG export preserves an image, not its editable stroke history, room ownership, or furnishings. Browser recovery keys are separate from the server database, so retain the browser's site data as well.

## Server configuration

Set environment variables before starting the application:

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Bind address; use `0.0.0.0` to accept connections from other devices |
| `PORT` | `3000` | HTTP and WebSocket port |
| `DATABASE` | `data/studio.sqlite` beside `server.js` | SQLite file path; use an absolute path on persistent storage for hosting |
| `ORIGIN` | Exact `http://` origin inferred from the request's Host header | Allowed WebSocket origin; set to the site's exact HTTPS origin behind a TLS proxy |

For example, to listen on your local network from PowerShell:

```powershell
$env:HOST = "0.0.0.0"
$env:PORT = "3000"
npm start
```

Other devices on the same network can open `http://YOUR-LAN-IP:3000`, subject to the host computer's firewall. `127.0.0.1` always refers to the device running the browser. The example assumes `ORIGIN` has not been set to a different address.

For an internet deployment, run one Node process with a persistent disk. Put it behind an HTTPS reverse proxy that forwards WebSocket upgrades at `/socket`; set `ORIGIN` to the external origin, including any nonstandard port and no trailing slash. The client selects `wss://` automatically on HTTPS pages. This checkout does not include a deployment manifest or a multi-instance storage architecture.

| Endpoint | Purpose |
| --- | --- |
| `GET /` | Browser application |
| `GET /health` | Basic process response: `{"ok":true}`; not a database integrity check |
| `GET /rooms` | Public room directory for this server |
| `/socket` | WebSocket connection for room commands and updates |

## Display and accessibility settings

Only the 3D view changes resolution with the quality preset; the interface and artwork canvases retain their resolution.

| Preset | Maximum render scale relative to CSS pixels | Pixel budget | Shadows |
| --- | ---: | ---: | --- |
| Mobile | 0.55× | 360,000 | Off |
| Fast | 0.70× | 650,000 | Off |
| Balanced | 1.00× | 1,200,000 | Off |
| Detailed | 1.50× | 2,200,000 | On |

Device pixel ratio and the pixel budget can lower the effective scale further. The initial preset is Mobile on detected mobile devices and Fast otherwise; saved preferences override it. Idle scenes avoid unnecessary redraws, and saved artwork restores in bounded slices to leave time for input.

Room Properties includes separate music, ambience, and effects volumes, mute, VHS controls, and a laundry-motion option. The game responds to the browser's reduced-motion preference. These controls do not establish full assistive-technology accessibility for the first-person 3D game.

## Development and checks

Run commands from `Multiplayer_Game/`:

```sh
npm test
npm run check
```

The test suite uses Node's built-in test runner. It covers multiplayer permissions, durable saves and restarts, movement validation, painting, laundry, gallery snapshots, labels, rendering budgets, replay, and audio behavior. `npm run check` checks JavaScript syntax. There is no separate bundler or lint command.

Validation of this checkout on Node `24.14.1`: **53 of 54 tests passed**, and the syntax checks passed. `test/release-parity.test.js` fails because it compares the local modules with `hosted/public/`, which is absent from this repository. That is a known checkout limitation, not a passing test or evidence that the hosted edition was validated.

Optional diagnostic tools:

```sh
node scripts/benchmark.js
node scripts/latency-preview.js
```

The benchmark measures durable stroke-acceptance latency using a temporary database. The latency proxy requires the game on port 3000, listens on port 3001, and adds 1.5 seconds to server responses for local testing. Its timings are not GPU or physical display-latency measurements.

### Repository layout

```text
Bathroom_Studio/
├── ReadMe.md                    # Repository landing page
└── Multiplayer_Game/
    ├── package.json             # Runtime, dependencies, and npm commands
    ├── package-lock.json        # Locked dependency versions
    ├── server.js                # HTTP, rooms, WebSocket commands, and SQLite
    ├── public/                  # Browser code, styles, title art, and audio
    ├── test/                    # Node test suite
    ├── scripts/                 # Benchmarks and inspection helpers
    ├── data/                    # Generated local saves; ignored by Git
    ├── AUDIO-CREDITS.md          # Music, samples, source links, and edits
    ├── ART-CREDITS.md            # Title graphic provenance
    └── README.md                # Historical development checkpoints
```

Start with `public/app.js` for client state and networking, `public/scene.js` for the room, and `public/controls.js` for input. Painting and restoration are split across `paint.js`, `paper-paint.js`, and `replay.js`; the server imports shared gameplay modules for validation.

## Current limits and troubleshooting

The server caps stored rooms at 100 and open WebSocket connections at 64. Active artwork is limited to 12,000 stroke segments per towel and 2,000 per paper roll. These are code limits, not tested hosting-capacity guarantees. Long histories still require full replay on join or reconnect; cached artwork checkpoints and compaction are not implemented.

| Problem | What to check |
| --- | --- |
| `node:sqlite` is unavailable | Check `node --version`; the package requires Node 24.14 or newer |
| Page does not load | Start the server from `Multiplayer_Game/`, check its terminal output, and open the HTTP URL |
| `EADDRINUSE` on startup | Another process uses the port; stop that process or choose a different `PORT` |
| Page loads but cannot connect | Check reverse-proxy WebSocket forwarding and the exact `ORIGIN` value |
| Another device cannot join | Use the host's LAN address, bind to `0.0.0.0`, and check firewall access |
| Painting is unavailable | Check collaboration permission, reach, tool ownership, laundry state, and whether artwork is still restoring |
| No sound | Interact after joining, then check mute, volume controls, and the vanity radio |
| You appear as a new artist | Use the original browser profile and site address; ownership depends on its saved recovery key |
| A private room stays full | Its four identities remain reserved even after players disconnect |
| Artwork disappears after hosting changes | Check that `DATABASE` points to the same persistent disk rather than temporary deployment storage |

The jar and folded washcloth are carry/place props. Object placement uses defined storage positions and validated floor placement, not a general physics simulation. Physical touch-device playtesting and testing with large saved histories remain open work.

## Contributing and reporting problems

Use this repository's GitHub Issues for bug reports or proposed changes. Include steps to reproduce, expected and observed behavior, the Node version, browser/device, and whether the problem occurred locally or behind a proxy. For rendering or input bugs, include the quality preset and control mode.

Keep pull requests focused and include relevant test results. Changes to shared room behavior should consider permissions, reconnects, and database restart recovery. New art or audio should include its source and license information. Do not attach player databases, recovery keys, or private room data to public reports.

## Project notes

The application source and `package.json` describe this checkout. Older notes record work across different copies of the project and can mention files, deployments, or validation artifacts that are not present here.

- [Development checkpoints](Multiplayer_Game/README.md): earlier features and local observations.
- [Version 0.12 notes](Multiplayer_Game/CHECKPOINT-0.12.md) and [version 0.13 notes](Multiplayer_Game/CHECKPOINT-0.13.md): label, room, display, and laundry work.
- [Mobile input audit](Multiplayer_Game/MOBILE-INPUT-AUDIT.md): movement and touch changes, plus remaining device checks.
- [Version 0.14 hosted notes](Multiplayer_Game/CHECKPOINT-0.14.md): the separate hosted edition, whose source is absent here.
- [Original design reference](Multiplayer_Game/bathroom-studio-reference.md): design intentions; not a list of completed features.

## Credits and license status

Music is by **Chris Zabriskie**, from *Cylinders*, *Thoughtless*, and *Divider*, credited under **CC BY 4.0**. Kenney interaction samples and the credited Freesound recordings are documented as **CC0**. See [Audio credits](Multiplayer_Game/AUDIO-CREDITS.md) for individual creators, source links, and modifications. The game serves these files locally and displays attribution in its Sound tab.

The title graphic was generated for this project with OpenAI's image generator. Its provenance and prompt are recorded in [Art credits](Multiplayer_Game/ART-CREDITS.md).

**No repository-wide source-code license is included.** The audio license notices do not define a license for the game's code or all of its artwork. Source-code licensing remains a maintainer decision; this README does not assign one. Third-party dependencies retain their own license notices in their installed packages.
