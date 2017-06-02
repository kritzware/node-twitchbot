const assert = require('assert')
const expect = require('chai').expect

const Bot = require('../index')
const test_options = {
  username : process.env.username,
  oauth    : process.env.oauth,
  channel  : process.env.channel
}

/* TODO: Make all tests better */

describe('Bot', () => {

  describe('init', () => {
    it('should create a new bot instance when given valid arguments', () => {
      const TwitchBot = new Bot(test_options)
    })
    it('should fail when no options given', () => {
      expect(() => new Bot()).to.throw(Error)
    })
    it('should fail when given no username, oauth or channel arguments', () => {
      expect(() => new Bot({}).to.throw(Error))
      expect(() => new Bot({username: 'hal',}).to.throw(Error))
    })
  })

  describe('connect', () => {
    let TwitchBot
    
    afterEach(done => {
      TwitchBot.client.disconnect()
      done()
    })

    it('should connect to twitch irc', done => {
      TwitchBot = new Bot(test_options)
      TwitchBot.connect()
      .then(() => {
        assert.equal(true, TwitchBot.client.conn.connected)
        done()
      })
    })
    it('should connect to the correct twitch channel', done => {
      TwitchBot = new Bot(test_options)
      TwitchBot.connect()
      .then(() => {
        assert.equal('#'+test_options.channel, TwitchBot.client.opt.channels[0])
        done()
      })
    })
  })

  /* TODO: Make this test better */
  describe('raw', () => {
    let TwitchBot

    before(done => {
      TwitchBot = new Bot(test_options)
      TwitchBot.connect().then(() => done())
    })

    it('should return all irc events', (done) => {
      TwitchBot.raw((err, event) => {
        if(!err && event.rawCommand === 'JOIN') {
          expect(event).to.have.any.keys('prefix', 'nick', 'user', 'host', 'args')
          expect(event.args[0]).to.equal('#'+test_options.channel)
          done()
        }
      })
    })
  })

  describe('msg', () => {
    let TwitchBotSender, TwitchBotListener

    before(done => {
      TwitchBotSender = new Bot(test_options)
      TwitchBotListener = new Bot(test_options)
      Promise.all([
        TwitchBotSender.connect(),
        TwitchBotListener.connect()
      ])
      .then(() => done())
    })

    after(() => {
      TwitchBotSender.client.disconnect()
      TwitchBotListener.client.disconnect()
    })

    it('should send a message to the correct twitch irc channel', done => {
      TwitchBotListener.listen((err, chatter) => {
        if(!err) {
          expect(chatter.msg).to.equal('message test FeelsGoodMan')
          expect(chatter.user).to.equal(test_options.username)
          expect(chatter.channel).to.equal(test_options.channel)
          done()
        }
      })
      TwitchBotSender.msg('message test FeelsGoodMan')
    })
  })

  describe('listen', () => {
    let TwitchBotSender, TwitchBotListener

    before(done => {
      TwitchBotSender = new Bot(test_options)
      TwitchBotListener = new Bot(test_options)
      Promise.all([
        TwitchBotSender.connect(),
        TwitchBotListener.connect()
      ])
      .then(() => done())
    })

    after(() => {
      TwitchBotSender.client.disconnect()
      TwitchBotListener.client.disconnect()
    })

    it('should listen for all messages and return chatter objects', (done) => {
      const messages = []
      TwitchBotSender.msg('chatter test 1')
      TwitchBotSender.msg('chatter test 2')
      TwitchBotListener.listen((err, chatter) => {
        if(!err) {
          messages.push(chatter)
          if(messages.length > 1) {
            expect(messages[0]).to.have.keys('user', 'msg', 'channel', 'twitch_id', 'level', 'sub', 'turbo')
            expect(messages[0].msg).to.equal('chatter test 1')
            expect(messages[1]).to.have.keys('user', 'msg', 'channel', 'twitch_id', 'level', 'sub', 'turbo')
            expect(messages[1].msg).to.equal('chatter test 2')
            done()
          }
        }
      })
    })
  })

  describe('listenFor', () => {
    let TwitchBotSender, TwitchBotListener

    before(done => {
      TwitchBotSender = new Bot(test_options)
      TwitchBotListener = new Bot(test_options)
      Promise.all([
        TwitchBotSender.connect(),
        TwitchBotListener.connect()
      ])
      .then(() => done())
    })

    it('should listen for an exact match and return a chatter object', (done) => {
      TwitchBotSender.msg('exact match test NaM')
      TwitchBotSender.msg('exact match test KKona')
      TwitchBotListener.listenFor('exact match test KKona', (err, chatter) => {
        if(!err) {
          expect(chatter).to.not.be.null
          expect(chatter.user).to.equal(test_options.username)
          expect(chatter.msg).to.equal('exact match test KKona')
          done()
        }
      })
    })
  })

})