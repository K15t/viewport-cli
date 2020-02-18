"use strict";

// ----------------- Dependencies ----------------- //

const inquirer = require('inquirer');
const fs = require('fs-extra');
const { pathExists } = require('./files.js');

exports.askTheme = askTheme;
exports.askConfig = askConfig;
exports.chooseConfig = chooseConfig;

// ----------------- Interactive CLI input ----------------- //

function askTheme(args) {
    return inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter a name for your theme:',
            default: 'my-viewport-theme',
            validate: function(value) {
                if (value.match(/^[a-z][a-z0-9_-]*$/i)) {
                    if (pathExists(value)) { // relative to cwd
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

// ToDo: clarify what configurations do, clarify what validation expects
// let defaultConfig default to empty object instead of undefined so accessing non-existing properties doesn't throw
function askConfig({existingEnvNames = [], defaultConfig = {}, envTemplate}) {
    return inquirer.prompt([
        {
            name: 'envName',
            type: 'input',
            message: 'Enter name of target environment',
            default: defaultConfig.envName || 'DEV',
            validate: function(value) {
                if (value.match(/^add\.\.\.$/i)) {
                    return "Please choose a different name because 'add...' is used internally.";
                } else if (existingEnvNames.includes(value)) {
                    if (defaultConfig.envName === value) { // allow duplicate name to itself in edit mode, i.e. when defaultConfig is not empty object
                        return true;
                    } else {
                        return `Target environment with name '${value}' already exist. Please choose a different name.`;
                    }
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
            validate: value => envTemplate['confluenceBaseUrl'].test(value) || 'Enter a valid URL. It should not contain a trailing slash.'
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
            name: 'scope',
            type: 'input',
            message: 'Enter space key to scope (empty for global)', // ToDo: Clarify what scope does
            default: defaultConfig.scope || '',
            validate: value => envTemplate['scope'].test(value) || 'Enter a valid scope.'
        },
    ]);
}

function chooseConfig(args) {
    return inquirer.prompt([
        {
            name: 'envToEdit',
            type: 'list',
            message: 'Choose existing target environment to edit or \'add...\' to add a new one.',
            choices: args.choices,
            default: 'add...'
    }]);
}