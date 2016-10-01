var irc = require('irc')
var Q = require('q')
var _ = require('lodash')

var parser = require('./src/parser')

var _conf;
var client;

module.exports = {

	run : function(conf) {
		conf.hashedChannel = '#' + conf.channel
		_conf = conf

		client = new irc.Client('irc.chat.twitch.tv', conf.username, {
			port: 6667,
			password: conf.oauth,
			channels: [conf.hashedChannel]
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
				deferred.resolve(callback(null, chatter))
			}).catch((err) => {
				deferred.reject(callback(err))
			})
		}).catch((err) => {
			deferred.reject(callback(err))
		})
		return deferred.promise;
	},

	/* Includes string match */
	listen : function(word, callback) {
		var deferred = Q.defer()

		this.raw((msg) => {
			parser.includesMatch(msg, word).then((chatter) => {
				deferred.resolve(callback(null, chatter))
			}).catch((err) => {
				deferred.reject(callback(err))
			})
		}).catch((err) => {
			deferred.reject(callback(err))
		})
		return deferred.promise;
	},

	resub : function(callback) {
		var deferred = Q.defer()

		this.raw((msg) => {
			parser.resub(msg).then((chatter, sub) => {
				deferred.resolve(callback(null, chatter, sub))
			}).catch((err) => {
				deferred.reject(callback(err))
			})
		}).catch((err) => {
			deferred.reject(callback(err))
		})
	},

	msg : function(message) {
		client.say(_conf.hashedChannel, message)
	}

}