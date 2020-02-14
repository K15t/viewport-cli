"use strict";

// ----------------- Interactive CLI input ----------------- //

const inquirer = require('inquirer');
const fs = require('fs-extra');
const { directoryExists } = require('./files.js');

exports.askProperties = askProperties;
exports.askConfig = askConfig;

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
        }
    ]);
}

async function askConfig(vpconfig) {

    const q1 = await inquirer.prompt([
        {
            name: 'env',
            type: 'input',
            message: 'Enter name of target environment',
            default: 'DEV',
            validate: function(value) {
                if (value.match(/^activeEnv$/i)) {
                    return "Please enter a different name since 'activeEnv' is used internally.";
                } else {
                    return true;
                }
            }
        }]);

    // empty string if env from q1 is not in vpconfig yet or vpconfig doesn't exist at all
    // prefer over undefined since accessing non-existing properties won't throw
    const activeEnv = vpconfig[q1.env] || '';

    const q2 = await inquirer.prompt([
        {
            name: 'scope',
            type: 'input',
            message: 'Enter space key to scope (empty for global)', // ToDo: Clarify what scope does
            default: activeEnv.name || ''
        },
        {
            name: 'confluenceBaseUrl',
            type: 'input',
            message: 'Enter URL of Confluence Server',
            default: activeEnv.confluenceBaseUrl || 'http://localhost:8090/confluence'
        },
        {
            name: 'targetPath',
            type: 'input',
            message: 'Enter URL relative to baseURL where theme should be deployed to (empty for root)',
            default: activeEnv.targetPath || ''
        },
        {
            name: 'username',
            type: 'input',
            message: 'Enter username of Confluence',
            default: activeEnv.username || 'admin'
        },
        {
            name: 'password',
            type: 'input',
            message: 'Enter password of Confluence',
            default: activeEnv.password || 'admin'
        },
    ]);

    return {...q1, ...q2};
}