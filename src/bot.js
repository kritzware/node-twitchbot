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
    port=443,
    silence = false,
    limit = 19,
    period = 30000
  }) {
    this.username = username
    this.oauth = oauth
    this.channel = channel.toLowerCase()
    this.port = port
    this.silence = silence
    this.message_rate_limit = limit
    this.message_rate_period = period

    if(!this.channel.includes('#')) this.channel = '#' + this.channel
    
    this.irc = new tls.TLSSocket()
    this.messageRateLimiter = new RateLimiter(this.message_rate_limit, this.message_rate_period)
    events.EventEmitter.call(this)
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.irc.connect({
        host: "irc.chat.twitch.tv",
        port: this.port
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
      this.irc.on("error", err => {
        // reject(err)
        this.emit('error', err)  
      })
    })
  }

  listen(callback) {
    const events_to_ignore = [
      '001', '002', '003', '004', 
      '372', '375', '376', // MOTD
      'CAP', // CAP 
      '353', '366' // NAMES LIST
    ]
    this.raw((event, err) => {
      if(err) callback(null, err)
      else {
        if(!events_to_ignore.includes(event.command)) {
          switch(event.command) {
            case 'PRIVMSG':
              this.emit('message', event.tags)
              break

            case 'NOTICE':
              if(event.params.includes('Login authentication failed')) {
                this.emit('error', event.params[1] + ' for ' + this.username)
              }
              break

            case 'ROOMSTATE':
              console.log(event.params)
              break

            case 'USERNOTICE': // resubs
              if(event.tags['msg-id'] === 'resub') {
                this.emit('resub', event.tags)
              }
              if(event.tags['msg-id'] === 'sub') {
                this.emit('sub', event.tags)
              }
              break

            case 'USERSTATE':
              break

            case 'JOIN':
              this.emit('join', { joined: true, ts: new Date() })
              break

            case 'MODE':
              break

            case 'PING':
              this.raw('PONG :tmi.twitch.tv')
              this.emit('ping', 'Ping recieved, pong sent back')
              break

            case '421':
              this.emit('error', event.params[2] + ' ' + event.params[1])
              break

            default:
              console.log('cmd -> ', event.command)
          }
        }
      }
    })
  }

  write(text, callback) {
    this.messageRateLimiter.removeTokens(1, (err, requests) => {
      if(err) callback(false, err)
      if(requests < 1) {
        callback(false, new Error('Twitch IRC rate limit reached'))
      } else {
        this.irc.write(text + "\r\n")
        if(callback) callback(true, null)
      }
    })
  }

  raw(callback) {
    this.irc.pipe(ircMsg.createStream()).on('data', data => {
      if(callback) callback(data, null)
    })
    this.irc.on('error', err => callback(null, err))
  }

  msg(text, callback) {
    if(!this.silence) {
      this.write("PRIVMSG " + this.channel + " :" + text, err => {
        if(err) callback(err)
        else {
          if(callback) callback(null)
        }
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

  close() {
    this.irc.destroy()
  }

}

Bot.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Bot