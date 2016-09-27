# node-twitchbot

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
