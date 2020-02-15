"use strict";

exports.validateConfig = validateConfig;

// ToDo: Validate whole vpconfig file
function validateConfig(vpconfig) {
    const props = Object.keys(vpconfig);

    if (props.length && props[0]) { // if there are properties with non-empty values
        return Object.keys(vpconfig);
    } else {
        throw new Error("No target environments in .vpconfig. Please delete the file and start again.");
    }

    // const vals = Object.values(vpconfig);
}