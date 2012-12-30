/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

	var mod = angular.module('az.directives',['az.services']);

	mod.directive('azLayer', ['az.services.layers', '$parse', function(layerService, $parse) {
		return {
			restrict: 'EA',
			replace: true,
			html: '',
			link: function(scope, elem, attrs) {
				var m = $parse(attrs);
				var opts = angular.extend({}, scope.$eval(attrs.lryOptions));
				var type = attrs.lyrType;
				var url = attrs.lyrUrl;
				var name = attrs.name;
				var layers = layerService.layers;
				var layer;
				switch(type) {
				case 'geojson':
					var lyrOptKeys = ['style', 'styleMap', 'filter'];
					var lyrOpt = {};
					$.each(lyrOptKeys, function(index, val) {
						if(val in opts) {
							lyrOpt[val] = opts[val];
							delete opts[val];
						}
					});
					layer = new OpenLayers.Layer.Vector(name, angular.extend({
						protocol: new OpenLayers.Protocol.HTTP(angular.extend({
							'url': url,
							format: new OpenLayers.Format.GeoJson()
						}, opts)),
						strategy: opts.strategy || new OpenLayers.Strategy.Fixed()
					}, lyrOpt));
				case 'wms':
					var paramKeys = ['styles', 'layers', 'version', 'format', 'exceptions'];
					var params = {};
					$.each(paramKeys, function(index, val) {
						if(val in opts) {
							params[val] = opts[val];
							delete opts[val];
						}
					});
					layer = new OpenLayers.Layer.WMS(name, url, params, opts);
				case 'tiles':
					var subdomains = opts.subdomains !== false && (opts.subdomains || [1, 2, 3, 4]);
					if(!url) {
						url = "http://otile${s}.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
					}
					var urls = [];
					if(subdomains) {
						delete opts.subdomains;
						$.each(subdomains, function(index, val) {
							urls[index] = OpenLayers.String.format(url,{
								's': val
							});
						})
					} else {
						urls = [url]
					}


					layer = new OpenLayers.Layer.XYZ(name, urls, angular.extend({
						projection: 'EPSG:3857',
						transitionEffect: 'resize',
						wrapDateLine: true
					}, opts));
				}
				layer && layers.push(layer);
				console.log(layers);
			}
		}
	}]);

})()