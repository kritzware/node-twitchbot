# node-twitchbot [![Build Status](https://travis-ci.org/kritzware/node-twitchbot.svg?branch=master)](https://travis-ci.org/kritzware/node-twitchbot)

<b>Note: </b> This package is not to be used for Twitch botting (inflating live viewer counts) and should only be used for chatbots. Attempting to 'bot' a Twitch channel can lead to your account being permanently banned. ![](https://static-cdn.jtvnw.net/emoticons/v1/91/1.0)

### Installation
Version 2.0.0^ (<b>Recommended</b>): 
```bash
$ npm install node-twitchbot
```
Version 1 (Deprecated):
```bash
$ npm install node-twitchbot@1.2.2
```

## V2 DOCS
### Example
```javascript
const TwitchBot = require('node-twitchbot')

const Bot = new TwitchBot({
  username : 'GLADOS',
  oauth    : 'oauth:secret-oauth-pass',
  channel  : 'Aperture'
})

/* Connect bot to Twitch IRC */
Bot.connect()
.then(() => {

  /* Listen for all messages in channel */
  Bot.listen((err, chatter) => {
    if(err) {
      console.log(err)
    } else {
      console.log(chatter.msg) // 'Hello World!'
    }
  })

  /* Listen for an exact messages match */
  Bot.listenFor('KKona', (err, chatter) => {
    console.log(chatter)
  })

  /* Send a message in the channel */
  Bot.msg('this is the message text PogChamp')

  /* Listen for raw IRC events */
  Bot.raw((err, event) => {
    console.log(event)
  })
})
.catch(err => {
  console.log('Connection error!')
  console.log(err)
})
```

### Chatter Object
Most callbacks return a `chatter` object which contains the following attributes:
```javascript
{
  user: 'kritzware',
  msg: 'Hello world! Kappa',
  channel: 'kritzware',
  twitch_id: '44667418',
  level: 'mod',
  sub: 0,
  turbo: 0
}
```

## V1 DOCS
### Example
```javascript
const Bot = require('node-twitchbot')

Bot.run({
username: 'bot_username',
  oauth: 'oauth:twitch_oauth_key',
  channel: 'channel'
})

/* Exact message match */
Bot.listenFor('Kappa', (err, chatter) => {
  if(err) {
    console.log(err)
  } else {
    console.log(chatter)
  }
})

/* Return all user message in channel */
Bot.listenFor('*', (err, chatter) {
  // Returns all viewer messages in channel
})

/* String is included in message */
Bot.listen('PogChamp', (err, chatter) => {
  console.log(chatter)
})

/* Sub/resub event in chat */
Bot.resub((err, chatter, sub) => {
  console.log(sub)
})

/* Say messages in chat */
Bot.msg('Hello chat!')

/* Private message user */
Bot.whisper('kritzware', 'This is a private message Kappa')

/* Setting commands instead of checking via string match */
const commands = {
  help : 'For help using this bot, contact kritzware',
  twitter : 'Follow this channel at https://twitter.com/test123',
  /* You can also use functions to generate a command response */
  random : (chatter) => {
    return Math.floor((Math.random() * -1) + 1)
  },
  /* Command functions can make use of the chatter object of the user who executed the command */
  goodnight : (chatter) => {
    return 'Goodnight ' + chatter.user + '! FeelsGoodMan'
  }
}

Bot.commands('!', commands, (err, chatter, command) => {
  if(err) {
    console.log(err)
  } else {
    console.log(command)
    console.log(chatter)
  }
})
```

#### Output for example '!goodnight' command above
![](http://i.imgur.com/buPqiaK.gif)

#### Example of a command
```javascript
Bot.listenFor('!command', (err, chatter) => {
  Bot.msg('This is the command response')
})
```
