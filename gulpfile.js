'use strict';

const	gulp   = require( 'gulp' ),
		yargs  = require( 'yargs' ),
		jeditor  = require( 'gulp-json-editor' ),
		notify = require('gulp-notify'),
		rename = require( 'gulp-rename' ),
		imagemin = require( 'gulp-imagemin' ),
		uglify = require( 'gulp-uglify' ),
		uglifycss = require( 'gulp-uglifycss' );

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
				`${ projectPath }/**/*.(sass|scss)`,
				`!${ projectPath }/**/assets/sass/style.(sass|scss)`,
			],
			inputThemeScss: [
				`${ projectPath }/assets/sass/style.(sass|scss)`,
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
			`${ projectPath }/../../uploads/**/*.+(jpg|jpeg|png|svg|gif)`,
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
	let newProjectPath= yargs.argv.path.replace( /\\/g, '/' )
	return gulp
		.src( configPath )
		.pipe( jeditor( function( json ) {
			json.projectPath = newProjectPath;
			return json;
		} ) )
		.pipe( gulp.dest( './' ) )
		.pipe( notify(
			{
				title:'The project is switched',
				message: newProjectPath
			}
		) );;
});

/**
*	Compress task
**/
gulp.task( TASK.compress.img, ( done ) => {
	return gulp
		.src( SRC_PATH.img )
		.pipe( imagemin() )
		.pipe( gulp.dest( '.' ) )
		.pipe( notify(
			{
				title:'Compress images',
				message:'File: <%= file.relative %>'
			}
		) );
});

gulp.task( TASK.compress.js, ( done ) => {
	return gulp
		.src( SRC_PATH.file )
		.pipe( uglify() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, SRC_PATH.js.output.path, SRC_PATH.js.output.sufix )
		} ) )
		.pipe( gulp.dest( './' ) )
		.pipe( notify(
			{
				title:'Compress JS.',
				message:'File: <%= file.relative %>'
			}
		) );
});

gulp.task( TASK.compress.css, ( done ) => {
	return gulp
		.src( SRC_PATH.css.input )
		.pipe( uglifycss() )
		.pipe( rename( function( filePath ){
			renameFile( filePath, SRC_PATH.css.output.path, SRC_PATH.css.output.sufix )
		} ) )
		.pipe( gulp.dest( './' ) )
		.pipe( notify(
			{
				title:'Compress CSS.',
				message:'File: <%= file.relative %>'
			}
		) );
});

/**
* Other function
**/
function renameFile( path, subDir, sufix) {
	path.dirname += subDir;
	path.basename += sufix;
};
