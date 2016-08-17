#!/usr/bin/env node
const http = require('http')
const program = require('commander');
const knightUrl = "http://www.dragonsofmugloar.com/api/game";
const weatherUrl = "http://www.dragonsofmugloar.com/weather/api/report/";
const xml2js = require('xml2js');
var parser = new xml2js.Parser({explicitArray : false});
const stream = require('stream');
const request = require('request');
const fs = require("fs");
const file = "dragGame.db";
const exists = fs.existsSync(file);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(file);
var gameNum = db.each("SELECT * FROM game", function(err, row) {
		console.log(row)
	  });




if (!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
} else {
    console.log("DB file exists")
}


var getKnightData = function() {
	http.get(knightUrl, function(res){
	    var body = '';

	    res.on('data', function(chunk){
	        body += chunk;
	    });

	    res.on('end', function(){
	        var dragRes = JSON.parse(body);
	        getWeatherData(dragRes.gameId) //call the weatherData api
	        addKnightDB(dragRes)
		
	        getIntoFight(dragRes.gameId, dragRes)
	    });
	}).on('error', function(e){
	      console.log("Got an error: ", e);
	});
}

var getWeatherData = function(gameId) {

 var data = '';
 var tableName = 'weather'
 http.get(weatherUrl + gameId, function(res, gameId, tableName) {
     if (res.statusCode >= 200 && res.statusCode < 400) {
       res.on('data', function(data_) { data += data_; });
       res.on('end', function(gameId) {
       	var testObj;
       	parser.parseString(data, function (err, result, gameId) {
			addWeatherDB(result, gameId)		
		});
       });
     }
   });
}

var getIntoFight = function(gameId, dragRes) {

	var dragon = {

	    "dragon": {
	        "scaleThickness": 3,
	        "clawSharpness": 8,
	        "wingStrength": 7,
	        "fireBreath": 2
	    }
	}

	request({
	   method: 'PUT',
	   uri: 'http://www.dragonsofmugloar.com/api/game/'+gameId+'/solution',
	   json: dragon
	}, function(error, request, body){
		});

}


var addWeatherDB = function(result, gameId) {
db.serialize(function() { //save data into DB
			if(!exists) {
			    db.run("CREATE TABLE weather ( gameId TEXT, time TEXT, code TEXT, message TEXT)");
			}
				var stmt = db.prepare("INSERT INTO weather (gameId, time, code, message) VALUES (?, ?, ?, ?)");
				stmt.run(gameId, result.report.time, result.report.code, result.report.message);
				stmt.finalize();
			});
}

var addKnightDB = function(dragRes) {
db.serialize(function() { //save data into DB
			console.log("hei hei")
			  if(!exists) {
			    db.run("CREATE TABLE knight ( gameId TEXT, knightName TEXT, attack TEXT, armor TEXT, agility TEXT, endurance TEXT )");
			    console.log("DB is empty, creating table")
			  }
				var stmt = db.prepare("INSERT INTO knight (gameId, knightName, attack, armor, agility, endurance) VALUES (?, ?, ?, ?, ?, ?)");
				stmt.run(dragRes.gameId, dragRes.knight.name, dragRes.knight.attack, dragRes.knight.armor, dragRes.knight.agility, dragRes.knight.endurance);
				stmt.finalize();
			});
}

var gameNumInc = function(gameNum) {
console.log(gameNum)
	if (gameNum === 0) {
		gameNum += 1
		addGameDB(gameNum) //adding gameNumber to DB
	} else {
		gameNum = db.each("SELECT * FROM game", function(err, row) {
	    gameNum = row + 1
	    addGameDB(gameNum)
	  });
	}

}


var addGameDB = function(gameNum) {
db.serialize(function(gameNum) { //save data into DB
			  if(!exists) {
			    db.run("CREATE TABLE game ( gameNum INT )");
			    console.log("DB is empty, creating table")
			  }
				var stmt = db.prepare("INSERT INTO game (gameNum) VALUES (?)");
				stmt.run(gameNum);
				stmt.finalize();
			});

}
/*
db.each("SELECT * FROM weather", function(err, row) {
    console.log(row);
  });

db.each("SELECT * FROM knight", function(err, row) {
    console.log(row);
  });
*/
getKnightData()
gameNumInc(gameNum)


db.each("SELECT * FROM game", function(err, row) {
    console.log(row);
  });