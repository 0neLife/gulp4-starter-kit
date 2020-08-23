"use strict";

const { series, src, dest, parallel } = require('gulp');

const gulp 						= require('gulp'),
			del 						= require('del'),
			sass 						= require('gulp-sass'),
			rename 					= require('gulp-rename'),
			uglify 					= require('gulp-uglify'),
			autoprefixer 		= require('autoprefixer'),
			postcss 				= require('gulp-postcss'),
			cssnano 			  = require("cssnano"),
			imagemin  			= require('gulp-imagemin'),
			imageminMozjpeg = require('imagemin-mozjpeg'),
			browsersync 		= require('browser-sync').create();

// BrowserSync
function browserSync(done) {
  browsersync.init({
		server: {
				baseDir: './dist'
		},
		port: 3000,
		notify: false,
		files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css','./dist/libs/*']
	});

  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./_site/assets/"]);
}

function copyLibs() {
	return (
		src([
			'src/libs/bootstrap-grid/*.css',
			'src/libs/jquery/*.js'
			])
			.pipe(dest('dist/libs'))
	)
}

function copyFonts() {
	return (
		src(['src/fonts/**/*.{ttf,woff,eot}'])
			.pipe(dest('dist/fonts/'))
	)
}

function copyFontAwesome() {
	return (
		src([
			'src/libs/font-awesome/webfonts/*.{ttf,woff,woff2,eot,svg}',
			'src/libs/font-awesome/css/all.min.css'
			])
			.pipe(dest('dist/css/font-awesome/webfonts/'))
	)
}

function imageCompression() {
	return (
		src('src/img/*')
			.pipe(imagemin([imageminMozjpeg({
				quality: 85
			})]))
			.pipe(dest('dist/img/'))
	)
}

function styles() {
  return (
		src('src/sass/*.sass')
			.pipe(sass({
				includePaths: require('node-bourbon').includePaths
			}).on('error', sass.logError))
			.pipe(rename({suffix: '.min', prefix : ''}))
			.pipe(postcss([autoprefixer(), cssnano()]))
			.pipe(dest('dist/css'))
	)
}

function scripts() {
	return (
		src('src/js/**/*.js')
			.pipe(uglify())
			.pipe(rename({ suffix: '.min' }))
			.pipe(dest('dist/js'))
	)
}

function copyHtml() {
	return (
		src('src/**/*.html')
			.pipe(dest('dist'))
	)
}

// Watch files
function watchFiles() {
	gulp.watch('src/libs/*', copyLibs);
  gulp.watch('src/sass/*.sass', styles);
	gulp.watch('src/js/*.js', scripts);
  gulp.watch('src/*.html', copyHtml);
}

// define complex tasks
const build = gulp.series(clean, gulp.parallel(styles, copyLibs, scripts, copyHtml, copyFonts, copyFontAwesome, imageCompression));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.copyLibs = copyLibs;
exports.copyFonts = copyFonts;
exports.copyFontAwesome = copyFontAwesome;
exports.imageCompression = imageCompression;
exports.styles = styles;
exports.scripts = scripts;
exports.copyHtml = copyHtml;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;


// gulp.task('default', ['watch','browser-sync']);


// const gulp 						= require('gulp'),
// 			sass 						= require('gulp-sass'),
// 			rename 					= require('gulp-rename'),
// 			uglify 					= require('gulp-uglify'),
// 			minifycss 			= require('gulp-minify-css'),
// 			autoprefixer 		= require('gulp-autoprefixer'),
// 			imagemin  			= require('gulp-imagemin'),
// 			imageminMozjpeg = require('imagemin-mozjpeg'),
// 			browserSync 		= require('browser-sync').create();

// gulp.task('browser-sync', [
// 						'styles',
// 						'imageCompression',
// 						'copyfontAwesome',
// 						'copyfonts',
// 						'copyLibs',
// 						'copyHtml',
// 						'scripts'
// 							], function() {
// 	browserSync.init({
// 			server: {
// 					baseDir: './dist'
// 			},
// 			notify: false,
// 			files: ['./dist/**/*.html','./dist/js/*.js','./dist/css/*.css','./dist/libs/*']
// 	});
// });

// gulp.task('styles', () => {
// 	return gulp.src('src/sass/*.sass')
// 	.pipe(sass({
// 		includePaths: require('node-bourbon').includePaths
// 	}).on('error', sass.logError))
// 	.pipe(rename({suffix: '.min', prefix : ''}))
// 	.pipe(autoprefixer({
// 		browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
// 		cascade: false
// 	}))
// 	.pipe(cleanCss(''))
// 	.pipe(gulp.dest('dist/css'));
// });

// gulp.task('imageCompression', () =>
//   gulp.src('src/img/*')
//   .pipe(imagemin([imageminMozjpeg({
//       quality: 85
//   })]))
//   .pipe(gulp.dest('dist/img/'))
// );

// gulp.task('copyfontAwesome', function() {
//   return gulp.src([
//   	'src/libs/font-awesome/webfonts/*.{ttf,woff,woff2,eot,svg}',
//   	'src/libs/font-awesome/css/all.min.css'
//   	])
//   	.pipe(gulp.dest('dist/css/font-awesome/webfonts/'));
// });

// gulp.task('copyfonts', function() {
//   return gulp.src([
//   	'src/fonts/**/*.{ttf,woff,eot}'])
//   	.pipe(gulp.dest('dist/fonts/'));
// });

// gulp.task('copyLibs', function() {
// 	return gulp.src([
// 		'src/libs/bootstrap-grid/*.css',
// 		'src/libs/jquery/*.js'
// 		])
// 		.pipe(gulp.dest('dist/libs'));
// });

// gulp.task('scripts', function() {
//   return gulp.src('src/js/**/*.js')
// 		.pipe(uglify())
// 		.pipe(rename({ suffix: '.min' }))
// 		.pipe(gulp.dest('dist/js'))
// });

// gulp.task('copyHtml', function() {
// 	return gulp.src('src/**/*.html')
// 	.pipe(gulp.dest('dist'));
// });

// gulp.task('watch', function () {
// 	gulp.watch('src/sass/*.sass', ['styles']);
// 	gulp.watch('src/libs/*', ['copyLibs']);
// 	gulp.watch('src/js/*.js', ['scripts']);
// 	gulp.watch('src/*.html', ['copyHtml']);
// });

// gulp.task('default', ['watch','browser-sync']);