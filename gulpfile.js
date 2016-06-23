'use strict';

var path = {
		base: __dirname + '/',
		js: {
			input: [
				'./modules/**/*.js',
				'!**/*.min.js',
				'!./node_modules',
				'!./gulpfile.js',
			],
			output:{
				path:'min/',
				sufix: '.min'
			}
		},
		scss: {
			input: [
				'**/*.scss',
			],
			output:{
				path:'min/',
				sufix: '.min'
			}
		},
		css: {
			input: [
				'**/*.css',
				'!**/*.min.css',
			],
			output:{
				path:'min/',
				sufix: '.min'
			}
		},
		img: [
			'**/*.+(jpg|jpeg|png|svg|gif)',
		],
		logs: 'logs/'
	},
	task = {
		default: 'default',
		watch: 'watch',
		compile: [
			'compile:js', //compile and compress file
			'compile:scss', //compile and compress file
			'compile:css', //compress and concat file
		],
		check: [
			'check:js',
			'check:php',
		],
		compress: [
			'compress:img',
		],
	},
	gulp = require( 'gulp' ),
	rename = require( 'gulp-rename' );


gulp
	//.task( task.default, task )
	//.task( task.watch, watchHandler )
	.task( task.compile[0], compileJs )
	.task( task.check[0], checkJs )
/*	.task( compile[1], compileCcss )
	.task( compile[2], compileCss )
	.task( compress[0], compressImg )*/;

function compileJs(){
	var uglify = require( 'gulp-uglify' )/*,
		stylish = require('gulp-jshint-file-reporter'),*/;

	gulp
		.src( path.js.input )
		.pipe( uglify() )
		.pipe( rename( function( path ){
			renameFile( path, '/min/', '.min' )
		} ) )
		.pipe( gulp.dest( path.base + path.cherryFramework.modules ) );
};
function checkJs(){
	var jshint = require( 'gulp-jshint' )/*,
		concat = require( 'gulp-concat' )*/;

	gulp
		.src( path.js.input )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'gulp-jshint-file-reporter', {
			filename: path.base + path.logs + 'jshint-output.log'
		} ) );
};

function scss(){
	var gulpSass = require( 'gulp-sass' );

	gulp
		.src( [
			path.base + path.cherryFramework.modules + path.assets.scss,
		] )
		.pipe( gulpSass( { outputStyle: 'compressed' } ).on( 'error', gulpSass.logError ) )
		.pipe( rename( function( path ){
			renameFile( path, '/min/', '.min')
		} ) )
		.pipe( gulp.dest( path.base + path.cherryFramework.modules ) );
};

function css(){
	var uglifycss = require( 'gulp-uglifycss' );

	gulp
		.src( [
			path.base + path.cherryFramework.modules + path.assets.css,
			'!' + path.base + path.cherryFramework.modules + path.assets.ignorCss,
		] )
		.pipe( uglifycss() )
		.pipe( rename( function( path ){
			renameFile( path, '/min/', '.min')
		} ) )
		.pipe( gulp.dest( path.base + path.cherryFramework.modules ) );
};

function compressImg(){
	var imagemin = require( 'gulp-imagemin' );

	gulp
		.src( [
			path.base + path.cherryFramework.modules + path.assets.img,
		] )
		.pipe(imagemin())
		.pipe( gulp.dest( path.base + path.cherryFramework.modules ) );
};

function watchHandler() {
	var watcher = gulp.watch(
		[
			path.base + path.cherryFramework.modules + path.assets.js,
			'!' + path.base + path.cherryFramework.modules + path.assets.ignorJs,
			path.base + path.cherryFramework.modules + path.assets.scss,
		],
		task
	);

	watcher
		.on( 'change', function( event ) {
			console.log( 'Event type: ' + event.type );
			console.log( 'Event path: ' + event.path );
		} )
		.on( 'error', function( event ) {
			console.log( 'Event type: ' + event.type );
			console.log( 'Event path: ' + event.path );
		} );
}

function renameFile( path, subDir, sufix) {
	path.dirname += subDir;
	path.basename += sufix;

	console.log( 'FILE: ' + __dirname + '/' + path.dirname + path.basename  + path.extname );
};
