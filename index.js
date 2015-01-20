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
var backend_target = 'http://egcbsc.com:1337/clients';
var upload_target = 'http://localhost:8080/upload';
var root_folder = '/Users/felixtioh/Desktop/test';

var currentTS = new Date().getTime();

glob((root_folder + "/**/*.jpg"), options, function (er, files) {
	if(files && files.length > 0){
		async.reduce(files, {}, function(memo, filepath, callback){
			var _reversed = filepath.split(/\/|\\/).reverse();
			var name = _reversed[4].trim().toUpperCase();
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
			if(!parts[1]){
				callback(null, memo);
				return;
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
			_.each(clientMapSorted, function(v,k,list){
				var last_session = null;
				var last_session_index = 0;
				var sessions = [];
				var photos = [];
				var profile_pic = {
					temp: 'images/profile.png',
					original: null,
					sized: null,
					square: null,
					large: null
				};
				_.each(v, function(el, kk){
					if(el.date_taken != last_session){
						last_session = el.date_taken;
						last_session_index += 1;
						sessions.push({
							date: el.date_taken,
							treatment_improvement: '',
							service: ''
						});
					}
					photos.push({
						taken_for: el.taken_for,
						session: last_session_index.toString(),
						angle: '',
						date_taken: el.date_taken,
						timestamp: el.timestamp,
						temp_path: '',
						original_picture: el.original_picture,
						sized_picture: el.sized_picture,
						square_picture: el.square_picture,
						large_picture: el.large_picture,
						index: kk.toString()
					});
					if(el.is_profile){
						profile_pic.original = el.original_picture;
						profile_pic.sized = el.sized_picture;
						profile_pic.square = el.square_picture;
						profile_pic.large = el.large_picture;
					}
				});
				console.log('====================');
				//console.log(k);
				//console.log(sessions);
				//console.log(photos);
				var client = {
					Id: k,
					name: k,
					client_name: k,
					profile_pic: profile_pic,
					photos: photos,
					sessions: sessions
				};
				console.log(client);
				agent
					.post(backend_target + '/' + k)
					.send(client)
					.end(function(res){
						console.log(res);
					});

			}); // after _.each(clientMapSorted)
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