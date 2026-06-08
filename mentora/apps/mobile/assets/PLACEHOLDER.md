# Assets

This directory must contain the following image assets before running the app:

| File                  | Size           | Used by                 |
|-----------------------|----------------|-------------------------|
| `icon.png`            | 1024 × 1024 px | App icon (iOS/Android)  |
| `splash.png`          | 1284 × 2778 px | Splash screen           |
| `adaptive-icon.png`   | 1024 × 1024 px | Android adaptive icon   |
| `favicon.png`         | 32 × 32 px     | Web favicon             |

For development/testing, any PNG of the correct dimensions works.
Use the Mentora brand blue (#1a56db) background with a white "M" glyph.

Generate quick placeholder assets with:

```bash
# Requires ImageMagick (convert)
convert -size 1024x1024 xc:#1a56db -fill white -font Helvetica-Bold \
  -pointsize 480 -gravity Center -annotate 0 "M" assets/icon.png
cp assets/icon.png assets/adaptive-icon.png
convert -size 1284x2778 xc:#1a56db assets/splash.png
convert -size 32x32 xc:#1a56db assets/favicon.png
```
