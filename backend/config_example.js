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
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades: {
        mc_stats_sub_type: false
      }
    },
    persistance: {
      backend: 'mongo',
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
        mod_notifications: '',
        logs: '',
        general: ''
      },
      roles: {
        admin: '',
        paxterya: '',
        mod: '',
        cool: '',
        utp: '',
        inactive: ''
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
      rcon_enabled: true,
      rcon_main_server: 'server1',
      rcon_servers: {
        server1: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        },
        server2: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        }
      },
    },
    post: {

    },
    stats: {

    },
    user: {

    },
    web: {
      http_port: 3000,
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
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades: {
        mc_stats_sub_type: false
      }
    },
    persistance: {
      backend: 'mongo',
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
        mod_notifications: '',
        logs: '',
        general: '',
      },
      roles: {
        admin: '',
        paxterya: '',
        mod: '',
        cool: '',
        utp: '',
        inactive: ''
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
      rcon_enabled: true,
      rcon_main_server: 'server1',
      rcon_servers: {
        server1: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        },
        server2: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        }
      },
    },
    post: {

    },
    stats: {

    },
    user: {

    },
    web: {
      http_port: 3000,
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
    data: {
      mongodb_url: 'mongodb://HOSTNAME/DATABASE',
      backend: 'mongo',
      db_upgrades: {
        mc_stats_sub_type: false
      }
    },
    persistance: {
      backend: 'mongo',
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
        mod_notifications: '',
        logs: '',
        general: ''
      },
      roles: {
        admin: '',
        paxterya: '',
        mod: '',
        cool: '',
        utp: '',
        inactive: ''
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
      rcon_enabled: true,
      rcon_main_server: 'server1',
      rcon_servers: {
        server1: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        },
        server2: {
          rcon_server: '',
          rcon_port: 25575,
          rcon_password: ''
        }
      },
    },
    post: {

    },
    stats: {

    },
    user: {

    },
    web: {
      http_port: 3000,
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
module.exports = function () {
  global.g.config = conf[global.g.ENVIRONMENT];
};