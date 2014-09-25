# include gulp
gulp           = require("gulp")

# include our plugins
sass           = require("gulp-sass")
plumber        = require("gulp-plumber")
notify         = require("gulp-notify")
minifycss      = require("gulp-minify-css")
autoprefixer   = require("gulp-autoprefixer")
concat         = require("gulp-concat")
rename         = require("gulp-rename")
uglify         = require("gulp-uglify")
coffee         = require("gulp-coffee")
assemble       = require("gulp-assemble")
minifyHTML     = require('gulp-minify-html')
browserSync    = require("browser-sync")
gulpStripDebug = require("gulp-strip-debug")
lr             = require("tiny-lr")
livereload     = require("gulp-livereload")
server         = lr()

# paths
src          = "src"
dest         = "dist"

# bower components and scripts files here
SCRIPTS = [
	"bower_components/detectizr/src/detectizr.js"
	"bower_components/instafeed.js/instafeed.js"
	"bower_components/velocity/velocity.js"
	"bower_components/velocity/velocity.ui.js"
	# "bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js"
	dest + "/scripts/scripts.js"
]

#
#	 gulp tasks
#	 ==========================================================================

# copy vendor scripts
gulp.task "copy", ->
	gulp.src [
		"bower_components/jquery/dist/jquery.js"
		"bower_components/modernizr/modernizr.js"
	]
	.pipe uglify()
	.pipe gulp.dest dest + "/scripts"

# coffee
gulp.task "coffee", ->
	gulp.src src + "/scripts/**/*.coffee"
	.pipe coffee
		bare: true
	.pipe concat("scripts.js")
	.pipe gulp.dest dest + "/scripts"
	.pipe livereload()

# coffee-dist
gulp.task "coffee-dist", ->
	gulp.src src + "/scripts/**/*.coffee"
	.pipe coffee
		bare: true
	.pipe concat("scripts.js")
	.pipe gulp.dest dest + "/scripts"

# scripts
gulp.task "scripts",["coffee"], ->
	gulp.src SCRIPTS
	.pipe concat "scripts.js"
	.pipe gulp.dest dest + "/scripts"

# scripts-dist
gulp.task "scripts-dist",["coffee-dist"], ->
	gulp.src SCRIPTS
	.pipe concat "scripts.js"
	.pipe gulpStripDebug()
	.pipe uglify()
	.pipe gulp.dest dest + "/scripts"

# styles
gulp.task "styles", ->
	gulp.src src + "/styles/styles.scss"
	.pipe plumber()
	.pipe sass
		sourceComments: "normal"
		errLogToConsole: false
		onError: (err) -> notify().write(err)
	.pipe autoprefixer("last 15 version")
	.pipe gulp.dest dest + "/styles"
	.pipe livereload()

# styles-dist
gulp.task "styles-dist",  ->
	gulp.src src + "/styles/styles.scss"
	.pipe plumber()
	.pipe sass()
	.on "error", notify.onError()
	.on "error", (err) ->
		console.log "Error:", err
	.pipe autoprefixer("last 15 version")
	.pipe minifycss
		keepSpecialComments: 0
	.pipe gulp.dest dest + "/styles"

# assemble
gulp.task "assemble", ->
	gulp.src( src + "/templates/pages/*.hbs")
	.pipe assemble
		data: src + "/data/*.json"
		partials: src + "/templates/partials/*.hbs"
		layoutdir: src + "/templates/layouts/"
	.pipe gulp.dest dest
	.pipe browserSync.reload stream:true

# assemble-dist
gulp.task "assemble-dist", ->
	gulp.src( src + "/templates/pages/*.hbs")
	.pipe assemble
		data: src + "/data/*.json"
		partials: src + "/templates/partials/*.hbs"
		layoutdir: src + "/templates/layouts/"
	.pipe gulp.dest dest

# browser-sync
gulp.task "browser-sync", ->
	browserSync.init null,
		# proxy: "site.dev"
		open: false
		server:
			baseDir: dest

# html
gulp.task "html", ["assemble-dist", "styles-dist", "scripts-dist"], ->
	gulp.src dest + "/*.html"
	.pipe plumber()
	.pipe minifyHTML()
	.pipe gulp.dest dest

# watch
gulp.task 'watch', ->
	gulp.watch [src + '/scripts/**/*.coffee'], ['scripts']
	gulp.watch [src + '/styles/**/*.scss'], ['styles']
	gulp.watch [src + '/templates/**/*.hbs'], ['assemble']
	gulp.watch [src + '/data/**/*.*'], ['assemble']
	gulp.watch [src + "/vendor/scripts/plugins/*.js"], ['scripts']

#
#  main tasks
#	 ==========================================================================

# default task
gulp.task 'default', [
	"copy"
	"assemble"
	"styles"
	"scripts"
	"browser-sync"
	"watch"
]

# build task
gulp.task 'dist', [
	"copy"
	"html"
]
