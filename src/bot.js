"use strict"

const tls = require('tls')
const events = require('events')

const ircMsg = require('irc-message')
const RateLimiter = require('limiter').RateLimiter

const parser = require('./parser')

const Bot = class Bot {

  constructor({ 
    username,
    oauth,
    channel,
    port = 443,
    silence = false,
    limit = 19,
    period = 30000,
    command_prefix = '!'
  }) {
    this.username = username
    this.oauth = oauth
    this.channel = channel ? channel.toLowerCase() : channel

    if(!username || !oauth || !channel) {
      throw ({ 
        name: 'missing required arguments', 
        message: 'You must provide all the default arguments [username, oauth, channel]'
      })
    }

    this.port = port
    this.silence = silence
    this.message_rate_limit = limit
    this.message_rate_period = period
    this.command_prefix = command_prefix

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
      if(err) this.emit('error', err)
      else {

        if(!events_to_ignore.includes(event.command)) {
          switch(event.command) {

            case 'PRIVMSG':
              const chatter = parser.getChatter(event, {
                command_prefix: this.command_prefix
              })
              this.emit('message', chatter)
              break

            case 'NOTICE':
              if(event.params.includes('Login authentication failed')) {
                this.emit('error', event.params[1] + ' for ' + this.username)
              }
              break

            case 'ROOMSTATE':
              if(!event.tags['broadcaster-lang']) {
                const roomstate_event = parser.getRoomstate(event)
                this.emit('roomstate', roomstate_event)
              }
              break

            case 'USERNOTICE': // resubs
              if(event.tags['msg-id'] === 'resub') {
                this.emit('resub', event.tags)
              }
              if(event.tags['msg-id'] === 'sub') {
                this.emit('sub', event.tags)
              }
              break

            case 'NOTICE':
              console.log(event)
              break

            case 'USERSTATE':
              break

            case 'JOIN':
              // console.log(event)
              this.emit('join', { joined: true, ts: new Date() })
              break

            case 'MODE':
              break

            case 'CLEARCHAT':
              console.log(event.tags) // /ban, /clear
              break

            case 'HOSTTARGET':
              const host = parser.getHost(event)
              this.emit('host', host)
              break

            case 'PING':
              this.raw('PONG :tmi.twitch.tv')
              this.emit('ping', {
                sent: true,
                ts: new Date()
              })
              break

            case '421':
              this.emit('error', event.params[2] + ' ' + event.params[1])
              break

            default:
              console.log('something new!')
              console.log(event)
          }
        }
      }
    })
  }

  write(text, callback) {
    this.messageRateLimiter.removeTokens(1, (err, requests) => {
      if(err) callback(err, false)
      if(requests < 1) {
        callback(new Error('Twitch IRC rate limit reached'), false)
      } else {
        this.irc.write(text + "\r\n")
        if(callback) callback(null, true)
      }
    })
  }

  raw(callback) {
    this.irc.pipe(ircMsg.createStream()).on('data', data => {
      if(callback) callback(data, null)
    })
    this.irc.on('error', err => callback(null, err))
  }

  say(text, callback) {
    if(!this.silence) {
      this.write("PRIVMSG " + this.channel + " :" + text, (err, sent) => {
        if(callback) callback(err, {
          sent: true,
          ts: new Date()
        })
      })
    } else {
      console.log('SILENCED MSG: ' + text)
      if(callback) callback(null, 'silenced message')
    }
  }

	whisper(user, text, callback) {
		this.write("PRIVMSG #jtv : /w " + user + " " + text, (err, sent) => {
      if(callback) callback(err, {
        sent: true,
        ts: new Date()
      })
    })
	}

  close() {
    this.irc.destroy()
  }

}

Bot.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Bot