# node-twitchbot [![Build Status](https://travis-ci.org/kritzware/node-twitchbot.svg?branch=master)](https://travis-ci.org/kritzware/node-twitchbot)

<b>Note: </b> This package is not to be used for Twitch botting (inflating live viewer counts) and should only be used for chatbots. Attempting to 'bot' a Twitch channel can lead to your account being permanently banned. ![](https://static-cdn.jtvnw.net/emoticons/v1/91/1.0)

### Installation
```bash
$ npm install node-twitchbot
```

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

#### Chatter : user object
```javascript
{
  user: 'KRITZWARE',
  msg: 'Hello chat! Keepo',
  channel: 'kritzware',
  user_id: '44667418'
  level: 'mod',
  sub: '0',
  turbo: '0'
}
```
#### Example of a command
```javascript
Bot.listenFor('!command', (err, chatter) => {
  Bot.msg('This is the command response')
})
```
