"use strict";

// ----------------- File system helpers ----------------- //

const fs = require('fs-extra');

exports.pathExists = fs.existsSync;
exports.createDirectory = createDirectory;
exports.copyDirectory = copyDirectory;
exports.directoryList = directoryList;

function createDirectory(path) {
    if (pathExists(path)) {
        throw new Error(`Can't create folder with name '${path}' since it already exists.`);
    } else {
        try {
            fs.mkdirSync(path);
        } catch (e) {
            throw new Error(`Encountered error while writing to disk. ${e}`)
        }
    }
}

function copyDirectory(srcPath, destPath) {
    if (pathExists(srcPath)) {
        try {
            fs.copySync(srcPath, destPath);
        } catch (e) {
            throw new Error(`Encountered error while copying files. ${e}`);
        }
    } else {
        throw new Error(`Can't copy files since source folder '${srcPath}' doesn't exist.`);
    }
}

function directoryList(parentDir) {
    return fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}