"use strict";

exports.regexVal = regexVal;

// validates an object against a template object
// property names must be identical, values must match regex values in template object
function regexVal(templateObj, obj) {
    const objKeys = Object.keys(obj);
    const objVals = Object.values(obj);
    const baseObjKeys = Object.keys(templateObj);

    // lengths must be equal
    if (objKeys.length != baseObjKeys.length) {
        return false;
    } // values must be of type 'string'
    else if (!objVals.every(item => typeof item == "string")) {
        return false;
    } // must have the same property names
    else if (!baseObjKeys.every(item => obj.hasOwnProperty(item))) {
        return false;
    } // values mast satisfy regex
    else if (!baseObjKeys.every(item => templateObj[item].test(obj[item]))) {
        return false;
    } else {
        return true;
    }
}