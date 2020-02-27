#! /usr/bin/env node

"use strict";

// ----------------- Dependencies ----------------- //

const args = require('args');
const fs = require('fs-extra');
const path = require('path');
const replace = require('replace-in-file');
const os = require('os');

const { directoryList } = require('./lib/files.js');
const { askTheme, askConfig, chooseConfig } = require('./lib/inquirer.js');
const { showWelcome, showFinishedCreate, showFinishedConfig, showConfigFirst, showError } = require('./lib/console.js');
const { regexVal } = require('./lib/validate.js');

// ----------------- Configuration ----------------- //

const templateDirName = "templates";
const templateDirPath = path.join(__dirname, templateDirName); // absolute path
const vpconfigName = ".vpconfig.json";
const vpconfigPath = path.join(os.homedir(), vpconfigName); // absolute path

// ToDo: put in proper restrictions from Scroll Viewport for envName, username, password
// ToDo: update inquirer help with restrictions as well.
// Note: If you change something in this template object, change it in viewport-sync as well!
const envTemplate = {
    'envName': /.*/i,
    'confluenceBaseUrl': /^(https?):\/\/[^\s$.?#].[^\s]*[^/]$/i,
    'username': /.*/i,
    'password': /.*/i,
    'spaceKey': /^[a-z0-9]{0,255}$/i, // https://confluence.atlassian.com/doc/space-keys-829076188.html
};

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

    if (fs.existsSync(vpconfigPath)) {
        createTheme()
            .then(showFinishedCreate)
            .catch(showError);
    } else {
        showConfigFirst();
    }
}

function config() {
    showWelcome();

    if (fs.existsSync(vpconfigPath)) {
        selectConfig()
            .then(createConfig)
            .then(showFinishedConfig)
            .catch(showError);
    } else {
        createConfig({})
            .then(showFinishedConfig)
            .catch(showError);
    }

}

// ----------------- Create ----------------- //

async function createTheme() {

    // get list of available templates
    const templateList = await directoryList(templateDirPath);
    if (!templateList.length) {
        throw new Error(`No templates found in ${templateDirName}$ directory.`);
    }

    // get list of available target environments
    const vpconfig = await fs.readJson(vpconfigPath); // exists since checked in create()
    const envNameList = Object.keys(vpconfig);
    if (!envNameList.length) {
        throw new Error(
            `No target environments found in ~/${vpconfigName}. Please use \'viewport config\' to configure target environments.`)
    }

    // get properties of theme from user
    const theme = await askTheme({ 'templateList': templateList, 'envNameList': envNameList });

    // compute absolute paths for theme
    theme.srcPath = path.join(templateDirPath, theme.template);
    theme.destPath = path.join(process.cwd(), theme.name);
    theme.packageJsonPath = path.join(theme.destPath, 'package.json');
    theme.gulpfilePath = path.join(theme.destPath, 'gulpfile.js');

    // validate chosen template
    if (!await fs.pathExists(path.join(theme.srcPath, 'package.json'))) {
        throw new Error(
            `No package.json found in '${theme.template}' directory.`);
    }
    if (!await fs.pathExists(path.join(theme.srcPath, 'gulpfile.js'))) {
        throw new Error(
            `No gulpfile.js found in '${theme.template}' directory.`);
    }

    // validate chosen environment
    if (!regexVal(envTemplate, vpconfig[theme.envName])) {
        throw new Error(
            `The target environment '${theme.envName}' in ~/${vpconfigName} contains invalid properties. Please use 'viewport config\' to configure target environments.`);
    }

    // create theme directory
    if (await fs.pathExists(theme.destPath)) {
        throw new Error(`Can't create folder with name '${theme.destPath}' since it already exists.`)
    } else {
        await fs.ensureDir(theme.destPath);
    }

    // copy template theme files into theme directory
    if (await fs.pathExists(theme.srcPath)) {
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

    // get list of available target environments
    const vpconfig = await fs.readJson(vpconfigPath); // exists since checked in config()
    const envNameList = Object.keys(vpconfig); // could be empty array

    // list configs to choose from, either edit or add new one
    const { envToEdit } = await chooseConfig({ 'choices': ['add...', ...envNameList] });

    // return arguments for createConfig() in promise chain
    if (envToEdit == "add...") {
        return { 'existingEnvNames': envNameList, 'vpconfig': vpconfig };
    } else {
        return { 'existingEnvNames': envNameList, 'defaultConfig': vpconfig[envToEdit], 'vpconfig': vpconfig };
    }
}

async function createConfig({ existingEnvNames = [], defaultConfig = {}, vpconfig = {} }) {

    const config = await askConfig({ existingEnvNames, defaultConfig, 'envTemplate': envTemplate});

    vpconfig[config.envName] = config; // overwrites if envName already exists, but has check implemented in askConfig() for this

    await fs.writeJson(vpconfigPath, vpconfig);

    return config; // for promise chain to continue
}