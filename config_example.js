/*
 *  EXAMPLE CONFIG FILE
 *  Copy this file and rename to config.js, then customize all options
 */

let conf = {
  prod: {

  },
  staging: {

  },
  testing: {
    application: {

    },
    auth: {
      discord_client_id: '',
      discord_client_secret: '',
      discord_redirect_uri_application: 'https://localhost:3001/join-us.html',
      discord_redirect_uri_staffLogin: 'https://localhost:3001/login.html',
      oauth_uris: {
        application: '',
        login: ''
      }
    },
    bulletin: {
      max_per_usr: 50
    },
    data: {
      mongodb_url: 'mongodb://localhost/testing',
      backend: 'testing',
      db_upgrades: {
        mc_stats_sub_type: false
      }
    },
    persistance: {
      backend: 'mongo'
    },
    discord_api: {

    },
    discord_bot: {
      bot_prefix: '+',
      bot_token: 'NjA3NTAyNjkzNTE0MDg0MzUy.XXkOJQ.qia1_SdABErJfXWv5xynsBz42Rk',
      guild: '592303011947216896',
      channel: {
        new_member_announcement: '607504671543656458',
        new_application_announcement: '607504671543656458',
        new_bulletin_announcement: '607504671543656458',
        general: '607504671543656458',
      },
      roles: {
        admin: '592305368831492106',
        paxterya: '640239004129820723',
        inactive: '754067705547456522'
      }
    },
    email: {
      mailUser: 'applications@paxterya.com',
      mailPass: 'redacted'
    },
    log: {
      log_level: 0
    },
    minecraft: {
      mc_stats_remote: 'txt-game02-m3',
      rcon_server: 'localhost',
      rcon_port: 23643,
      rcon_password: 'beepboop'
    },
    post: {

    },
    stats: {

    },
    user: {

    },
    web: {
      http_port: 3000,
      https_port: 3001,
      https_redirect: false, //enables automatic redirecting from http queries to https
      use_external_certs: false, //false to use internal certs that are not valid
      cert_path: '/etc/letsencrypt/live/{Domain}/'
    },
    workers: {

    },
    youtube: {
      google_api_key: 'AIzaSyAYqK26BqHMU7TFBrzkDHmb60tRoQz8LFk',
      youtube_video_announcements: [
        {
          youtube_id: 'UC3bXl38E3-KtJdXHBUKg_Dw',
          channel_id: '594844047655305226',
          role: '614135191707058187'
        },
        {
          youtube_id: 'UCH-JgwSf8J8tdjemXqihEKw',
          channel_id: '594844047655305226',
          role: '614135191707058187'
        },
        {
          youtube_id: 'UCeuVgIjBf-3fKDqiQkwcXFQ',
          channel_id: '594844047655305226',
          role: '614135191707058187'
        }
      ]
    }
  },
};

//Export the container
module.exports = function(){
  config = conf[ENVIRONMENT];
};
