// required modules

var gulp        = require('gulp'),
	concat      = require('gulp-concat'),
	cleanCSS    = require('gulp-clean-css'),
	uglify      = require('gulp-uglify'),
	removeCode  = require('gulp-remove-code'),
	del         = require('del'),
	runSequence = require('run-sequence'),
	zip         = require('gulp-zip'),
	pkg         = require('./package.json'),
	replace     = require('gulp-replace-task'),
	semver      = require('semver'),
	rename      = require("gulp-rename"),
	vinylPaths  = require('vinyl-paths'),
	config 		= require('./config')
;


var pluginName='edd-drip';

var sourceJSRoot = config.buildPath.sourceRoot + config.buildPath.jsRoot;
var sourceCSSRoot = config.buildPath.sourceRoot + config.buildPath.cssRoot;

var buildDeployFolder   = config.distribute.buildDestination + pluginName + pkg.version + '/edd-drip/';

// option task - copy files to server
var source             = config.buildPath.sourceRoot + '**';
var devDestination     = config.server.pluginDir;

gulp.task('deploy-dev', function(){
	process.stdout.write(source + '\n' + devDestination + '\n');
	return gulp.src(source)
		.pipe(gulp.dest(devDestination));
});

// watch files for css & js changes
gulp.task('watch', function(){
	gulp.watch([sourceCSSRoot + '**/*.css', '!' + sourceCSSRoot + '**/*.min.css'], ['build-css']);
	gulp.watch([sourceJSRoot + '**/*.js', '!' + sourceJSRoot + '**/*.min.js'], ['build-js']);

	gulp.watch(sourceCSSRoot + '**', ['deploy-dev']);
	gulp.watch(sourceJSRoot + '**', ['deploy-dev']);
});


// default task
//gulp.task('default', ['js', 'css']);


//  ** Build Tasks **

// gulp.task('set-safe', function() {
// 	buildType = 'premium';
// 	pluginName='wpbackitup-safe';
//
// 	sourceRoot = 'wp-backitup-safe/';
// 	jsRoot = sourceRoot + 'admin/js/';
// 	cssRoot = sourceRoot + 'admin/css/';
//
// 	distributePluginFolder   = distribute + pluginName + pkg.version + '/wp-backitup-safe/';
// });

//delete all folders under distribute
gulp.task('build-clean', function(){
	var delDir= config.distribute.buildDestination + pluginName + pkg.version + '/**/';
	process.stdout.write('delete:' +delDir + '\n' );
	return del([delDir], {force:true});
});

//uglify JS in source folder
gulp.task('build-js', function(){
	return gulp.src([sourceJSRoot + '**/*.js', '!' + sourceJSRoot + '**/*.min.js'])
		.pipe(concat(pluginName+'-admin.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(sourceJSRoot));
});

//minify css in source folder
gulp.task('build-css', function(){
	return gulp.src([sourceCSSRoot + '**/*.css', '!' + sourceCSSRoot + '**/*.min.css'])
		.pipe(concat(pluginName + '-admin.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest(sourceCSSRoot));
});

//Copy all index.html files
gulp.task('build-copyHTML', function(){
	return gulp.src([config.buildPath.sourceRoot + '**/index.html'])
		.pipe(gulp.dest(buildDeployFolder));
});

//Copy all .MD files
gulp.task('build-copyMD', function(){
	return gulp.src([config.buildPath.sourceRoot + '**/*.md'])
		.pipe(gulp.dest(buildDeployFolder));
});

//Copy all index.html files
gulp.task('build-copyRootTXT', function(){
	return gulp.src([config.buildPath.sourceRoot + '*.txt'])
		.pipe(gulp.dest(buildDeployFolder));
});

//Copy all minified css
gulp.task('build-copyMinCSS', function(){
	return gulp.src([config.buildPath.sourceRoot + '**/*.min.css'])
		.pipe(gulp.dest(buildDeployFolder));
});


gulp.task('build-copyCSSImages', function(){
	return gulp.src([sourceCSSRoot + 'images/**'])
		.pipe(gulp.dest(buildDeployFolder + 'css/images'));
});

gulp.task('build-copyImages', function(){
	return gulp.src([config.buildPath.sourceRoot + '**/*.{png,gif,jpg}'])
		.pipe(gulp.dest(buildDeployFolder));
});

//Copy all minified JS
gulp.task('build-copyMinJS', function(){
	return gulp.src([config.buildPath.sourceRoot + '**/*.min.js'])
		.pipe(gulp.dest( buildDeployFolder ));
});

//Copy all language files
gulp.task('build-copyVendor', function(){
	return gulp.src([config.buildPath.sourceRoot + 'vendor/**'])
		.pipe(gulp.dest( buildDeployFolder + 'vendor'));
});

//Copy all language files
gulp.task('build-copyLanguage', function(){
	return gulp.src([config.buildPath.sourceRoot + '/**/*.{pot,po,mo}'])
		.pipe(gulp.dest( buildDeployFolder));
});

//Copy all language files
gulp.task('build-copyPHP', function(){
	var srcPath = config.buildPath.sourceRoot + '**/*.php';
	process.stdout.write('Source Path:' +srcPath + '\n' );
	process.stdout.write('Destination Path:' +buildDeployFolder + '\n' );
	return gulp.src([srcPath])
		.pipe(gulp.dest( buildDeployFolder));
});

//Called from Lite Build
//removeIf(liteBuild)
//endRemoveIf(liteBuild)
//Remove Premium Code
//Do not evaluate vendor code or extensions folder
gulp.task('build-removePremiumOnlyCode', function(){
	return gulp.src(['trunk/**/*.php','!trunk/vendor/**','!trunk/views/test.php'])
		.pipe(removeCode({liteBuild: true }))
		.pipe(gulp.dest(buildDeployFolder));
});


//Called from Premium Build
//removeIf(liteOnly)
//endRemoveIf(liteOnly)
//Remove Lite Code
//Do not evaluate vendor code or extensions folder
gulp.task('build-removeLiteOnlyCode', function(){
	return gulp.src(['trunk/**/*.php','!trunk/vendor/**','!trunk/views/test.php'])
		.pipe(removeCode({premiumBuild: true }))
		.pipe(gulp.dest(buildDeployFolder));
});

// copy wp-backitup.php and rename to wp-backitup-premium.php
gulp.task('build-renamePremium', function(){
	return gulp.src(buildDeployFolder + 'wp-backitup.php')
		.pipe(vinylPaths(del)) // delete the original disk copy
		.pipe(rename('wp-backitup-premium.php'))
		.pipe(gulp.dest(buildDeployFolder));
});

//Use in place of removePremiumCode
// gulp.task('build-copyPHP', function(){
// 	return gulp.src(['trunk/**/*.php','!trunk/vendor/**','!trunk/views/test.php'])
// 		.pipe(gulp.dest( distributePluginFolder));
// });


//Remove Test Folder
gulp.task('build-remove-public-folder', function(){
	return del( buildDeployFolder + 'public-NOTUSED', {force:true});
});

gulp.task('build-remove-aws-folders', function(){
	return del([ buildDeployFolder + 'vendor/aws/aws-sdk-php/src/**','! ' + buildDeployFolder + 'vendor/aws/aws-sdk-php/src', '! ' + buildDeployFolder + 'vendor/aws/aws-sdk-php/src/*.php', '! ' + buildDeployFolder + 'vendor/aws/aws-sdk-php/src/S3/**' ], {force:true});
});


//Remove all php files from extensions folder
gulp.task('build-cleanExtensions', function(){
	return del([ buildDeployFolder + 'extensions/*.php',], {force:true});
});

gulp.task('build-updateVersion', function () {

	console.log(semver.major(pkg.version));
	console.log(semver.minor(pkg.version));
	console.log(semver.patch(pkg.version));

	return gulp.src([ buildDeployFolder + '/wp-backitup.php'])
		.pipe(replace({
			patterns: [
				{
					match: 'version',
					replacement: pkg.version
				},
				{
					match: 'major',
					replacement: semver.major(pkg.version)
				},
				{
					match: 'minor',
					replacement: semver.minor(pkg.version)
				},
				{
					match: 'patch',
					replacement: semver.patch(pkg.version)
				}
			]
		}))
		.pipe(gulp.dest(buildDeployFolder));
});

gulp.task('build-zip', function () {
	return gulp.src(config.distribute.buildDestination + pluginName + pkg.version + '/**')
		.pipe(zip(pluginName + pkg.version + '.zip'))
		.pipe(gulp.dest(config.distribute.buildDestination));
});

//Not working
gulp.task('build-fetch-transifex', function(){
	return gulp.src('trunk/languages/*')
		.pipe(transifex.pullResource())
});

// This will run in this order:
gulp.task('build', function(callback) {
	runSequence(
		'build-clean',
		// 'build-js',
		// 'build-css',
		 'build-copyPHP',
		 'build-copyRootTXT',
		// 'build-copyHTML',
		// 'build-copyMD',
		// 'build-copyImages',
		// 'build-copyMinCSS',
		// 'build-copyMinJS',
		// 'build-copyLanguage',
		 'build-zip', //not working for mac
		callback);
});
