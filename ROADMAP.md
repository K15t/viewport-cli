# Roadmap

## Misc

- Implement config switch
- Make file helpers async

## Frameworks

- implement way how frameworks can be included in theme, e.g. src/styles/frameworks and src/scripts/frameworks folders or in entirely seperate folder outside of src
- exclude frameworks folders from build pipeline, e.g. merging, only in upload pipeline
- ? Implement framework chooser in `viewport create` for most popular choices, e.g. jQuery, Foundation, MotionUI
- ? Make chooser even modular so can add own frameworks
- ? include Framework handling in gulp only if frameworks where chosen, e.g. Sass handling

## NPM package

- make `viewport-tools` the only package needed instead of the theme being a package itself
- have gulp, gulp-viewport, etc. as dependencies of `viewport-tools` on installation, themes are just folder with source code and `gulpfile.js`, no unnecessary `node_modules` folder for every theme, no `npm install` for every theme
- unfortunately gulp isn't designed to work globally if installed globally but searches for a local install to hand control over to, might need different task manager

## Build process in `gulpfile.js`

- Add CSS minification pipeline, see [CSS Minification Benchmark](http://goalsmashers.github.io/css-minification-benchmark/)
- ? Integrate sourcemaps ?
- Integrate JS transpiler like Babel
- Integrate TypeScript
- ? Integrate image compression
- Add more error handling and console output
- ? Pipe .css before SASS compiler or after ?