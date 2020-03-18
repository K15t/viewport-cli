# Readme

## Introduction

The *viewport-cli* package is a command line tool to set up a local theme development environment for Scroll Viewport. Creating custom themes for Scroll Viewport locally enables you to develop in your favorite IDE instead of Scroll Viewport's built-in Theme Editor in the browser. The *viewport-cli* provide customizable theme templates that use the powerful task manager *gulp* to take care of building and uploading your theme to Scroll Viewport. Under the hood, the build process is already configured to use *viewport-uploader* to communicate with Scroll Viewport, which otherwise you would have needed to set up yourself. The provided build process should fit most users needs, while still retaining full customization in case you want to change anything later. For example, we built the theme of [k15t.com](https://www.k15t.com/) from the "default" template of *viewport-cli*.

Note: *viewport-cli* was formerly known as *viewport-tools*. Read more about the name change in the [CHANGELOG](CHANGELOG.md).

## Getting started

### Installation

1. Install Confluence Server and the Scroll Viewport add-on (see [Help Center - Scroll Viewport](https://help.k15t.com/scroll-viewport)).
1. Install Node.js, `npm` and `npx`. We recommend using `nvm` to install Node.
1. Install viewport-cli _globally_ to be able to run in from everywhere.
```bash
npm install -g @k15t/viewport-cli
```

### Usage

The tool will guide you through all the steps. See the documentation below for more details what happens in each step.

Note: The commands and file paths below are written for UNIX but the packages should run on Windows as well.

1\. Add a target environment that matches your configuration of Scroll Viewport. You need to provide information like URL of your Confluence Server instance, username and password.
```javascript
viewport config
```
2\. Create a new theme in your desired working directory. You need to provide basic information like name, version, description and choose a target environment. You can select between the installed theme templates. By default *viewport-cli* contains only the "default" theme template.
```javascript
cd <your-working-directory>
viewport create
```

3\. From within your theme folder, install the dependencies for *gulp*.
```javascript
cd <your-theme-name>
npm install
```

4\. Write some source code. (Make sure to put the files in their proper directories for the build process to work properly. Also make sure to include the `main.css` and `main.js` files in your markup file for the styles and scripts to get applied to your web page).

5\. From within your newly created theme folder, build the project and upload it to Scroll Viewport using the *gulp* tasks defined by the chosen theme template. The "default" theme template provides the following tasks:

- Builds and uploads the theme to Scroll Viewport.

 ```javascript
 npx gulp build
 ```
- Continuously builds and uploads the theme to Scroll Viewport as soon as you make changes. Your browser opens a new tab that mirrors the Viewport URL and automatically refreshes as soon as changes were uploaded. Stop watch using <kbd>CTRL</kbd> + <kbd>C</kbd>.

 ```javascript
 npx gulp watch
 ```
- Resets the theme in Scroll Viewport. This normally shouldn't be needed as it is part of the build process already.

```javascript
npx gulp clean
```


## Documentation

### Target environments

A target environment contains the URL of your Confluence Server instance, the username and password to authenticate with it, as well as the space key [^1] of the Viewport. Target environments are saved as objects in the hidden file `.vpconfig.json` in your home directory. You can add or edit target environments using `viewport config`, so you don't need to edit the `.vpconfig.json` manually. For more information on the `.vpconfig.json`, see the documentation of [viewport-uploader][1].

When creating a new theme, *viewport-cli* asks you to choose one of the available target environments in the `.vpconfig.json` for your theme. The name of the selected target environment is then filled out in the `gulpfile.js` of your new theme. When running the build process, *viewport-uploader* will then look in the `.vpconfig.json` for a target environment with that name and use the data to communicate with Scroll Viewport to create, upload or clean your theme. Read more below what you should keep in mind before modifying the `gulpfile.js` of your theme. 

**Beware:** The `vpconfig.json` is saved unencrypted and includes the username and password of your Confluence Server instance. Therefore you should use these tools only for development.

[^1]: **Beware**: Scroll Viewport treats space keys case-sensitive even though for Confluence they are case-insensitive. If you provide the wrong case, the upload will fail without a helpful error message. ⚠️

### Theme templates

When creating a new theme, *viewport-cli* offers to select from the available theme templates. By default, the "default" theme template is selected which comes with an average folder structure and build process. It is intended to get you started quickly and can always be customized later.

### "Default" theme template

#### Folder structure

The "default" theme comes with the following folder structure. The `src` folder is intended for all source code. Each file type should go in its corresponding subdirectory as follows:

- `fonts` for font files
- `images` for image files
- `markups` for markup files, e.g. `.vm`
- `scripts` for script files, e.g. `.js`, `.ts`
- `styles` for style files, e.g. `.css`, `.sass`, `.scss`

The build process then creates a `build` folder with the same subfolders (provided the source folders are non-empty).

A `.gitignore` file is included to ignore the `build` folder, any OS files, as well as Node related files like the `node_modules` folder, in case you use Git to version control your theme (which you should!). This also means if you clone a theme you need to run `npm install` again to install all dependencies.

Note: Changing the folder structure means the build process in the `gulpfile.js` needs to be adapted as well! ⚠️

#### Build process

The task manager *gulp* is used to automate the build process of a theme. The build process is defined in the `gulpfile.js`. The "default" theme comes with an average build process that should get you started quickly. By default, script files are transpiled and made backwards compatible for older browsers (Babel), merged into one file and minified. Style files are compiled (Sass), merged into one file, minified, and made backwards compatible for older browsers (autoprefixer). Sourcemaps are generated for both. All these tools are used with their default settings which should work for most people. 

Note: Files need to be placed in their proper directories to be handled by the build process, e.g. any `.js` files must go inside `src/scripts/`. Subdirectories are allowed.

Note 2: Since this theme template should be as lean as possible, there is no support for frameworks built into the build process. If you want to use frameworks, you can install the packages via NPM and include the relevant files in the `styles` or `scripts` tasks. For SASS frameworks, this would be in the `includePaths` argument to the `sass` call. For JS frameworks you can source them in like any other file, but you might want to use the minified files in a separate pipe after all the merging and sourcemaps pipes, so you can already load them asynchronously in the head of your page during page load.

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
| markups   | -                                                                                     | .vm         | src/markups/                | build/markups/  |
| upload    | uploads file type or entire build dir to Scroll Viewport                              | any                | build/ or build/[file type] | -               |

By default, `upload()` takes the files and folders inside the `build` directory and uploads them to the root of the theme in Scroll Viewport, i.e. `<confluenceBaseUrl>/<spaceKey>/<content-of-build-dir-goes-here>`. If you want to add or omit a subdirectory, you can change the `targetPath` and `sourcePath` options as seen in the [viewport-uploader][1] documentation.

Note: The `main.css` and `main.js` files must be referenced in the markup file for styles and scripts to get applied to the web page.

Note 2: Babel automatically enables strict mode in the `main.js` so you don't need to use it in any file. If you disable Babel, still be aware of using strict mode in script files. Since they are merged to one file, the script might behave differently than expected. If the top most file happens to have a strict mode directive, the whole file is executed in strict mode. If not, then the whole file is executed in sloppy mode. If any part of your code relies on strict mode (or equally sloppy mode), your script will behave differently than intended, e.g. `this` being undefined in a function. ⚠️

### Custom theme templates

Theme templates are simply folders within in the `templates` folder in the *viewport-cli* installation directory. You can create your own theme templates just by creating a new folder or modifying an existing one. For example, you could put in the resources you need for every of your themes like logos and icons.

Also you can customise the build process by modifying the `gulpfile.js`. For example, you could add a compression pipe to the images pipeline, or a linter to the scripts pipeline. Or you might include the JavaScript and CSS framework you use for every of your themes. You can even conditionally execute certain pipes using packages like `gulp-if`, for example based on if the `NOVE_ENV` environment variable is set to `production` like it might be in your CD/CI pipeline. If you want to modify which file types and/or directories are used, edit the globs and directories inside the constructor of the `Paths` class. These values are used to compute the files and directories dynamically in every task. For example, you could restrict image file types to only be of type `.jpg` by modifying the `imagesGlob` to `[**/*.jpg]`. The globs are written relative to their respective directory defined in the [Folder structure](#), but computed relative to the CWD of the script. Be aware: The glob passed to `upload()` must be written relative to the CWD, i.e. just '**' would upload everything in your theme folder including the whole `node_modules` folder ⚠️

A theme template _must_ contain a `package.json` and a `gulpfile.js`. These get filled with the information you provide when creating a new theme from that template. The `package.json` is filled with the theme data like name, version and description. The `gulpfile.js` is filled with the name of the selected target environment and the theme name. Make sure to _not_ change the declaration of the `themeData` variable in the `gulpfile.js` because this is where *viewport-cli* fills in the theme name and the name of the selected target environment. ⚠️

It's probably best to start off with duplicating the "default" theme template and to modify that.

### URLs

When working with a theme for Scroll Viewport, you will encounter different URLs that might be confusing. This section should serve as a quick reference in case you come across those terms in the official documentation. Don't worry if you don't understand all of them just yet. When you set up a target environment you only need to provide the `confluenceBaseUrl` and the `spaceKey`. The other URLs will only become relevant as you start to add resources to your theme. Also they are already set up in the "default" theme template, so you can directly start using it.

| name | description | URL |
| ---- | ----------- | --- |
| `confluenceBaseUrl` | URL of Confluence Server | e.g. `http://localhost:8090/confluence` |
| `confluenceSpaceUrl` | URL of a space in Confluence Server | `<confluenceBaseUrl>/display/<spaceKey>/` |
| `viewportUrl` | URL of the Viewport of a space | `<confluenceBaseUrl>/<spaceKey>/` by default (can customise in Scroll Viewport Configuration) |
| `themeBaseUrl` | URL of a theme of a Viewport | `<confluenceBaseUrl>/<spaceKey>/_/<themeId>/<anotherId>` |

The theme resources are uploaded to the `themeBaseUrl`, for example to access the `main.js` in the "default" theme template you would use `<themeBaseUrl>/scripts/main.js`. But since markup files are loaded in the Viewport, their paths are taken relative to the `viewportUrl`. This means to reference any of your resources like styles, scripts and images from within your markup files you need to prepend the path with the `_/<themeId>/<anotherId>` part. Fortunately there is a handy VLT placeholder `${theme.baseUrl}` which you can use. As example from the "default" theme template, the head of a `page.vm` might contain

```html
<link rel="icon" href="${theme.baseUrl}/images/favicon.ico">
<link rel="stylesheet" href="${theme.baseUrl}/styles/main.css">
<script src="${theme.baseUrl}/scripts/main.js" defer></script>
```

Beware: In the resources themselves, like styles and scripts, paths are taken relative to the folder they are in. This means you don't need to prepend the path with the `themeBaseUrl` since the files are already in there. The `themeBaseUrl` needs to be references only in markup files. For example in the "default" theme template, to reference an image within your style sheet, you would use `background-image: url("../images/my-awesome-image.jpg")`. ⚠️


## Notes

- A theme is actually a NPM package since it contains a `package.json`. Though it is not designed to be published. NPM is only used to load the dependencies for *gulp*. Having a separate `node_modules` subdirectory with the same dependencies for every theme created is certainly not the most space efficient way, but *gulp* is not designed to work globally and will only work if contained in the theme directory. If you want to exchange themes between different machines, it might even benefit you that each theme contains all of its dependencies and can run on the other machine without needing to set up anything, except having Node.js and npm installed. Also the `.gitignore` file already takes care of not backing up the dependencies to your Git repository.

- The dependencies like *gulp*, *viewport-uploader*, etc. of the theme package are installed as `devDependencies` which means they won't be installed if the Node environment is set to `production`. (Also they wouldn't be included if the theme package were to be published, which it isn't intended to anyways.). For most people this shouldn't be a problem since Node is by default in `development` mode.


## Roadmap

- see [Roadmap](Roadmap.md)

[1]: https://github.com/K15t/viewport-uploader/