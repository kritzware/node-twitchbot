"use strict";

const irc = require('irc')
const Q = require('q')
const _ = require('lodash')

const parser = require('./src/parser')

let _conf;
let client;
let _commands;

module.exports = {

	run : function(conf) {
		conf.hashedChannel = '#' + conf.channel
		_conf = conf

		client = new irc.Client('irc.chat.twitch.tv', conf.username, {
			port: 6667,
			password: conf.oauth,
			channels: [conf.hashedChannel]
		})

		client.addListener('error', err => {
			console.log(err)
		})

		client.send('CAP REQ', 'twitch.tv/membership')
		client.send('CAP REQ', 'twitch.tv/tags')
		client.send('CAP REQ', 'twitch.tv/commands')
	},

	raw : function(callback) {
		const deferred = Q.defer()

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
		const deferred = Q.defer()

		this.raw((msg) => {
			parser.exactMatch(msg, word)
			.then((chatter) => {
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
		const deferred = Q.defer()

		this.raw((msg) => {
			parser.includesMatch(msg, word)
			.then((chatter) => {
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
		const deferred = Q.defer()

		this.raw((msg) => {
			parser.resub(msg)
			.then((chatter, sub) => {
				deferred.resolve(callback(null, chatter, sub))
			}).catch((err) => {
				deferred.reject(callback(err))
			})
		}).catch((err) => {
			deferred.reject(callback(err))
		})
		return deferred.promise;
	},

	msg : function(message) {
		client.send('PRIVMSG ' + _conf.hashedChannel, message)
	},

	whisper : function(user, message) {
		client.send('PRIVMSG ' + _conf.hashedChannel, '/w ' + user + ' ' + message)
	},

	commands : function(prefix, commands, callback) {
		_commands = commands
		const _this = this
		const deferred = Q.defer()

		this.raw((msg) => {
			_.keys(_commands).forEach((cmd) => {
				parser.exactMatch(msg, prefix + cmd)
				.then((chatter) => {
					if(Object.prototype.toString.call(_commands[cmd]) == '[object Function]') {
						try {
							const out = _commands[cmd](chatter)
							_this.msg(out.toString())
							deferred.resolve(callback(null, chatter, cmd))
						} catch(err) {
							deferred.reject(callback(err))
						}
					} else {
						_this.msg(_commands[cmd])
						deferred.resolve(callback(null, chatter, cmd))
					}
				})
			})
		})
		.catch((err) => {
			deferred.reject(callback(err))
		})
		return deferred.promise;
	}
}