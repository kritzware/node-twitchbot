"use strict";

const _ = require('lodash')

module.exports = {

	createChatter : function(msg) {
		return new Promise(resolve => {
			resolve({
				user: this.getElement(msg, 'display-name'),
				msg: this.getMessage(msg),
				channel: this.getChannel(msg),
				twitch_id: this.getElement(msg, 'user-id'),
				level: this.getElement(msg, 'user-type'),
				sub: +this.getElement(msg, 'subscriber'),
				turbo: +this.getElement(msg, 'turbo'),
			})
		})
	},

	getElement : function(msg, el) {
		let temp;
		const s = msg.rawCommand.split(';')

		s.some((m) => {
			if(_.includes(m, el)) {
				temp = m.split('=')[1]
			}
		})
		return temp;
	},

	getMessage : function(msg) {
		return msg.args[0].split(':')[1]
	},

	getChannel : function(msg) {
		if(_.includes(msg.args[0], '#')) {
			return msg.args[0].split('#')[1].split(' ')[0]
		}
		return 'IRC'
	},

	exactMatch : function(msg, word) {
		return new Promise(resolve => {
			if(word === '*') {
				resolve(this.createChatter(msg))
			} else {
				if(msg.args[0].split(':')[1] === word) {
					resolve(this.createChatter(msg))
				}
			}
		})
	},

	includesMatch : function(msg, word) {
		return new Promise(resolve => {
			if(_.includes(msg.args[0].split(':')[1], word)) {
				resolve(this.createChatter(msg))
			}
		})
	},

	resub : function(msg) {
		const _this = this;
		return new Promise(resolve => {
			if(_.includes(msg.command, 'msg-id=resub')) {
				var split_raw = _.split(msg.command, ';')
				split_raw.forEach(function(msg) {
					if(_.includes(msg, 'msg-param-months')) {
						resolve(_this.createChatter(msg), _.split(msg, '=')[1])
					}
				})
			}
		})
	}

}