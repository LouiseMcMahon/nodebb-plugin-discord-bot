"use strict";
var DiscordClient = require("discord.io");
var winston = module.parent.require('winston');
var db = module.parent.require('./database');
var Package = require("./package.json");

var bot = {}
var adminRoute = '/admin/plugins/discord-bot';
var settings = {
	"botEmail": process.env.DISCORD_BOT_EMAIL || undefined,
	"botPassword": process.env.DISCORD_BOT_PASSWORD || undefined
};

var NodebbBot = {}


//should return a list of repplies as the second callback argument and an error only if their is an error as the first callback arguemnt
function getReplies(command,fromUser,fromUserID,callback) {
	var repplys = []

	if (command == "hello" || command == "hi"){
		repplys.push("<@"+fromUserID+"> hello ");
	}

	if (command == "help"){
		repplys.push("<@"+fromUserID+"> im just a bot you might want to call 999");
	}

	return callback(null,repplys);
};

function nodebbBotSettings(req, res, next) {
	var data = req.body;
	var newSettings = {
		botEmail: data.botEmail || '',
		botPassword: data.botPassword || ''
	};

	saveSettings(newSettings, res, next);
};

function fetchSettings(callback){
	db.getObjectFields(Package.name, Object.keys(settings), function(err, newSettings){
		if (err) {
			winston.error(err.message);
			if (typeof callback === 'function') {
				callback(err);
			}
			return;
		}

		if(!newSettings.botEmail){
			settings.botEmail = process.env.DISCORD_BOT_EMAIL || "";
		}else{
			settings.botEmail = newSettings.botEmail;
		}

		if(!newSettings.botPassword){
			settings.botPassword = process.env.DISCORD_BOT_PASSWORD || "";
		}else{
			settings.botPassword = newSettings.botPassword;
		}

		if (typeof callback === 'function') {
			callback();
		}
	});
}

function saveSettings(settings, res, next) {
	db.setObject(Package.name, settings, function(err) {
		if (err) {
			return next(makeError(err));
		}

		fetchSettings(function () {
		});
		res.json('Saved!');
	});
}

function renderAdmin(req, res) {
	// Regenerate csrf token
	var token = req.csrfToken();

	var data = {
		botEmail: settings.botEmail,
		botPassword: settings.botPassword,
		csrf: token
	};

	res.render('admin/plugins/discord-bot', data);
}

NodebbBot.load = function(params, callback) {

	fetchSettings(function(err,data) {
		if (err) {
			return winston.error(err.message);
		}

		params.router.get(adminRoute, params.middleware.applyCSRF, params.middleware.admin.buildHeader, renderAdmin);
		params.router.get('/api' + adminRoute, params.middleware.applyCSRF, renderAdmin);
		params.router.post('/api' + adminRoute + '/nodebbBotSettings', nodebbBotSettings);

		if (typeof settings.botEmail == undefined){
			winston.error("botEmail undefined")
			return callback(new Error("botEmail undefined"),null)
		};
		if (typeof settings.botPassword == undefined){
			winston.error("botPassword undefined")
			return callback(new Error("botPassword undefined"),null)
		};

		bot = new DiscordClient({
			autorun: true,
			email: settings.botEmail,
			password: settings.botPassword
		});

		bot.on("ready", function() {
			bot.on("message", function(user, userID, channelID, message, rawEvent) {
				console.log(message);
				//if message is directed at the bot
				if(message.startsWith("<@"+bot["id"]+">")){
					var command = message.replace("<@"+bot["id"]+">","").trim().toLowerCase();
					console.log(command);

					getReplies(command,user,userID,function (err,data) {
						data.forEach(function(entry){
							bot.sendMessage({
								to: channelID,
								message: entry
							});
						});
					})
				};
			});
		});

		callback(null,undefined);

	});
};


NodebbBot.appendData =  function (data,callback) {
	console.log(data);
	var message = ""
	message = data["content"]
	bot.sendMessage({
		to: "167038734745862144",
		message: message
	});
	return callback(null,data);
};

NodebbBot.adminMenu = function(custom_header, callback) {
	custom_header.plugins.push({
		"route": '/plugins/discord-bot',
		"icon": 'fa-envelope-o',
		"name": 'Discord Bot'
	});

	callback(null, custom_header);
}

module.exports = NodebbBot;