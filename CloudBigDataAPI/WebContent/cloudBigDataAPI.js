CBD = {
	
	Auth : function(){
		var clientID = document.getElementById('CLOUD-BIG-DATA-API').getAttribute("data-client-id");
		var apiKEY = document.getElementById('CLOUD-BIG-DATA-API').getAttribute("data-api-key");
		if(clientID && apiKEY){
			//TODO Server auth
			CBD.token = 'My new unique token';
		}else{
			throw 'Auth failed!';
		}
		return CBD;
	},

	MapReduce : function (args){
	
		/** GLOBAL */
		var timeStart = new Date();
		var downloadTime = 0;
		var mapTime = 0;
		var jobs = [];
		var jobFinish = 0;
		var intermediateResults = [];
		var results = [];
		/** END GLOBAL */
			
		/** EVENTS */
		var events = {
			finish : function(data){
				//TODO remove results listener
				var e = new CustomEvent('finish');
				e.data = data;
				document.dispatchEvent(e);
			},
			progress : function(porcent, perf){
				var e = new CustomEvent('progress');
				e.porcent = porcent;
				e.perf = perf;
				document.dispatchEvent(e);
			}
		};
		this.addListener = function(type, callback){
			if(type in events){
				document.addEventListener(type, callback);
			}else{
				throw 'No event with "'+type+'" name!';
			}
		};
		/** END EVENTS */
		
		(function createJobs(){
			var jobsLimits = args.split(args.limit.left, args.limit.right, args.limit.step);
			for(var i in jobsLimits){
				jobs.push({
					data : args.data,
					map : args.map,
					key : jobsLimits[i][0],
					libs : args.libs,
					limit : {
						left : jobsLimits[i][0],
						right : jobsLimits[i][1]
					}
				});	
			}
		}());
			
		/** Transform [data functions + map functions + the worker skeleton] to a JS single script URL */
		function createScriptURL(dataFn, mapper){
			var jsonStr = '';
			for (property in dataFn) {
				jsonStr += '\t'+property + ': ' + dataFn[property]+',\n';
			}
			var data = 'var dataFn = {\n'+jsonStr+'\n};';
			var mapFn = 'var map = '+mapper+';';
			var workerBase = "importScripts('http://localhost:8080/CloudBigDataAPI/worker.skeleton.js');";
			var oblob = new Blob([[data,mapFn,workerBase].join('\n')], { "type" : "text\/javascript" });
			return URL.createObjectURL(oblob);
		}
		
		
		this.start = function(){
			
			var MAX_WORKERS = 10;
			var nbWorkers = 0;
			
			/** PUSH REQUEST ON SERVER */
			/** END PUSH REQUEST ON SERVER */
			
			/** LISTEN TO SERVER RESULTS */
			function onDataReceived(data){
				intermediateResults = intermediateResults.concat(data.results);
				jobFinish++;
				downloadTime += data.time.download;
				mapTime += data.time.map;
				events.progress(jobFinish / jobs.length * 100, {
					time : (new Date() - timeStart),
					download : downloadTime,
					map : mapTime
				});
				if(jobs.length == jobFinish){
					function groupBy(list) {
						var ret = [];
						for (var i in list) {
							var key = list[i].key;
							var value = list[i].value;
							if (!ret[key]) {
								ret[key] = [];
							}
							ret[key].push(value);
						}
						return ret;
					}
					var groups = groupBy(intermediateResults);
					for(var key in groups) {
						var values = groups[key];
						results.push(args.reduce(key, values));
					}
					events.finish(results);
				}
			}
			
			var i = 0;
			
			(function doJobs(){
				while(i < jobs.length && nbWorkers < MAX_WORKERS){
					nbWorkers++;
					var worker = new Worker(createScriptURL(jobs[i].data, jobs[i].map));
					worker.addEventListener('message', function(event){
						if(event.data.type == 'log'){
							console.log(event.data.log);
						}else{
							onDataReceived(event.data);
							nbWorkers--;
							this.terminate();
							if(nbWorkers == 0){
								doJobs();
							}
						}
					}, false);
					worker.postMessage({
						key : jobs[i].key,
						libs : jobs[i].libs,
						limit : jobs[i].limit
					});	
					i++;
				}
			}());
						
			/** END LISTEN TO SERVER RESULTS */			
		};
		
	}
};