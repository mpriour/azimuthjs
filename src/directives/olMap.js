/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

	angular.module('az.directives').
	directive('olMap', ['az.config', 'az.services.layers', /*'az.services.map',*/ '$parse', 
		function(config, layerService, /*mapService,*/ $parse) {
		var defaults = config.defaults;
		return {
			restrict: 'EA',
			priority: -10,
			link: function(scope, elem, attrs) {
				var layers = layerService.getMapLayers();
				var center = attrs.center ? attrs.center.split(',') : defaults.CENTER.split(',').reverse();
				var zoom = attrs.zoom || defaults.ZOOM;
				var projection = attrs.projection || attrs.proj || attrs.crs || 'EPSG:' + defaults.CRS;
				var dispProj = attrs.dispProjection || attrs.dispProj || 'EPSG:' + defaults.DISP_CRS;
				var controls = (attrs.controls || defaults.OL_CONTROLS).split(',');
				var controlOptions = angular.extend(defaults.OL_CTRL_OPTS, $parse(attrs.controlOpts)());
				var mapCtls = [];
				$.each(controls, function(i, ctl) {
					var opts = controlOptions[ctl] || undefined;
					ctl = ctl.replace(/^\w/, function(m) {
						return m.toUpperCase()
					});
					mapCtls.push(new OpenLayers.Control[ctl](opts));
				});
				var listeners = {};
				$.each(attrs, function(key, val) {
					var evtType = key.match(/map([A-Z]\w+)/);
					if(evtType) {
						evtType = evtType[1].replace(/^[A-Z]/,function(m){return m.toLowerCase()});
						var $event = {
							type: key
						};
						listeners[evtType] = function(evtObj) {
							elem.trigger(angular.extend({}, $event, evtObj));
							//We create an $apply if it isn't happening.
							//copied from angular-ui uiMap class
							if(!scope.$$phase) scope.$apply();
						};
					}
				});
				center = new OpenLayers.LonLat(center).transform('EPSG:4326', projection);
				var map = new OpenLayers.Map(elem[0], {
					'projection': projection,
					'displayProjection': dispProj,
					'controls': mapCtls,
					'center': center,
					'zoom': zoom,
					'layers': layers,
					'eventListeners': listeners
				});
				var model = $parse(attrs.olMap);
				//Set scope variable for the map
				if(model){model.assign(scope, map);}
				mapService.map = map;
			}
		}
	}]);
})()
