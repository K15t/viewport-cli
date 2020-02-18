# Readme

(Note: The commands and file paths below are written for UNIX but the packages themselves should run on Windows as well.)

## Introduction

The `viewport-tools` package is a simple command line tool to set up local theme development for Scroll Viewport. Creating themes locally enables you to work in your favorite IDE instead of the built-in Theme Editor of Scroll Viewport in the browser. `viewport-tools` sets up the powerful task manager `gulp` to take care of building and uploading your theme to Scroll Viewport. It also comes with customizable theme templates that you can choose from to get you started quickly.


## Getting started

### Installation

0. Have Confluence Server up and running with the Scroll Viewport add-on (see [insert URL](#)).
1. Install Node.js, `npm` and `npx`. We recommend using `nvm` to install Node.
2. Install `viewport-tools` globally
```bash
npm install -g viewport-tools
```

### Usage

<!-- ToDo: Make clearer.   -->
1\. Add a target environment that matches your configuration of Scroll Viewport.
```javascript
viewport config
```
2\. In your desired working directory create a new theme. You need to provide basic information and can choose from installed theme templates. The tool will guide you through it.
```javascript
cd <your-working-directory>
viewport create
```

3\. From within your theme folder install the dependencies like `gulp`.
```javascript
cd <your-theme-name>
npm install
```

4\. Write some source code. (Make sure to put the files in their proper directories for the build workflow to work properly).

5\. From within your theme folder build the project and upload it to Scroll Viewport using `gulp` and the tasks defined by your theme template. The "default" theme template provides already the following tasks:
- Builds and uploads the theme to Scroll Viewport.
 ```javascript
 npx gulp build
 ```
- Continuously builds and uploads the theme to Scroll Viewport as soon as you make changes. If `viewport-tools` was properly configured, it opens the browser and automatically refreshes. Stop it using <kbd>CTRL</kbd> + <kbd>C</kbd>.
 ```javascript
 npx gulp watch
 ```
- Resets the theme. This normally shouldn't be needed as it is part of the build workflow already.
```javascript
npx gulp clean
```


## Documentation

### Target environments

A target environment contains data like the URL of your Confluence Server instance, and the username and password. It is used in the build workflow by `gulp-viewport` to access Scroll Viewport to create, upload or clean your theme. Target environments are saved as objects in the hidden file `.vpconfig.json` in your home directory. You can add or edit target environments using `viewport config`.

When creating a new theme, `viewport-tools` asks you to choose a target environment for your theme. The name of this target environment is then filled out in the `gulpfile.js` of your theme and `gulp-viewport` looks for a target environment with this name in the `.vpconfig.json`.

**Beware:** The `vpconfig.json` is saved unencrypted and includes the username and password of your Confluence Server instance. Therefore you should use these tools only for development.

### Theme templates

When creating a new theme `viewport-tools` offers to select from the available theme templates. By default the "default" theme template is selected which comes with a predefined folder structure and build workflow. It should fit most basic needs and is intended to get your started quickly.

Theme templates are simply folders within in the `templates` folder in `viewport-tools`. Therefore you can even create your own theme templates and modify existing ones. For example, you could copy the default template and add some JavaScript and CSS frameworks. A theme template must contain a `package.json` and a `gulpfile.js` which are used when creating a new theme from that template. The `package.json` is filled with the theme data you provide on theme creation like name, version and description. The `gulpfile.js` is filled with the name of a target environment and your theme.

### "Default" theme template

#### Folder structure

The default theme comes with the following folder structure. A `src` folder is used for all source code. Each file type should go in its corresponding subdirectory.

- `fonts` for font files
- `images` for image files
- `markups` for markup files, e.g. `.html`, `.vm`
- `scripts` for script files, e.g. `.js`, `.ts`
- `styles` for style files, e.g. `.css`, `.sass`, `.scss`

The build workflow then creates a `build` folder with same subfolders.

Note: Changing the folder structure means the build workflow in the `gulpfile.js` needs to be adapted as well.

#### Build workflow

The task manager `gulp` is used to automate the build workflow of a theme. The workflow is defined in the `gulpfile.js`. The predefined build workflow should work for most people, but you can customise it if you want. By default, script files are transpiled and made backwards compatible for older browsers (Babel), merged into one file, minified, and style files are compiled (Sass), merged into one file, minified, and made backwards compatible for older browsers (autoprefixer). Also sourcemaps are generated for both.

Note: Files need to be placed in their proper directories to be handled by the build workflow, e.g. any `.js` files must go inside `src/scripts/`. Subdirectories are allowed.

##### Tasks

Public tasks can be run from anywhere within the theme folder using `npx gulp <task-name>`.

| Task name | Subtasks                                                       | Description                                                                 |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| clean     | -                                                              | deletes build directory locally and in Scroll Viewport                                 |
| build     | create, clean, fonts, images, scripts, styles, markups, upload | builds theme and uploads it to Scroll Viewport                                         |
| watch     | build, [respective task for changed file, upload]              | builds theme and uploads it to Scroll Viewport on every file change, refreshes browser |


##### Subtasks

Private tasks are used internally by the public tasks and can not be run from command line. Most of the subtasks process a single file type from the source directory and output it to the build directory. The following table shows the subtasks along with the default source directories, build directories and file types handled.

| Task name | Description                                                                           | File types         | Source directory            | Build directory |
| --------- | ------------------------------------------------------------------------------------- | ------------------ | --------------------------- | --------------- |
| create    | creates theme in Scroll Viewport                                                                 | -                  | -                           | -               |
| fonts     | -                                                                                     | any                | src/fonts/                  | build/fonts/    |
| images    | -                                                                                     | any                | src/images/                 | build/images/   |
| scripts   | creates sourcemap, transpiles and adds backward compatibility, concats to single `main.js`, minifies | .js                | src/scripts/                | build/          |
| styles    | creates sourcemap, compiles SASS, concats to single `main.css`, minifies, adds backward compatibility | .css, .sass, .scss | src/styles/                 | build/          |
| markups   | -                                                                                     | .html, .vm         | src/markups/                | build/markups/  |
| upload    | uploads file type or entire build dir to Scroll Viewport                                         | any                | build/ or build/[file type] | -               |

#### Custom build workflow

The build above build workflow should work for most people. But nothing stops you from adapting it to your needs. For example, you could restricting images to only handle .jpeg and other image file types instead of all file types, or add a compression pipe to the markup files pipeline.

To customise the build workflow for *all* new themes, modify the `gulpfile.js` in the template. Don't change the declaration of the `themeData` variable, because this is used by the `viewport-tools` to replace the content programmatically when creating a new theme. ⚠️

#### Misc

- A `.gitignore` file is included to ignore any OS files as well as Node related files like the `node_modules` folder in case you use git to version control your theme (which you should!). This also means if clone a theme you need to run `npm install` again to install all dependencies.

- Beware of using strict mode in script files. Since they are merged to one file, the script might behave differently than expected. If the top file has a strict mode directive, the whole file is executed in strict mode, if not then the whole file is executed in sloppy mode. If any part of your code relies on strict mode (or sloppy mode), e.g. `this` being undefined in a function, it will break. ⚠️

- Make sure to include the `main.css` and `main.js` files in your `.html` file for the styles and scripts to get applied to your web page.

## Notes

- A theme is actually a NPM package. Though it is not designed to be published. The `package.json` is only intended to load the dependencies for `gulp`. Having a separate `node_modules` subdirectory with the same dependencies for every theme created is certainly not the most space efficient way, but `gulp` is not designed to work globally and will only work if contained in the theme directory. If you want to exchange themes between different machines, it might even benefit you that each theme contains all of its dependencies and can run on the other machine without needing to set up anything, except having Node.js installed. Also the `.gitignore` file already takes care of not backing up the dependencies to your Git repository.

- The dependencies like `gulp`, `gulp-viewport`, etc. of the theme package are installed as `devDependencies` which means they won't be installed if the Node environment is set to `production`. (Also they wouldn't be included if the theme package were to be published, which doesn't matter, since it isn't intended to anyways.). If you don't know what it means then this is not a problem, since Node is by default in `development` mode.

## Roadmap

- see [Roadmap](Roadmap.md)
