// Gulp workflow

"use strict";

// --------------- Modules --------------- //
const { src, dest, series, parallel, watch } = require('gulp');
const del           = require('del');
const ViewportTheme = require('gulp-viewport');
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify');
const sass          = require('gulp-dart-sass');
const autoprefixer  = require('gulp-autoprefixer');
const browserSync   = require('browser-sync').create();

// --------------- Theme --------------- //

const activeEnv = {};

const viewportTheme = new ViewportTheme(activeEnv);

// --------------- Folder structure --------------- //

const srcDir = 'src/';
const buildDir = 'build/';

const subDirs = {fonts: 'fonts/',
images: 'images/',
markups: 'markups/',
scripts: 'scripts/',
styles: 'styles/'};

function srcDirOf(type) {
  return subDirs[type] && srcDir + subDirs[type];
}
function buildDirOf(type) {
  return subDirs[type] && buildDir + subDirs[type];
}

// --------------- Tasks --------------- //

exports.clean = clean;
exports.build = series(create, clean, parallel(fonts, images, scripts, styles, markups), upload);
exports.watch = series(exports.build, startWatch);

// Globs of file types
// e.g. sassGlob currently results in ['src/styles/**/*.scss', 'src/styles/**/*.sass']
// can restrict file types by modifying globs in array, e.g. **/*.jpg for images to restrict to .jpg files
// ToDo: restrict to font data types e.g. fonts/**/*.woff, valid image data types e.g. fonts/**/*.jpg
const fontsGlob = ['**'].map(item => srcDirOf('fonts') + item);
const imagesGlob = ['**'].map(item => srcDirOf('images') + item);
const jsGlob = ['**/*.js'].map(item => srcDirOf('scripts') + item);
const sassGlob = ['**/*.scss', '**/*.sass'].map(item => srcDirOf('styles') + item);
const cssGlob = ['**/*.css'].map(item => srcDirOf('styles') + item);
const markupGlob = ['**/*.html', '**/*.vm'].map(item => srcDirOf('markups') + item);

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
    return src(jsGlob)
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest(buildDir));
}

function styles() {
    return src(sassGlob)
        .pipe(sass({
            includePaths: sassDependencies,
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(src(cssGlob))
        .pipe(concat('main.css'))
        .pipe(autoprefixer())
        .pipe(dest(buildDir));
}

function markups() {
    return src(markupGlob)
        .pipe(dest(buildDirOf('markups')));
}

// ToDo: check if needs to specify sourceBase and targetPath in upload
function upload(type) {
    if (type) {
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

    watch(fontsGlob, series(fonts, upload('fonts')));
    watch(imagesGlob, series(images, upload('images')));
    watch(jsGlob, series(scripts, upload));
    watch([...cssGlob, ...sassGlob], series(styles, upload));
    watch(markupGlob, series(markups, upload('markups')));

    done();
}
