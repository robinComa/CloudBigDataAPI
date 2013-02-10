var Tm = function(tm, startDate){
		
		/** Return the timestamp value of a tm */
		this.getTime = function(){
			return startDate + (parseInt(tm.d) * 1000);
		};
	
		/** Return the float value of tm */
		this.getFloatValue = function(){
			return parseFloat(tm.v);
		};
		
		/** Return the closest value of a tm list from time*/
		this.getTmClosest = function(tmList){			
			var currentClosest = null;
			var currentLapse = Number.MAX_VALUE;
			//Data are already sorted by the server
			for(var i in tmList){
				var tm = new Tm(tmList[i], startDate);
				if(Math.abs(tm.getTime() - this.getTime()) < currentLapse){
					currentLapse = Math.abs(tm.getTime() - this.getTime());
					currentClosest = tm;
				}else{
					return currentClosest;
				}
			}
			return currentClosest;
		};

};