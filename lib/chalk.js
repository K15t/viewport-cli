"use strict";

// ----------------- Creates colorful CLI output ----------------- //

const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');

exports.showWelcome = showWelcome;
exports.showFinishedCreate = showFinishedCreate;
exports.showFinishedConfig = showFinishedConfig;
exports.showConfigFirst = showConfigFirst;
exports.showError = showError;

function showWelcome() {
    clear();
    console.log(chalk.yellow(figlet.textSync('viewport-tools', { horizontalLayout: 'full' })));
}

function showError(error) {
    console.log(chalk.red("😞 Ups, something failed! 😞 " + error));
}

function showFinishedCreate(obj) {
    console.log(chalk.green(`🎉 Your theme '${obj.name}' has been successfully created. 🎉`));
    console.log(chalk.green('Please do the following steps:'));
    console.log(chalk.green(`1. Switch into your theme directory 'cd ${obj.name}'.`));
    console.log(chalk.green('2. Run \'npm install\' to install gulp.‍'));
    console.log(chalk.green('3. Write some code.'));
    console.log(chalk.green('4. Run \'gulp build\' to build and upload your theme to Scroll Viewport.'));
    return obj; // for promise chain to continue
}

function showFinishedConfig(obj) {
    console.log(chalk.green(`🎉 Your config '${obj.activeEnv}' has been successfully created. 🎉`));
    console.log(chalk.green('🎉 Run \'viewport create\' to create a theme project. 🎉'));
    return obj; // for promise chain to continue
}

function showConfigFirst() {
    console.log(chalk.red('Please run \'viewport config\' first.'));
}