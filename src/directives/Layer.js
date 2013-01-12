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

		var lyrDir = {
			restrict: 'EA',
			replace: true,
			html: '',
			scope:{},
			link: function(scope, elem, attrs) {
				var _attrs = {};
				//filter out the prototype attributes
				for(var k in attrs){
					if(attrs.hasOwnProperty(k)){
						_attrs[k]=attrs[k]
					}
				}
				var opts = angular.extend({}, _attrs, $parse(attrs.lyrOptions)());
				var type = attrs.lyrType;
				var url = attrs.lyrUrl;
				var name = attrs.name;
				var layers = layerService.layers;
				var inmap = elem.parents(inmapQuery).length>0;
				var maplib = OpenLayers || L ? OpenLayers ? 'ol' : 'leaflet' : null;
				if(opts.isBaseLayer){opts.isBaseLayer = $parse(opts.isBaseLayer)()}
				var lyrConstruct;
				switch(type){
					case 'tiles':
						lyrConstruct = maplib=='ol' ? ol_tiles : leaflet_tiles;
						break
					case 'wms':
						lyrConstruct = maplib=='ol' ? ol_wms : leaflet_wms;
						break
					case 'geojson':
						lyrConstruct = maplib=='ol' ? ol_geojson : leaflet_geojson;
						break
				}
				var layer = lyrConstruct(name, url, opts, inmap);
				if(layer){layers.push(layer);}
				console.log(layers);
			}
		};

		var ol_geojson = function(name, url, opts, inmap){
				var lyrOptKeys = ['style', 'styleMap', 'filter', 'projection'];
				var lyrOpt = {'mapLayer':inmap};
				$.each(lyrOptKeys, function(index, val) {
					if(val in opts) {
						lyrOpt[val] = opts[val];
						delete opts[val];
					}
				});
				var layer = new OpenLayers.Layer.Vector(name, angular.extend({
					protocol: new OpenLayers.Protocol.HTTP(angular.extend({
						'url': url,
						format: new OpenLayers.Format.GeoJSON()
					}, opts)),
					strategies: [opts.strategy || new OpenLayers.Strategy.Fixed()]
				}, lyrOpt));
				return layer;
			},
		leaflet_geojson = function(name, url, opts, inmap){
				var lyrOptKeys = ['pointToLayer','style','filter','onEachFeature'];
				var lyrOpt = {'mapLayer':inmap};
				$.each(lyrOptKeys, function(index, val) {
					if(val in opts) {
						lyrOpt[val] = opts[val];
						delete opts[val];
					}
				});
				var layer = L.geoJson(null,lyrOpt);
				$.ajax({
					dataType: 'json',
					'url': url,
					data: opts.params,
					success: function(data){
						layer.addData(data);
					}
				});
				return layer;
			},
		ol_wms = function(name, url, opts, inmap){
				var paramKeys = ['styles', 'layers', 'version', 'format', 'exceptions', 'transparent', 'crs'];
				var params = {};
				$.each(paramKeys, function(index, val) {
					if(val in opts) {
						params[val] = val=='transparent' ? eval(opts[val]) : opts[val];
						delete opts[val];
					}
				});
				var layer = new OpenLayers.Layer.WMS(name, url, params, opts);
				layer.mapLayer = inmap;
				return layer
			},
		leaflet_wms = function(name, url, opts, inmap){
				var layer = L.tileLayer.wms(url, angular.extend({
					mapLayer: inmap
				}, opts));
				return layer;
			},
		ol_tiles = function(name, url, opts, inmap){
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

				var layer = new OpenLayers.Layer.XYZ(name, urls, angular.extend({
					projection: 'EPSG:'+defaults.CRS,
					transitionEffect: 'resize',
					wrapDateLine: true
				}, opts));
				layer.mapLayer = inmap;
				return layer;
			},
		leaflet_tiles = function(name, url, opts, inmap){
				var subdomains = opts.subdomains !== false && (opts.subdomains || defaults.SUBDOMAINS);
				if(!url) {
					url = defaults.TILE_URL
				}
				var layer = L.tileLayer(url, angular.extend({
					mapLayer: inmap
				}, opts));
				return layer;
			}
		return lyrDir;
	}]);
})()