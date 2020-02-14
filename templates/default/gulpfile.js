// Gulp workflow

"use strict";

// --------------- Modules --------------- //

const { src, dest, series, parallel, watch } = require('gulp');
const del           = require('del');

const ViewportTheme = require('gulp-viewport');
const browserSync   = require('browser-sync').create();

const concat        = require('gulp-concat');
const sourcemaps    = require('gulp-sourcemaps');

const babel         = require('gulp-babel');
const terser        = require('gulp-terser');

const sass          = require('gulp-sass');
const cleancss      = require('gulp-clean-css');
// const autoprefixer  = require('gulp-autoprefixer'); // currently broken with gulp-sourcemaps
const postcss       = require('gulp-postcss'); // replace gulp-autoprefixer
const autoprefixer  = require('autoprefixer'); // replace gulp-autoprefixer

// --------------- Theme --------------- //

const activeEnv = {};

const viewportTheme = new ViewportTheme(activeEnv);

// --------------- Folder structure --------------- //

const srcDir = 'src';
const buildDir = 'build';

const subDirs = {fonts: 'fonts',
images: 'images',
markups: 'markups',
scripts: 'scripts',
styles: 'styles'};

function srcDirOf(type) {
  return subDirs[type] && buildPath(srcDir, subDirs[type]); // left most falsy operand, last one if all are truthy
}
function buildDirOf(type) {
  return subDirs[type] && buildPath(buildDir, subDirs[type]); // left most falsy operand, last one if all are truthy
}

function buildPath(...args) {
    return args.join("/");
}

// --------------- Tasks --------------- //

exports.clean = clean;
exports.build = series(create, clean, parallel(fonts, images, scripts, styles, markups), upload);
exports.watch = series(exports.build, startWatch);

// Globs of file types, relative to this script file
// e.g. stylesGlob currently results in ['src/styles/**/*.scss', 'src/styles/**/*.sass']
// can restrict file types by modifying globs in array, e.g. **/*.jpg for images to restrict to .jpg files
// ToDo: restrict to font data types e.g. fonts/**/*.woff, valid image data types e.g. fonts/**/*.jpg
const fontsGlob = ['**'].map(item => buildPath(srcDirOf('fonts'), item));
const imagesGlob = ['**'].map(item => buildPath(srcDirOf('images'), item));
const scriptsGlob = ['**/*.js'].map(item => buildPath(srcDirOf('scripts'), item));
const stylesGlob = ['**/*.scss', '**/*.sass', '**/*.css'].map(item => buildPath(srcDirOf('styles'), item));
const markupsGlob = ['**/*.html', '**/*.vm'].map(item => buildPath(srcDirOf('markups'), item));

function create(done) {
    if (viewportTheme.exists()) {
        console.log('Theme with name \'' + activeEnv.themeName + '\' already exists.');
    } else {
        viewportTheme.create();
    }
    done();
}

function clean() {
    viewportTheme.removeAllResources();
    return del(buildDir);
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
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(sourcemaps.write())
        .pipe(dest(buildDir));
}

function styles() {
    return src(stylesGlob)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(cleancss())
        //.pipe(autoprefixer()) // currently broken with gulp-sourcemaps
        .pipe(postcss([autoprefixer()])) // replace gulp-autoprefixer
        .pipe(sourcemaps.write())
        .pipe(dest(buildDir));
}

function markups() {
    return src(markupsGlob)
        .pipe(dest(buildDirOf('markups')));
}

// ToDo: check if needs to specify sourceBase and targetPath in upload
function upload(type) {
    if (Object.values(subDirs).includes(type)) {
        return src(buildDirOf(type))
            .pipe(viewportTheme.upload());
    } else {
        return src(buildDir)
            .pipe(viewportTheme.upload());
    }
}

function startWatch(done) {
    if (activeEnv.confluenceBaseUrl) {
        browserSync.init({
            proxy: activeEnv.confluenceBaseUrl
        });
    } else {
        // ToDo: Error handling
    }
    viewportTheme.on('uploaded', browserSync.reload);

    // use anonymous functions since series() expects functions
    watch(fontsGlob, series(fonts, () => upload('fonts')));
    watch(imagesGlob, series(images, () => upload('images')));
    watch(scriptsGlob, series(scripts, () => upload('scripts')));
    watch(stylesGlob, series(styles, () => upload('styles')));
    watch(markupsGlob, series(markups, () => upload('markups')));

    done();
}
