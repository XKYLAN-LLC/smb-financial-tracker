# Video Walkthrough

The video walkthrough should use only synthetic data from the public sample dashboard.

Suggested local output:

```text
docs/assets/video/smb-financial-tracker-walkthrough.mp4
```

The checked-in `smb-financial-tracker-walkthrough.mp4` is a short slideshow generated from synthetic screenshots. It is safe for the public repo because it does not record a real desktop session or private files.

Regenerate screenshots first:

```bash
node scripts/capture-screenshots.mjs
```

Then regenerate the MP4:

```bash
ffmpeg -y \
  -loop 1 -t 3 -i docs/assets/screenshots/dashboard-overview.png \
  -loop 1 -t 3 -i docs/assets/screenshots/ledger-review.png \
  -loop 1 -t 3 -i docs/assets/screenshots/accountant-export.png \
  -filter_complex "[0:v]scale=1440:1100,setsar=1[v0];[1:v]scale=1440:1100,setsar=1[v1];[2:v]scale=1440:1100,setsar=1[v2];[v0][v1][v2]concat=n=3:v=1:a=0,format=yuv420p[v]" \
  -map "[v]" -r 30 docs/assets/video/smb-financial-tracker-walkthrough.mp4
```

Recommended walkthrough beats:

1. Open the local dashboard.
2. Show KPI cards and threshold buffer.
3. Scroll to the ledger and review statuses.
4. Show the review queue and source-document/package manifest docs.
5. Scroll to accountant export.
6. Close by showing the validation commands.

Keep the video short: 60 to 90 seconds is enough. Do not record real private records, browser profiles, notifications, account pages, or local filenames that contain personal details.
