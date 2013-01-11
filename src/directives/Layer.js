/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {

angular.module('az.directives').
	directive('azLayer', ['az.config','az.services.layers', '$parse', function(config,layerService, $parse) {
		var defaults = config.defaults;
		var MAP_DIRECTIVES = ['ol-map','leaflet-map']
		var inmapQuery = '';
		$.each(MAP_DIRECTIVES, function(n, val){
			if(n>0) inmapQuery += ',';
			inmapQuery += '*[' + val + '], ' + val;
		});

		return {
			restrict: 'EA',
			replace: true,
			html: '',
			scope:{},
			link: function(scope, elem, attrs) {
				var m = $parse(attrs);
				var opts = angular.extend({}, attrs, $parse(attrs.lyrOptions)());
				var type = attrs.lyrType;
				var url = attrs.lyrUrl;
				var name = attrs.name;
				var layers = layerService.layers;
				var inmap = elem.parents(inmapQuery).length>0;
				var layer;
				if(opts.isBaseLayer){opts.isBaseLayer = $parse(opts.isBaseLayer)()}
				switch(type) {
				case 'geojson':
					var lyrOptKeys = ['style', 'styleMap', 'filter', 'projection'];
					var lyrOpt = {'mapLayer':inmap};
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
					layer.mapLayer = inmap;
					break;
				case 'tiles':
					var subdomains = opts.subdomains !== false && (opts.subdomains || defaults.SUBDOMAINS);
					if(!url) {
						url = defaults.TILE_URL
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
						projection: 'EPSG:'+defaults.CRS,
						transitionEffect: 'resize',
						wrapDateLine: true
					}, opts));
					layer.mapLayer = inmap;
					break;
				}
				layer && layers.push(layer);
				console.log(layers);
			}
		}
	}]);

})()