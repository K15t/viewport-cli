"use strict";

// ----------------- File system helpers ----------------- //

const fs = require('fs-extra');

exports.directoryList = directoryList;

function directoryList(parentDir) {
    return fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}