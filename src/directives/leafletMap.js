/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

	var mod = angular.module('az.directives');

	mod.directive('leafletMap', ['az.services.layers', '$parse', function(layerService, $parse) {
		return {
			restrict: 'EA',
			priority: -10,
			link: function(scope, elem, attrs) {
				var layers = layerService.getMapLayers();
				var center = attrs.center ? attrs.center.split(',') : defaults.CENTER.split(',');
				var zoom = attrs.zoom || defaults.ZOOM;
				var projection = attrs.projection || attrs.proj || attrs.crs || undefined;
				var opts = angular.extend({}, $parse(attr.mapOpts)());
				var map = L.Map(elem[0],angular.extend({
					'crs':projection,
					'center':center,
					'zoom':zoom,
					'layers':layers
				}, opts));
			}
		}
	}]);
})()