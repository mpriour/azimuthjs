/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

	var mod = angular.module('az.directives');

	mod.directive('olMap', ['az.services.layers', '$parse', function(layerService, $parse) {
		return {
			restrict: 'EA',
			link: function(scope, elem, attrs) {
				var layers = layerService.getMapLayers();
				var center = (attrs.center || '-99,40').split(',');
				var zoom = attrs.zoom || 5;
				var projection = attrs.projection || attrs.proj || attrs.crs || 'EPSG:3857';
				var controls = (attrs.controls || 'zoom,navigation').split(',');
				center = new OpenLayers.LonLat(center).transform('EPSG:4326',projection);
				var mapCtls = [];
				$.each(controls,function(i,ctl){
					ctl = ctl.replace(/^\w/,function(m){return m.toUpperCase()});
					mapCtls.push(new OpenLayers.Control[ctl]());
				});
				var map = new OpenLayers.Map(elem[0],{
					'projection':projection,
					'controls':mapCtls,
					'center':center,
					'zoom':zoom,
					'layers':layers
				});
			}
		}
	}]);
})()
