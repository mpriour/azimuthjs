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
				var opts = angular.extend({}, attrs, $parse(attrs.lyrOptions)());
				var type = attrs.lyrType;
				var url = attrs.lyrUrl;
				var name = attrs.name;
				var layers = layerService.layers;
				var layer;
				if(opts.isBaseLayer){opts.isBaseLayer = eval(opts.isBaseLayer)}
				switch(type) {
				case 'geojson':
					var lyrOptKeys = ['style', 'styleMap', 'filter', 'projection'];
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
							format: new OpenLayers.Format.GeoJSON()
						}, opts)),
						strategies: [opts.strategy || new OpenLayers.Strategy.Fixed()]
					}, lyrOpt));
					break;
				case 'wms':
					var paramKeys = ['styles', 'layers', 'version', 'format', 'exceptions', 'transparent', 'crs'];
					var params = {};
					$.each(paramKeys, function(index, val) {
						if(val in opts) {
							params[val] = val=='transparent' ? eval(opts[val]) : opts[val];
							delete opts[val];
						}
					});
					layer = new OpenLayers.Layer.WMS(name, url, params, opts);
					break;
				case 'tiles':
					var subdomains = opts.subdomains !== false && (opts.subdomains || [1, 2, 3, 4]);
					if(!url) {
						url = "http://otile${s}.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png"
					}
					var urls = [];
					if(subdomains) {
						delete opts.subdomains;
						$.each(subdomains, function(index, val) {
							urls[index] = OpenLayers.String.format(url,{
								s: val,
								x:'${x}',
								y:'${y}',
								z:'${z}'
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
					break;
				}
				layer && layers.push(layer);
				console.log(layers);
			}
		}
	}]);

})()