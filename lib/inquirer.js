"use strict";

// ----------------- Interactive CLI input ----------------- //

const inquirer = require('inquirer');
const fs = require('fs-extra');
const { directoryExists } = require('./files.js');

exports.askProperties = askProperties;
exports.askConfig = askConfig;
exports.chooseConfig = chooseConfig;

function askProperties(args) {
    return inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter a name for your theme:',
            default: 'my-viewport-theme',
            validate: function(value) {
                if (value.match(/^[a-z][a-z0-9_-]*$/i)) {
                    if (directoryExists(value)) {
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
            choices: args.envList,
        },
    ]);
}

function askConfig({existingEnvNames, defaultConfig}) {
    return inquirer.prompt([
        {
            name: 'envName',
            type: 'input',
            message: 'Enter name of target environment',
            default: defaultConfig.envName || 'DEV',
            validate: function(value) {
                if (value.match(/^add\.\.\.$/i)) {
                    return "Please choose a different name because 'add...' is used internally.";
                } else if (existingEnvNames && existingEnvNames.includes(value)) {
                    // returns left most falsy operand, i.e. existingEnvNames if undefined
                    if (defaultConfig.envName === value) {
                        // allow duplicate name to itself in edit mode, i.e. when defaultConfig is not empty object
                        return true;
                    } else {
                        return `Target environment with name ${value} already exist. Please choose a different one.`;
                    }
                } else {
                    return true;
                }
            }
        },
        {
            name: 'confluenceBaseUrl',
            type: 'input',
            message: 'Enter URL of Confluence Server',
            default: defaultConfig.confluenceBaseUrl || 'http://localhost:8090/confluence'
        },
        {
            name: 'username',
            type: 'input',
            message: 'Enter username for Confluence Server',
            default: defaultConfig.username || 'admin'
        },
        {
            name: 'password',
            type: 'input',
            message: 'Enter password for Confluence Server',
            default: defaultConfig.password || 'admin'
        },
        {
            name: 'scope',
            type: 'input',
            message: 'Enter space key to scope (empty for global)', // ToDo: Clarify what scope does
            default: defaultConfig.scope || ''
        },
        {
            name: 'targetPath',
            type: 'input',
            message: 'Enter URL relative to baseURL where theme should be deployed to (empty for root)', // ToDo: Clarify what targetPath does
            default: defaultConfig.targetPath || ''
        },
        {
            name: 'sourcePath',
            type: 'input',
            message: 'Enter file path relative to theme directory from where theme should be sourced (empty for root)', // ToDo: Clarify what sourcePath does
            default: defaultConfig.sourcePath || ''
        }
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