/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

	var mod = angular.module('az.directives');

	mod.directive('leafletMap', ['az.config','az.services.layers', '$parse', function(config, layerService, $parse) {
		var defaults = config.defaults,
		addLayerCtl = function(map, layers, opts){
			var baseLyrs = {}, overLyrs = {};
			$.each(layers, function(i,lyr){
				if(lyr.options.isBaseLayer===true){baseLyrs[lyr.options.name] = lyr}
				else{overLyrs[lyr.options.name] = lyr}
			})
			L.control.layers(baseLyrs,overLyrs,opts).addTo(map);
		},
		addScaleCtl = function(map, opts){
			L.control.scale(opts).addTo(map);
		};
		return {
			restrict: 'EA',
			priority: -10,
			link: function(scope, elem, attrs) {
				var layers = layerService.getMapLayers();
				var center = attrs.center ? attrs.center.split(',') : defaults.CENTER.split(',');
				var zoom = attrs.zoom || defaults.ZOOM;
				var projection = attrs.projection || attrs.proj || attrs.crs || L.CRS['EPSG'+defaults.CRS];
				var controls = attrs.controls ? attrs.controls.split(',') : [];
				var controlOptions = angular.extend({}, $parse(attrs.controlOpts)());
				var opts = angular.extend({}, $parse(attrs.mapOpts)());
				
				var map = L.map(elem[0],angular.extend({
					'crs':projection,
					'center':center,
					'zoom':zoom,
					'layers':layers
				}, opts));

				$.each(controls,function(i,ctl){
					var opts = controlOptions[ctl] || undefined;
					switch(ctl){
						case 'layers':
							addLayerCtl(map,layers,opts);
							break;
						case 'scale':
							addScaleCtl(map,opts);
							break;
					}
				});
			}
		}
	}]);
})()