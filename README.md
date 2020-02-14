# README

## Introduction

The `viewport-tools` package is a simple command line tool that enables you to develop themes for VPRT locally instead of in the built-in Theme Editor in the browser. It creates a theme directory and sets up the task manager `gulp` along with a predefined build process such that files can easily be uploaded to VPRT.

## Getting started

### Installation

0. Have Confluence Server up and running with the Scroll Viewport add-on (see ?).
1. Install Node.js, npm, npx ?
2. Install viewport-tools globally
```bash
npm install -g viewport-tools
```

### Usage

1. Create a theme using `viewport create` in your desired working directory. Provide information and make sure the Confluence Server URL matches your installation
2. Write some code 👩‍💻 Make sure to put the files in their proper directories (see documentation below).
2. Run `npx gulp build` from within your theme directory to build the project. If you at some point want to reset your VPRT theme run `npx gulp clean`. This normally shouldn't be needed as it is part of the build workflow already.
- use `watch` to automatically upload changes, stop using <kbd>CTRL</kbd> + <kbd>C</kbd>, browser opens if BROWSERSYNC_URL is configured


## Documentation

### `.viewportrc`

- `.viewportrc` contains URL of your Confluence Server instance
- can contain different "target environments" that you can switch between using ?
- needed for upload of files, browser sync, ?

### Folder structure

The `viewport-tools` script sets up the following folder structure for a new theme. It creates a `src` folder for all files with subfolders for specific file types:
- `fonts` for font files
- `images` for image files
- `markups` for markup files, e.g. `.html`, `.vm`
- `scripts` for script files, e.g. `.js`, `.ts`
- `styles` for style files, e.g. `.css`, `.sass`, `.scss`

The build workflow then creates a `build` folder with same subfolders.

### Build workflow

The task manager `gulp` is used to automate the build workflow of a theme. The predefined build workflow should work for most people but can always be customised, more on that later. By default, style and script files are compiled (SASS, TypeScript [ToDo]) and merged to one file and made backwards compatible for older browsers. Images are compressed as well [ToDo]. See the following tables for detailed descriptions.

Note: Files need to be placed in their proper directories to be handled by the build workflow, e.g. any `.js` files must go inside `src/scripts/`. Any subdirectories are allowed. To change the folder structure needs to modify `.gulpfile.js` and `index.js` of `viewport-tools`.

#### Tasks

Public tasks can be run from anywhere within the theme folder using `npx gulp <task-name>`.

| Task name | Subtasks                                                       | Description                                                                 |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| clean     | -                                                              | deletes build directory locally and in VPRT                                 |
| build     | create, clean, fonts, images, scripts, styles, markups, upload | builds theme and uploads it to VPRT                                         |
| watch     | build, [respective task for changed file, upload]              | builds theme and uploads it to VPRT on every file change, refreshes browser |


#### Subtasks

Private tasks are used internally by the public tasks and can not be run from command line. Most of the subtasks process a single file type from the source directory and output it to the build directory. The following table shows the subtasks along with the default source directories, build directories and file types. You could improve it by restricting images only to .jpeg file types, adding compression to markup files etc.

| Task name | Description                                                                           | File types         | Source directory            | Build directory |
| --------- | ------------------------------------------------------------------------------------- | ------------------ | --------------------------- | --------------- |
| create    | creates theme in VPRT                                                                 | -                  | -                           | -               |
| fonts     | -                                                                                     | any                | src/fonts/                  | build/fonts/    |
| images    | -                                                                                     | any                | src/images/                 | build/images/   |
| scripts   | concats to single main.js, uglifies                                                   | .js                | src/scripts/                | build/          |
| styles    | compiles .scss and .sass, concats with .css to single main.css, adds browser prefixes | .css, .sass, .scss | src/styles/                 | build/          |
| markups   | -                                                                                     | .html, .vm         | src/markups/                | build/markups/  |
| upload    | uploads file type or entire build dir to VPRT                                         | any                | build/ or build/[file type] | -               |

#### Custom build workflow

To customise the build workflow for all new themes, modify the `gulpfile.js` in the `viewport-tools` directory. For already existing themes you need to modify the `gulpfile.js` in the respective theme directory. If you make changes regarding the folder structure, make sure to also change it in the `viewport-tools` script which creates those folders for new themes as well as the `.gitignore` file incase you use git (which you should).

## Notes

- The workflow dependencies like gulp, gulp-viewport, etc. are installed as devDependencies in theme package. They won't be installed if Node environment is set to production. This is most of the time the right choice. Don't worry about it if it doesn't tell you anything.

- Beware of using strict mode in script files. Since they are merged to one file, the script might behave differently than expected. If the top file has a strict mode directive, the whole file is executed in strict mode, if not then the whole file is executed in sloppy mode. If any part of your code relies on strict mode (or sloppy mode), e.g. `this` being undefined in a function, it will break. ⚠️

- The browsers handled by autoprefixer can be modified by adding a browserlist to `package.json`, not by supplying arguments to autoprefixer in the pipe in `gulpfile.js`.

## Roadmap

- see [Roadmap](Roadmap.md)
