var config = {};

//jsRoot : 'admin/js/',
//cssRoot :'admin/css/'
config.buildPath = {
	sourceRoot:'src/'
};

config.distribute = {
	buildDestination: '/@distribute/@distribute-edd-drip/'
};

// Put your web server plugin destination path here.
// Ex. '/home/opu/Server/wp/wpbackitup/wp-content/plugins/wp-backitup'
// Ex. 'C:/Users/Chris/Documents/Websites/www.main-restore.dev/wp-content/plugins/wp-backitup-safe'
//'C:\\@GIT-Repos\\wpbackitup-docker\\wpbackitup-docker-REPO\\docker-wpbackitup-php5.6-apache\\docker-data\\wordpress\\wp-content\\plugins\\wpbackitup-safe'

config.server = {
	pluginDir: ''
};

module.exports = config;