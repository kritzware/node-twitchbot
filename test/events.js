module.exports = {

    'sub': {
        badges: 'subscriber/0,premium/1',
        color: true,
        'display-name': 'Chezfez14',
        emotes: true,
        id: 'a9224894-7c4d-4868-8e50-5505f3cf410e',
        login: 'chezfez14',
        mod: '0',
        'msg-id': 'sub',
        'msg-param-months': '1',
        'msg-param-sub-plan-name': 'Channel\\sSubscription\\s(LIRIK)',
        'msg-param-sub-plan': 'Prime',
        'room-id': '23161357',
        subscriber: '1',
        'system-msg': 'Chezfez14\\sjust\\ssubscribed\\swith\\sTwitch\\sPrime!',
        'tmi-sent-ts': '1496435693948',
        turbo: '0',
        'user-id': '83703386',
        'user-type': true
    },

    'resub': {

    },

    'chatter': {
        badges: 'subscriber/6,premium/1',
        color: '#00FF6A',
        'display-name': 'AceSlash',
        emotes: true,
        id: '73358dc0-e898-4cd2-b5ae-f647893b64b3',
        mod: '0',
        'room-id': '23161357',
        'sent-ts': '1496436125243',
        subscriber: '1',
        'tmi-sent-ts': '1496436125849',
        turbo: '0',
        'user-id': '40705354',
        'user-type': true
    },

    'chatter-mod': {
        badges: 'moderator/1,subscriber/12',
        color: '#69E600',
        'display-name': 'hnlBot',
        emotes: '50741:0-9/89011:35-43',
        id: '8c88735a-2d24-4761-ada5-cc01c6691c3d',
        mod: '1',
        'room-id': '23161357',
        subscriber: '1',
        'tmi-sent-ts': '1496436178173',
        turbo: '0',
        'user-id': '78917118',
        'user-type': 'mod'
    },

    'host': {
        tags: {},
        prefix: 'tmi.twitch.tv',
        command: 'HOSTTARGET',
        params: [ '#kritzware', 'blarev 0'] 
    },

    'unhost': {
        raw: ':tmi.twitch.tv HOSTTARGET #kritzware :- 0',
		tags: {},
		prefix: 'tmi.twitch.tv',
		command: 'HOSTTARGET',
		params: [ '#kritzware', '- 0']
    }

}