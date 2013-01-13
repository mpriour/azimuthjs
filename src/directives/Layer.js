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
				var opts = {};
				//filter out the prototype attributes && evaluate attributes
				$.each(attrs,function(key, val){
					if(attrs.hasOwnProperty(key) && !angular.isObject(val) && !angular.isFunction(val)){
						var pval;
						try{
							pval = scope.$eval(val);
						} catch (e){
							pval = undefined;
						}
						opts[key] = angular.isDefined(pval) ? pval : val;
						//check for special case
						//TODO may want a more generally applicable test
						if(key == 'version' && isNaN(pval)){
							opts[key] = val;
						}
					}
				});
				opts = angular.extend(opts, opts.lyrOptions);
				var type = attrs.lyrType;
				var url = attrs.lyrUrl;
				delete opts.lyrOptions; delete opts.lyrType; delete opts.lyrUrl;
				var name = attrs.name;
				var layers = layerService.layers;
				var inmap = elem.parents(inmapQuery).length>0;
				var maplib = typeof(OpenLayers) != 'undefined' ? 'ol' : typeof(L) != 'undefined' ? 'leaflet' : null;
				if(opts.maplib){maplib = opts.maplib}
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
				if(layer){layers[maplib=='ol' ? "push" : "unshift"](layer);}
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
				var lyrOpt = {'mapLayer':inmap, name: opts.name || 'Vector'};
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
						params[val] =  opts[val];
						delete opts[val];
					}
				});
				var layer = new OpenLayers.Layer.WMS(name, url, params, opts);
				layer.mapLayer = inmap;
				return layer
			},
		leaflet_wms = function(name, url, opts, inmap){
				url = url.replace(/\${/g, '{');
				if(opts.transparent && (!opts.format || opts.format.indexOf('jpg')>-1)){
					opts.format = 'image/png';
				}
				var layer = L.tileLayer.wms(url, angular.extend({
					mapLayer: inmap
				}, opts)).on('loading',function(e){
					var lyr = e.target, projKey = lyr.wmsParams.version >= '1.3' ? 'crs' : 'srs';
					if(opts[projKey] != lyr.wmsParams[projKey]){
						//if someone went to the trouble to set it, let them keep it that way.
						//lots of WMS servers only accept certain crs codes which are aliases
						//for the ones defined in Leaflet. ie reject EPSG:3857 but accept EPSG:102113
						lyr.wmsParams[projKey] = opts[projKey];
					}
				});
				
				return layer;
			},
		ol_tiles = function(name, url, opts, inmap){
				var subdomains = opts.subdomains !== false && (opts.subdomains || defaults.SUBDOMAINS);
				if(!url) {
					url = defaults.TILE_URL
				}
				var urls = [];
				var splitUrl = url.split('${s}');
				if(subdomains && splitUrl.length>1) {
					delete opts.subdomains;
					$.each(subdomains, function(index, val) {
						urls[index] =
							OpenLayers.String.format(splitUrl[0]+'${s}',angular.extend(opts,{s:val})) + splitUrl[1];
					});
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
				url = url.replace(/\${/g, '{');
				var layer = L.tileLayer(url, angular.extend({
					mapLayer: inmap,
					'subdomains': subdomains
				}, opts));
				return layer;
			}
		return lyrDir;
	}]);
})()