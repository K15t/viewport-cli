#! /usr/bin/env node

"use strict";

// ----------------- Dependencies ----------------- //

const args = require('args');
const fs = require('fs-extra');
const path = require('path');
const replace = require('replace-in-file');

const { directoryExists, createDirectory, copyDirectory, directoryList } = require('./lib/files.js');
const { askProperties, askConfig, chooseConfig } = require('./lib/inquirer.js');
const { showWelcome, showFinishedCreate, showFinishedConfig, showConfigFirst, showError } = require('./lib/chalk.js');
const { validateConfig } = require('./lib/validate');

// ----------------- Configuration ----------------- //

// ToDo: Change to home dir path
const templateDirName = "templates";
const templateDirPath = path.join(__dirname, templateDirName); // absolute path
const vpconfigPath = path.join(__dirname, './vpconfig.json'); // absolute path

// ----------------- Commands ----------------- //

args.command('config', 'Set up Scroll Viewport connection', config);
args.command('create', 'Create new local theme project.', create);
args.parse(process.argv, {
    version: false
});
if (!args.sub[0]) {
    args.showHelp();
}

function create() {
    showWelcome();

    if (directoryExists(vpconfigPath)) {
        buildTheme()
            .then(showFinishedCreate)
            .catch(showError);
    } else {
        showConfigFirst();
    }
}

function config() {
    showWelcome();

    if (directoryExists(vpconfigPath)) {
        selectConfig()
            .then(buildConfig)
            .then(showFinishedConfig)
            .catch(showError);
    } else {
        buildConfig({})
            .then(showFinishedConfig)
            .catch(showError);
    }

}

// ----------------- Create ----------------- //

async function buildTheme() {

    // get list of available templates
    const templateList = directoryList(templateDirPath); // uses path relative to this file

    // get list of available target environments
    const vpconfig = await fs.readJson(vpconfigPath); // exists since checked in create()
    const envList = Object.keys(vpconfig);

    // get properties of theme from user
    const theme = await askProperties({ 'templateList': templateList, 'envList': envList });

    // compute paths for theme
    theme.srcPath = path.join(templateDirPath, theme.template); // absolute path of theme template
    theme.destPath = path.join(process.cwd(), theme.name); // absolute path where theme should be created
    theme.packageJsonPath = path.join(theme.destPath, 'package.json');
    theme.gulpfilePath = path.join(theme.destPath, 'gulpfile.js');

    // create theme directory
    if (directoryExists(theme.destPath)) {
        throw new Error(`Can't create folder with name '${theme.destPath}' since it already exists.`)
    } else {
        await fs.ensureDir(theme.destPath);
    }

    // copy theme template
    if (directoryExists(theme.srcPath)) {
        await fs.copy(theme.srcPath, theme.destPath);
    } else {
        throw new Error(`Can't copy template since source folder '${theme.srcPath}' doesn't exists.`)
    }

    // set properties in package.json
    const packageJson = await fs.readJson(theme.packageJsonPath);
    [packageJson.name, packageJson.version, packageJson.description] = [theme.name, theme.version, theme.description];
    await fs.writeJson(theme.packageJsonPath, packageJson);

    // copy active environment config from vpconfig.json into gulpfile.js
    const regex = /(const\s+themeData\s*=\s*)(.*)(;)/i;
    // matches variable declaration of "themeData", gulpfile.js must contain this pattern to be replaced properly!
    // creates three capture groups, will keep the first and the third and replace only the second one, much simpler than positive
    // lookaheads and lookbehinds
    const themeData = { 'themeName': theme.name, 'envName': theme.envName };
    await replace({
        'files': theme.gulpfilePath,
        'from': regex,
        'to': `$1${JSON.stringify(themeData)}$3`
    });

    return theme; // for promise chain to continue
}

// ----------------- Initialize ----------------- //

async function selectConfig() {
    const vpconfig = await fs.readJson(vpconfigPath); // exists since checked in config()
    validateConfig(vpconfig);
    const existingEnvNames = Object.keys(vpconfig);

    // list configs to choose from, either edit or add new one
    const { envToEdit } = await chooseConfig({'choices': ['add...', ...existingEnvNames]});

    if (envToEdit == "add...") {
        return {'existingEnvNames': existingEnvNames, 'vpconfig': vpconfig};
    } else {
        const chosenConfig = vpconfig[envToEdit];
        return {'existingEnvNames': existingEnvNames, 'defaultConfig': chosenConfig, 'vpconfig': vpconfig};
    }
}

async function buildConfig({existingEnvNames = [], defaultConfig = {}, vpconfig = {}}) {
// set defaultConfig to empty object instead of undefined so accessing non-existing properties in askConfig doesn't throw

    const config = await askConfig({existingEnvNames, defaultConfig});

    // Note: overwrites if envName already exists, but has check implemented in askConfig
    vpconfig[config.envName] = config;

    await fs.writeJson(vpconfigPath, vpconfig);

    return config; // for promise chain to continue
}