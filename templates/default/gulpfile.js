// Gulp workflow

"use strict";

// --------------- Modules --------------- //

const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const path = require('path');

const ViewportTheme = require('gulp-viewport');
const browserSync = require('browser-sync').create();

const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const babel = require('gulp-babel');
const terser = require('gulp-terser');

const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
// const autoprefixer  = require('gulp-autoprefixer'); // currently broken with gulp-sourcemaps
const postcss = require('gulp-postcss'); // replaces gulp-autoprefixer
const autoprefixer = require('autoprefixer'); // replaces gulp-autoprefixer

// --------------- Theme --------------- //

const themeData = {};

const theme = new ViewportTheme(themeData);

// --------------- Folder structure --------------- //

const srcDir = 'src';
const buildDir = 'build';

const subDirs = {
    fonts: 'fonts',
    images: 'images',
    markups: 'markups',
    scripts: 'scripts',
    styles: 'styles'
};

function srcDirOf(type) {
    return subDirs[type] && path.join(srcDir, subDirs[type]); // returns left most falsy operand, last one if all are truthy, i.e.
                                                              // undefined if type is invalid
}

function buildDirOf(type) {
    return subDirs[type] && path.join(buildDir, subDirs[type]); // returns left most falsy operand, last one if all are truthy, i.e.
                                                                // undefined if type is invalid
}

// --------------- Tasks --------------- //

exports.clean = clean;
exports.build = series(create, clean, parallel(fonts, images, scripts, styles, markups), upload);
exports.watch = series(exports.build, startWatch);

// The globs of files for `src()` and `dest()`, path is taken relative to CWD
// can restrict file types by modifying globs in array, e.g. **/*.jpg for images to restrict to .jpg files
// e.g. stylesGlob currently results in ['src/styles/**/*.scss', 'src/styles/**/*.sass', 'src/styles/**/*.css']
// ToDo: restrict to font data types e.g. fonts/**/*.woff, valid image data types e.g. fonts/**/*.jpg
const fontsGlob = ['**'].map(item => path.join(srcDirOf('fonts'), item));
const imagesGlob = ['**'].map(item => path.join(srcDirOf('images'), item));
const scriptsGlob = ['**/*.js'].map(item => path.join(srcDirOf('scripts'), item));
const stylesGlob = ['**/*.scss', '**/*.sass', '**/*.css'].map(item => path.join(srcDirOf('styles'), item));
const markupsGlob = ['**/*.html', '**/*.vm'].map(item => path.join(srcDirOf('markups'), item));

function create() {
    return theme.create(); // existance check is implemented in viewport-sync
}

function clean() {
    return Promise.all(theme.reset(), del(buildDir));
}

function fonts() {
    return src(fontsGlob)
        .pipe(dest(buildDirOf('fonts')));
}

function images() {
    return src(imagesGlob)
        .pipe(dest(buildDirOf('images')));
}

function scripts() {
    return src(scriptsGlob)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(sourcemaps.write())
        .pipe(dest(buildDir));
}

function styles() {
    return src(stylesGlob)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(cleancss())
        //.pipe(autoprefixer()) // currently broken with gulp-sourcemaps
        .pipe(postcss([autoprefixer()])) // replaces gulp-autoprefixer
        .pipe(sourcemaps.write())
        .pipe(dest(buildDir));
}

function markups() {
    return src(markupsGlob)
        .pipe(dest(buildDirOf('markups')));
}

// ToDo: check if needs to specify sourceBase and targetPath in upload
function upload(type) {
    // if valid type argument is provided upload only files of that type
    if (Object.values(subDirs).includes(type)) {
        return theme.upload({'glob': '**', 'sourcePath': buildDirOf(type)});
    } // if not upload whole buildDir
    else {
        return theme.upload({'glob': '**', 'sourcePath': buildDir});
    }
}

// ToDo: fix
function syncBrowser() {
    if (themeData.confluenceBaseUrl) {
        browserSync.init({
            proxy: themeData.confluenceBaseUrl
        });
    } else {
        // ToDo: Error handling
    }

    browserSync.reload();
}

function startWatch(done) {

    // use anonymous functions since upload(type) gives a value and series() expects a function
    watch(fontsGlob, series(fonts, () => upload('fonts'), browserSync));
    watch(imagesGlob, series(images, () => upload('images'), browserSync));
    watch(scriptsGlob, series(scripts, () => upload('scripts'), browserSync));
    watch(stylesGlob, series(styles, () => upload('styles'), browserSync));
    watch(markupsGlob, series(markups, () => upload('markups'), browserSync));

    done();
}
