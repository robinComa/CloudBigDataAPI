var console = {
	log : function(obj){
		self.postMessage({type : 'log',log : obj});
	}
};

self.addEventListener('message', function(e) {
	var dataObj = {};
	var start = new Date();
	for(key in e.data[1]){//data
		callback = function(data){
			dataObj[key] = data;
		};
		importScripts(e.data[1][key]);
	}
	for(var i in e.data[2]){//libs
		importScripts(e.data[2][i]);
	}
	var download = (new Date()) - start;
	start = new Date();
	self.postMessage({
		results: map(e.data[0],dataObj),
		time : {
			download : download,
			map : (new Date()) - start
		}
	});
}, false);
