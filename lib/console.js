"use strict";

// ----------------- Creates colorful CLI output ----------------- //

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');

exports.showWelcome = showWelcome;
exports.showFinishedCreate = showFinishedCreate;
exports.showAddedConfig = showAddedConfig;
exports.showEditedConfig = showEditedConfig;
exports.showDeletedConfig = showDeletedConfig;
exports.showConfigFirst = showConfigFirst;
exports.showError = showError;

function showWelcome() {
    clear();
    console.log(chalk.yellow(figlet.textSync('viewport-tools')));
}

function showError(error) {
    console.log(chalk.red("😞 Ups, something failed!", error));
}

function showFinishedCreate(theme) {
    console.log(chalk.green(`🎉 The theme '${theme.name}' has been successfully created.`));
    console.log(chalk.green('🎉 Please do the following steps:'));
    console.log(chalk.green(`🎉 1. Switch into your theme directory 'cd ${theme.name}'.`));
    console.log(chalk.green('🎉 2. Run \'npm install\' to install gulp.‍'));
    console.log(chalk.green('🎉 3. Write some code.'));
    console.log(chalk.green('🎉 4. Run the provided gulp tasks to build and upload your theme to Scroll Viewport.'));
    return theme; // for promise chain to continue
}

function showAddedConfig(envName) {
    console.log(chalk.green(`🎉 The target environment '${envName}' has been saved successfully.`));
    // console.log(chalk.green('🎉 Run \'viewport create\' to create a theme project.'));
    return envName; // for promise chain to continue
}

function showEditedConfig(envName) {
    console.log(chalk.green(`🎉 The target environment '${envName}' has been edited successfully.`));
    // console.log(chalk.green('🎉 Run \'viewport create\' to create a theme project.'));
    return envName; // for promise chain to continue
}

function showDeletedConfig(envName) {
    console.log(chalk.green(`🎉 The target environment '${envName}' has been deleted successfully.`));
    // console.log(chalk.green('🎉 Run \'viewport create\' to create a theme project.'));
    return envName; // for promise chain to continue
}

function showConfigFirst() {
    console.log(chalk.red('Please run \'viewport config\' first.'));
}