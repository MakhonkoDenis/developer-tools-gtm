'use strict';

const	gulp = require( 'gulp' ),
		rename = require( 'gulp-rename' ),
		notify = require('gulp-notify')
		fs = require( 'fs' ),
		package = JSON.parse( fs.readFileSync( `${__dirname}/package.json` ) );

const	projectPath = '',
		path = {
			js: {
				input: [
					`${ projectPath }/**/*.js`,
					'!${ projectPath }/**/*.min.js',
				],
				inputThemeJs: [
					'${ projectPath }/assets/js/theme-script.js',
				],
				output:{
					path:'/min/',
					sufix: '.min'
				}
			},
			scss: {
				input: [
					'${ projectPath }/**/*.(sass|scss)',
					'!${ projectPath }/**/assets/sass/style.(sass|scss)',
				],
				inputThemeScss: [
					'${ projectPath }/assets/sass/style.(sass|scss)',
				],
				output:{
					path:'/min/',
					sufix: '.min'
				}
			},
			css: {
				input: [
					'${ projectPath }/**/*.css',
					'!${ projectPath }/**/*.min.css',
					'!${ projectPath }/**/(style|rtl).css',
				],
				output:{
					path:'/min/',
					sufix: '.min'
				}
			},
			php: [
				'${ projectPath }/**/*.php',
			],
			img: [
				'${ projectPath }/**/*.+(jpg|jpeg|png|svg|gif)',
			],
			deleteFiles: [
				'${ projectPath }/logs',
				'${ projectDir }/**/*.+(map|log|dll)',
			],
			logs: '${ projectPath }/logs/'
		},
		task = {
			default: 'default',
			watch: {
				dev: 'watch:dev',
				maker: 'watch:maker'
			},
			compile: {
				all: 'compile',
				themeScss: 'compile:theme-scss', //compile and compress file
				scss: 'compile:scss' //compile and compress file
			},
			compress: {
				all: 'compress',
				themeJs: 'compress:theme-js', //compress file
				js: 'compress:js', //compress file
				css: 'compress:css', //compress file
				img: 'compress:img'
			},
			check: {
				all: 'check',
				js: 'check:js',
				php: 'check:php',
				textDomain: 'check:textdomain'
			},
			tools:{
				clean: 'clean',
				renamePrefix: 'rename-prefix'
			},
			develop: 'dev'
		};

const	PHP_CODING_STANDARDS_PATH = `${__dirname}/style_guide_config/php_codesniffer/scripts/phpcs`,
		WP_CODING_STANDARDS_PATH = `${__dirname}/style_guide_config/wordpress_coding_standards`;

gulp
	//.task( task.default, task )
	.task(
		task.watch.dev,
		watcher.bind(
			null,
			{
				file: merge( [ path.js.input, path.scss.input, path.scss.inputThemeScss, path.css.input, path.img, ] ),
				task: merge( [ task.compile, task.compress, ] )
			}
		)
	)
	.task(
		task.watch.maker,
		watcher.bind(
			null,
			{
				file: [ path.js.inputThemeJs, path.scss.inputThemeScss ],
				task: [ task.compile.themeScss, task.compress.themeJs, ]
			}
		)
	)
	/*.task( task.check.all, merge( task.check ) )
	.task( task.check.js, checkJs )
	.task( task.check.php, checkPhp )
	.task( task.check.textDomain, checkTextDomain )*/
	.task( task.compile.all, merge( task.compile ) )
	.task(
		task.compile.scss,
		compileScss.bind(
			null,
			{
				file: path.scss.input,
				outputFile: './',
				rename:true
			}
		)
	)
	.task(
		task.compile.themeScss,
		compileScss.bind(
			null,
			{
				file: path.scss.inputThemeScss,
				outputFile: projectPathв,
				rename:false
			}
		)
	)
	.task( task.compress.all, merge( task.compress ) )
	.task( task.compress.themeJs, compressJs.bind( null, { file: path.js.inputThemeJs } ) )
	.task( task.compress.js, compressJs.bind( null, { file: path.js.input } ) )
	.task( task.compress.css, compressCss )
	.task( task.compress.img, compressImg )
	/*.task( task.tools.clean, cleanHandler )
	.task( task.tools.renamePrefix, renamePrefix )
	.task( task.develop, devHandler )*/;

function devHandler() {
	console.log( merge( task.compress ) );
	//console.log(merge([ task.compile, task.compress ]));
}

/**
*	Wotch for change files
**/
function watcher( data ) {
	gulp
		.watch(
			data.file,
			data.task
		)
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
function compileScss( data ){
	let gulpSass = require( 'gulp-sass' ),
		autoprefixer = require('gulp-autoprefixer');

	return gulp
			.src( data.file )
			.pipe( autoprefixer() )
			.pipe(
				gulpSass( { outputStyle: 'compressed' } )
					.on( 'error', gulpSass.logError )
			)
			.pipe( rename( function( filePath ){
				if( data.rename ){
					renameFile( filePath, path.scss.output.path, path.scss.output.sufix )
				}
			} ) )
			.pipe( gulp.dest( data.outputFile ) )
			.pipe( notify(
				{
					title:'Compile SASS.',
					message:'File: <%= file.relative %>'
				}
			) );
};

/**
*	Compress task
**/
function compressJs( data ){
	let uglify = require( 'gulp-uglify' );

	return gulp
			.src( data.file )
			.pipe( uglify() )
			.pipe( rename( function( filePath ){
				renameFile( filePath, path.js.output.path, path.js.output.sufix )
			} ) )
			.pipe( gulp.dest( './' ) )
			.pipe( notify(
				{
					title:'Compress JS.',
					message:'File: <%= file.relative %>'
				}
			) );
};

function compressCss(){
	let uglifycss = require( 'gulp-uglifycss' );

	return gulp
			.src( path.css.input )
			.pipe( uglifycss() )
			.pipe( rename( function( filePath ){
				renameFile( filePath, path.css.output.path, path.css.output.sufix )
			} ) )
			.pipe( gulp.dest( './' ) )
			.pipe( notify(
				{
					title:'Compress CSS.',
					message:'File: <%= file.relative %>'
				}
			) );
};

function compressImg(){
	let imagemin = require( 'gulp-imagemin' );

	return gulp
			.src( path.img )
			.pipe( imagemin() )
			.pipe( gulp.dest( './' ) )
			.pipe( notify(
				{
					title:'Compress images.',
					message:'File: <%= file.relative %>'
				}
			) );
};

/**
*	Check task
**//*
function checkJs(){
	var jsHint = require( 'gulp-jshint' ),
		jscs = require( 'gulp-jscs' ),
		stylish = require( 'gulp-jscs-stylish' ),
		rev = require( 'gulp-rev' );

	return gulp
			.src( path.js.input )

			.pipe( jscs( {
				fix: false,
				configPath: './cherry-framework/.jscsrc'
			} ) )
			.pipe( jsHint() )
			.pipe( stylish.combineWithHintResults() )
			.pipe( jsHint.reporter( 'gulp-jshint-file-reporter', {
				filename: path.base + path.logs + 'js-cs-and-hint.log'
			} ) )
			.pipe( notify(
				{
					title:'Check JS.',
					message:'File: <%= file.relative %>'
				}
			) );
};

function checkPhp() {
	var phpcs = require('gulp-phpcs');

	return gulpgulp
			.src( path.php )
			.pipe( phpcs({
				bin: './test-config/php_codesniffer',
				standard: 'PSR2',
				warningSeverity: 0
			}) )
			.pipe( phpcs.reporter( 'file', { path: path.base + path.logs + 'php-cs.log' } ) )
			.pipe( notify(
				{
					title:'Check PHP.',
					message:'File: <%= file.relative %>'
				}
			) );
}

function checkTextDomain() {
	console.log('checkTextDomain');
}
*/
/**
* tools tack
**//*
function cleanHandler() {
	var clean = require('gulp-clean');

	return gulp
			.src( path.deleteFiles )
			.pipe( clean() )
			.pipe( notify(
				{
					title:'Clear theme done.',
					message:'Delete file: <%= file.relative %>'
				}
			) );
}

function renamePrefix() {
	console.log('renamePrefix');
}
*/
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
		ignor = [ 'all', 'themeJs', ],
		outputArray = new Array();

	for ( item in object ) {

		if( 'object' === typeof( object[ item ] ) || 'array' === typeof( object[ item ] )){
			for ( deepItem in object[ item ] ) {
				if ( -1 === ignor.indexOf( deepItem ) ) {
					outputArray.push( object[ item ][ deepItem ] );
				}
			}

		} else {
			if ( -1 === ignor.indexOf( deepItem ) ) {
				outputArray.push( object[ item ] );
			}
		}
	}

	return outputArray;
};
