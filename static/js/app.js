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
					console.log(data)
					$scope.weather = data.list[0].weather[0].icon;
					$scope.temp = data.list[0].temp.day;
					$scope.desc = data.list[0].weather[0].description;
					$scope.wind = data.list[0].speed*3.6;
					$scope.direction = data.list[0].deg;
					$scope.map.center.latitude = data.city.coord.lat;
					$scope.map.center.longitude = data.city.coord.lon;
					console.log("lon: " + $scope.map.center.longitude + " lat :" + $scope.map.center.latitude)
					$scope.map.markers[0]={
						id: Date.now(),
						coords: $scope.map.center
					}
				});

	}
	 // Define variables for our Map object
	var areaLat      = 43.656198305413184,
	  areaLng      = 7.186002731323242,
	  areaZoom     = 10;
	// $scope.latitude = 0;
	// $scope.longitude = 0;
	// $scope.id = 0;
	uiGmapGoogleMapApi.then(function(maps) {
		$scope.map     = { 
			center: { 
				latitude: areaLat, 
				longitude: areaLng 
			}, 
			zoom: areaZoom,
			markers: [],
			options : { scrollwheel: true, mapTypeId: google.maps.MapTypeId.TERRAIN },
			events: {
				click: function (map, eventName, originalEventArgs) {

					$scope.latitude = originalEventArgs[0].latLng.lat();
					$scope.longitude = originalEventArgs[0].latLng.lng();
					console.log("latitude :"+$scope.latitude);
					console.log("longitude :"+$scope.longitude);
							//scope apply required because this event handler is outside of the angular domain
					var marker = {
						id: Date.now(),
						coords: {
							latitude: $scope.latitude,
							longitude: $scope.longitude
						}
					};
					$scope.map.markers[0]=marker;
					console.log($scope.map.markers[0]);
					$scope.$apply();
					dataMeteo.getcrd($scope.latitude,$scope.longitude).success(function(data){
						$scope.weather = data.list[0].weather[0].icon;
						$scope.temp = data.list[0].temp.day;
						$scope.desc = data.list[0].weather[0].description;
						$scope.wind = data.list[0].speed*3.6;
						$scope.direction = data.list[0].deg;
						$scope.city = data.city.name;
						console.log("City :"+$scope.city)
					});
				},
				
					
				    // options: { draggable: true },
				    // events: {
				      // dragend: function (marker, eventName, args) {

				        // $scope.latitude = marker.getPosition().lat();
				        // console.log($scope.latitude)
				        // $scope.longitude = marker.getPosition().lng();
			}
		}
	}) 
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
			get: get,
			getcrd: getcrd
		});
	function get(id) {
		return $http.get(urlBase + '/daily?q=' + id + "&units=metric&cnt=10&mode=json&lang=fr&APPID=97bb144054d3f8d2ab617db1a2922efd")
	    } 
	function getcrd(lat,lon) {
		return $http.get(urlBase + '/daily?lat=' + lat + "&lon=" + lon + "&units=metric&cnt=10&mode=json&lang=fr&APPID=97bb144054d3f8d2ab617db1a2922efd")
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