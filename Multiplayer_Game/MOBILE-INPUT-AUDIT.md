# Mobile input and movement audit — October 4, 2026

Implemented locally in both the original game and hosted phone-test copy. No production deployment or physical-phone measurement was performed.

## Findings and fixes

1. **Use waited for release.** Use, Turn and Put down were click-only handlers. They now activate on primary pointer press, respect the gameplay readiness check, and ignore the subsequent pointer click. Keyboard and assistive clicks still work.
2. **Legal walking could be rejected near corners.** Client collision handling takes small X/Z steps and slides along furniture. The server previously tested only a straight line from the previous reported position to the next. The client now sends the actual collision steps and the server checks every segment and total travel distance. Solid obstacles and speed checks remain enforced.
3. **Hosted movement discarded the route and could reorder movement across actions.** Pending poses were replaced with the newest pose. A delayed request could therefore erase seconds of travel, including a turn around furniture. Movement packets are now retained in order, including their position relative to Use/paint commands.
4. **Batched movement exhausted the short arrival-time allowance.** Retained small packets arriving together now draw on a bounded accumulated allowance rather than repeatedly hitting the old three-unit cap. Each packet still has a short maximum route, and the server checks distance against elapsed server time. Legacy endpoint-only clients retain the old allowance. The larger allowance trades stricter burst enforcement for tolerance of delayed delivery.
5. **Actions could use an older server position.** Commands now flush unsent movement first. The hosted transport batches synchronous movement and action submissions together and removes its extra 35 ms wait when commands are pending.

Movement recording pauses at a bounded backlog if sending is blocked, instead of dropping the path and allowing unlimited local divergence.

## Verification and remaining limits

Regression coverage exercises legal turns around the toilet, shower partition and laundry machines; rejection of direct obstacle shortcuts; delayed movement packets; queue ordering; pointer-press activation; and duplicate-click suppression. The existing multiplayer, persistence, painting, permissions and collision tests remain part of the full suite. Syntax checks and the hosted production build are also run.

Shared fixture changes still wait for authoritative server confirmation. The hosted transport serializes HTTPS requests, so an action submitted during a slow request must wait for it. Artwork histories are reconstructed by the hosted engine on requests, and database contention can retry a room operation; these are possible contributors to freezes, not proven causes of the reported live stalls. This pass does not claim to eliminate hosting outages or all reconciliation snaps, including reconnects, explicit recovery, or genuinely invalid movement.

Before release, physically test simultaneous walking, looking and Use on iOS/Android; the three reported tight areas on desktop and mobile; painting immediately after walking; and a room with substantial artwork under a delayed connection. Deploy the hosted client and engine together so movement routes are understood by both ends.
