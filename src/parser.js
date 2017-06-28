const _ = require('lodash')

module.exports = {

	getChatter(event, { command_prefix }) {

		const chatter = event.tags

		chatter.mod 				   = !!+chatter.mod
		chatter['room-id'] 		 = +chatter['room-id']
		chatter.subscriber 		 = !!+chatter.subscriber
		chatter['tmi-sent-ts'] = +chatter['tmi-sent-ts']
		chatter['sent-ts'] 		 = +chatter['sent-ts']
		chatter.turbo 				 = !!+chatter.turbo
		chatter['user-id'] 		 = +chatter['user-id']

		/* ircMsg parser module returns empty vals as bools */
		if(typeof chatter.emotes === 'boolean') {
			chatter.emotes = false
		}
		
		chatter.msg = event.params[1]
		if(chatter.msg.includes('\u0001ACTION')) {
			chatter.msg = chatter.msg.split('\u0001')[1].replace('ACTION ', '')
			chatter.color_message = true
		}

		if(command_prefix) {
			chatter.is_command = chatter.msg.split(' ')[0][0] === command_prefix ? true : false
		}

		if(chatter.is_command) {
			const split_msg = chatter.msg.split(' ')
			chatter.args = split_msg.splice(1, split_msg.length - 1)
			chatter.msg_without_command = chatter.args.join(' ')
			chatter.command = split_msg[0].replace('!', '')
		}
		
		if(typeof chatter['display-name'] === 'boolean') {
			chatter.username = event.prefix.split('!')[0]
		} else {
			chatter.username = chatter['display-name'].toLowerCase()
		}

		if(chatter.bits) {

		}

		return chatter
	},

	getHost(event) {
		const host = event.params[1]
		const is_hosting = host.split(' ')

		if(is_hosting[0] === '-') {
			return {
				hosting: false,
				ts: new Date()
			}
		}
		return {
			hosting: true,
			channel: is_hosting[0],
			viewers: is_hosting[1],
			ts: new Date()
		}
	},

	getRoomstate(event) {
		const state = event.tags

		state['room-id'] = +state['room-id']

		if(state['subs-only']) {
			state['subs-only'] = !!+state['subs-only']
		}
		if(state['r9k']) {
			// console.log(event.tags)
			// delete state['r9k']
			// state['rk9'] = !!+state['r9k']
		}
		if(state.slow) {
			state.slow = +state.slow
		}
		if(state['emote-only']) {
			state['emote-only'] = !!+state['emote-only']
		}
		if(state['followers-only']) {
			state['followers-only'] = +state['followers-only']
		}

		return state
	}

}