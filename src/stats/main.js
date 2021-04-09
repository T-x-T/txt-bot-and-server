/*
 *  GENERAL STATS RETRIEVER
 *  This is used to get various predefined statistic templates for mc and member stats
 */

//Dependencies
const mc = require('./minecraft.js');
const MemberFactory = require('../user/memberFactory.js');
let memberFactory = new MemberFactory();
memberFactory.connect();

//Create the container
var stats = {};

//Container for all templates
stats.template = {};

//Gets the basic stats for the statistics.html overview
stats.template.overview = function(options, callback) {
  memberFactory.getAllWhitelisted()
  .then(members => {
    if(!members || members.length === 0){
      callback('Didnt receive members');
      return;
    }
    global.log(0, "stats", "stats.template.overview received members", {memberCount: members.length});

    stats.template.mc({collection: 'overview'}, function (err, overview) {
      if(!err && overview) {
        let averageAge = 0;
        members.forEach(member => averageAge += member.getAge());
        averageAge = Math.round(averageAge / members.length);
        
        members = members.sort((a, b) => a.getAge() - b.getAge());
        let medianAge = members[Number.parseInt(members.length / 2)].getAge();
        
        //Constuct and callback the final object
        callback(false, {
          'total_members': members.length,
          'average_age': averageAge,
          'median_age': medianAge,
          'total_playtime': overview.playtime,
          'silly': Math.round(overview.cobblestone_mined_per_death_by_zombie)
        });
      } else {
        callback('Couldnt get mc stats: ' + err, false);
      }
    });
  })
  .catch(e => {
    callback('Got error trying to get all whitelisted players: ' + e, false);
  });
};

//Gets the basic overview of one or multiple members
//This includes: discord_id, mc_uuid, discord_nick, mc_nick, age, country, playtime, mc_render_url, discord_avatar_url
stats.template.memberOverview = function(options, callback) {
  let discord_id = options.hasOwnProperty('discord_id') ? options.discord_id : false;
  if(discord_id) {

    //Get stats only for one member
    memberFactory.getByDiscordId(discord_id)
    .then(member => {
      stats.template.mc({uuid: member.getMcUuid(), collection: 'playtime'}, function (err, playtime) {
        if(err || !playtime) playtime = 0;
        //Build the object to send back
        let obj = {
          discord_nick: member.getDiscordUserName(),
          mc_nick: member.getMcIgn(),
          age: member.getAgeConsiderPrivacy(),
          country: member.getCountryConsiderPrivacy(),
          playtime: playtime,
          mc_render_url: member.getMcSkinUrl(),
          joined_date: member.getJoinedDate()
        };
        callback(false, obj);
      });
    })
    .catch(e => {
      callback('Got error while trying to get member: ' + e, false);
    });
  } else {
    //Get stats for all players
    memberFactory.getAllWhitelisted()
    .then(members => {
      let error = false;
      let output = [];
      for(let i = 0; i < members.length; i++) {
        stats.template.memberOverview({discord_id: members[i].getDiscordId()}, function (err, doc) {
          output.push(doc);
          if(err) error = true;
          //Check if this is the last callback
          if(output.length == members.length) {
            if(!error) callback(false, output);
            else callback('There was some error, idk I cant read my own code, no idea what it is', false);
          }
        });
      }
    })
    .catch(e => {
      callback('got error while trying to get all members: ' + e, false);
    });
  }
};

//callsback a list of all countries with their respective member count and coloring for the map-view in statistics.html
stats.template.countryList = function(options, callback) {
  memberFactory.getAllWhitelisted()
  .then(async members => {
    //Get the country list
    let countries = _internal.getCountries();

    //Add the data of each member to countries
    await Promise.allSettled(members.map(async (member) => {
      //Get the ISO representation of the country
      let iso = _internal.getCountryIsoByName(countries, member.getCountry());
      if(iso) {
        countries[iso].numberOfThings++;
        countries[iso].count++;
        try{
          countries[iso].playtime.push(await stats.templatePromise.mc({uuid: member.getMcUuid(), collection: 'playtime'}));
        }catch(_){}
      } else {
        global.log(2, 'stats', 'stats.countryList doesnt contain a country', {country: member.getCountry()})
      }
    }));

    //Combine the playtime arrays
    for(let country in countries){
      countries[country].playtime = countries[country].playtime.reduce((a, b) => a + b, 0);
    }

    callback(false, countries);
  })
  .catch(e => {
    callback('got error trying to get countryList data: ' + e, false);
  });
};

//This is template for all kinds of different minecraft stats collections
//Options:
//collections: See mc_collections.js
//uuid: uuid if stats of a single player are wanted; if false or not set this returns stats for all players
//rank: include rank; only gets evaluated if uuid is given
stats.template.mc = function(options, callback){
  if(options.uuid){
    if(options.rank){
      mc.getRanked(options, callback);
    }else{
      mc.getSingle(options, callback);
    }
  }else{
    mc.getAll(options, callback);
  }
};

stats.templatePromise = {};

stats.templatePromise.mc = function(options){
  return new Promise((resolve, reject) => {
    stats.template.mc(options, (err, res) => {
      if(err){
        reject(err);
      }else{
        resolve(res);
      }
    });
  });
}

//Internal stuff
var _internal = {};

//Finds an objects key by its value
_internal.getCountryIsoByName = function(object, value) {
  let iso = false;
  for(let key in object) if(object[key].name === value) iso = object[key].ISO;
  return iso;
};

//Returns an object containing all countries as keys, with an empty object as a value
_internal.getCountries = function() {
  return {
    'ABW': {ISO: 'ABW', name: `Aruba`, numberOfThings: 0, count: 0, playtime: []},
    'AFG': {ISO: 'AFG', name: `Afghanistan`, numberOfThings: 0, count: 0, playtime: []},
    'AGO': {ISO: 'AGO', name: `Angola`, numberOfThings: 0, count: 0, playtime: []},
    'AIA': {ISO: 'AIA', name: `Anguilla`, numberOfThings: 0, count: 0, playtime: []},
    'ALA': {ISO: 'ALA', name: `Åland Islands`, numberOfThings: 0, count: 0, playtime: []},
    'ALB': {ISO: 'ALB', name: `Albania`, numberOfThings: 0, count: 0, playtime: []},
    'AND': {ISO: 'AND', name: `Andorra`, numberOfThings: 0, count: 0, playtime: []},
    'ARE': {ISO: 'ARE', name: `United Arab Emirates`, numberOfThings: 0, count: 0, playtime: []},
    'ARG': {ISO: 'ARG', name: `Argentina`, numberOfThings: 0, count: 0, playtime: []},
    'ARM': {ISO: 'ARM', name: `Armenia`, numberOfThings: 0, count: 0, playtime: []},
    'ASM': {ISO: 'ASM', name: `American Samoa`, numberOfThings: 0, count: 0, playtime: []},
    'ATA': {ISO: 'ATA', name: `Antarctica`, numberOfThings: 0, count: 0, playtime: []},
    'ATF': {ISO: 'ATF', name: `French Southern Territories`, numberOfThings: 0, count: 0, playtime: []},
    'ATG': {ISO: 'ATG', name: `Antigua and Barbuda`, numberOfThings: 0, count: 0, playtime: []},
    'AUS': {ISO: 'AUS', name: `Australia`, numberOfThings: 0, count: 0, playtime: []},
    'AUT': {ISO: 'AUT', name: `Austria`, numberOfThings: 0, count: 0, playtime: []},
    'AZE': {ISO: 'AZE', name: `Azerbaijan`, numberOfThings: 0, count: 0, playtime: []},
    'BDI': {ISO: 'BDI', name: `Burundi`, numberOfThings: 0, count: 0, playtime: []},
    'BEL': {ISO: 'BEL', name: `Belgium`, numberOfThings: 0, count: 0, playtime: []},
    'BEN': {ISO: 'BEN', name: `Benin`, numberOfThings: 0, count: 0, playtime: []},
    'BES': {ISO: 'BES', name: `Bonaire, Sint Eustatius and Saba`, numberOfThings: 0, count: 0, playtime: []},
    'BFA': {ISO: 'BFA', name: `Burkina Faso`, numberOfThings: 0, count: 0, playtime: []},
    'BGD': {ISO: 'BGD', name: `Bangladesh`, numberOfThings: 0, count: 0, playtime: []},
    'BGR': {ISO: 'BGR', name: `Bulgaria`, numberOfThings: 0, count: 0, playtime: []},
    'BHR': {ISO: 'BHR', name: `Bahrain`, numberOfThings: 0, count: 0, playtime: []},
    'BHS': {ISO: 'BHS', name: `Bahamas`, numberOfThings: 0, count: 0, playtime: []},
    'BIH': {ISO: 'BIH', name: `Bosnia and Herzegovina`, numberOfThings: 0, count: 0, playtime: []},
    'BLM': {ISO: 'BLM', name: `Saint Barthélemy`, numberOfThings: 0, count: 0, playtime: []},
    'BLR': {ISO: 'BLR', name: `Belarus`, numberOfThings: 0, count: 0, playtime: []},
    'BLZ': {ISO: 'BLZ', name: `Belize`, numberOfThings: 0, count: 0, playtime: []},
    'BMU': {ISO: 'BMU', name: `Bermuda`, numberOfThings: 0, count: 0, playtime: []},
    'BOL': {ISO: 'BOL', name: `Bolivia, Plurinational State of`, numberOfThings: 0, count: 0, playtime: []},
    'BRA': {ISO: 'BRA', name: `Brazil`, numberOfThings: 0, count: 0, playtime: []},
    'BRB': {ISO: 'BRB', name: `Barbados`, numberOfThings: 0, count: 0, playtime: []},
    'BRN': {ISO: 'BRN', name: `Brunei Darussalam`, numberOfThings: 0, count: 0, playtime: []},
    'BTN': {ISO: 'BTN', name: `Bhutan`, numberOfThings: 0, count: 0, playtime: []},
    'BVT': {ISO: 'BVT', name: `Bouvet Island`, numberOfThings: 0, count: 0, playtime: []},
    'BWA': {ISO: 'BWA', name: `Botswana`, numberOfThings: 0, count: 0, playtime: []},
    'CAF': {ISO: 'CAF', name: `Central African Republic`, numberOfThings: 0, count: 0, playtime: []},
    'CAN': {ISO: 'CAN', name: `Canada`, numberOfThings: 0, count: 0, playtime: []},
    'CCK': {ISO: 'CCK', name: `Cocos (Keeling) Islands`, numberOfThings: 0, count: 0, playtime: []},
    'CHE': {ISO: 'CHE', name: `Switzerland`, numberOfThings: 0, count: 0, playtime: []},
    'CHL': {ISO: 'CHL', name: `Chile`, numberOfThings: 0, count: 0, playtime: []},
    'CHN': {ISO: 'CHN', name: `China`, numberOfThings: 0, count: 0, playtime: []},
    'CIV': {ISO: 'CIV', name: `Côted'Ivoire`, numberOfThings: 0, count: 0, playtime: []},
    'CMR': {ISO: 'CMR', name: `Cameroon`, numberOfThings: 0, count: 0, playtime: []},
    'COD': {ISO: 'COD', name: `Congo, the Democratic Republic of the`, numberOfThings: 0, count: 0, playtime: []},
    'COG': {ISO: 'COG', name: `Congo`, numberOfThings: 0, count: 0, playtime: []},
    'COK': {ISO: 'COK', name: `Cook Islands`, numberOfThings: 0, count: 0, playtime: []},
    'COL': {ISO: 'COL', name: `Colombia`, numberOfThings: 0, count: 0, playtime: []},
    'COM': {ISO: 'COM', name: `Comoros`, numberOfThings: 0, count: 0, playtime: []},
    'CPV': {ISO: 'CPV', name: `Cabo Verde`, numberOfThings: 0, count: 0, playtime: []},
    'CRI': {ISO: 'CRI', name: `Costa Rica`, numberOfThings: 0, count: 0, playtime: []},
    'CUB': {ISO: 'CUB', name: `Cuba`, numberOfThings: 0, count: 0, playtime: []},
    'CUW': {ISO: 'CUW', name: `Curaçao`, numberOfThings: 0, count: 0, playtime: []},
    'CXR': {ISO: 'CXR', name: `Christmas Island`, numberOfThings: 0, count: 0, playtime: []},
    'CYM': {ISO: 'CYM', name: `Cayman Islands`, numberOfThings: 0, count: 0, playtime: []},
    'CYP': {ISO: 'CYP', name: `Cyprus`, numberOfThings: 0, count: 0, playtime: []},
    'CZE': {ISO: 'CZE', name: `Czech Republic`, numberOfThings: 0, count: 0, playtime: []},
    'DEU': {ISO: 'DEU', name: `Germany`, numberOfThings: 0, count: 0, playtime: []},
    'DJI': {ISO: 'DJI', name: `Djibouti`, numberOfThings: 0, count: 0, playtime: []},
    'DMA': {ISO: 'DMA', name: `Dominica`, numberOfThings: 0, count: 0, playtime: []},
    'DNK': {ISO: 'DNK', name: `Denmark`, numberOfThings: 0, count: 0, playtime: []},
    'DOM': {ISO: 'DOM', name: `Dominican Republic`, numberOfThings: 0, count: 0, playtime: []},
    'DZA': {ISO: 'DZA', name: `Algeria`, numberOfThings: 0, count: 0, playtime: []},
    'ECU': {ISO: 'ECU', name: `Ecuador`, numberOfThings: 0, count: 0, playtime: []},
    'EGY': {ISO: 'EGY', name: `Egypt`, numberOfThings: 0, count: 0, playtime: []},
    'ERI': {ISO: 'ERI', name: `Eritrea`, numberOfThings: 0, count: 0, playtime: []},
    'ESH': {ISO: 'ESH', name: `Western Sahara`, numberOfThings: 0, count: 0, playtime: []},
    'ESP': {ISO: 'ESP', name: `Spain`, numberOfThings: 0, count: 0, playtime: []},
    'EST': {ISO: 'EST', name: `Estonia`, numberOfThings: 0, count: 0, playtime: []},
    'ETH': {ISO: 'ETH', name: `Ethiopia`, numberOfThings: 0, count: 0, playtime: []},
    'FIN': {ISO: 'FIN', name: `Finland`, numberOfThings: 0, count: 0, playtime: []},
    'FJI': {ISO: 'FJI', name: `Fiji`, numberOfThings: 0, count: 0, playtime: []},
    'FLK': {ISO: 'FLK', name: `Falkland Islands (Malvinas)`, numberOfThings: 0, count: 0, playtime: []},
    'FRA': {ISO: 'FRA', name: `France`, numberOfThings: 0, count: 0, playtime: []},
    'FRO': {ISO: 'FRO', name: `Faroe Islands`, numberOfThings: 0, count: 0, playtime: []},
    'FSM': {ISO: 'FSM', name: `Micronesia, Federated States of`, numberOfThings: 0, count: 0, playtime: []},
    'GAB': {ISO: 'GAB', name: `Gabon`, numberOfThings: 0, count: 0, playtime: []},
    'GBR': {ISO: 'GBR', name: `United Kingdom`, numberOfThings: 0, count: 0, playtime: []},
    'GEO': {ISO: 'GEO', name: `Georgia`, numberOfThings: 0, count: 0, playtime: []},
    'GGY': {ISO: 'GGY', name: `Guernsey`, numberOfThings: 0, count: 0, playtime: []},
    'GHA': {ISO: 'GHA', name: `Ghana`, numberOfThings: 0, count: 0, playtime: []},
    'GIB': {ISO: 'GIB', name: `Gibraltar`, numberOfThings: 0, count: 0, playtime: []},
    'GIN': {ISO: 'GIN', name: `Guinea`, numberOfThings: 0, count: 0, playtime: []},
    'GLP': {ISO: 'GLP', name: `Guadeloupe`, numberOfThings: 0, count: 0, playtime: []},
    'GMB': {ISO: 'GMB', name: `Gambia`, numberOfThings: 0, count: 0, playtime: []},
    'GNB': {ISO: 'GNB', name: `Guinea-Bissau`, numberOfThings: 0, count: 0, playtime: []},
    'GNQ': {ISO: 'GNQ', name: `Equatorial Guinea`, numberOfThings: 0, count: 0, playtime: []},
    'GRC': {ISO: 'GRC', name: `Greece`, numberOfThings: 0, count: 0, playtime: []},
    'GRD': {ISO: 'GRD', name: `Grenada`, numberOfThings: 0, count: 0, playtime: []},
    'GRL': {ISO: 'GRL', name: `Greenland`, numberOfThings: 0, count: 0, playtime: []},
    'GTM': {ISO: 'GTM', name: `Guatemala`, numberOfThings: 0, count: 0, playtime: []},
    'GUF': {ISO: 'GUF', name: `French Guiana`, numberOfThings: 0, count: 0, playtime: []},
    'GUM': {ISO: 'GUM', name: `Guam`, numberOfThings: 0, count: 0, playtime: []},
    'GUY': {ISO: 'GUY', name: `Guyana`, numberOfThings: 0, count: 0, playtime: []},
    'HKG': {ISO: 'HKG', name: `Hong Kong`, numberOfThings: 0, count: 0, playtime: []},
    'HMD': {ISO: 'HMD', name: `Heard Island and McDonald Islands`, numberOfThings: 0, count: 0, playtime: []},
    'HND': {ISO: 'HND', name: `Honduras`, numberOfThings: 0, count: 0, playtime: []},
    'HRV': {ISO: 'HRV', name: `Croatia`, numberOfThings: 0, count: 0, playtime: []},
    'HTI': {ISO: 'HTI', name: `Haiti`, numberOfThings: 0, count: 0, playtime: []},
    'HUN': {ISO: 'HUN', name: `Hungary`, numberOfThings: 0, count: 0, playtime: []},
    'IDN': {ISO: 'IDN', name: `Indonesia`, numberOfThings: 0, count: 0, playtime: []},
    'IMN': {ISO: 'IMN', name: `Isle of Man`, numberOfThings: 0, count: 0, playtime: []},
    'IND': {ISO: 'IND', name: `India`, numberOfThings: 0, count: 0, playtime: []},
    'IOT': {ISO: 'IOT', name: `British Indian Ocean Territory`, numberOfThings: 0, count: 0, playtime: []},
    'IRL': {ISO: 'IRL', name: `Ireland`, numberOfThings: 0, count: 0, playtime: []},
    'IRN': {ISO: 'IRN', name: `Iran, Islamic Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'IRQ': {ISO: 'IRQ', name: `Iraq`, numberOfThings: 0, count: 0, playtime: []},
    'ISL': {ISO: 'ISL', name: `Iceland`, numberOfThings: 0, count: 0, playtime: []},
    'ISR': {ISO: 'ISR', name: `Israel`, numberOfThings: 0, count: 0, playtime: []},
    'ITA': {ISO: 'ITA', name: `Italy`, numberOfThings: 0, count: 0, playtime: []},
    'JAM': {ISO: 'JAM', name: `Jamaica`, numberOfThings: 0, count: 0, playtime: []},
    'JEY': {ISO: 'JEY', name: `Jersey`, numberOfThings: 0, count: 0, playtime: []},
    'JOR': {ISO: 'JOR', name: `Jordan`, numberOfThings: 0, count: 0, playtime: []},
    'JPN': {ISO: 'JPN', name: `Japan`, numberOfThings: 0, count: 0, playtime: []},
    'KAZ': {ISO: 'KAZ', name: `Kazakhstan`, numberOfThings: 0, count: 0, playtime: []},
    'KEN': {ISO: 'KEN', name: `Kenya`, numberOfThings: 0, count: 0, playtime: []},
    'KGZ': {ISO: 'KGZ', name: `Kyrgyzstan`, numberOfThings: 0, count: 0, playtime: []},
    'KHM': {ISO: 'KHM', name: `Cambodia`, numberOfThings: 0, count: 0, playtime: []},
    'KIR': {ISO: 'KIR', name: `Kiribati`, numberOfThings: 0, count: 0, playtime: []},
    'KNA': {ISO: 'KNA', name: `Saint Kitts and Nevis`, numberOfThings: 0, count: 0, playtime: []},
    'KOR': {ISO: 'KOR', name: `Korea, Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'KWT': {ISO: 'KWT', name: `Kuwait`, numberOfThings: 0, count: 0, playtime: []},
    'LAO': {ISO: 'LAO', name: `Lao People's Democratic Republic`, numberOfThings: 0, count: 0, playtime: []},
    'LBN': {ISO: 'LBN', name: `Lebanon`, numberOfThings: 0, count: 0, playtime: []},
    'LBR': {ISO: 'LBR', name: `Liberia`, numberOfThings: 0, count: 0, playtime: []},
    'LBY': {ISO: 'LBY', name: `Libya`, numberOfThings: 0, count: 0, playtime: []},
    'LCA': {ISO: 'LCA', name: `Saint Lucia`, numberOfThings: 0, count: 0, playtime: []},
    'LIE': {ISO: 'LIE', name: `Liechtenstein`, numberOfThings: 0, count: 0, playtime: []},
    'LKA': {ISO: 'LKA', name: `Sri Lanka`, numberOfThings: 0, count: 0, playtime: []},
    'LSO': {ISO: 'LSO', name: `Lesotho`, numberOfThings: 0, count: 0, playtime: []},
    'LTU': {ISO: 'LTU', name: `Lithuania`, numberOfThings: 0, count: 0, playtime: []},
    'LUX': {ISO: 'LUX', name: `Luxembourg`, numberOfThings: 0, count: 0, playtime: []},
    'LVA': {ISO: 'LVA', name: `Latvia`, numberOfThings: 0, count: 0, playtime: []},
    'MAC': {ISO: 'MAC', name: `Macao`, numberOfThings: 0, count: 0, playtime: []},
    'MAF': {ISO: 'MAF', name: `Saint Martin (Frenchpart)`, numberOfThings: 0, count: 0, playtime: []},
    'MAR': {ISO: 'MAR', name: `Morocco`, numberOfThings: 0, count: 0, playtime: []},
    'MCO': {ISO: 'MCO', name: `Monaco`, numberOfThings: 0, count: 0, playtime: []},
    'MDA': {ISO: 'MDA', name: `Moldova, Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'MDG': {ISO: 'MDG', name: `Madagascar`, numberOfThings: 0, count: 0, playtime: []},
    'MDV': {ISO: 'MDV', name: `Maldives`, numberOfThings: 0, count: 0, playtime: []},
    'MEX': {ISO: 'MEX', name: `Mexico`, numberOfThings: 0, count: 0, playtime: []},
    'MHL': {ISO: 'MHL', name: `Marshall Islands`, numberOfThings: 0, count: 0, playtime: []},
    'MKD': {ISO: 'MKD', name: `Macedonia, the former Yugoslav Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'MLI': {ISO: 'MLI', name: `Mali`, numberOfThings: 0, count: 0, playtime: []},
    'MLT': {ISO: 'MLT', name: `Malta`, numberOfThings: 0, count: 0, playtime: []},
    'MMR': {ISO: 'MMR', name: `Myanmar`, numberOfThings: 0, count: 0, playtime: []},
    'MNE': {ISO: 'MNE', name: `Montenegro`, numberOfThings: 0, count: 0, playtime: []},
    'MNG': {ISO: 'MNG', name: `Mongolia`, numberOfThings: 0, count: 0, playtime: []},
    'MNP': {ISO: 'MNP', name: `Northern Mariana Islands`, numberOfThings: 0, count: 0, playtime: []},
    'MOZ': {ISO: 'MOZ', name: `Mozambique`, numberOfThings: 0, count: 0, playtime: []},
    'MRT': {ISO: 'MRT', name: `Mauritania`, numberOfThings: 0, count: 0, playtime: []},
    'MSR': {ISO: 'MSR', name: `Montserrat`, numberOfThings: 0, count: 0, playtime: []},
    'MTQ': {ISO: 'MTQ', name: `Martinique`, numberOfThings: 0, count: 0, playtime: []},
    'MUS': {ISO: 'MUS', name: `Mauritius`, numberOfThings: 0, count: 0, playtime: []},
    'MWI': {ISO: 'MWI', name: `Malawi`, numberOfThings: 0, count: 0, playtime: []},
    'MYS': {ISO: 'MYS', name: `Malaysia`, numberOfThings: 0, count: 0, playtime: []},
    'MYT': {ISO: 'MYT', name: `Mayotte`, numberOfThings: 0, count: 0, playtime: []},
    'NAM': {ISO: 'NAM', name: `Namibia`, numberOfThings: 0, count: 0, playtime: []},
    'NCL': {ISO: 'NCL', name: `New Caledonia`, numberOfThings: 0, count: 0, playtime: []},
    'NER': {ISO: 'NER', name: `Niger`, numberOfThings: 0, count: 0, playtime: []},
    'NFK': {ISO: 'NFK', name: `Norfolk Island`, numberOfThings: 0, count: 0, playtime: []},
    'NGA': {ISO: 'NGA', name: `Nigeria`, numberOfThings: 0, count: 0, playtime: []},
    'NIC': {ISO: 'NIC', name: `Nicaragua`, numberOfThings: 0, count: 0, playtime: []},
    'NIU': {ISO: 'NIU', name: `Niue`, numberOfThings: 0, count: 0, playtime: []},
    'NLD': {ISO: 'NLD', name: `Netherlands`, numberOfThings: 0, count: 0, playtime: []},
    'NOR': {ISO: 'NOR', name: `Norway`, numberOfThings: 0, count: 0, playtime: []},
    'NPL': {ISO: 'NPL', name: `Nepal`, numberOfThings: 0, count: 0, playtime: []},
    'NRU': {ISO: 'NRU', name: `Nauru`, numberOfThings: 0, count: 0, playtime: []},
    'NZL': {ISO: 'NZL', name: `New Zealand`, numberOfThings: 0, count: 0, playtime: []},
    'OMN': {ISO: 'OMN', name: `Oman`, numberOfThings: 0, count: 0, playtime: []},
    'PAK': {ISO: 'PAK', name: `Pakistan`, numberOfThings: 0, count: 0, playtime: []},
    'PAN': {ISO: 'PAN', name: `Panama`, numberOfThings: 0, count: 0, playtime: []},
    'PCN': {ISO: 'PCN', name: `Pitcairn`, numberOfThings: 0, count: 0, playtime: []},
    'PER': {ISO: 'PER', name: `Peru`, numberOfThings: 0, count: 0, playtime: []},
    'PHL': {ISO: 'PHL', name: `Philippines`, numberOfThings: 0, count: 0, playtime: []},
    'PLW': {ISO: 'PLW', name: `Palau`, numberOfThings: 0, count: 0, playtime: []},
    'PNG': {ISO: 'PNG', name: `Papua New Guinea`, numberOfThings: 0, count: 0, playtime: []},
    'POL': {ISO: 'POL', name: `Poland`, numberOfThings: 0, count: 0, playtime: []},
    'PRI': {ISO: 'PRI', name: `Puerto Rico`, numberOfThings: 0, count: 0, playtime: []},
    'PRK': {ISO: 'PRK', name: `Korea, Democratic People's Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'PRT': {ISO: 'PRT', name: `Portugal`, numberOfThings: 0, count: 0, playtime: []},
    'PRY': {ISO: 'PRY', name: `Paraguay`, numberOfThings: 0, count: 0, playtime: []},
    'PSE': {ISO: 'PSE', name: `Palestine, Stateof`, numberOfThings: 0, count: 0, playtime: []},
    'PYF': {ISO: 'PYF', name: `French Polynesia`, numberOfThings: 0, count: 0, playtime: []},
    'QAT': {ISO: 'QAT', name: `Qatar`, numberOfThings: 0, count: 0, playtime: []},
    'REU': {ISO: 'REU', name: `Réunion`, numberOfThings: 0, count: 0, playtime: []},
    'ROU': {ISO: 'ROU', name: `Romania`, numberOfThings: 0, count: 0, playtime: []},
    'RUS': {ISO: 'RUS', name: `Russian Federation`, numberOfThings: 0, count: 0, playtime: []},
    'RWA': {ISO: 'RWA', name: `Rwanda`, numberOfThings: 0, count: 0, playtime: []},
    'SAU': {ISO: 'SAU', name: `Saudi Arabia`, numberOfThings: 0, count: 0, playtime: []},
    'SDN': {ISO: 'SDN', name: `Sudan`, numberOfThings: 0, count: 0, playtime: []},
    'SEN': {ISO: 'SEN', name: `Senegal`, numberOfThings: 0, count: 0, playtime: []},
    'SGP': {ISO: 'SGP', name: `Singapore`, numberOfThings: 0, count: 0, playtime: []},
    'SGS': {ISO: 'SGS', name: `South Georgia and the South Sandwich Islands`, numberOfThings: 0, count: 0, playtime: []},
    'SHN': {ISO: 'SHN', name: `Saint Helena, Ascension and Tristanda Cunha`, numberOfThings: 0, count: 0, playtime: []},
    'SJM': {ISO: 'SJM', name: `Svalbard and Jan Mayen`, numberOfThings: 0, count: 0, playtime: []},
    'SLB': {ISO: 'SLB', name: `Solomon Islands`, numberOfThings: 0, count: 0, playtime: []},
    'SLE': {ISO: 'SLE', name: `Sierra Leone`, numberOfThings: 0, count: 0, playtime: []},
    'SLV': {ISO: 'SLV', name: `El Salvador`, numberOfThings: 0, count: 0, playtime: []},
    'SMR': {ISO: 'SMR', name: `San Marino`, numberOfThings: 0, count: 0, playtime: []},
    'SOM': {ISO: 'SOM', name: `Somalia`, numberOfThings: 0, count: 0, playtime: []},
    'SPM': {ISO: 'SPM', name: `Saint Pierre and Miquelon`, numberOfThings: 0, count: 0, playtime: []},
    'SRB': {ISO: 'SRB', name: `Serbia`, numberOfThings: 0, count: 0, playtime: []},
    'SSD': {ISO: 'SSD', name: `South Sudan`, numberOfThings: 0, count: 0, playtime: []},
    'STP': {ISO: 'STP', name: `Sao Tome and Principe`, numberOfThings: 0, count: 0, playtime: []},
    'SUR': {ISO: 'SUR', name: `Suriname`, numberOfThings: 0, count: 0, playtime: []},
    'SVK': {ISO: 'SVK', name: `Slovakia`, numberOfThings: 0, count: 0, playtime: []},
    'SVN': {ISO: 'SVN', name: `Slovenia`, numberOfThings: 0, count: 0, playtime: []},
    'SWE': {ISO: 'SWE', name: `Sweden`, numberOfThings: 0, count: 0, playtime: []},
    'SWZ': {ISO: 'SWZ', name: `Swaziland`, numberOfThings: 0, count: 0, playtime: []},
    'SXM': {ISO: 'SXM', name: `Sint Maarten (Dutchpart)`, numberOfThings: 0, count: 0, playtime: []},
    'SYC': {ISO: 'SYC', name: `Seychelles`, numberOfThings: 0, count: 0, playtime: []},
    'SYR': {ISO: 'SYR', name: `Syrian Arab Republic`, numberOfThings: 0, count: 0, playtime: []},
    'TCA': {ISO: 'TCA', name: `Turks and Caicos Islands`, numberOfThings: 0, count: 0, playtime: []},
    'TCD': {ISO: 'TCD', name: `Chad`, numberOfThings: 0, count: 0, playtime: []},
    'TGO': {ISO: 'TGO', name: `Togo`, numberOfThings: 0, count: 0, playtime: []},
    'THA': {ISO: 'THA', name: `Thailand`, numberOfThings: 0, count: 0, playtime: []},
    'TJK': {ISO: 'TJK', name: `Tajikistan`, numberOfThings: 0, count: 0, playtime: []},
    'TKL': {ISO: 'TKL', name: `Tokelau`, numberOfThings: 0, count: 0, playtime: []},
    'TKM': {ISO: 'TKM', name: `Turkmenistan`, numberOfThings: 0, count: 0, playtime: []},
    'TLS': {ISO: 'TLS', name: `Timor-Leste`, numberOfThings: 0, count: 0, playtime: []},
    'TON': {ISO: 'TON', name: `Tonga`, numberOfThings: 0, count: 0, playtime: []},
    'TTO': {ISO: 'TTO', name: `Trinidad and Tobago`, numberOfThings: 0, count: 0, playtime: []},
    'TUN': {ISO: 'TUN', name: `Tunisia`, numberOfThings: 0, count: 0, playtime: []},
    'TUR': {ISO: 'TUR', name: `Turkey`, numberOfThings: 0, count: 0, playtime: []},
    'TUV': {ISO: 'TUV', name: `Tuvalu`, numberOfThings: 0, count: 0, playtime: []},
    'TWN': {ISO: 'TWN', name: `Taiwan, Province of China`, numberOfThings: 0, count: 0, playtime: []},
    'TZA': {ISO: 'TZA', name: `Tanzania, United Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'UGA': {ISO: 'UGA', name: `Uganda`, numberOfThings: 0, count: 0, playtime: []},
    'UKR': {ISO: 'UKR', name: `Ukraine`, numberOfThings: 0, count: 0, playtime: []},
    'UMI': {ISO: 'UMI', name: `United States Minor Outlying Islands`, numberOfThings: 0, count: 0, playtime: []},
    'URY': {ISO: 'URY', name: `Uruguay`, numberOfThings: 0, count: 0, playtime: []},
    'USA': {ISO: 'USA', name: `United States`, numberOfThings: 0, count: 0, playtime: []},
    'UZB': {ISO: 'UZB', name: `Uzbekistan`, numberOfThings: 0, count: 0, playtime: []},
    'VAT': {ISO: 'VAT', name: `HolySee (Vatican City State)`, numberOfThings: 0, count: 0, playtime: []},
    'VCT': {ISO: 'VCT', name: `Saint Vincent and the Grenadines`, numberOfThings: 0, count: 0, playtime: []},
    'VEN': {ISO: 'VEN', name: `Venezuela, Bolivarian Republic of`, numberOfThings: 0, count: 0, playtime: []},
    'VGB': {ISO: 'VGB', name: `Virgin Islands, British`, numberOfThings: 0, count: 0, playtime: []},
    'VIR': {ISO: 'VIR', name: `Virgin Islands, U.S.`, numberOfThings: 0, count: 0, playtime: []},
    'VNM': {ISO: 'VNM', name: `VietNam`, numberOfThings: 0, count: 0, playtime: []},
    'VUT': {ISO: 'VUT', name: `Vanuatu`, numberOfThings: 0, count: 0, playtime: []},
    'WLF': {ISO: 'WLF', name: `Wallis and Futuna`, numberOfThings: 0, count: 0, playtime: []},
    'WSM': {ISO: 'WSM', name: `Samoa`, numberOfThings: 0, count: 0, playtime: []},
    'YEM': {ISO: 'YEM', name: `Yemen`, numberOfThings: 0, count: 0, playtime: []},
    'ZAF': {ISO: 'ZAF', name: `South Africa`, numberOfThings: 0, count: 0, playtime: []},
    'ZMB': {ISO: 'ZMB', name: `Zambia`, numberOfThings: 0, count: 0, playtime: []},
    'ZWE': {ISO: 'ZWE', name: `Zimbabwe`, numberOfThings: 0, count: 0, playtime: []},
  };
};

//Export the container
module.exports = stats;
