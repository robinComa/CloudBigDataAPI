/** Public Classes */
var console = {
	log : function(obj){
		self.postMessage({type : 'log',log : obj});
	}
};
var JsonpData = function(url){
	var obj = {};
	callback = function(data){
		obj = data;
	};
	importScripts(url);
	return obj;
};
/** End Public Classes */

self.addEventListener('message', function(e) {
	var start = new Date();
	var value = {};
	
	//Input Data
	for(key in dataFn){
		value[key] = dataFn[key](e.data.limit.left, e.data.limit.right);
	}
	
	//Libraries
	for(var i in e.data.libs){
		importScripts(e.data.libs[i]);
	}
	
	var downloadTime = (new Date()) - start;
	start = new Date();
	
	self.postMessage({
		results: map(e.data.key,value),
		time : {
			download : downloadTime,
			map : (new Date()) - start
		}
	});
}, false);
