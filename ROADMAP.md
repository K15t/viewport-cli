# Roadmap

## Misc

- Make `directoryList` async, await it in index.js

## NPM package

- make `viewport-tools` the only package needed instead of the theme being a package itself
- have gulp, gulp-viewport, etc. as dependencies of `viewport-tools` on installation, themes are just folder with source code and `gulpfile.js`, no unnecessary `node_modules` folder for every theme, no `npm install` for every theme
- unfortunately gulp isn't designed to work globally if installed globally but searches for a local install to hand control over to, i.e. might need to use different task manager altogether

## ESNext

- Make `src` and `bld` variables in `Paths` class of `gulpfile.js` private
- Use optional chaining in `askConfig` so doesn't need to set default value for `defaultConfig` argument