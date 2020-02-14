# Viewport-tools ToDo

## Developer ToDo

- Clean gulpfile.js from ToDo comments
- Go through code, add comments, write Readme

## Build process

- Implement more build processes into `gulpfile.js`
- Add CSS minification pipeline, see [CSS Minification Benchmark](http://goalsmashers.github.io/css-minification-benchmark/)
- Integrate sourcemaps ?
- Integrate JS transpiler like Babel
- Integrate Typescript
- Integrate image compression
- Add more error handling and console output

- ?? Pipe .css before SASS compiler or after ??
- ?? Want concat ?? Old versions doesn't have it ??

## Frameworks

- Implement framework chooser in `viewport create` for most popular choices, e.g. jQuery, Foundation, MotionUI
- Make chooser even modular so can add own frameworks
- ? include Framework handling in gulp only if frameworks where chosen, e.g. Sass handling
- outsource JS frameworks to src/styles/frameworks folder
- CSS frameworks into src/sripts/frameworks/

## Target environment

- Implement target environment switching in viewport-tools to change TE of current project
- Make URL source automatically from .viewportrc

## Theme templates

- Implement built-in theme templates, can choose on theme creation
- Create directory in viewport-tools where can download theme templates too
- On theme creation can choose template

## Rethink package structure

Idea:
- make `viewport-tools` the only package, non-dev-dependencies on gulp, gulp-viewport, etc. on installation, themes are just folder with source code and `gulpfile.js`
- unfortunately gulp isn't designed to work globally if installed globally but searches for a local install to hand control to
