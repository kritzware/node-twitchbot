"use strict"

const tls = require('tls')
const events = require('events')

const ircMsg = require('irc-message')
const RateLimiter = require('limiter').RateLimiter

const Bot = class Bot {

  constructor({ 
    username,
    oauth,
    channel,
    silence = false,
    limit = 19
  }) {
    this.username = username
    this.oauth = oauth
    this.channel = channel.toLowerCase()
    this.silence = silence
    if(!this.channel.includes('#')) this.channel = '#' + this.channel
    
    this.irc = new tls.TLSSocket()
    this.messageRateLimiter = new RateLimiter(limit, 30000)
    events.EventEmitter.call(this)
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.irc.connect({
        host: "irc.chat.twitch.tv",
        port: 443
      })
      this.irc.setEncoding("utf8")
      this.irc.once("connect", () => {
        
        this.write("PASS " + this.oauth)
        this.write("NICK " + this.username)
        this.write("JOIN " + this.channel)

        this.write("CAP REQ :twitch.tv/membership")
        this.write("CAP REQ :twitch.tv/tags")
        this.write("CAP REQ :twitch.tv/commands")

        this.listen()
        resolve()
      })
    })
  }

  listen(callback) {
    this.raw((event, err) => {
      if(err) callback(null, err)
      else {
        switch(event.command) {
          case 'PRIVMSG':
            this.emit('message', event.tags)
            break

          case 'NOTICE':
            if(event.params.includes('Login authentication failed')) {
              this.emit('error', event.params[1] + ' for ' + this.username)
            }
            break

          case 'USERNOTICE':
            console.log(event)
            break

          default:
            console.log('something else')
        }
      }
    })
  }

  write(text, callback) {
    this.messageRateLimiter.removeTokens(1, (err, requests) => {
      if(err) callback(err)
      if(requests < 1) {
        callback(new Error('Twitch IRC rate limit reached'))
      } else {
        this.irc.write(text + "\r\n")
      }
    })
  }

  raw(callback) {
    this.irc.pipe(ircMsg.createStream()).on('data', data => {
      callback(data, null)
    })
    this.irc.on('error', err => callback(null, err))
  }

  msg(text, callback) {
    if(!this.silence) {
      this.write("PRIVMSG " + this.channel + " :" + text, err => {
        if(err) callback(err)
      })
    } else {
      console.log('SILENCED MSG: ' + text)
    }
  }

	whisper(user, text) {
		this.write("PRIVMSG #jtv : /w " + user + " " + text, err => {
      if(err) callback(err)
    })
	}

}

Bot.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Bot