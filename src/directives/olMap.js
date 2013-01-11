/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

angular.module('az.directives').
	directive('olMap', ['az.config','az.services.layers', '$parse', function(config, layerService, $parse) {
		var defaults = config.defaults;
		return {
			restrict: 'EA',
			priority: -10,
			link: function(scope, elem, attrs) {
				var layers = layerService.getMapLayers();
				var center = attrs.center ? attrs.center.split(',') : defaults.CENTER.split(',').reverse();
				var zoom = attrs.zoom || defaults.ZOOM;
				var projection = attrs.projection || attrs.proj || attrs.crs || 'EPSG:'+defaults.CRS;
				var dispProj = attrs.dispProjection || attrs.dispProj || 'EPSG:'+defaults.DISP_CRS;
				var controls = (attrs.controls || defaults.OL_CONTROLS).split(',');
				var controlOptions = angular.extend(defaults.OL_CTRL_OPTS, $parse(attrs.controlOpts)());
				center = new OpenLayers.LonLat(center).transform('EPSG:4326',projection);
				var mapCtls = [];
				$.each(controls,function(i,ctl){
					var opts = controlOptions[ctl] || undefined;
					ctl = ctl.replace(/^\w/,function(m){return m.toUpperCase()});
					mapCtls.push(new OpenLayers.Control[ctl](opts));
				});
				var map = new OpenLayers.Map(elem[0],{
					'projection':projection,
					'displayProjection':dispProj,
					'controls':mapCtls,
					'center':center,
					'zoom':zoom,
					'layers':layers
				});
			}
		}
	}]);
})()