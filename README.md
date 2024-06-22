# Garn47 Drill Dragon Helper 

![Drilly](.github/images/Drilly_Anim.webp)

Drilly from the game Garn47 by Floombo! They're real now!

## Features

- Full 3D!
- Randomly makes sounds like the game!
- Repositionable by dragging the green frame!
- Change size via the taskbar tray!

## Installation

Latest build here: [Latest Release](https://github.com/Mrpalland/DrillDragonHelper/releases/latest)

> Currently only a Windows portable application is available but build instructions are below.

## License

Since Drilly's design, model and sounds are from Garn47, a game by Floombo, this repo uses assets that were created by and belong to Floombo under the [CC BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. The assets in the `assets` directory remain under the `CC BY-NC-SA` license.

![CC BY-NC-SA](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)

> Changes to the Assets: The Drilly model has been tweaked slightly to allow for easy import with Threejs FBX Loader.

## Issues

### Known Issues

- [ ] Limited interaction
- [ ] Window highlights if double clicked
- [ ] Asset loading from directory may not be robust on all platforms

## Planned Features

- [ ] More interactive features and animations
- [ ] Customizable appearance/custom models
- [ ] More window settings
- [ ] Start on system boot

## Building from Source

- Node.js (v20 or later)
- npm (v10 or later)

### Clone the Repository

```bash
git clone https://github.com/Mrpalland/DrillDragonHelper.git
cd DrillDragonHelper
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm start
```

## Building

To build a portable application for windows use:

```bash
npm run build
```

for other platforms use

```bash
npx electron-builder build
```

This will create a release in the `dist` folder.

## Acknowledgements

- Thanks to Floombo for being totally garnular and supplying Drilly's assets to his community and their continued work on the game Garn47.

- <img src=".github/images/Drilly.png" alt="drawing" width="20"/>
