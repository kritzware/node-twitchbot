"use strict"

const IRC = require('irc')
const _ = require('lodash')
const parser = require('./src/parser')

function Bot({
	username=null, 
	oauth=null, 
	channel=null
}) {
	if(!username || !oauth || !channel) {
		throw new Error('Bot() requires options argument')
	}
	this.username = username
	this.oauth = oauth
	this.channel = channel.toLowerCase()
	this.client = null
}

Bot.prototype = {

	connect() {
		return new Promise((resolve, reject) => {
			this.client = new IRC.Client('irc.chat.twitch.tv', this.username, {
				userName: this.username + '-node-twitchbot',
				realName: this.username + '-node-twitchbot',
				port: 443,
				password: this.oauth,
				channels: ['#' + this.channel],
				debug: false,
				secure: true,
				autoConnect: false
			})
			this.client.connect(connected => {
				if(!connected) reject()
				if(connected.rawCommand === '001') {
					this.client.send('CAP REQ', 'twitch.tv/membership')
					this.client.send('CAP REQ', 'twitch.tv/tags')
					this.client.send('CAP REQ', 'twitch.tv/commands')
					resolve()
				}
			})
			this.client.addListener('error', err => {
				// console.log('CONNECTION ERROR')
				// console.log(err)
			})
		})
	},

	listen(callback) {
		return new Promise((resolve, reject) => {
			this.raw((err, event) => {
				if(err) {
					resolve(callback(err))
				} else {
					if(event.commandType === 'normal') {
						const split = event.command.split(';')
						if(_.includes(split[2], 'display-name=') && !_.includes(event.args[0], 'USERSTATE')) {
							parser.createChatter(event)
							.then(chatter => resolve(callback(null, chatter)))
							.catch(err => resolve(callback(err)))
						}
					}					
				}
			})
		})
	},

	listenFor(word, callback) {
		return new Promise((resolve, reject) => {
			this.raw((err, event) => {
				if(err) {
					resolve(callback(err))
				} else {
					if(event.commandType === 'normal') {
						const split = event.command.split(';')
						if(_.includes(split[2], 'display-name=')) {
							parser.exactMatch(event, word)
							.then(chatter => resolve(callback(null, chatter)))
							.catch(err => resolve(callback(err)))
						}
					}
				}
			})
		})
	},

	raw(cb_event) {
		return new Promise((resolve, reject) => {
			this.client.addListener('raw', event => {
				resolve(cb_event(null, event))
			})
			this.client.addListener('error', err => {
				resolve(cb_event(err))
			})
		})
	},

	msg(text) {
		this.client.send('PRIVMSG #' + this.channel, text)
	}

}

module.exports = Bot