const assert = require('assert')
const expect = require('chai').expect

const TwitchBot = require('../index')

const conf = {
  username: process.env.BOT_USERNAME || 'bot_kappa_123',
  oauth: process.env.BOT_OAUTH || 1,
  channel: process.env.BOT_CHANNEL || 'kritzware'
}

describe('bot', () => {

  describe('constructor', () => {

    it('should create a new bot instance with default arguments', () => {
      const Bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel
      })
      expect(Bot.username).to.equal(conf.username)
      expect(Bot.oauth).to.equal(conf.oauth)
      expect(Bot.channel).to.equal('#' + conf.channel.toLowerCase())
      expect(Bot.port).to.equal(443)
      expect(Bot.silence).to.equal(false)
      expect(Bot.message_rate_limit).to.equal(19)
      expect(Bot.message_rate_period).to.equal(30000)
    })
  })

  describe('connect', () => {
    
    it('should connect to twitch irc server', async done => {
      const Bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel
      })
      try {
        await Bot.connect()
        done()
      } catch(err) {
        done(err)
      }
    })

  })


})