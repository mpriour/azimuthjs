/**
 * @license AzimuthJS
 * (c) 2012-2013 Matt Priour
 * License: MIT
 */
(function() {
var service = angular.module('az.services',[]);
service.factory('az.services.layers', function($rootScope) {
    var layerService = {
    	layers: [],
    	getMapLayers: function(){
    		var lyrs = [];
    		$.each(this.layers,function(i,lyr){
    			if(lyr.mapLayer !== false){
    				lyrs.push(lyr);
    			}
    		});
    		return lyrs;
    	}
    };
    return layerService;
  });

})()
