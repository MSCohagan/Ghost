# Media Workflow

## Goal

Create clean, lightweight demo media for README/docs with a repeatable process.

## Folder Convention

- `docs/media/src/`:
  - raw captures (`.mov`, long clips)
  - local working files (usually not committed)
- `docs/media/final/`:
  - final `.mp4` and `.gif` assets used in docs (committed)

## Capture

1. Record short clips (8-25s depending on feature).
2. Keep one clear objective per clip:
   - movement/possession
   - streaming transition
   - puzzle interaction
   - editor workflow

## Edit and Crop (FFmpeg)

Crop top bar from raw capture:

```bash
ffmpeg -i docs/media/src/<clip>.mov \
  -vf "crop=iw:ih-80:0:80" \
  -c:v libx264 -crf 18 -preset medium -c:a copy \
  docs/media/final/<clip>.mp4
```

Adjust `80` as needed.

## Convert MP4 to GIF

Generate palette:

```bash
ffmpeg -i docs/media/final/<clip>.mp4 \
  -vf "fps=12,scale=960:-1:flags=lanczos,palettegen" \
  docs/media/src/palette.png
```

Create GIF:

```bash
ffmpeg -i docs/media/final/<clip>.mp4 -i docs/media/src/palette.png \
  -filter_complex "fps=12,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  docs/media/final/<clip>.gif
```

Delete intermediate palette:

```bash
rm docs/media/src/palette.png
```

## Repo Keep/Delete Policy

Keep in git:

- final `.mp4`
- final `.gif` only if referenced in README/docs

Do not keep in git:

- raw captures unless intentionally archived
- intermediate files (for example `palette.png`)
- duplicate exports

## README Usage

Embed final assets from `docs/media/final/`:

```md
![Streaming Demo](./docs/media/final/streaming-demo.gif)
```

Prefer MP4 links for longer clips and GIF for short inline previews.
