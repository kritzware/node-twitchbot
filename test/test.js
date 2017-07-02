const assert = require('assert')
const expect = require('chai').expect

const TwitchBot = require('../index')
const parser = require('../src/parser')

const conf = {
  username: process.env.BOT_USERNAME,
  oauth: process.env.BOT_OAUTH,
  channel: !process.env.BOT_CHANNEL.includes('#') ? '#' + process.env.BOT_CHANNEL : process.env.BOT_CHANNEL
}
const sender_conf = {
  username: process.env.USERNAME,
  oauth: process.env.OAUTH,
  channel: !process.env.CHANNEL.includes('#') ? '#' + process.env.CHANNEL : process.env.CHANNEL
}

async function newBot(options) {
  const bot = new TwitchBot(options)
  await bot.connect()
  return bot
}
function destroy(reciever, sender) {
  reciever.close()
  sender.close()
}

describe('Bot', () => {

  describe('constructor', () => {

    it('should create a bot with default settings', () => {
      const bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel
      })
      expect(bot).to.include({ username: conf.username })
      expect(bot).to.include({ oauth: conf.oauth })
      expect(bot).to.include({ channel: conf.channel })
      expect(bot).to.include({ port: 443 })
      expect(bot).to.include({ silence: false })
      expect(bot).to.include({ message_rate_limit: 19 })
      expect(bot).to.include({ message_rate_period: 30000 })
      expect(bot).to.include({ command_prefix: '!' })
    })

    it('should create a bot with optional settings', () => {
      const bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel,
        port: 6667,
        silence: true,
        limit: 10,
        period: 25000,
        command_prefix: '#'
      })
      expect(bot).to.include({ username: conf.username })
      expect(bot).to.include({ oauth: conf.oauth })
      expect(bot).to.include({ channel: conf.channel })
      expect(bot).to.include({ port: 6667 })
      expect(bot).to.include({ silence: true })
      expect(bot).to.include({ message_rate_limit: 10 })
      expect(bot).to.include({ message_rate_period: 25000 })
      expect(bot).to.include({ command_prefix: '#' })
    })

    it('should fail when default arguments not provided', () => {
      try {
        const bot = new TwitchBot({
        username: '',
        oauth: ''
      })
      } catch(err) {
        expect(err.name).to.equal('missing required arguments')
      }
    })

    it('should create a new socket', () => {
      const bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel
      })
      expect(bot.irc).to.include({ domain: null })
      expect(bot.irc).to.include({ connecting: true })
    })

  })

  describe('connect', () => {
    
    it('should connect to Twitch IRC', async () => {
      const bot = await newBot(conf)
      expect(bot.irc).to.include({ connecting: false })
      expect(bot.irc).to.include({ _host: 'irc.chat.twitch.tv' })  
    })

  })

  describe('events', () => {
    
    describe('join', () => {
      it('should emit a join message when connecting to the channel room', async () => {
        const bot = await newBot(conf)
        return new Promise(resolve => {
          bot.on('join', event => {
            expect(event.joined).to.equal(true)
            resolve()
          })
        })
      })
    })

    describe('roomstate', () => {
      it('should emit roomstate event when a room mode is toggled', async () => {
        const bot = await newBot(conf)
        return new Promise(resolve => {
          bot.on('roomstate', state => {
            if(state['subs-only']) {
              expect(state['subs-only']).to.equal(true)
              resolve()
            }
          })
          bot.say('/subscribersoff')
          bot.say('/subscribers')
          bot.say('/subscribersoff')
        })
      })
    })

    describe('message', () => {
      it('should emit a chatter when a message is sent in the channel room', async () => {
        const msg = 'unit test message 1 KKona'
        const [
          bot,
          sender
        ] = await Promise.all([
          newBot(conf),
          newBot(sender_conf)
        ])
        return new Promise(resolve => {
          bot.on('message', chatter => {
            expect(chatter.msg).to.equal(msg)
            expect(chatter.username).to.equal(sender_conf.username)
            expect(chatter.emotes).to.equal(false)
            resolve()
          })
          sender.say(msg)
        })
      })
    })

  })
  
})