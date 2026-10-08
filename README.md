# Dragon Ball Z — The Warriors of Earth

An interactive, fan-made editorial website featuring cinematic scrolling, five playable character showcases, transformations, illustrated attacks, battle scenes, and Dragon Ball / Shenron interactions.

## Run locally

From this directory, with Python 3 installed:

```sh
python -m http.server 4173
```

Open http://localhost:4173. No build or npm install is required. The working website uses HTML, CSS, JavaScript, Three.js, GSAP, and Lenis. Google Fonts and animation libraries load from external CDNs, so internet access is required.

## Hosting

Serve this directory with a static web host at the domain root. Asset URLs are root-relative; a subdirectory deployment such as default GitHub project Pages requires adjusting those URLs. Uploading to this repository does not automatically deploy the website.

## Assets and credits

- `art/`: illustrated forms, attacks, and battle scenes.
- `audio/CREDITS.txt`: source and CC0 license for the power-up sound recreation. Other effects are synthesized in the browser.
- `vendor/three.module.js`: bundled Three.js; its license notice is retained in the file.
- Dragon Ball characters and branding belong to their respective rights holders. This is an unofficial fan project, not an official product. No general license is granted for the character artwork or branding.

Unused videos, removed clip viewers, generation intermediates, and development caches are intentionally excluded.
