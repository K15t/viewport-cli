# Readme

(Note: The commands and file paths below are written for UNIX but the packages themselves should run on Windows as well.)

## Introduction

The `viewport-tools` package is a simple command line tool to set up a local theme development environment for Scroll Viewport. Creating themes locally enables you to develop themes for Scroll Viewport in your favorite IDE instead of Scroll Viewport's built-in Theme Editor in the browser. `viewport-tools` comes with customizable theme templates that use the powerful task manager `gulp` to take care of building and uploading your theme to Scroll Viewport. It is intended to get you started quickly.


## Getting started

### Installation

1. Install Confluence Server and the Scroll Viewport add-on (see [insert URL](#)).
1. Install Node.js, `npm` and `npx`. We recommend using `nvm` to install Node.
1. Install `viewport-tools` _globally_ to be able to run in from everywhere
```bash
npm install -g viewport-tools
```

### Usage

The tool will guide you through all the steps. Each step is covered in more detail in the documentation below.

<!-- ToDo: Make clearer.   -->
1\. Add a target environment that matches your configuration of Scroll Viewport. You need to provide information like URL of your Confluence Server instance, username and password.
```javascript
viewport config
```
2\. Create a new theme in your desired working directory. You need to provide basic information like name, version, description and choose a target environment. You can select between the installed theme templates. By default `viewport-tools` contains only the "default" theme template.
```javascript
cd <your-working-directory>
viewport create
```

3\. From within your theme folder, install the dependencies for `gulp`.
```javascript
cd <your-theme-name>
npm install
```

4\. Write some source code. (Make sure to put the files in their proper directories for the build workflow to work properly. Also make sure to include the `main.css` and `main.js` files in your markup file for the styles and scripts to get applied to your web page).

5\. From within your newly created theme folder, build the project and upload it to Scroll Viewport using the `gulp` tasks defined by the chosen theme template. The "default" theme template provides the following tasks:
- Builds and uploads the theme to Scroll Viewport.
 ```javascript
 npx gulp build
 ```
- Continuously builds and uploads the theme to Scroll Viewport as soon as you make changes. If `viewport-tools` was properly configured, it opens the browser and automatically refreshes the site, mirrors the site on `http://localhost:3000` and should automatically open. Stop it using <kbd>CTRL</kbd> + <kbd>C</kbd>.
 ```javascript
 npx gulp watch
 ```
- Resets the theme in Scroll Viewport. This normally shouldn't be needed as it is part of the build workflow already.
```javascript
npx gulp clean
```


## Documentation

### Target environments

A target environment contains data like the URL of your Confluence Server instance, and the username and password. When creating a new theme, `viewport-tools` asks you to choose one of the available target environments for your theme. In the build workflow, this is then used by `viewport-sync` to communicate with Scroll Viewport to create, upload or clean your theme. You can add or edit target environments using `viewport config`.

Target environments are saved as objects in the hidden file `.vpconfig.json` in your home directory. When creating a theme, the name of the selected target environment is filled out in the `gulpfile.js`. Upon running the build workflow, `viewport-sync` is instantiated with the name of the target environment and looks for a target environment with this name in the `.vpconfig.json`. (Read more below how it transfers the name of the target environment into the `gulpfile.js` and what you should bear in mind before modifying it.)

**Beware:** The `vpconfig.json` is saved unencrypted and includes the username and password of your Confluence Server instance. Therefore you should use these tools only for development.

### Theme templates

When creating a new theme, `viewport-tools` offers to select from the available theme templates. By default, the "default" theme template is selected which comes with a predefined folder structure and average build workflow. It is intended to get you started quickly and can always be customized later.

### "Default" theme template

#### Folder structure

The "default" theme comes with the following folder structure. The `src` folder is intended for all source code. Each file type should go in its corresponding subdirectory as follows:

- `fonts` for font files
- `images` for image files
- `markups` for markup files, e.g. `.html`, `.vm`
- `scripts` for script files, e.g. `.js`, `.ts`
- `styles` for style files, e.g. `.css`, `.sass`, `.scss`

The build workflow then creates a `build` folder with the same subfolders (provided the source folders are non-empty).

A `.gitignore` file is included to ignore any OS files as well as Node related files like the `node_modules` folder, in case you use git to version control your theme (which you should!). This also means if you clone a theme you need to run `npm install` again to install all dependencies.

Note: Changing the folder structure means the build workflow in the `gulpfile.js` needs to be adapted as well! ⚠️

#### Build workflow

The task manager `gulp` is used to automate the build workflow of a theme. The workflow is defined in the `gulpfile.js`. The "default" theme comes with a predefined build workflow that. By default, script files are transpiled and made backwards compatible for older browsers (Babel), merged into one file and minified. Style files are compiled (Sass), merged into one file, minified, and made backwards compatible for older browsers (autoprefixer). Sourcemaps are generated for both. All these tools are used with their default settings. Currently, frameworks are not handled separately from any other file placed in the source directory. It might make sense to exclude them from the merging pipeline for example. This is something on the Roadmap already.

Note: Files need to be placed in their proper directories to be handled by the build workflow, e.g. any `.js` files must go inside `src/scripts/`. Subdirectories are allowed.

##### Tasks

Public tasks can be run from anywhere within the theme folder using `npx gulp <task-name>`. The following table shows the available tasks along with a description and the order of subtasks.

| Task name | Subtasks                                                       | Description                                                                 |
| --------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| clean     | -                                                              | deletes build directory locally and in Scroll Viewport                                 |
| build     | create, clean, fonts, images, scripts, styles, markups, upload | builds theme and uploads it to Scroll Viewport                                         |
| watch     | build, [respective task for changed file], [respective upload for changed file]              | builds theme and uploads it to Scroll Viewport on every file change, refreshes browser |

##### Subtasks

Private tasks are used internally by the public tasks and can not be run from the command line. Most of the subtasks process a single file type from the source directory and output it to the build directory. The following table shows the subtasks along with the default source directories, build directories and file types handled.

| Task name | Description                                                                           | File types         | Source directory            | Build directory |
| --------- | ------------------------------------------------------------------------------------- | ------------------ | --------------------------- | --------------- |
| create    | creates theme in Scroll Viewport (if it doesn't exist yet)                            | -                  | -                           | -               |
| fonts     | -                                                                                     | any                | src/fonts/                  | build/fonts/    |
| images    | -                                                                                     | any                | src/images/                 | build/images/   |
| scripts   | creates sourcemap, transpiles and adds backward compatibility (Babel), concats to single `main.js`, minifies | .js                | src/scripts/                | build/          |
| styles    | creates sourcemap, preprocesses (Sass), concats to single `main.css`, minifies, adds backward compatibility | .css, .sass, .scss | src/styles/                 | build/          |
| markups   | -                                                                                     | .html, .vm         | src/markups/                | build/markups/  |
| upload    | uploads file type or entire build dir to Scroll Viewport                              | any                | build/ or build/[file type] | -               |

Note: The `main.css` and `main.js` files must be referenced in the markup file for styles and scripts to get applied to the web page.

Note 2: Beware of using strict mode in script files. Since they are merged to one file, the script might behave differently than expected. If the top most file happens to have a strict mode directive, the whole file is executed in strict mode. If not, then the whole file is executed in sloppy mode. If any part of your code relies on strict mode (or equally sloppy mode), e.g. `this` being undefined in a function, your script will behave differently than intended. ⚠️

### Custom theme templates

Theme templates are simply folders within in the `templates` folder in the `viewport-tools` installation directory. You can create your own theme templates just by creating a new folder or modifying an existing one. For example, you could put in the resources you need for every of your themes like logos and icons, or the JavaScript and CSS framework you use.

Also you can customise the build workflow by modifying the `gulpfile.js`. For example, you could add a compression pipe to the images pipeline, or a linter to the scripts pipeline. If you want to modify which file types and/or directories are used, edit the globs and directories inside the constructor of the `Paths` class. These values are used to compute the files and directories dynamically in every task. For example, you could restrict image file types to only be of type `.jpg` by modifying the `imagesGlob` to `[**/*.jpg]`. The globs are written relative to their respective directory, but computed relative to the CWD of the script. Be aware: also the glob passed to `upload()` is taken relative to the CDW, i.e. just '**' would upload everything including your `node_modules` folder ⚠️

A theme template must contain a `package.json` and a `gulpfile.js`. These get filled with the information you provide when creating a new theme from that template. The `package.json` is filled with the theme data like name, version and description. The `gulpfile.js` is filled with the name of the selected target environment and the theme name. It's probably best to duplicate the "default" theme template and start to modify that. Make sure to _not_ change the declaration of the `themeData` variable in the `gulpfile.js` because this is where `viewport-tools` fills in the theme name and the name of the selected target environment. ⚠️


## Notes

- A theme is actually a NPM package since it contains a `package.json`. Though it is not designed to be published. NPM is only used to load the dependencies for `gulp`. Having a separate `node_modules` subdirectory with the same dependencies for every theme created is certainly not the most space efficient way, but `gulp` is not designed to work globally and will only work if contained in the theme directory. If you want to exchange themes between different machines, it might even benefit you that each theme contains all of its dependencies and can run on the other machine without needing to set up anything, except having Node.js and npm installed. Also the `.gitignore` file already takes care of not backing up the dependencies to your Git repository.

- The dependencies like `gulp`, `viewport-sync`, etc. of the theme package are installed as `devDependencies` which means they won't be installed if the Node environment is set to `production`. (Also they wouldn't be included if the theme package were to be published, which it isn't intended to anyways.). For most people this shouldn't be a problem since Node is by default in `development` mode.

## Roadmap

- see [Roadmap](Roadmap.md)
