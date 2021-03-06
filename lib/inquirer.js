"use strict";

// ----------------- Dependencies ----------------- //

const inquirer = require('inquirer');
const fs = require('fs-extra');
const { pathExists } = require('./files.js');

exports.askTheme = askTheme;
exports.askConfig = askConfig;
exports.chooseConfig = chooseConfig;
exports.chooseConfigToDelete = chooseConfigToDelete;

// ----------------- Interactive CLI input ----------------- //

async function askTheme(args) {
    return inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter a name for your theme:',
            default: 'my-viewport-theme',
            validate: async function(value) {
                if (value.match(/^[a-z][a-z0-9_-]*$/i)) {
                    if (await fs.pathExists(value)) { // relative to cwd
                        return "Folder with name '" + value + "' already exists. Use different name.";
                    } else {
                        return true;
                    }
                } else {
                    return "Please enter a valid name. Must start with a letter and can contain only alpha-numeric characters, '-', and '_'.";
                }
            }
        },
        {
            name: 'version',
            type: 'input',
            message: 'Enter a version for your theme:',
            default: '1.0.0',
            validate: function(value) {
                if (value.match(/^(\d+\.)?(\d+\.)?(\d+)$/i)) {
                    return true;
                } else {
                    return "Please enter a valid version. Must be one to three numbers separated by dots."
                }
            }
        },
        {
            name: 'description',
            type: 'input',
            message: 'Enter a description for your theme:',
            default: 'My awesome Scroll Viewport theme.',
        },
        {
            name: 'template',
            type: 'list',
            message: 'Select a template for your theme:',
            choices: args.templateList,
            default: "default"
        },
        {
            name: 'envName',
            type: 'list',
            message: 'Select a target environment for your theme:',
            choices: args.envNameList,
        },
    ]);
}

// defaultConfig in initialised to empty object instead of undefined by default, so that accessing non-existing properties doesn't throw
async function askConfig({existingEnvNames = [], envTemplate, defaultConfig = {}}) {
    return inquirer.prompt([
        {
            name: 'envName',
            type: 'input',
            message: 'Enter name of target environment',
            default: defaultConfig.envName || 'DEV',
            validate: function(value) {
                if (value.match(/^add\.\.\.$/i)) {
                    return "Please choose a different name because 'add...' is used internally.";
                } else if (value.match(/^delete\.\.\.$/i)) {
                    return "Please choose a different name because 'delete...' is used internally.";
                } else if (existingEnvNames.includes(value)) {
                    return `Target environment with name '${value}' already exist. Please choose a different name.`;
                } else {
                    return envTemplate['envName'].test(value)  || 'Enter a valid name.';
                }
            }
        },
        {
            name: 'confluenceBaseUrl',
            type: 'input',
            message: 'Enter URL of Confluence Server',
            default: defaultConfig.confluenceBaseUrl || 'http://localhost:8090/confluence',
            validate: value => envTemplate['confluenceBaseUrl'].test(value) || 'Enter a valid URL. It may not contain a trailing slash.'
        },
        {
            name: 'username',
            type: 'input',
            message: 'Enter username for Confluence Server',
            default: defaultConfig.username || 'admin',
            validate: value => envTemplate['username'].test(value) || 'Enter a valid username.'
        },
        {
            name: 'password',
            type: 'input',
            message: 'Enter password for Confluence Server',
            default: defaultConfig.password || 'admin',
            validate: value => envTemplate['password'].test(value) || 'Enter a valid password.'
        },
        {
            name: 'spaceKey',
            type: 'input',
            message: 'Enter space key (empty for global)',
            default: defaultConfig.spaceKey || '',
            validate: value => envTemplate['spaceKey'].test(value) || 'Enter a valid space key. It may contain up to 225 alphanumeric characters. NOTE: Scroll Viewport treats space keys case-sensitive even though for Confluence they are case-insensitive!'
        },
    ]);
}

async function chooseConfig(args) {
    return inquirer.prompt([
        {
            name: 'envNameOrAddOrDelete',
            type: 'list',
            message: 'Choose existing target environment to edit or \'add...\' to add a new one or \'delete...\' to delete one.',
            choices: args.choices,
            default: 'add...'
    }]);
}

async function chooseConfigToDelete(args) {
    return inquirer.prompt([
        {
            name: 'envNameToDelete',
            type: 'list',
            message: 'Choose which target environment to delete.',
            choices: args.choices,
            default: ''
        }]);
}