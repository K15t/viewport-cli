# Changelog

## 1.0.0

K15t is proud to announce version 1.0.0 of `viewport-tools` with long awaited improvements that make professional local theme development for Scroll Viewport possible.

### Overview

- Theme templates aren't hardcoded in viewport-tools anymore. This has lots of benefits. Theme creation and build process aren't dependent on a binary choice anymore. Instead the default theme is completely lean. This means you can customise it to your liking with any frameworks you like instead of relying on hardcoded jQuery and Foundation. We still offer theme templates to help you get started but don't hardcode them in `viewport-tools` anymore. You are completely free if you want to install theme templates and which to install, and can even modify the templates to make your own. Nothing is hardcoded anymore. You can find our theme templates on [insert URL here]() along with installation instructions.

- `viewport-tools` doesn't source the theme templates from our repo anymore. With the bare theme template it's not necessary. The two main benefits are, that creating a theme will work without internet connection and is much faster. An additional benefit is that the whole package now is locked, it it works once you can keep your setup and be sure that it will work forever.

- The build workflow was rewritten from scratch to be much more robust and independent. It uses contemporary dependencies, notably it uses gulp 4 which means it works again with all recent versions of Node until v13 at the time of writing. It is made independent of any framework. Also the exposed tasks were simplified and the whole workflow was optimised to be faster.

### Detailed list

- clean up `.gitignore`
- rewrite `.gulpfile.js`, more see below
-

#### `gulpfile.js`


- Remove support for LESS in favour of SASS
- Handles .css files too instead of only .sass files
- Renamed the folder structure to reflect use case better
- autoprefixer default browserlist is used instead of hardcoded `browser` array, i.e. removed the old `ie >= 9` choice
- Framework files are not hardcoded anymore but sourced dynamically from the source directory like any other file. The build process is independent of the choice of framework. Developer can now choose if he sticks with jQuery or not.
- The BROWSERSYNC_URL is not hardcoded anymore as it was for the theme template "Basic", which needed to be manually changed on every new theme creation
-

- Update old dependencies
  - Use del instead of gulp-clean
  - Use gulp-uglify instead of gulp-clean
  - Use gulp-dart-sass instead of gulp-sass which depends on C compiler
  - Remove bower


- Uses parallel() and series() methods instead of [] syntax, more performant with parallel processing
- Uses native exports object to register tasks instead of task() method
- Public tasks were reduced to "clean", "build", and "watch", all smaller tasks are kept private, also default task for showing help is added
- Makes only one upload at end of complete build instead of with each subtask, much more performant since bottleneck is VPRT not local processing, don't worry for watch it still uploads only the single file type change, e.g. only CSS
