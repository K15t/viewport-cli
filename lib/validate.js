"use strict";

exports.regexVal = regexVal;

// validates an object against a template object
// keys must be identical
// values must be strings that match regex values in template object
function regexVal(templateObj, obj) {
    const objKeys = Object.keys(obj);
    const objVals = Object.values(obj);
    const templateObjKeys = Object.keys(templateObj);

    // lengths must be equal
    if (objKeys.length != templateObjKeys.length) {
        return false;
    } // must have the same property names
    else if (!templateObjKeys.every(item => obj.hasOwnProperty(item))) {
        return false;
    } // values must be of type 'string'
    else if (!objVals.every(item => typeof item == "string")) {
        return false;
    } // values mast satisfy regex
    else if (!templateObjKeys.every(item => templateObj[item].test(obj[item]))) {
        return false;
    } else {
        return true;
    }
}