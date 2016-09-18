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

/* Message is string */
Bot.listenFor('Kappa', (chatter) => {
	console.log(chatter)
}).catch((err) => {
	console.log(err)
})

/* Message includes string */
Bot.listen('PogChamp', (chatter) => {
	console.log(chatter)
})
```

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
