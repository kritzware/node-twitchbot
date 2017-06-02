# node-twitchbot [![Build Status](https://travis-ci.org/kritzware/node-twitchbot.svg?branch=master)](https://travis-ci.org/kritzware/node-twitchbot)

<b>Note: </b> This package is not to be used for Twitch botting (inflating live viewer counts) and should only be used for chatbots. Attempting to 'bot' a Twitch channel can lead to your account being permanently banned. ![](https://static-cdn.jtvnw.net/emoticons/v1/91/1.0)

# Install
```bash
$ npm install node-twitchbot
```

# Docs
## Basic example
```javascript
const TwitchBot = require('node-twitchbot')

const Bot = new TwitchBot({
  username: 'your_twitch_bot',
  oauth: 'oauth:your-oauth-key',
  channel: 'your_channel'
})

Bot.connect()
.then(() => {
  
  Bot.on('message', chatter => {
    if(chatter.msg === '!command') {
      Bot.msg('Command executed PogChamp')
    }
  })

  Bot.on('error', err => {
    console.log('twitch irc error', err)
  })
})
.catch(err => console.log(err))
```

## `TwitchBot()` options
| parameter | type | description | required |
| - | - | - | - |
| `username` | `String` | Bot username | YES |
| `oauth` | `String` | Twitch chat oauth token | YES |
| `channel` | `String` | Channel, `#` can be included e.g. `#channel` or `channel` | YES |
| `port` | `int` | Twitch IRC port, usually `443` or `6777`. Defaults to `443`| NO |
| `silence` | `boolean` | Prevent bot from sending messages in chat. Outbound messages logged in console - useful for development. Defaults to `false` | NO |
| `limit` | `int` | Limit number of raw messages sent to IRC. Defaults to `19`. Use `30` for moderators. | NO |
| `period` | `int` | Message rate limit period (milliseconds). Defaults to `30000` | NO |

## Methods

### `connect()`
The `connect` method creates a connection to `"irc.chat.twitch.tv"` and resolves once the connection is established.
#### Usage
```javascript
Bot.connect()
.then(() => {
  // ...
})
.catch(err => console.log(err))
```

#### Usage with async/await
```javascript
async function start() {
  await Bot.connect()
  // ...
}

try {
  start()
} catch(err) {
  console.log(err)
}
```

### `msg(text, callback)`
Sends a chat message to the connected Twitch channel. If `silence` was set to `true` the message will be printed in the console and not sent to IRC. A callback is provided if you wish to validate if the message was correctly sent.
#### Usage
```javascript
Bot.msg('This is a message from the bot! PogChamp')
Bot.msg('Kappa 123')

Bot.msg('Did this message send? :thinking:', err => {
  if(err) console.log(err)
})
```

OLD DOCS (REMOVED BEFORE PUBLISHING)
```javascript
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