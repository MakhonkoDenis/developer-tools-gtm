'use strict';

var path = {
		base: __dirname + '/',
		js: {
			input: [
				'**/*.js',
				'!**/*.min.js',
				'!**/node_modules/**/*.js',
				'!**/gulpfile.js',
			],
			output:{
				path:'/min/',
				sufix: '.min'
			}
		},
		scss: {
			input: [
				'**/*.scss',
				'!**/node_modules/**/*.scss',
				'!**/_*.scss',
			],
			output:{
				path:'/min/',
				sufix: '.min'
			},
			inputMainScss: [
				'assets/style.scss',
			],
			outputMainScss: [
				'./',
			]
		},
		css: {
			input: [
				'**/*.css',
				'!**/*.min.css',
				'!**/node_modules/**/*.css',
			],
			output:{
				path:'/min/',
				sufix: '.min'
			}
		},
		php: [
			'**/*.php',
		],
		img: [
			'**/*.+(jpg|jpeg|png|svg|gif)',
			'!**/node_modules/**/*.+(jpg|jpeg|png|svg|gif)',
		],
		deleteFiles: [
			'**/*.+(map|log|dll)',
/*			'.gitignore',
			'.jscsrc',
			'.jshintignore',*/
			'**/.travis.yml',
			'**/codesniffer.ruleset.xml',
		],
		logs: 'logs/'
	},
	task = {
		default: 'default',
		watch: 'watch',
		clean: 'clean',
		compile: {
			all: 'compile',
			scss: 'compile:scss' //compile and compress file
		},
		check: {
			all: 'check',
			js: 'check:js',
			php: 'check:php',
			textDomain: 'check:textdomain',
		},
		compress: {
			all: 'compress',
			js: 'compress:js', //compress file
			css: 'compress:css', //compress file
			img: 'compress:img',
		},
		tools:{
			clear: 'clear',
			renamePrefix: 'rename-prefix'
		},
		develop: 'dev'
	},
	report,
	gulp = require( 'gulp' ),
	rename = require( 'gulp-rename' );


gulp
	//.task( task.default, task )
	.task( task.watch, watchHandler )
	.task( task.check.all, merge( task.check ) )
	.task( task.check.js, checkJs )
	.task( task.check.php, checkPhp )
	.task( task.check.textDomain, checkTextDomain )
	.task( task.compile.all, merge( task.compile ) )
	.task( task.compile.scss, compileScss )
	.task( task.compress.all, merge( task.compress ) )
	.task( task.compress.js, compressJs )
	.task( task.compress.css, compressCss )
	.task( task.compress.img, compressImg )
	.task( task.tools.clean, cleanHandler )
	.task( task.tools.renamePrefix, renamePrefix )
	.task( task.develop, devHandler );

function devHandler() {
	console.log( merge( task.compress ) );
	//console.log(merge([ task.compile, task.compress ]));
}

/**
*	Wotch for change files
**/
function watchHandler() {
	var inputFiles = mergeArray( [ path.js.input, path.scss.input, path.css.input, path.img, ] ),
		allTack = mergeArray( [ task.compile, task.compress ] ),
		watcher = gulp.watch(
			inputFiles,
			allTack
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

/**
*	Compail task
**/
function compileScss(){
	var gulpSass = require( 'gulp-sass' );

	gulp
		.src( path.scss.input )
		.pipe(
			gulpSass( { outputStyle: 'compressed' } )
				.on( 'error', gulpSass.logError )
		)
		.pipe( rename( function( filePath ){
			renameFile( filePath, path.scss.output.path, path.scss.output.sufix )
		} ) )
		.pipe( gulp.dest( './' ) );
};

/**
*	Compress task
**/
function compressJs(){
	var uglify = require( 'gulp-uglify' );

	report += '\rCompile Files:\r';
	gulp
		.src( path.js.input )
		.pipe( uglify() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, path.js.output.path, path.js.output.sufix )
		} ) )
		.pipe( gulp.dest( './' ) );
};

function compressCss(){
	var uglifycss = require( 'gulp-uglifycss' );

	gulp
		.src( path.css.input )
		.pipe( uglifycss() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, path.css.output.path, path.css.output.sufix )
		} ) )
		.pipe( gulp.dest( './' ) );
};

function compressImg(){
	var imagemin = require( 'gulp-imagemin' );

	gulp
		.src( path.img )
		.pipe( imagemin() )
		.pipe( gulp.dest( './' ) );
};

/**
*	Check task
**/
function checkJs(){
	var jsHint = require( 'gulp-jshint' ),
		jscs = require( 'gulp-jscs' ),
		stylish = require( 'gulp-jscs-stylish' );

	gulp
		.src( path.js.input )
		.pipe( jsHint() )
		.pipe( jscs( {
			fix: false,
			configPath: './test-config/.jscsrc'
		} ) )
		.pipe( stylish.combineWithHintResults() )
		.pipe( jsHint.reporter( 'gulp-jshint-file-reporter', {
			filename: path.base + path.logs + 'js-cs-and-hint.log'
		} ) )
};

function checkPhp() {
	var phpcs = require('gulp-phpcs');

	gulp
		.src( path.php )
		.pipe( phpcs({
			bin: './test-config/php_codesniffer',
			standard: 'PSR2',
			warningSeverity: 0
		}) )
		.pipe( phpcs.reporter( 'file', { path: path.base + path.logs + 'php-cs.log' } ) );
	console.log('checkPhp');
}

function checkTextDomain() {
	console.log('checkTextDomain');
}

/**
* tools tack
**/
function cleanHandler() {
	var clean = require('gulp-clean');

	gulp
		.src( path.deleteFiles )
		.pipe( clean() );
}

function renamePrefix() {
	console.log('renamePrefix');
}

/**
* Other function
**/
function renameFile( path, subDir, sufix) {
	path.dirname += subDir;
	path.basename += sufix;

	//console.log('FILE: ' + __dirname + '/' + path.dirname + path.basename  + path.extname );
};

function merge( object ) {
	var item,
		deepItem,
		pushItem,
		ignor = 'all',
		outputArray = new Array();

	for ( item in object ) {

		if( 'object' === typeof( object[ item ] ) || 'array' === typeof( object[ item ] )){
			for ( deepItem in object[ item ] ) {
				if ( ignor !== deepItem ) {
					outputArray.push( object[ item ][ deepItem ] );
				}
			}

		} else {
			if ( ignor !== item ) {
				outputArray.push( object[ item ] );
			}
		}
	}

	return outputArray;
};
