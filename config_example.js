/*
 *  EXAMPLE CONFIG FILE
 *  Copy this file and rename to config.js, then customize all options
 */

let conf = {
  prod: {
    application: {
  
    },
    auth: {
      discord_client_id: '',
      discord_client_secret: '',
      discord_redirect_uri_application: '',
      discord_redirect_uri_staffLogin: '',
      oauth_uris: {
        application: '',
        login: ''
      }
    },
    bulletin: {
      max_per_usr: 5
    },
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades:{
        mc_stats_sub_type: false
      }
    },
    discord_api: {
  
    },
    discord_bot: {
      bot_prefix: '+',
      bot_token: 'ENTER YOUR TOKEN HERE',
      guild: 'guild id goes here',
      channel: {
        new_member_announcement: '',
        new_application_announcement: '',
        new_bulletin_announcement: '',
        general: ''
      },
      roles: {
        admin: '',
        paxterya: ''
      }
    },
    email: {
      mailUser: 'test@example.org',
      mailPass: 'badPW123'
    },
    log: {
      log_level: 1
    },
    minecraft: {
      mc_stats_remote: 'rclone remote name',
      rcon_server: '',
      rcon_port: 25575,
      rcon_password: ''
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
      https_redirect: true, //enables automatic redirecting from http queries to https
      use_external_certs: true, //false to use internal certs that are not valid
      cert_path: '/etc/letsencrypt/live/{Domain}/'
    },
    workers: {
  
    },
    youtube: {
      google_api_key: 'google api key here',
      youtube_video_announcements: [
        {
          youtube_id: 'youtube channel id',
          channel_id: 'discord channel id',
          role: 'id of the role to ping'
        }
      ]
    }
  },
  staging: {
    application: {
  
    },
    auth: {
      discord_client_id: '',
      discord_client_secret: '',
      discord_redirect_uri_application: '',
      discord_redirect_uri_staffLogin: '',
      oauth_uris: {
        application: '',
        login: ''
      }
    },
    bulletin: {
      max_per_usr: 5
    },
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades:{
        mc_stats_sub_type: false
      }
    },
    discord_api: {
  
    },
    discord_bot: {
      bot_prefix: '+',
      bot_token: 'ENTER YOUR TOKEN HERE',
      guild: 'guild id goes here',
      channel: {
        new_member_announcement: '',
        new_application_announcement: '',
        new_bulletin_announcement: '',
        general: '',
      },
      roles: {
        admin: '',
        paxterya: ''
      }
    },
    email: {
      mailUser: 'test@example.org',
      mailPass: 'badPW123'
    },
    log: {
      log_level: 1
    },
    minecraft: {
      mc_stats_remote: 'rclone remote name',
      rcon_server: '',
      rcon_port: 25575,
      rcon_password: ''
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
      https_redirect: true, //enables automatic redirecting from http queries to https
      use_external_certs: true, //false to use internal certs that are not valid
      cert_path: '/etc/letsencrypt/live/{Domain}/'
    },
    workers: {
  
    },
    youtube: {
      google_api_key: 'google api key here',
      youtube_video_announcements: [
        {
          youtube_id: 'youtube channel id',
          channel_id: 'discord channel id',
          role: 'id of the role to ping'
        }
      ]
    }
  },
  testing: {
    application: {
  
    },
    auth: {
      discord_client_id: '',
      discord_client_secret: '',
      discord_redirect_uri_application: '',
      discord_redirect_uri_staffLogin: '',
      oauth_uris: {
        application: '',
        login: ''
      }
    },
    bulletin: {
      max_per_usr: 5
    },
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades:{
        mc_stats_sub_type: false
      }
    },
    discord_api: {
  
    },
    discord_bot: {
      bot_prefix: '+',
      bot_token: 'ENTER YOUR TOKEN HERE',
      guild: 'guild id goes here',
      channel: {
        new_member_announcement: '',
        new_application_announcement: '',
        new_bulletin_announcement: '',
        general: ''
      },
      roles: {
        admin: '',
        paxterya: ''
      }
    },
    email: {
      mailUser: 'test@example.org',
      mailPass: 'badPW123'
    },
    log: {
      log_level: 1
    },
    minecraft: {
      mc_stats_remote: 'rclone remote name',
      rcon_server: '',
      rcon_port: 25575,
      rcon_password: ''
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
      https_redirect: true, //enables automatic redirecting from http queries to https
      use_external_certs: true, //false to use internal certs that are not valid
      cert_path: '/etc/letsencrypt/live/{Domain}/'
    },
    workers: {
  
    },
    youtube: {
      google_api_key: 'google api key here',
      youtube_video_announcements: [
        {
          youtube_id: 'youtube channel id',
          channel_id: 'discord channel id',
          role: 'id of the role to ping'
        }
      ]
    }
  },
};

//Export the container
module.exports = function(){
  config = conf[ENVIRONMENT];
};
