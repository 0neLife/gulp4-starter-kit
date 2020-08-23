"use strict";

// load plugins
const autoprefixer 		= require('autoprefixer'),
			browsersync 		= require('browser-sync').create(),
			del 						= require('del'),
			cssnano 			  = require('cssnano'),
			imageminMozjpeg = require('imagemin-mozjpeg'),
			gulp						= require('gulp'),  
			sass 						= require('gulp-sass'),
			rename 					= require('gulp-rename'),
			uglify 					= require('gulp-uglify'),
			postcss 				= require('gulp-postcss'),
			imagemin  			= require('gulp-imagemin');

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
			'src/libs/bootstrap-grid/*.css',
			'src/libs/jquery/*.js'
			])
			.pipe(dest('dist/libs'))
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
		src('src/styles/*.scss')
			.pipe(sass({
				includePaths: require('node-bourbon').includePaths
			}).on('error', sass.logError))
			.pipe(rename({suffix: '.min', prefix : ''}))
			.pipe(postcss([autoprefixer(), cssnano()]))
			.pipe(dest('dist/css'))
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

// define complex tasks
const build = series(clean, parallel(styles, copyLibs, scripts, copyHtml, copyFonts, copyFontAwesome, compressionImages));
const watch = parallel(watchFiles, browserSync);

// export tasks
exports.copyLibs = copyLibs;
exports.copyFonts = copyFonts;
exports.copyFontAwesome = copyFontAwesome;
exports.compressionImages = compressionImages;
exports.styles = styles;
exports.scripts = scripts;
exports.copyHtml = copyHtml;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = series(build, watch);
