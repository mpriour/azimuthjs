angular.module('az.config', []).value('az.config', {
	defaults:{
		CENTER: '38,-99',
		ZOOM: 5,
		CRS: '3857',
		DISP_CRS:'4326',
		OL_CONTROLS:'zoom,navigation,attribution',
		OL_CTRL_OPTS:{},
		TILE_URL:"http://otile${s}.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
		SUBDOMAINS:[1,2,3,4]
	}
});
angular.module('az.services',['az.config']);
angular.module('az.directives',['az.services', 'az.config']);
angular.module('az', ['az.services', 'az.directives', 'az.config']);