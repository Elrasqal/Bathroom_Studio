# Bathroom Studio audio credits

Music: Chris Zabriskie — [Cylinders](https://chriszabriskie.com/cylinders/) [Thoughtless](https://chriszabriskie.com/thoughtless/) and [Divider](https://chriszabriskie.com/divider/). [Creator license statement](https://chriszabriskie.com/use/): [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution is also shown inside Room & settings. Complete tracks were re-encoded from the creator's public M4A files to 96 kbps MP3. No musical edits. Total decoded duration: 106 minutes 24 seconds. The playlist plays once; replay requires an explicit radio action.

| Title | Album | Duration | Original source |
|---|---|---:|---|
| Cylinder One | Cylinders | 2:56 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-01.m4a) |
| Cylinder Two | Cylinders | 3:47 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-02.m4a) |
| Cylinder Three | Cylinders | 2:46 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-03.m4a) |
| Cylinder Four | Cylinders | 2:56 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-04.m4a) |
| Cylinder Five | Cylinders | 2:53 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-05.m4a) |
| Cylinder Six | Cylinders | 1:45 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-06.m4a) |
| Cylinder Seven | Cylinders | 8:52 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-07.m4a) |
| Cylinder Eight | Cylinders | 5:38 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-08.m4a) |
| Cylinder Nine | Cylinders | 5:22 | [Creator audio](https://audio.chriszabriskie.com/cylinders/cylinders-09.m4a) |
| Everybody’s Got Problems That Aren’t Mine | Thoughtless | 8:17 | [Creator audio](https://audio.chriszabriskie.com/thoughtless/thoughtless-01.m4a) |
| Another Version of You | Thoughtless | 6:09 | [Creator audio](https://audio.chriszabriskie.com/thoughtless/thoughtless-02.m4a) |
| There’s a Special Place for Some People | Thoughtless | 6:24 | [Creator audio](https://audio.chriszabriskie.com/thoughtless/thoughtless-03.m4a) |
| I Can’t Imagine Where I’d Be Without It | Thoughtless | 8:12 | [Creator audio](https://audio.chriszabriskie.com/thoughtless/thoughtless-04.m4a) |
| Rewound | Thoughtless | 7:18 | [Creator audio](https://audio.chriszabriskie.com/thoughtless/thoughtless-05.m4a) |

Interaction samples: [Kenney RPG Audio](https://kenney.nl/assets/rpg-audio), CC0 1.0. Original license included at public/audio/sfx/KENNEY-LICENSE.txt. Current interaction mapping uses cloth1, cloth2, doorClose_1, doorOpen_1, metalClick, metalLatch and bookPlace1; old Kenney footstep/creak files remain bundled for compatibility. Recorded tile steps replace the old footsteps. Converted to MP3.

Outdoor ambience: [city morning with birds and traffic](https://freesound.org/people/thegreatbelow/sounds/546794/) by thegreatbelow, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Uses the openly available high-quality MP3 preview (about 87 seconds), repeated at low volume.

Procedural shower water and electrical hum are original audio definitions in public/audio.js, dedicated to CC0 1.0. These quiet ambience layers repeat; the music does not.

No third-party streaming service or account is required at runtime. Assets are served locally, one music track at a time; sound effects are decoded only on first use and reused.

## Version 0.8 recorded interactions

All eight new recordings below are **CC0 1.0**, verified on each creator’s original Freesound page. The CC0 dedication permits redistribution and commercial use without attribution conditions; credits are retained here and in Room Properties. Public high-quality MP3 previews were downloaded, trimmed, converted to mono 44.1 kHz / 96 kbps MP3, and mixed quietly in the game. Primary-page snapshots are retained in data/audio-sources.

| Use | Creator | Original recording | Game edit |
|---|---|---|---|
| duck | Slothfully_So | [Freesound source](https://freesound.org/people/Slothfully_So/sounds/685067/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | First second; rubber duck squeeze |
| flush | lorenzgillner | [Freesound source](https://freesound.org/people/lorenzgillner/sounds/274448/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | First 4 seconds; toilet flush |
| washer | TravieDoodle | [Freesound source](https://freesound.org/people/TravieDoodle/sounds/567545/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 10–30 seconds; finite 20-second wash |
| dryer | felix.blume | [Freesound source](https://freesound.org/people/felix.blume/sounds/188454/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 15–35 seconds; finite 20-second dry |
| paste | jpkweli | [Freesound source](https://freesound.org/people/jpkweli/sounds/154791/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 0.5–5 seconds; sustained low-volume paste application |
| tile | wrenshep098 | [Freesound source](https://freesound.org/people/wrenshep098/sounds/132235/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | First 5.48 seconds; alternating softened step excerpts |
| brush | wrenshep098 | [Freesound source](https://freesound.org/people/wrenshep098/sounds/132236/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 2–26 seconds; sustained toothbrush/sponge application |
| spray | michael_grinnell | [Freesound source](https://freesound.org/people/michael_grinnell/sounds/464428/) · [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | First second; sustained filtered aerosol hiss |

Painting uses one sustained buffer source per held application, with short gain fades and a loop region; it does not retrigger a sample every animation frame. Machine recordings play once per 20-second cycle and seek to the current cycle position on reconnect. Effects stop or suspend on mute and when the page is hidden. Duck and flush recordings replace the previous synthesized cues.

Design research: [SuchArt: Creative Space’s official Steam listing](https://store.steampowered.com/app/1469280/SuchArt_Creative_Space/) inspired tangible tool selection and mixing. The soap-dish mint mixer and duck stamp are original bathroom-themed implementations. No SuchArt assets are used.

## Version 0.9 extractor fan

**Bathroom fan**, by **yottasounds**: [original Freesound recording](https://freesound.org/people/yottasounds/sounds/380837/), dedicated to [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The primary source page and public HQ MP3 preview are retained in data/audio-sources/fan.html and fan.mp3. The game uses seconds 5–35, converted to mono 44.1 kHz / 96 kbps MP3 in public/audio/sfx/fan.mp3. A sustained loop, gain fades, distance attenuation, doorway attenuation and listener-relative stereo panning accompany the shared fan switch. This replaces the original procedural ventilation sound. Fan decoding is lazy and cancelled on mute/background/disposal. Located interaction and machine samples also gain stereo positioning; recordings and license terms remain unchanged.

## Version 0.11 additions and license recheck

All bundled third-party audio licenses were rechecked on October 2, 2026 (Pacific time). The original source pages, check results and source URLs are retained in `data/license-audit/report.json` and adjacent HTML files. All recordings and Kenney samples remain CC0; all music remains CC BY 4.0, including permission for commercial publication with attribution.

Six complete additional Divider tracks: Heliograph (5:40), Candlepower (5:40), CGI Snake (6:31), Wonder Cycle (5:46), Oxygen Garden (6:03), Divider (3:22). Original downloads: https://audio.chriszabriskie.com/divider/divider-01.m4a through divider-06.m4a. Re-encoded to 96 kbps MP3, with no musical edits.

**VHSStartup**, by **Sassaby**: [original Freesound recording](https://freesound.org/people/Sassaby/sounds/264934/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Recorded from a VHS player through RCA outputs. The public HQ preview was converted to mono 96 kbps MP3. The game plays occasional finite bursts with gradual gain fades, rather than an always-on static loop. Turning tape playback off also stops the static.
