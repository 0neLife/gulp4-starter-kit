"use strict";

// load plugins
const autoprefixer    = require('autoprefixer'),
      browsersync     = require('browser-sync').create(),
      del             = require('del'),
      exec            = require('child_process').exec, // run command-line programs from gulp
      cssnano         = require('cssnano'),
      imageminMozjpeg = require('imagemin-mozjpeg'),
      gulp            = require('gulp'),
      surge           = require('gulp-surge'),
      sass            = require('gulp-sass'),
      rename          = require('gulp-rename'),
      uglify          = require('gulp-uglify'),
      postcss         = require('gulp-postcss'),
      imagemin        = require('gulp-imagemin');

// load gulp api methods
const { series, src, dest, parallel } = require('gulp');

// browserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist'
    },
    port: 3000,
    notify: false,
    files: [
      './dist/**/*.html',
      './dist/js/*.js',
      './dist/css/*.css',
      './dist/libs/*'
    ]
  });

  done();
}

// browserSync reload
function browserSyncReload(done) {
  browsersync.reload();

  done();
}

// copy all libraries
function copyLibs() {
  return (
    src([
      'src/libs/bootstrap-grid/bootstrap-grid-4.0.0.min.css',
      'src/libs/jquery/jquery-3.5.1.min.js',
      'src/libs/jquery/jquery.inputmask.min.js',
      'src/libs/moment-js/moment.min.js'
    ])
      .pipe(dest('dist/libs/'))
  )
}

// copy all fonts
function copyFonts() {
  return (
    src(['src/fonts/**/*.{ttf,woff,woff2}'])
      .pipe(dest('dist/fonts/'))
  )
}

// copy font-awesome icons 
function copyFontAwesome() {
  return (
    src([
      'src/libs/font-awesome/webfonts/*.{ttf,woff,woff2,eot,svg}',
      'src/libs/font-awesome/css/all.min.css'
    ])
      .pipe(dest('dist/css/font-awesome/webfonts/'))
  )
}

// compression all images
function compressionImages() {
  return (
    src('src/img/*')
      .pipe(
        imagemin([
          imageminMozjpeg({
            quality: 85
          })
        ]))
      .pipe(dest('dist/img/'))
  )
}

// copy scss
function styles() {
  return (
    src('src/styles/*.sass')
      .pipe(sass({
        includePaths: require('node-bourbon').includePaths
      }).on('error', sass.logError))
      .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(dest('dist/css'))
  )
}

// copy js
function entryScripts() {
  return (
    src('src/*.js')
      .pipe(dest('dist'))
  )
}

// copy js
function scripts() {
  return (
    src('src/js/**/*.js')
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest('dist/js'))
  )
}

// copy html
function copyHtml() {
  return (
    src('src/**/*.html')
      .pipe(dest('dist'))
  )
}

// Watch files
function watchFiles() {
  gulp.watch('src/libs/*', copyLibs);
  gulp.watch('src/styles/*.scss', styles);
  gulp.watch('src/js/*.js', scripts);
  gulp.watch('src/*.html', copyHtml);
}

// clean build
function clean() {
  return del(['./dist']);
}

// Commit and push files to Git
function git() {
  return exec('git add . && git commit -m"surge deploy"');
}

// Deploy prodject to surge
function surgeDeploy() {
  return surge({
  project: './dist', // Path to your static build directory
  domain: '${YOUR_DOMAIN_NAME}.surge.sh'  // Your domain or Surge subdomain
  })
}

// define complex tasks
const build = series(clean, parallel(styles, copyLibs, entryScripts, scripts, copyHtml, copyFonts, copyFontAwesome, compressionImages));
const watch = parallel(watchFiles, browserSync, browserSyncReload);

// export tasks
exports.copyLibs = copyLibs;
exports.copyFonts = copyFonts;
exports.copyFontAwesome = copyFontAwesome;
exports.compressionImages = compressionImages;
exports.styles = styles;
exports.entryScripts = entryScripts;
exports.scripts = scripts;
exports.copyHtml = copyHtml;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = series(build, watch);
exports.deploy = series(build, surgeDeploy);
