var app = angular.module("maMeteo",['ngResource','uiGmapgoogle-maps']);

//changement des tags angular {{}} -> {[]}
app.config(['$interpolateProvider','uiGmapGoogleMapApiProvider', function($interpolateProvider,uiGmapGoogleMapApiProvider) {
  $interpolateProvider.startSymbol('{[');
  $interpolateProvider.endSymbol(']}');
  uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyA5rkldojfAUAPcUXpz-vH2COXuuR8XWy8',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
}]);


app.controller("maMeteoCtrl",['$scope','dataMeteo','uiGmapGoogleMapApi',function($scope,dataMeteo,uiGmapGoogleMapApi) {
	// $scope.weather = {location:"Nice"};
	

    $scope.getWeather = function (city){ 
	
	dataMeteo.get(city).success(function(data){
                $scope.weather = data.list[0].weather[0].icon;
                $scope.temp = data.list[0].temp.day;
                $scope.desc = data.list[0].weather[0].description;
                $scope.wind = data.list[0].speed*3.6;
                $scope.direction = data.list[0].deg;
            });
}
	 // Define variables for our Map object
	var areaLat      = 43.5126995,
	  areaLng      = 7.15,
	  areaZoom     = 10;

	uiGmapGoogleMapApi.then(function(maps) {
		$scope.map     = { center: { latitude: areaLat, longitude: areaLng }, zoom: areaZoom };
		$scope.options = { scrollwheel: true, mapTypeId: google.maps.MapTypeId.TERRAIN };
	});

}]);

 app.controller("profilCtrl",['$scope','Entry','$window','$location',function($scope,Entry,$window,$location) {
	$scope.posts = [];
//	console.log($scope.posts.Record)
	$scope.delPost = function (keysafe) {
		Entry.delete({id : keysafe}, function() {
			$scope.posts = Entry.query(function() {
			console.log($scope.posts);
		});
		
    })
	}


	$scope.addPost = function (commentaire) {

		var test
		test = Entry.save(commentaire,function(){
			$scope.posts = Entry.query()
			$scope.commentaire=""
    })
		};
	$scope.modPost = function (keysafe) {

		$scope.select = keysafe;
		Entry.get({id:keysafe}).$promise.then(function (response) {
			//$scope.comment=post.Records[0].value;
//			console.log("result "+response.Records.value)
			$scope.commentaire = response.Records.value;
		}
		);
	}
	$scope.cancelPost = function (keysafe) {
		$scope.select = 0;
		$scope.commentaire ="";
		}
	$scope.postPost = function (keysafe, commentaire) {
		console.log("keysafe: "+keysafe)
		console.log("commentaire: "+commentaire)	
		$scope.post = Entry.get({id:keysafe},function(resp){
			$scope.post.Records.date = Date.now();
			console.log("post :"+$scope.post)
			Entry.update({id: keysafe},commentaire,function(resp){
			$scope.posts = Entry.query(function(resp){
				console.log(resp)
			});
//			console.log(resp)
		})
		})
		
		$scope.select =0;
	};
		
	$scope.posts = Entry.query(function(resp) {
			console.log(resp);
		})	
 }
//		$window.location.reload()
	
	
 ]);



app.factory('dataMeteo', ['$http', function($http) {
	var urlBase = "http://api.openweathermap.org/data/2.5/forecast";
	// dataMeteo.get = function(id) {
		return ({
			get: get 
		});
	function get(id) {
		return $http.get(urlBase + '/daily?q=' + id + "&units=metric&cnt=10&mode=json&lang=fr&APPID=97bb144054d3f8d2ab617db1a2922efd")
	    } 
}]);

app.factory('Entry', ['$resource', function($resource) {
  return $resource('/profile/comment/:id',{},{ 
  												'update': {method: 'PUT'}, 
												'query': {method: 'GET', isArray: false }
										}); 
}]);

app.directive('modifcomment', function () {
	return {
		restrict: 'E',
		scope :{
			postmodif : '='
		},
		template: 'Hello World'
		
	}
})