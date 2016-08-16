var http = require('http')

var knightUrl = "http://www.dragonsofmugloar.com/api/game";
var weatherUrl = "http://www.dragonsofmugloar.com/weather/api/report/";
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var getKnightData = function() {
	http.get(knightUrl, function(res){
	    var body = '';

	    res.on('data', function(chunk){
	        body += chunk;
	    });

	    res.on('end', function(){
	        var dragRes = JSON.parse(body);
	        getWeatherData(dragRes.gameId) //call the weatherData api
	        console.log(dragRes);
	    });
	}).on('error', function(e){
	      console.log("Got an error: ", e);
	});
}




var getWeatherData = function(gameId) {
 parser.on('error', function(err) { console.log('Parser error', err); });

 var data = '';
 http.get(weatherUrl + gameId, function(res) {
     if (res.statusCode >= 200 && res.statusCode < 400) {
       res.on('data', function(data_) { data += data_.toString(); });
       res.on('end', function() {
         console.log('data', data);
         parser.parseString(data, function(err, result) {
           console.log('FINISHED', err, result);
         });
       });
     }
   });
}

getKnightData()