var Q = require('q')
var _ = require('lodash')

module.exports = {

	createChatter : function(msg) {
		var deferred = Q.defer()

		deferred.resolve({
			user: this.getElement(msg, 'display-name'),
			msg: this.getMessage(msg),
			channel: this.getChannel(msg),
			user_id: this.getElement(msg, 'user-id'),
			level: this.getElement(msg, 'user-type'),
			sub: this.getElement(msg, 'subscriber'),
			turbo: this.getElement(msg, 'turbo'),
		})

		return deferred.promise;
	},

	getElement : function(msg, el) {
		var temp;
		var s = msg.rawCommand.split(';')

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
		return msg.args[0].split('#')[1].split(' ')[0]
	},

	exactMatch : function(msg, word) {
		var deferred = Q.defer()

		if(msg.args[0].split(':')[1] === word) {
			deferred.resolve(this.createChatter(msg))
		}

		return deferred.promise;
	},

	includesMatch : function(msg, word) {
		var deferred = Q.defer()

		if(_.includes(msg.args[0].split(':')[1], word)) {
			deferred.resolve(this.createChatter(msg))
		}

		return deferred.promise;
	}

}