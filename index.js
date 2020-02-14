#! /usr/bin/env node

"use strict";

// ----------------- Dependencies ----------------- //

const args = require('args');
const fs = require('fs-extra');
const path = require('path');
const replace = require('replace-in-file');

const { directoryExists, createDirectory, copyDirectory, directoryList } = require('./lib/files.js');
const { askProperties, askConfig } = require('./lib/inquirer.js');
const { showWelcome, showFinishedCreate, showFinishedConfig, showConfigFirst, showError} = require('./lib/chalk.js');

// ----------------- Configuration ----------------- //

const templateDirName = "templates";
const vpconfigPath = path.join(process.cwd(), './vpconfig.json'); // absolute path

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

    buildConfig()
        .then(showFinishedConfig)
        .catch(showError);
}

// ----------------- Create ----------------- //

async function buildTheme() {

    // get list of available templates
    const templateList = directoryList(templateDirName); // uses path relative to this file

    // get properties of theme from user
    const theme = await askProperties({'templateList': templateList});

    // compute paths for theme
    theme.srcPath = path.join(process.cwd(), templateDirName, theme.template); // absolute path of theme template
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
    const vpconfig = await fs.readJson(vpconfigPath); // exists since checked in create()
    const activeEnv = vpconfig[vpconfig.activeEnv]; // extracts activeEnv object using computed property names
    const regex = /(const\s+activeEnv\s*=\s*)(.*)(;)/i;
    // matches variable declaration of "activeEnv", gulpfile.js must contain this pattern to be replaced properly!
    // creates three capture groups, will keep the first and the third and replace only the second one, much simpler than positive lookaheads and lookbehinds
    const activeEnvForGulpfile = {'themeName': theme.name, ...activeEnv};
    await replace({
        'files': theme.gulpfilePath,
        'from': regex,
        'to': `$1${JSON.stringify(activeEnvForGulpfile)}$3`
    });

    return theme; // for promise chain to continue
}

// ----------------- Initialize ----------------- //

async function buildConfig() {

    const vpconfig = directoryExists(vpconfigPath) ? await fs.readJson(vpconfigPath) : {activeEnv: {}};

    const config = await askConfig(vpconfig); // pass current vpconfig to provide default values

    // Note: overwrites if env already exists, but for this case provided default values from existing env in askConfig() input dialog
    vpconfig[config.env] = config;
    vpconfig.activeEnv = config.env; // set active environment tracker to new environment

    await fs.writeJson(vpconfigPath, vpconfig);

    return vpconfig; // for promise chain to continue
}