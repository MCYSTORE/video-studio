# Yamaguchi Short

Vertical Remotion composition: 1080 × 1920, 30 fps, H.264/AAC.

```sh
npm ci
npx remotion render StickmanShort out/yamaguchi_short_final.mp4
```

`npm install` and the render command were run in the cloud environment. The config reuses `/usr/bin/chromium` when installed; otherwise Remotion uses its default browser discovery. Render concurrency is limited to two tabs.

All sixteen original JPEGs are preserved, with byte-identical copies named `public/scenes/01.jpg` through `16.jpg`. The composition uses every scene in order and all three SFX assets. The caption font and its license are included for reproducibility.

The source voice is approximately 42.998 seconds. Whisper small (faster-whisper 1.2.1, CPU int8, PyAV 16.1.0) supplied word timestamps, reviewed against FFmpeg speech/silence boundaries at −40 dB. Evidence is stored in `alignment/`. Recognition errors in names and punctuation were corrected using the supplied narrative. Captions also include spoken phrases missing from the template (for example, “de repente”, “del planeta”, and “en su lugar”).

The rendered timeline is 1,285 frames (42.833 seconds), removing only the trailing silence after the final spoken phrase. Visual timing is quantized to the nearest frame: 33.3 ms precision at 30 fps, not sample-level or millisecond-perfect speech alignment. Scene 16 carries the final “este hombre…” phrase; its last eight frames blend to the opening image. The background music has 100 ms edge fades to avoid a click when looping. Viewer watch time is not guaranteed by a loop edit.

Voice volume stays at 1.0; the background bed stays at 0.14 except for its short edge fades. SFX are placed on the spoken explosion, return journey, and “acero” beats. The quiet chime has an explicit gain of 3.0; explosions and train use lower levels to protect speech intelligibility. Global four-frame flashes occur at exactly 6, 12, 18, 24, 30, 36, and 42 seconds. Existing zoom, pan, and impact-shake camera movements are retained.

`out/yamaguchi_short_final.mp4` is the publication deliverable. Use GitHub’s **Download raw file** action if the chat preview cannot display it.
