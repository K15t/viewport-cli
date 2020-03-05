// Gulp build process

"use strict";

// --------------- Modules --------------- //

const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const path = require('path');

const ViewportTheme = require('viewport-sync');
const browserSync = require('browser-sync').create();

const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const babel = require('gulp-babel');
const terser = require('gulp-terser');

const sass = require('gulp-dart-sass');
const cleancss = require('gulp-clean-css');
// const autoprefixer = require('gulp-autoprefixer'); // currently breaks when using gulp-sourcemaps
const postcss = require('gulp-postcss'); // replaces gulp-autoprefixer
const autoprefixer = require('autoprefixer'); // replaces gulp-autoprefixer

// --------------- Theme --------------- //

const themeData = {};

const theme = new ViewportTheme(themeData);

// --------------- Folder structure --------------- //

class Paths {
    
    constructor() {
        // make src and bld objects to store paths
        this.src = {};
        this.bld = {};
        
        // source and build directories relative to CWD
        this.srcDir = 'src/';
        this.bldDir = 'build/';

        // sub-directories relative to srcDir
        this.src.fonts = 'fonts/';
        this.src.images = 'images/';
        this.src.markups = 'markups/';
        this.src.scripts = 'scripts/';
        this.src.styles = 'styles/';

        // sub-directories relative to bldDir
        this.bld.fonts = 'fonts/';
        this.bld.images = 'images/';
        this.bld.markups = ''; // markups are in top-level
        this.bld.scripts = 'scripts/';
        this.bld.styles = 'styles/';

        // source globs relative to corresponding sub-directories
        this.src.fontsGlob = ['**'];
        this.src.imagesGlob = ['**'];
        this.src.markupsGlob = ['**/*.html', '**/*.vm'];
        this.src.scriptsGlob = ['**/*.js'];
        this.src.stylesGlob = ['**/*.scss', '**/*.sass', '**/*.css'];

        // build globs relative to corresponding sub-directories
        this.bld.fontsGlob = ['**'];
        this.bld.imagesGlob = ['**'];
        this.bld.markupsGlob = ['**/*.html', '**/*.vm'];
        this.bld.scriptsGlob = ['main.js']; // concatenated to single main.js
        this.bld.stylesGlob = ['main.css']; // concatenated to single main.css

        // general source and build globs relative to source and build directories
        this.srcGlob = path.join(this.srcDir, '**');
        this.bldGlob = path.join(this.bldDir, '**');
    }

    // computes source directory of a type, e.g. 'src/markups/'
    srcDirOf(type) {
        if (this.src.hasOwnProperty(type)) {
            return path.join(this.srcDir, this.src[type]);
        } else {
            throw new Error(`No source path for type \'${type}\' found.`);
        }
    }

    // computes build directory of a type, e.g. 'build/markups/'
    bldDirOf(type) {
        if (this.bld.hasOwnProperty(type)) {
            return path.join(this.bldDir, this.bld[type]);
        } else {
            throw new Error(`No build path for type \'${type}\' found.`);
        }
    }

    // computes glob for source files of a type, e.g. '['src/markups/**/*.html', 'src/markups/**/*.vm']'
    srcGlobOf(type) {
        if (this.src.hasOwnProperty(type + 'Glob') && this.src.hasOwnProperty(type)) {
            return this.src[type + 'Glob'].map(item => path.join(this.srcDirOf(type), item));
        } else {
            throw new Error(`No source glob for type \'${type}\' found.`);
        }
    }

    // computes glob for build files of a type, e.g. '['build/markups/**/*.html', 'build/markups/**/*.vm']'
    bldGlobOf(type) {
        if (this.bld.hasOwnProperty(type + 'Glob') && this.bld.hasOwnProperty(type)) {
            return this.bld[type + 'Glob'].map(item => path.join(this.bldDirOf(type), item));
        } else {
            throw new Error(`No build glob for type \'${type}\' found.`);
        }
    }
}

const paths = new Paths();

// --------------- Tasks --------------- //

exports.clean = series(create, reset);
exports.build = series(create, reset, parallel(fonts, images, scripts, styles, markups), upload);
exports.watch = series(exports.build, initialiseBrowser, startWatch);

function create() {
    return theme.create(); // existence check is implemented in viewport-sync
}

function reset() {
    return (async () => {
        await theme.reset();
        await del(paths.bldDir);
    })();
}

function fonts() {
    return src(paths.srcGlobOf('fonts'))
        .pipe(dest(paths.bldDirOf('fonts')));
}

function images() {
    return src(paths.srcGlobOf('images'))
        .pipe(dest(paths.bldDirOf('images')));
}

function markups() {
    return src(paths.srcGlobOf('markups'))
        .pipe(dest(paths.bldDirOf('markups')));
}

function scripts() {
    return src(paths.srcGlobOf('scripts'))
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(sourcemaps.write())
        .pipe(dest(paths.bldDirOf('scripts')));
}

function styles() {
    return src(paths.srcGlobOf('styles'))
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(cleancss())
        //.pipe(autoprefixer()) // currently broken with gulp-sourcemaps
        .pipe(postcss([autoprefixer()])) // replaces gulp-autoprefixer
        .pipe(sourcemaps.write())
        .pipe(dest(paths.bldDirOf('styles')));
}

function upload(type) {
    // if type argument is provided upload only files of that type, type validation happens in paths.bldGlobOf()
    if (typeof type == 'string') {
        return theme.upload({ 'glob': paths.bldGlobOf(type), 'sourcePath': paths.bldDir, 'targetPath': '' });
    } // if not upload whole buildDir
    else {
        return theme.upload({ 'glob': paths.bldGlob, 'sourcePath': paths.bldDir, 'targetPath': '' });
    }
}

function initialiseBrowser(done) {
    browserSync.init({
        // manual concat since can't use path.join() on Windows for URLs!
        // values were validated in ViewportTheme class to not contain leading / trailing slashes
        // Scroll Viewport converts spaceKey in URL to lowercase
        proxy: theme.confluenceBaseUrl + "/" + theme.spaceKey.toLowerCase()
    });
    done();
}

function reloadBrowser(done) {
    browserSync.reload();
    done();
}

function startWatch(done) {

    // use anonymous function to wrap value of upload(type) otherwise it would be replaced by its return value
    watch(paths.srcGlobOf('fonts'), series(fonts, () => upload('fonts'), reloadBrowser));
    watch(paths.srcGlobOf('images'), series(images, () => upload('images'), reloadBrowser));
    watch(paths.srcGlobOf('scripts'), series(scripts, () => upload('scripts'), reloadBrowser));
    watch(paths.srcGlobOf('styles'), series(styles, () => upload('styles'), reloadBrowser));
    watch(paths.srcGlobOf('markups'), series(markups, () => upload('markups'), reloadBrowser));

    done();
}