# node-twitchbot

### Installation
```bash
$ npm install node-twitchbot
```

### Example
```javascript
var bot = require('node-twitchbot')

bot.run({
  username: 'bot_username',
  oauth: 'oauth:twitch_oauth_key',
  channel: 'channel'
})

bot.listenFor('Hello').progress((chatter) => {
  bot.msg('Hello ' + chatter.user)
})
```

#### Chatter : user object
```javascript
{
  user: 'KRITZWARE',
  msg: 'Hello chat! PogChamp',
  sub: 0,
  type: 'mod'
}
```
