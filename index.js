var irc = require('irc')
var Q = require('q')
var _ = require('lodash')

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

	listen : function() {
		var deferred = Q.defer()

		client.addListener('raw', (msg) => {
			if(msg.commandType === 'normal') {
				// console.log(msg)
				var s = msg.command.split(';')
				if(_.includes(s[2], 'display-name=')) {
					deferred.notify(msg, s)
				}
			}
		})
		client.addListener('error', (err) => {
			deferred.reject(err)
		})
		return deferred.promise;
	},

	listenFor : function(word) {

		return this.listen().progress((msg, split) => {
			if(_.includes(msg.args[0].split(':')[1], word)) {
				return {
					user: msg.rawCommand.split(';')[2].split('=')[1],
					msg: msg.args[0].split(':')[1],
					sub: msg.rawCommand.split(';')[7].split('=')[1],
					type: msg.rawCommand.split(';')[10].split('=')[1]
				}
			}
		})
	},

	msg : function(message) {
		client.say(_conf.channel, message)
	}

}