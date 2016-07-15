'use strict';

const	gulp   = require( 'gulp' ),
		yargs  = require( 'yargs' ),
		jeditor  = require( 'gulp-json-editor' ),
		rename = require( 'gulp-rename' ),
		imagemin = require( 'gulp-imagemin' ),
		uglify = require( 'gulp-uglify' ),
		uglifycss = require( 'gulp-uglifycss' ),
		gulpSass = require( 'gulp-sass' ),
		autoprefixer = require('gulp-autoprefixer'),
		print = require('gulp-print'),
		chalk = require('chalk');

const	fileNameColor = chalk.cyan,
		messageColor = chalk.green;

let		configPath = `${__dirname}/config.json`,
		config = require( configPath ),
		projectPath = config.projectPath;

const	SRC_PATH = {
		js: {
			input: [
				`${ projectPath }/**/*.js`,
				`!${ projectPath }/**/*.min.js`,
			],
			inputThemeJs: [
				`${ projectPath }/assets/js/theme-script.js`,
			],
			output:{
				path:'/min/',
				sufix: '.min'
			}
		},
		scss: {
			input: [
				`${ projectPath }/**/*.scss`,
				`!${ projectPath }/**/assets/sass/style.scss`,
			],
			inputThemeScss: [
				`${ projectPath }/assets/sass/style.scss`,
			],
			output:{
				path:'/min/',
				sufix: '.min'
			}
		},
		css: {
			input: [
				`${ projectPath }/**/*.css`,
				`!${ projectPath }/**/*.min.css`,
				`!${ projectPath }/**/+(style|rtl).css`,
			],
			output:{
				path:'/min/',
				sufix: '.min'
			}
		},
		img: [
			`${ projectPath }/**/*.+(jpg|jpeg|png|svg|gif)`,
		],
	},
	TASK = {
		default: 'default',
		watch: {
			dev: 'watch:dev',
			maker: 'watch:maker'
		},
		compile: {
			all: 'compile',
			themeScss: 'compile:theme-scss',
			scss: 'compile:scss'
		},
		compress: {
			all: 'compress',
			themeJs: 'compress:theme-js',
			js: 'compress:js',
			css: 'compress:css',
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

/**
*	Set project
**/
gulp.task('use-in', ( done ) => {
	let newProjectPath= yargs.argv.path.replace( /\\/g, '/' ).replace( /(\\|\/)$/g, '' );
	return gulp
		.src( configPath )
		.pipe( jeditor( function( json ) {
			json.projectPath = newProjectPath;
			return json;
		} ) )
		.pipe( gulp.dest( './' ) )
		.pipe( print( () => {
			return notice( 'The project is switched: ', newProjectPath );
		} ) );
});

/**
*	Wotch for change files
**/
gulp
	.task(
		TASK.watch.dev,
		watcher.bind(
			null,
			{
				file: merge( [ SRC_PATH.js.input, SRC_PATH.scss.input, SRC_PATH.scss.inputThemeScss, ] ),
				task: merge( [ TASK.compile, TASK.compress.js, ] )
			}
		)
	)
	.task(
		TASK.watch.maker,
		watcher.bind(
			null,
			{
				file: [ SRC_PATH.js.inputThemeJs, SRC_PATH.scss.inputThemeScss, ],
				task: [ TASK.compile.themeScss, TASK.compress.themeJs, ]
			}
		)
	);

function watcher( data ) {
	return gulp
		.watch(
			data.file,
			data.task
		)
		/*.on( 'change', function( event ) {
			console.log( 'Event type: ' + event.type );
			console.log( 'Event path: ' + event.path );
		} )
		.on( 'error', function( event ) {
			console.log( 'Event type: ' + event.type );
			console.log( 'Event path: ' + event.path );
		} )*/;
}

/**
*	Compress task
**/
gulp.task( TASK.compress.img, ( done ) => {
	return gulp
		.src( SRC_PATH.img )
		.pipe( imagemin() )
		.pipe( gulp.dest( projectPath + '/' ) )
		.pipe( print( ( path ) => {
			return notice( 'Compress image file: ', path );
		} ) );
});

gulp.task( TASK.compress.js, ( done ) => {
	return gulp
		.src( SRC_PATH.js.input )
		.pipe( uglify() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, SRC_PATH.js.output.path, SRC_PATH.js.output.sufix )
		} ) )
		.pipe( gulp.dest( projectPath + '/' ) )
		.pipe( print( ( path ) => {
			return notice( 'Compress JS file: ', path );
		} ) );
});

gulp.task( TASK.compress.css, ( done ) => {
	return gulp
		.src( SRC_PATH.css.input )
		.pipe( uglifycss() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, SRC_PATH.css.output.path, SRC_PATH.css.output.sufix )
		} ) )
		.pipe( gulp.dest( projectPath + '/' ) )
		.pipe( print( ( path ) => {
			return notice( 'Compress CSS file: ', path );
		} ) );
});

/**
*	Compail task
**/
gulp.task(
		TASK.compile.scss,
		compileScss.bind(
			null,
			{
				file: SRC_PATH.scss.input,
				outputFile: projectPath + '/',
				rename:true
			}
		)
	)
	.task(
		TASK.compile.themeScss,
		compileScss.bind(
			null,
			{
				file: SRC_PATH.scss.inputThemeScss,
				outputFile: projectPath + '/',
				rename:false
			}
		)
	);

function compileScss( data ){
	return gulp
			.src( data.file )
			.pipe( autoprefixer() )
			.pipe(
				gulpSass( { outputStyle: 'compressed' } )
					.on( 'error', gulpSass.logError )
			)
			.pipe( rename( function( filePath ){
				if( data.rename ){
					renameFile( filePath, SRC_PATH.scss.output.path, SRC_PATH.scss.output.sufix )
				}
			} ) )
			.pipe( gulp.dest( data.outputFile ) )
			.pipe( print( ( path ) => {
				return notice( 'Compile SASS file: ', path );
			} ) );
};

/**
* Other function
**/
function notice( message, path ){
	var regexp = /(\w[^\/|//]{1,})/ig ,
		path = ( path ) ? fileNameColor( path ) : '',
		message = message ? messageColor( message ) : '' ;

	return  message + path;
}

function renameFile( path, subDir, sufix) {
	path.dirname += subDir;
	path.basename += sufix;
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
