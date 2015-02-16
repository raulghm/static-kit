/* 	--------------------------------------------
 *
 *	Starter web kit for static web development
 * 	
 *	author: Raúl Hernández M.
 *	url: https://github.com/raulghm/static-kit
 *	github: http://github.com/raulghm
 *	email: raulghm@gmail.com
 *	twitter: @raulghm
 *	web: raulh.com
 *
 * 	 Copyright 2015 Raúl Hernández M., All rights reserved.
 *
 * 	 Licensed under the Apache License, Version 2.0 (the "License");
 * 	 you may not use this file except in compliance with the License.
 * 	 You may obtain a copy of the License at
 *
 * 	 https://www.apache.org/licenses/LICENSE-2.0
 *
 * 	 Unless required by applicable law or agreed to in writing, software
 * 	 distributed under the License is distributed on an "AS IS" BASIS,
 * 	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 	 See the License for the specific language governing permissions and
 * 	 limitations under the License
 * 	-------------------------------------------- */

'use strict';

/* 	--------------------------------------------
 * 	Include Gulp and other build automation 
 *	tools and utilities
 *	See: https://github.com/gulpjs/gulp/blob/master/docs/API.md
 * 	-------------------------------------------- */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var argv = require('minimist')(process.argv.slice(2));

/* 	--------------------------------------------
 * 	Settings
 * 	-------------------------------------------- */
var SRC = 'src';                    // The source input folder
var DEST = './dist';                // The build output folder
var BOWER = './bower_components';   // The bower input folder
var RELEASE = !!argv.dist;          // Minimize and optimize during a build?

/* 	--------------------------------------------
 * 	Autoprefixer
 * 	See: https://github.com/ai/autoprefixer
 * 	-------------------------------------------- */
var AUTOPREFIXER_BROWSERS = [       
	'ie >= 9',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

/* 	--------------------------------------------
 * 	Vendor scripts variables for consume
 * 	-------------------------------------------- */
var VENDOR_SCRIPTS = require('./vendor_scripts');

/* 	--------------------------------------------
 * 	Temporaly variables for used tasks
 * 	-------------------------------------------- */
var src = {};
var watch = false;
var reload = browserSync.reload;

/* 	--------------------------------------------
 * 	Auto reload gulpfile.js
 * 	See: http://noxoc.de/2014/06/25/reload-gulpfile-js-on-change/
 * 	-------------------------------------------- */
var spawn = require('child_process').spawn;
gulp.task('autoreload', function() {
	var process;

	function restart() {
		if (process) {
			process.kill();
		}
		process = spawn('gulp', null, {stdio: 'inherit'});
	}

	gulp.watch(['gulpfile.js', 'vendor_scripts.js'], restart);
	restart();
});

/* 	--------------------------------------------
 * 	Clean up task
 * 	-------------------------------------------- */
gulp.task('clean', del.bind(null, [DEST]));

/* 	--------------------------------------------
 * 	Images task
 * 	-------------------------------------------- */
gulp.task('images', function() {
	src.images = SRC + '/images/**';
	return gulp.src(SRC + '/images/**/*')
		.pipe($.cache($.imagemin({
			progressive: true,
			interlaced: true
		})))
		.pipe(gulp.dest(DEST + '/images'))
		.pipe($.if(watch, reload({stream: true})));
});

/* 	--------------------------------------------
 * 	Fonts task
 * 	-------------------------------------------- */
gulp.task('fonts', function() {
	return merge(
		gulp.src(BOWER + '/font-awesome/fonts/**')
			.pipe(gulp.dest(DEST + '/fonts/font-awesome'))
	);
});

/* 	--------------------------------------------
 * 	HTML pages task (assemble)
 * 	-------------------------------------------- */
gulp.task('pages', function() {
	src.pages = [SRC + '/templates/pages/**/*', SRC + '/templates/layouts/**/*', SRC + '/templates/partials/**/*', SRC + '/data/**/*.{yml,json}'];
	return gulp.src(src.pages[0])
		.pipe($.if('*.hbs', $.assemble({
			data: src.pages[3],
			partials: SRC + '/templates/partials/**/*.hbs',
			layout: 'default',
			layoutext: '.hbs',
			layoutdir: SRC + '/templates/layouts'
		})))
		.pipe($.if(RELEASE, $.htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			// minifyJS: true, minifyCSS: true
		})))
		.pipe($.size({
			title: 'Size HTML:'
		}))
		.pipe(gulp.dest(DEST))
		.pipe($.if(watch, reload({stream: true})));
});

/* 	--------------------------------------------
 * 	Styles task (SASS)
 * 	-------------------------------------------- */
gulp.task('styles', function() {
	src.styles = [SRC + '/styles/**/*.scss'];
	return gulp.src(SRC + '/styles/styles.scss')
		.pipe($.plumber())
		.pipe($.if(!RELEASE, $.sourcemaps.init()))
		  .pipe($.sass({
		    sourceComments: "normal",
		    errLogToConsole: false,
		    onError: function(err) {
		      return $.notify().write(err);
		    }
		  }))
		.pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
		.pipe($.if(!RELEASE, $.sourcemaps.write('./')))
		.pipe($.if(RELEASE, $.minifyCss({
	    keepSpecialComments: 0
	  })))
	  .pipe($.size({
			title: 'Size CSS:'
		}))
		.pipe($.changed(DEST))
		.pipe(gulp.dest(DEST + '/styles'))
		.pipe($.filter('**/*.css'))
		.pipe($.if(watch, $.livereload()))
});

/* 	--------------------------------------------
 * 	Scripts task
 * 	-------------------------------------------- */
gulp.task('scripts', function() {
	src.scripts = [SRC + '/scripts/**/*.js'];
	return gulp.src(VENDOR_SCRIPTS)
		.pipe($.if(!RELEASE, $.sourcemaps.init()))
		.pipe($.concat('scripts.js'))
		.pipe($.if(RELEASE, $.uglify()))
		.pipe($.if(RELEASE, $.stripDebug()))
		.pipe($.if(!RELEASE, $.sourcemaps.write('./')))
		.pipe($.size({
			title: 'Size JS:'
		}))
		.pipe(gulp.dest(DEST + '/scripts'))
		.pipe($.if(watch, reload({stream: true})));
});


/* 	--------------------------------------------
 * 	Gulp tasks
 * 	-------------------------------------------- */

/* 	--------------------------------------------
 * 	The default task 
 *	-> gulp
 * 	-------------------------------------------- */
gulp.task('default', ['serve']);

/* 	--------------------------------------------
 * 	The build task
 *	-> gulp build
 *	-> gulp build --dist (for distribution)
 * 	-------------------------------------------- */
gulp.task('build', ['clean'], function (cb) {
	runSequence(['styles', 'scripts', 'fonts', 'images', 'pages'], cb);
});

/* 	--------------------------------------------
 * 	The watch task
 * 	-------------------------------------------- */
gulp.task('watch', function() {
	$.livereload.listen();
	gulp.watch(src.images, ['images']);
	gulp.watch(src.pages, ['pages']);
	gulp.watch(src.styles, ['styles']);
	gulp.watch(src.scripts, ['scripts']);
	watch = true;
});

/* 	--------------------------------------------
 * 	Serve task (BrowserSync)
 * 	-------------------------------------------- */
gulp.task('serve', ['build'], function() {
	if (!RELEASE) {
		browserSync({
			notify: false,
			open: false,
			server: {
				baseDir: DEST
			}
		});
		runSequence('watch');
	}
});
