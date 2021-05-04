//Only use this file to declare types when you cant avoid it

interface IFactoryOptions {
  persistanceProvider?: string,
  schema: any,
  name: string
}

interface IDiscordApiUserObject {
  id: string,
  username: string,
  discriminator: string,  
}

interface IRequestData {
  path: string,
  queryStringObject: any,
  method: string,
  headers: any,
  payload: any,
  cookies: any
}

interface IHandlerResponse {
  status?: number,
  payload?: any,
  contentType?: "json" | "plain"
}


const enum EApplicationStatus {
  pending = 1,
  denied = 2,
  accepted = 3
}

const enum EMemberStatus {
  default,
  active,
  inactive
}

const
  enum EEnvironment {
  prod = "prod",
  staging = "staging",
  testing = "testing"
}

interface IConfig {
  auth:        IConfigAuth;
  data:        IConfigData;
  discord_bot: IConfigDiscordBot;
  email:       IConfigEmail;
  minecraft:   IConfigMinecraft;
  web:         IConfigWeb;
  youtube:     IConfigYoutube;
}

interface IConfigAuth {
  discord_client_id:                   string;
  discord_client_secret:               string;
  discord_redirect_uri_application:    string;
  discord_redirect_uri_staffLogin:     string;
  discord_redirect_uri_applicationNew: string;
  discord_redirect_uri_interface:      string;
  oauth_uris:                          IConfigOauthUris;
}

interface IConfigOauthUris {
  application: string;
  login:       string;
}

interface IConfigData {
  mongodb_url: string;
  backend:     string;
  db_upgrades: IConfigDBUpgrades;
}

interface IConfigDBUpgrades {
  mc_stats_sub_type: boolean;
  build_images_fill: boolean;
  [index: string]: boolean;
}

interface IConfigDiscordBot {
  bot_prefix: string;
  bot_token:  string;
  guild:      string;
  channel:    IConfigDiscordChannels;
  roles:      IConfigDiscordRoles;
}

interface IConfigDiscordChannels {
  new_member_announcement:      string;
  new_application_announcement: string;
  new_bulletin_announcement:    string;
  mod_notifications:            string;
  logs:                         string;
  general:                      string;
}

interface IConfigDiscordRoles {
  owner:    string;
  admin:    string;
  paxterya: string;
  inactive: string;
  mayor:    string,
  cool:     string;
  mod:      string;
}

interface IConfigEmail {
  mailUser: string;
  mailPass: string;
}

interface IConfigMinecraft {
  mc_stats_remote:  string;
  rcon_main_server: string;
  rcon_enabled:     boolean;
  rcon_servers:     IConfigRconServers;
}

interface IConfigRconServers {
  main_smp:        IConfigRconServer;
  creative_server: IConfigRconServer;
  [index: string]: IConfigRconServer;
}

interface IConfigRconServer {
  rcon_server:   string;
  rcon_port:     number;
  rcon_password: string;
}

interface IConfigWeb {
  http_port:          number;
  https_port:         number;
  https_redirect:     boolean;
  use_external_certs: boolean;
  cert_path:          string;
}

interface IConfigYoutube {
  google_api_key:              string;
  youtube_video_announcements: IConfigYoutubeVideoAnnouncement[];
}

interface IConfigYoutubeVideoAnnouncement {
  youtube_id: string;
  channel_id: string;
  role:       string;
}
