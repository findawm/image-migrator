var glob = require("glob"),
	agent = require("superagent"),
	async = require("async"),
	_ = require("underscore"),
	clientMap = null,
	clientMapSorted = {},
	clients = [],
	options = {};

//-----------------------
// CONFIG
//-----------------------
var upload_target = 'http://localhost:8080/upload'

var currentTS = new Date().getTime();

glob("/Users/felixtioh/Desktop/test/**/*.jpg", options, function (er, files) {
	if(files && files.length > 0){
		async.reduce(files, {}, function(memo, filepath, callback){
			var _reversed = filepath.split(/\/|\\/).reverse();
			var name = _reversed[4].trim();
			var is_profile = false;
			if(_reversed[1].trim() == 'Profile'){
				is_profile = true;
			}
			var _parts = _reversed[2].split(/_/);
			var taken_for = null;
			currentTS += 1;
			var timestamp = currentTS.toString();
			if(_parts[0] == 'vBefore'){
				taken_for = 'Before';
			}
			if(_parts[0] == 'vAfter'){
				taken_for = 'After';
			}
			var date_taken = _parts[1].replace(/-/g, '.');
			var original_picture = null;
			var sized_picture = null;
			var square_picture = null;
			var large_picture = null;
			agent
				.post(upload_target)
				.field('client_id', name)
				.field('timestamp', timestamp)
				.attach('image', filepath)
				.end(function(res){
					console.log(res.body);
					original_picture = res.body.original;
					sized_picture = res.body.sized;
					square_picture = res.body.square;
					large_picture = res.body.large;
					if(memo[name]){
						memo[name].push({
							name: name,
							taken_for: taken_for,
							timestamp: timestamp,
							date_taken: date_taken,
							filepath: filepath,
							original_picture: original_picture,
							sized_picture: sized_picture,
							square_picture: square_picture,
							large_picture: large_picture,
							is_profile: is_profile
						});
					} else {
						memo[name] = [
							{
								name: name,
								taken_for: taken_for,
								timestamp: timestamp,
								date_taken: date_taken,
								filepath: filepath,
								original_picture: original_picture,
								sized_picture: sized_picture,
								square_picture: square_picture,
								large_picture: large_picture,
								is_profile: is_profile
							}
						]
					}; // end if
					callback(null, memo);
				}); // end agent
		}, function(err, result){
			clientMap = result;
			_.each(clientMap, function(v,k,list){
				var temp = _.sortBy(v, function(x){
					return x.date_taken;
				});
				clientMapSorted[k] = temp;
			});
			console.log(clientMapSorted);
		}); // end async
	} // end if files
}); // end glob

/**
 agent
 .get("http://testsvr.eurogrp.com:8100/api/login/NX1,123456/details")
 .auth('sa-web-api', 'dc0P2$$L')
 .set("username", "sa-web-api")
 .set("password", "dc0P2$$L")
 .end(function(res){
	console.log(res.text);
	console.log(res.header);
});
 **/