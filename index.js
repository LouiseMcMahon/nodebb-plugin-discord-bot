"use strict";
var DiscordClient = require("discord.io");
var winston = module.parent.require('winston');
var db = module.parent.require('./database');
var Posts = module.parent.require('./posts');
var Topics = module.parent.require('./topics');
var User = module.parent.require('./user');
var Package = require("./package.json");
var siteConfig = module.parent.require('../config.json');

var bot = {}
var adminRoute = '/admin/plugins/discord-bot';
var settings = {
	"botEmail": process.env.DISCORD_BOT_EMAIL || undefined,
	"botPassword": process.env.DISCORD_BOT_PASSWORD || undefined,
	"botUpdateChannel": process.env.DISCORD_BOT_CHANNEL || undefined
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
		botPassword: data.botPassword || '',
		botUpdateChannel: data.botUpdateChannel || ''
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

		if(!newSettings.botUpdateChannel){
			settings.botUpdateChannel = process.env.DISCORD_BOT_CHANNEL || "";
		}else{
			settings.botUpdateChannel = newSettings.botUpdateChannel;
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
		botUpdateChannel: settings.botUpdateChannel,
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
			winston.error("botEmail undefined");
			return callback(new Error("botEmail undefined"),null)
		}
		if (typeof settings.botPassword == undefined){
			winston.error("botPassword undefined");
			return callback(new Error("botPassword undefined"),null)
		}

		bot = new DiscordClient({
			autorun: true,
			email: settings.botEmail,
			password: settings.botPassword
		});

		bot.on("ready", function() {
			bot.on("message", function(user, userID, channelID, message, rawEvent) {
				console.log(rawEvent);
				//if message is directed at the bot
				if(message.startsWith("<@"+bot["id"]+">")){
					var command = message.replace("<@"+bot["id"]+">","").trim().toLowerCase();
					getReplies(command,user,userID,function (err,data) {
						data.forEach(function(entry){
							bot.sendMessage({
								to: channelID,
								message: entry
							});
						});
					})
				}
			});
		});

		callback(null,undefined);

	});
};

function getPostURl(pid,tid,callback){
	Topics.getTopicField(tid,"slug",function (err,slug) {
		var url = siteConfig.url+"/topic/"+slug+"/"+pid;
		return callback(err,url)
	})

}

function getDiscordUserName(uid,callback){
	User.getUsernamesByUids([uid],function (err,userName) {
		callback(null,userName[0]);
	})
}

function stringAbbreviate(str, max, suffix)
{
	if((str = str.replace(/^\s+|\s+$/g, '').replace(/[\r\n]*\s*[\r\n]+/g, ' ').replace(/[ \t]+/g, ' ')).length <= max)
	{
		return str;
	}
	var
		abbr = '',
		str = str.split(' '),
		suffix = (typeof suffix !== 'undefined' ? suffix : ' ...'),
		max = (max - suffix.length);

	for(var len = str.length, i = 0; i < len; i ++)
	{
		if((abbr + str[i]).length < max)
		{
			abbr += str[i] + ' ';
		}
		else { break; }
	}
	return abbr.replace(/[ ]$/g, '') + suffix;
}

NodebbBot.userPosted = function (data,callback) {
	getPostURl(data["pid"],data["tid"],function (err,postURL) {
		getDiscordUserName(data["uid"],function (err,userName) {
			console.log(data);
			var postContent = stringAbbreviate(data["content"],100,"...");

			var message = "";
			message = "User "+userName+" has posted \n\n";
			message = message+postContent+"\n\n";
			message = message+postURL;
			bot.sendMessage({
				to: settings.botUpdateChannel,
				message: message
			});
			return callback(null,data);

		})
	})

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