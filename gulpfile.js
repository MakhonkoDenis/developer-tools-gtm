'use strict';

var path = {
		base: __dirname + '/',
		assets: {
			js: '**/*.js',
			ignorJs: '**/*.min.js',

			scss: '**/*.scss',

			css: '**/*.css',
			ignorCss: '**/*.min.css',

			img: '**/*.+(jpg|jpeg|png|svg|gif)',
		},
		cherryFramework: {
			base: 'cherry-framework/',
			modules: 'modules/'
		}
	},
	task = [
		'js',
		'scss',
		/*'css',*/
	],
	useFiles = [
		path.base + path.cherryFramework.modules + path.assets.js,
		'!' + path.base + path.cherryFramework.modules + path.assets.ignorJs,

		path.base + path.cherryFramework.modules + path.assets.scss,

		//path.base + path.cherryFramework.modules + path.assets.css,
		//'!' + path.base + path.cherryFramework.modules + path.assets.ignorCss,
	],
	gulp = require( 'gulp' ),
	rename = require( 'gulp-rename' ),
	uglify = require( 'gulp-uglify' );


gulp
	.task( 'default', task )
	.task( 'watch', watchHandler )
	.task( 'js', js )
	.task( 'sass', scss )
	.task( 'css', css )
	.task( 'img', compressImg );

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

function js(){
	var jshint = require( 'gulp-jshint' ),
		uglify = require( 'gulp-uglify' ),/*
		stylish = require('gulp-jshint-file-reporter'),*/
		concat = require( 'gulp-concat' );

	gulp
		.src( [
			path.base + path.cherryFramework.modules + path.assets.js,
			'!' + path.base + path.cherryFramework.modules + path.assets.ignorJs,
		] )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'gulp-jshint-file-reporter', {
			filename: './logs/jshint-output.log'
		} ) )
		.pipe( uglify() )
		.pipe( rename( function( path ){
			renameFile( path, '/min/', '.min')
		} ) )
		.pipe( gulp.dest( path.base + path.cherryFramework.modules ) );
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

function renameFile( path, subDir, sufix) {
	path.dirname += subDir;
	path.basename += sufix;

	console.log( 'FILE: ' + __dirname + '/' + path.dirname + path.basename  + path.extname );
}
function logFiles( logFileName ){
	logFileName = './logs/jshint.log';
}
