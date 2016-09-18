var irc = require('irc')
var Q = require('q')
var _ = require('lodash')

var parser = require('./src/parser')

var _conf;
var client;

module.exports = {

	run : function(conf) {
		_conf = conf;

		client = new irc.Client('irc.chat.twitch.tv', conf.username, {
			port: 6667,
			password: conf.oauth,
			channels: ['#' + conf.channel]
		})

		client.send('CAP REQ', 'twitch.tv/membership')
		client.send('CAP REQ', 'twitch.tv/tags')
		client.send('CAP REQ', 'twitch.tv/commands')
	},

	raw : function(callback) {
		var deferred = Q.defer()

		client.addListener('raw', (msg) => {
			if(msg.commandType === 'normal') {
				var s = msg.command.split(';')
				if(_.includes(s[2], 'display-name=')) {
					deferred.resolve(callback(msg, s))
				}
			}
		})

		client.addListener('error', (err) => {
			deferred.reject(err)
		})

		return deferred.promise;
	},

	/* Exact string match */
	listenFor : function(word, callback) {
		var deferred = Q.defer()

		this.raw((msg) => {
			parser.exactMatch(msg, word).then((chatter) => {
				deferred.resolve(callback(chatter))
			}).catch((err) => {
				deferred.reject(err)
			})
		}).catch((err) => {
			deferred.reject(err)
		})
		return deferred.promise;
	},

	/* Includes string match */
	listen : function(word, callback) {
		var deferred = Q.defer()

		this.raw((msg) => {
			parser.includesMatch(msg, word).then((chatter) => {
				deferred.resolve(callback(chatter))
			}).catch((err) => {
				deferred.reject(err)
			})
		}).catch((err) => {
			deferred.reject(err)
		})
		return deferred.promise;
	},

	msg : function(message) {
		client.say(_conf.channel, message)
	}

}