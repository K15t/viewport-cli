# Changelog

## 1.0.0

Version 1.0.0 of `viewport-tools` comes with long awaited improvements that make local theme development for Scroll Viewport again possible with the newest versions of Node. It relies on the new `viewport-sync` tools which replace `gulp-viewport`.

### Summary

- `viewport-tools` was rewritten from scratch to be much more stable, reliable and modular.

- Theme templates aren't hardcoded anymore and then sourced from the internet on theme creation. Instead they are sourced dynamically from `themes` folder. User can add own theme templates or customize existing ones.

- The build workflow was rewritten from scratch to be much more robust and independent of any frameworks. It uses contemporary dependencies, notably gulp 4 which means it works again with all recent Node version until v13 at the time of writing. The available tasks were simplified and the whole workflow was optimised to be faster.

### `viewport-tools`

- Rewritten from scratch
    - with ES6 syntax, strict mode, `const` variables
    - much cleaner code, split into modules 
- All functions are async and use promises
- Templates are not hardcoded into `viewport-tools` anymore and downloaded on every theme creation, but instead taken from local `themes` folder
    - much faster, no internet connection needed on every theme creation
    - user isn't forced to make binary choice, instead free to use what he wants
    - blank default template
    - user can add their custom templates by adding into `themes` folder, even create their own, or download from anyone that offers (e.g. K15t)
    - user can even customise default template
    - also package can be locked using package-lock, if it works once it will continue to work, can't break because remote repo changes some file
- human-readable `.viewportrc` in home directory was replaced by machine-readable `vpconfig.json`
    - difficult to parse and modify human-readable file, JSON is much easier
    - much less error prone to edit a JSON instead of a file that could look arbitrarily
    - doesn't need to edit by hand since implemented modification interface directly in `viewport-tools`
    - the new `viewport-sync` makes use of it, loading is easier, needs to pass it only `envName` when instantiating, i.e. no hardcoded config, e.g. `confluenceBaseUrl` was left hardcoded in old "Basic" template, needed to be changed in every new theme created from it because it was downloaded from the Github repo each time.
    - on theme creation fills out `gulpfile.js` with selected config automatically, no need to manually edit it anymore
    - added `scope` property
    - removed `targetPath` and `sourcePath` in favor of providing them as arguments to `upload()` method of `viewport-sync` directly
- Nicer visuals

### "default" theme template

- single default theme template
- renamed folder structure, more descriptive and general
- provided newer `.gitignore`

#### `gulpfile.js`

- rewritten from scratch, ES6 syntax, cleaner code
- uses gulp 4, doesn't break anymore with recent versions of Node
    - uses `parallel()` and `series()` methods instead of [] syntax, faster with parallel processing when possible
    - uses native exports object to register tasks instead of `task()` method
- remove / replace old dependencies, update existing ones
    - use del instead of gulp-clean
    - use gulp-terser instead of gulp-clean
    - remove bower
    - remove LESS in favour of SASS
- improved tasks
    - public tasks were reduced to "clean", "build", and "watch", all smaller tasks are kept private
    - default task for showing help is added
    - makes only one upload at end of complete build instead of with each subtask, much more performant since bottleneck is VPRT not local processing (for watch still uploads only the single file type change, e.g. only styles)
- improved build pipelines
    - independent of any choice of frameworks, not hardcoded anymore, are sourced like any other file in source directory
    - handles .css files too instead of only .sass files
    - script files are transpiled using `gulp-babel`, concated, minified using `gulp-terser` (before did not concat script files)
    - style files are compiled using `gulp-sass`, concated, minified using `gulp-clean-css`, and get autoprefixed
    - sourcemaps are added to both script and style files
- autoprefixer default browserlist is used instead of hardcoded `browser` array (`ie >= 9`), i.e. "> 0.5%, last 2 versions, Firefox ESR, not dead"
- environment config is not hardcoded anymore (see `vpconfig.json` above)