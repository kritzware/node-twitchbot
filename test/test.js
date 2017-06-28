const assert = require('assert')
const expect = require('chai').expect

const TwitchBot = require('../index')

const conf = {
  username: process.env.BOT_USERNAME,
  oauth: process.env.BOT_OAUTH,
  channel: process.env.BOT_CHANNEL
}

function createBotInstance() {
  return new TwitchBot({
    username: conf.username,
    oauth: conf.oauth,
    channel: conf.channel
  })
}

describe('bot', () => {

  describe('constructor', () => {
    let Bot = null
    
    before(() => {
      Bot = createBotInstance()
    })

    it('should create a new bot instance with default arguments', () => {
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
    let Bot = null

    before(done => {
      Bot = createBotInstance()
      Bot.connect().then(() => done())
    })

    it('should connect to twitch irc server', done => {
      const Bot = new TwitchBot({
        username: conf.username,
        oauth: conf.oauth,
        channel: conf.channel
      })
      Bot.connect()
      .then(() => {
        Bot.on('join', connected => {
          if(connected.joined) {
            done()
          }
        })
      })
    })

    after(done => {
      Bot.close()
      done()
    })
  })

  describe('write', () => {
    let Bot = null
    let Listener = null

    beforeEach(done => {
      Bot = createBotInstance()
      Listener = createBotInstance()
      Promise.all([
        Bot.connect(),
        Listener.connect()
      ])
      .then(() => done())
    })

    it('should send raw commands to irc', done => {
      Listener.on('message', chatter => {
        if(chatter['display-name'] === conf.username) {
          done()
        }
      })
      Bot.write('PRIVMSG ' + Bot.channel + ' : raw message test KKona')
    })

    it('should send raw commands to irc (callback)', done => {
      Bot.write('PRIVMSG ' + Bot.channel + ' : raw message test (cb) KKona', (sent, err) => {
        expect(sent).to.equal(true)
        done()
      })
    })

    afterEach(done => {
      Bot.close()
      Listener.close()
      done()
    })
  })

})