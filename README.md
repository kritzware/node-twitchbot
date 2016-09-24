# node-twitchbot

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

/* String is included in message */
Bot.listen('PogChamp', (err, chatter) => {
  console.log(chatter)
})

/* Sub/resub event in chat */
Bot.resub((err, chatter, sub) => {
  console.log(sub)
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
