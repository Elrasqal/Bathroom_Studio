# Hosted phone-test edition — version 0.14

Prepared October 4, 2026, in the separate hosted/ project. The original local server and data/studio.sqlite are preserved; existing user artwork was not uploaded.

The browser game, environment, original touch controls, painting tools, private friend codes, collaboration grants, laundry, labels, audio and attribution carry over. Public listing controls and the directory are disabled in this edition.

A bundled Worker and managed D1 database replace the local Node server for this copy. HTTPS command batches and event polling preserve the original authoritative command validation. Atomic conditional D1 batches prevent concurrent room operations from overwriting each other and keep stroke appends durable before acceptance. Indexed recipient event delivery, bounded stroke caches and temporary-event expiry limit unnecessary work. Room ownership still depends on the browser's recovery credential. The room-code system does not bypass the site's private access setting.

Mobile refinements include 44px movement buttons, explicit Touch/Mobile settings, compact landscape branding, portrait/landscape layout checks, and retained lightweight rendering. The tested 390 × 844 viewport used a 214 × 464 world canvas and had no horizontal overflow. On-screen Paint produced a visible mark that survived reload. An 844 × 390 landscape view also fit. Real physical-phone performance and simultaneous multi-touch gestures need user testing.

Five hosted checks pass: browser display-tool validation, durable code rooms and collaboration permissions, concurrent stroke acceptance without duplicates, origin rejection, and both 20-second laundry cycles across engine reconstruction. Browser tools registered and performed valid configuration/status calls; invalid control selection was rejected.

The hosted copy re-encodes all 20 complete music tracks at 48 kbps / 22.05 kHz MP3, reducing music from 76.6 MB to 38.3 MB. Every track duration was verified within 0.3 seconds of its source manifest; the playlist remains 106.41 minutes. This reduces fidelity, which is disclosed in the hosted Sound tab and audio credits. Original prototype audio and interaction samples are preserved. Three.js's MIT license is included in public/THREE-LICENSE.txt. No new third-party audio was sourced.

Site registration is recorded in hosted/.openai/hosting.json. Publication uses that same private site. Windows packaging needed process-local Git ownership/path configuration and GNU tar's --force-local option; no global Git or browser settings changed. An 80 MB upload timed out, and the host then clarified that d1 must be the logical binding string "DB"; the smaller corrected package was accepted.

Screenshots: data/bathroom-hosted-phone.png and data/bathroom-hosted-landscape.png show the local hosted-format preview. They are not proof of physical-device testing.

Publication succeeded: https://bathroom-studio.elrasquillo.chatgpt.site (private owner review). Site project appgprj_6ac2f1c774b48191b32dc1e61346eff2; version appgprj_6ac2f1c774b48191b32dc1e61346eff2~appgver_4ff7f955cd488191a38a12f545a703e7; deployment appgdep_6ac2ff686b548191a97229b80baa51f5. Verified pushed source: 55b8c4bc37a63baab3e90725d19f99add7c06c46. Native deployment success confirms publication; production gameplay and physical phone behavior still need the user's review. The separate port-3001 preview was stopped after publication; the original port-3000 prototype remains available.
