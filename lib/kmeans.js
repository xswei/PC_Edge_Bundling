function cluster(dataset,k){
	//使用k-means算法对dataset聚类成k簇
	//dataset:[[],[],[]...]
	result=kmeans(dataset,k);
	var centroids=result.centroids;
	clusterAssment=result.clusterAssment;
	return {"centroids":centroids,"clusterAssment":clusterAssment};
}

function euclDistance(a,b){
	console.log("euclDistance");
	console.log(Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1])));
	return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]));
}
function kmeans(dataset,k){
	//console.log("k"+k);
	var numSamples=dataset.length;
	var clusterAssment=[];
	for(var i=0;i<numSamples;++i){
		clusterAssment.push([0,0])
	}
	var clusterChanged=true;
	var centroids=initCentroids(dataset,k);
	while(clusterChanged){
		clusterChanged=false;
		for(var i=0;i<numSamples;++i){
			var minDist  = 100000.0;
			var minIndex = 0;
			for(var j=0;j<k;++j){
				//console.log(centroids);
				var distance=Math.sqrt((centroids[j][0]-dataset[i][0])*(centroids[j][0]-dataset[i][0])+(centroids[j][1]-dataset[i][1])*(centroids[j][1]-dataset[i][1]));
				//var distance=euclDistance(centroids[j],dataset[i]);
				//console.log(distance);
				if(distance<minDist){
					minDist=distance;
					minIndex=j;
				}
			}
			if(clusterAssment[i][0]!=minIndex){
				clusterChanged=true;
				clusterAssment[i][0]=minIndex;
				clusterAssment[i][1]=minDist*minDist;
			}

		}
		for(var j=0;j<k;++j){
			var temp=[];
			for(var m=0;m<clusterAssment.length;++m){
				if(j==clusterAssment[m][0]){
					temp.push(dataset[m]);
				}
			}
			if(temp.length>0){
				centroids[j]=mean(temp);
			}
			
		}
	}
	//console.log("Congratulations, cluster complete!");
	var re={
		"centroids":centroids,
		"clusterAssment":clusterAssment
	}
	return re;
}
function initCentroids(dataset,k){
	var numSamples=dataset.length;
	//console.log(dataset[0]);
	var dim=dataset[0].length;
	var centroids_init=[];
	for(var n=0;n<k;++n){
		//console.log(n);
		var index=parseInt(Math.random()*numSamples);
		centroids_init.push(dataset[index]);
	}
	//console.log("check point :");
	return centroids_init;
}
function mean(temp){

	var sum=0,
		index=0;
	for(var i=0;i<temp.length;++i){
		index+=temp[i][0];
		sum+=temp[i][1];
	}
	return [index/temp.length,sum/temp.length];
}
