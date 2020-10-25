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
    stats.template.mc({collection: 'playtime'}, function (err, playtime) {
      if(!err && playtime) {
        let averageAge = 0;
        members.forEach(member => averageAge += member.getAge());
        averageAge = Math.round(averageAge / members.length);

        members = members.sort((a, b) => a.getAge() - b.getAge());
        let medianAge = members[members.length / 2].getAge();

        //Constuct and callback the final object
        callback(false, {
          'total_members': members.length,
          'average_age': averageAge,
          'median_age': medianAge,
          'total_playtime': playtime + 'h'
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
  .then(members => {
    //Get the country list
    let countries = _internal.getCountries();

    //Add the members countries to the list
    members.forEach((member) => {
      //Get the ISO representation of the country
      let iso = _internal.getCountryIsoByName(countries, member.getCountry());
      if(iso) {
        countries[iso].numberOfThings++;
      } else {
        global.log(2, 'stats', 'stats.countryList doesnt contain a country', {country: member.getCountry()})
      }
    });

    //Add the colorcoding
    //Get the maximum amount
    let max = 0;
    for(let key in countries) if(countries[key].numberOfThings > max) max = countries[key].numberOfThings;

    //Do the actual colorcoding
    for(let key in countries) if(countries[key].numberOfThings > 0) countries[key].fillKey = ((countries[key].numberOfThings / max).toFixed(1) * 100) + '%';

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
    'ABW': {ISO: 'ABW', name: `Aruba`, numberOfThings: 0},
    'AFG': {ISO: 'AFG', name: `Afghanistan`, numberOfThings: 0},
    'AGO': {ISO: 'AGO', name: `Angola`, numberOfThings: 0},
    'AIA': {ISO: 'AIA', name: `Anguilla`, numberOfThings: 0},
    'ALA': {ISO: 'ALA', name: `Åland Islands`, numberOfThings: 0},
    'ALB': {ISO: 'ALB', name: `Albania`, numberOfThings: 0},
    'AND': {ISO: 'AND', name: `Andorra`, numberOfThings: 0},
    'ARE': {ISO: 'ARE', name: `United Arab Emirates`, numberOfThings: 0},
    'ARG': {ISO: 'ARG', name: `Argentina`, numberOfThings: 0},
    'ARM': {ISO: 'ARM', name: `Armenia`, numberOfThings: 0},
    'ASM': {ISO: 'ASM', name: `American Samoa`, numberOfThings: 0},
    'ATA': {ISO: 'ATA', name: `Antarctica`, numberOfThings: 0},
    'ATF': {ISO: 'ATF', name: `French Southern Territories`, numberOfThings: 0},
    'ATG': {ISO: 'ATG', name: `Antigua and Barbuda`, numberOfThings: 0},
    'AUS': {ISO: 'AUS', name: `Australia`, numberOfThings: 0},
    'AUT': {ISO: 'AUT', name: `Austria`, numberOfThings: 0},
    'AZE': {ISO: 'AZE', name: `Azerbaijan`, numberOfThings: 0},
    'BDI': {ISO: 'BDI', name: `Burundi`, numberOfThings: 0},
    'BEL': {ISO: 'BEL', name: `Belgium`, numberOfThings: 0},
    'BEN': {ISO: 'BEN', name: `Benin`, numberOfThings: 0},
    'BES': {ISO: 'BES', name: `Bonaire, Sint Eustatius and Saba`, numberOfThings: 0},
    'BFA': {ISO: 'BFA', name: `Burkina Faso`, numberOfThings: 0},
    'BGD': {ISO: 'BGD', name: `Bangladesh`, numberOfThings: 0},
    'BGR': {ISO: 'BGR', name: `Bulgaria`, numberOfThings: 0},
    'BHR': {ISO: 'BHR', name: `Bahrain`, numberOfThings: 0},
    'BHS': {ISO: 'BHS', name: `Bahamas`, numberOfThings: 0},
    'BIH': {ISO: 'BIH', name: `Bosnia and Herzegovina`, numberOfThings: 0},
    'BLM': {ISO: 'BLM', name: `Saint Barthélemy`, numberOfThings: 0},
    'BLR': {ISO: 'BLR', name: `Belarus`, numberOfThings: 0},
    'BLZ': {ISO: 'BLZ', name: `Belize`, numberOfThings: 0},
    'BMU': {ISO: 'BMU', name: `Bermuda`, numberOfThings: 0},
    'BOL': {ISO: 'BOL', name: `Bolivia, Plurinational State of`, numberOfThings: 0},
    'BRA': {ISO: 'BRA', name: `Brazil`, numberOfThings: 0},
    'BRB': {ISO: 'BRB', name: `Barbados`, numberOfThings: 0},
    'BRN': {ISO: 'BRN', name: `Brunei Darussalam`, numberOfThings: 0},
    'BTN': {ISO: 'BTN', name: `Bhutan`, numberOfThings: 0},
    'BVT': {ISO: 'BVT', name: `Bouvet Island`, numberOfThings: 0},
    'BWA': {ISO: 'BWA', name: `Botswana`, numberOfThings: 0},
    'CAF': {ISO: 'CAF', name: `Central African Republic`, numberOfThings: 0},
    'CAN': {ISO: 'CAN', name: `Canada`, numberOfThings: 0},
    'CCK': {ISO: 'CCK', name: `Cocos (Keeling) Islands`, numberOfThings: 0},
    'CHE': {ISO: 'CHE', name: `Switzerland`, numberOfThings: 0},
    'CHL': {ISO: 'CHL', name: `Chile`, numberOfThings: 0},
    'CHN': {ISO: 'CHN', name: `China`, numberOfThings: 0},
    'CIV': {ISO: 'CIV', name: `Côted'Ivoire`, numberOfThings: 0},
    'CMR': {ISO: 'CMR', name: `Cameroon`, numberOfThings: 0},
    'COD': {ISO: 'COD', name: `Congo, the Democratic Republic of the`, numberOfThings: 0},
    'COG': {ISO: 'COG', name: `Congo`, numberOfThings: 0},
    'COK': {ISO: 'COK', name: `Cook Islands`, numberOfThings: 0},
    'COL': {ISO: 'COL', name: `Colombia`, numberOfThings: 0},
    'COM': {ISO: 'COM', name: `Comoros`, numberOfThings: 0},
    'CPV': {ISO: 'CPV', name: `Cabo Verde`, numberOfThings: 0},
    'CRI': {ISO: 'CRI', name: `Costa Rica`, numberOfThings: 0},
    'CUB': {ISO: 'CUB', name: `Cuba`, numberOfThings: 0},
    'CUW': {ISO: 'CUW', name: `Curaçao`, numberOfThings: 0},
    'CXR': {ISO: 'CXR', name: `Christmas Island`, numberOfThings: 0},
    'CYM': {ISO: 'CYM', name: `Cayman Islands`, numberOfThings: 0},
    'CYP': {ISO: 'CYP', name: `Cyprus`, numberOfThings: 0},
    'CZE': {ISO: 'CZE', name: `Czech Republic`, numberOfThings: 0},
    'DEU': {ISO: 'DEU', name: `Germany`, numberOfThings: 0},
    'DJI': {ISO: 'DJI', name: `Djibouti`, numberOfThings: 0},
    'DMA': {ISO: 'DMA', name: `Dominica`, numberOfThings: 0},
    'DNK': {ISO: 'DNK', name: `Denmark`, numberOfThings: 0},
    'DOM': {ISO: 'DOM', name: `Dominican Republic`, numberOfThings: 0},
    'DZA': {ISO: 'DZA', name: `Algeria`, numberOfThings: 0},
    'ECU': {ISO: 'ECU', name: `Ecuador`, numberOfThings: 0},
    'EGY': {ISO: 'EGY', name: `Egypt`, numberOfThings: 0},
    'ERI': {ISO: 'ERI', name: `Eritrea`, numberOfThings: 0},
    'ESH': {ISO: 'ESH', name: `Western Sahara`, numberOfThings: 0},
    'ESP': {ISO: 'ESP', name: `Spain`, numberOfThings: 0},
    'EST': {ISO: 'EST', name: `Estonia`, numberOfThings: 0},
    'ETH': {ISO: 'ETH', name: `Ethiopia`, numberOfThings: 0},
    'FIN': {ISO: 'FIN', name: `Finland`, numberOfThings: 0},
    'FJI': {ISO: 'FJI', name: `Fiji`, numberOfThings: 0},
    'FLK': {ISO: 'FLK', name: `Falkland Islands (Malvinas)`, numberOfThings: 0},
    'FRA': {ISO: 'FRA', name: `France`, numberOfThings: 0},
    'FRO': {ISO: 'FRO', name: `Faroe Islands`, numberOfThings: 0},
    'FSM': {ISO: 'FSM', name: `Micronesia, Federated States of`, numberOfThings: 0},
    'GAB': {ISO: 'GAB', name: `Gabon`, numberOfThings: 0},
    'GBR': {ISO: 'GBR', name: `United Kingdom`, numberOfThings: 0},
    'GEO': {ISO: 'GEO', name: `Georgia`, numberOfThings: 0},
    'GGY': {ISO: 'GGY', name: `Guernsey`, numberOfThings: 0},
    'GHA': {ISO: 'GHA', name: `Ghana`, numberOfThings: 0},
    'GIB': {ISO: 'GIB', name: `Gibraltar`, numberOfThings: 0},
    'GIN': {ISO: 'GIN', name: `Guinea`, numberOfThings: 0},
    'GLP': {ISO: 'GLP', name: `Guadeloupe`, numberOfThings: 0},
    'GMB': {ISO: 'GMB', name: `Gambia`, numberOfThings: 0},
    'GNB': {ISO: 'GNB', name: `Guinea-Bissau`, numberOfThings: 0},
    'GNQ': {ISO: 'GNQ', name: `Equatorial Guinea`, numberOfThings: 0},
    'GRC': {ISO: 'GRC', name: `Greece`, numberOfThings: 0},
    'GRD': {ISO: 'GRD', name: `Grenada`, numberOfThings: 0},
    'GRL': {ISO: 'GRL', name: `Greenland`, numberOfThings: 0},
    'GTM': {ISO: 'GTM', name: `Guatemala`, numberOfThings: 0},
    'GUF': {ISO: 'GUF', name: `French Guiana`, numberOfThings: 0},
    'GUM': {ISO: 'GUM', name: `Guam`, numberOfThings: 0},
    'GUY': {ISO: 'GUY', name: `Guyana`, numberOfThings: 0},
    'HKG': {ISO: 'HKG', name: `Hong Kong`, numberOfThings: 0},
    'HMD': {ISO: 'HMD', name: `Heard Island and McDonald Islands`, numberOfThings: 0},
    'HND': {ISO: 'HND', name: `Honduras`, numberOfThings: 0},
    'HRV': {ISO: 'HRV', name: `Croatia`, numberOfThings: 0},
    'HTI': {ISO: 'HTI', name: `Haiti`, numberOfThings: 0},
    'HUN': {ISO: 'HUN', name: `Hungary`, numberOfThings: 0},
    'IDN': {ISO: 'IDN', name: `Indonesia`, numberOfThings: 0},
    'IMN': {ISO: 'IMN', name: `Isle of Man`, numberOfThings: 0},
    'IND': {ISO: 'IND', name: `India`, numberOfThings: 0},
    'IOT': {ISO: 'IOT', name: `British Indian Ocean Territory`, numberOfThings: 0},
    'IRL': {ISO: 'IRL', name: `Ireland`, numberOfThings: 0},
    'IRN': {ISO: 'IRN', name: `Iran, Islamic Republic of`, numberOfThings: 0},
    'IRQ': {ISO: 'IRQ', name: `Iraq`, numberOfThings: 0},
    'ISL': {ISO: 'ISL', name: `Iceland`, numberOfThings: 0},
    'ISR': {ISO: 'ISR', name: `Israel`, numberOfThings: 0},
    'ITA': {ISO: 'ITA', name: `Italy`, numberOfThings: 0},
    'JAM': {ISO: 'JAM', name: `Jamaica`, numberOfThings: 0},
    'JEY': {ISO: 'JEY', name: `Jersey`, numberOfThings: 0},
    'JOR': {ISO: 'JOR', name: `Jordan`, numberOfThings: 0},
    'JPN': {ISO: 'JPN', name: `Japan`, numberOfThings: 0},
    'KAZ': {ISO: 'KAZ', name: `Kazakhstan`, numberOfThings: 0},
    'KEN': {ISO: 'KEN', name: `Kenya`, numberOfThings: 0},
    'KGZ': {ISO: 'KGZ', name: `Kyrgyzstan`, numberOfThings: 0},
    'KHM': {ISO: 'KHM', name: `Cambodia`, numberOfThings: 0},
    'KIR': {ISO: 'KIR', name: `Kiribati`, numberOfThings: 0},
    'KNA': {ISO: 'KNA', name: `Saint Kitts and Nevis`, numberOfThings: 0},
    'KOR': {ISO: 'KOR', name: `Korea, Republic of`, numberOfThings: 0},
    'KWT': {ISO: 'KWT', name: `Kuwait`, numberOfThings: 0},
    'LAO': {ISO: 'LAO', name: `Lao People's Democratic Republic`, numberOfThings: 0},
    'LBN': {ISO: 'LBN', name: `Lebanon`, numberOfThings: 0},
    'LBR': {ISO: 'LBR', name: `Liberia`, numberOfThings: 0},
    'LBY': {ISO: 'LBY', name: `Libya`, numberOfThings: 0},
    'LCA': {ISO: 'LCA', name: `Saint Lucia`, numberOfThings: 0},
    'LIE': {ISO: 'LIE', name: `Liechtenstein`, numberOfThings: 0},
    'LKA': {ISO: 'LKA', name: `Sri Lanka`, numberOfThings: 0},
    'LSO': {ISO: 'LSO', name: `Lesotho`, numberOfThings: 0},
    'LTU': {ISO: 'LTU', name: `Lithuania`, numberOfThings: 0},
    'LUX': {ISO: 'LUX', name: `Luxembourg`, numberOfThings: 0},
    'LVA': {ISO: 'LVA', name: `Latvia`, numberOfThings: 0},
    'MAC': {ISO: 'MAC', name: `Macao`, numberOfThings: 0},
    'MAF': {ISO: 'MAF', name: `Saint Martin (Frenchpart)`, numberOfThings: 0},
    'MAR': {ISO: 'MAR', name: `Morocco`, numberOfThings: 0},
    'MCO': {ISO: 'MCO', name: `Monaco`, numberOfThings: 0},
    'MDA': {ISO: 'MDA', name: `Moldova, Republic of`, numberOfThings: 0},
    'MDG': {ISO: 'MDG', name: `Madagascar`, numberOfThings: 0},
    'MDV': {ISO: 'MDV', name: `Maldives`, numberOfThings: 0},
    'MEX': {ISO: 'MEX', name: `Mexico`, numberOfThings: 0},
    'MHL': {ISO: 'MHL', name: `Marshall Islands`, numberOfThings: 0},
    'MKD': {ISO: 'MKD', name: `Macedonia, the former Yugoslav Republic of`, numberOfThings: 0},
    'MLI': {ISO: 'MLI', name: `Mali`, numberOfThings: 0},
    'MLT': {ISO: 'MLT', name: `Malta`, numberOfThings: 0},
    'MMR': {ISO: 'MMR', name: `Myanmar`, numberOfThings: 0},
    'MNE': {ISO: 'MNE', name: `Montenegro`, numberOfThings: 0},
    'MNG': {ISO: 'MNG', name: `Mongolia`, numberOfThings: 0},
    'MNP': {ISO: 'MNP', name: `Northern Mariana Islands`, numberOfThings: 0},
    'MOZ': {ISO: 'MOZ', name: `Mozambique`, numberOfThings: 0},
    'MRT': {ISO: 'MRT', name: `Mauritania`, numberOfThings: 0},
    'MSR': {ISO: 'MSR', name: `Montserrat`, numberOfThings: 0},
    'MTQ': {ISO: 'MTQ', name: `Martinique`, numberOfThings: 0},
    'MUS': {ISO: 'MUS', name: `Mauritius`, numberOfThings: 0},
    'MWI': {ISO: 'MWI', name: `Malawi`, numberOfThings: 0},
    'MYS': {ISO: 'MYS', name: `Malaysia`, numberOfThings: 0},
    'MYT': {ISO: 'MYT', name: `Mayotte`, numberOfThings: 0},
    'NAM': {ISO: 'NAM', name: `Namibia`, numberOfThings: 0},
    'NCL': {ISO: 'NCL', name: `New Caledonia`, numberOfThings: 0},
    'NER': {ISO: 'NER', name: `Niger`, numberOfThings: 0},
    'NFK': {ISO: 'NFK', name: `Norfolk Island`, numberOfThings: 0},
    'NGA': {ISO: 'NGA', name: `Nigeria`, numberOfThings: 0},
    'NIC': {ISO: 'NIC', name: `Nicaragua`, numberOfThings: 0},
    'NIU': {ISO: 'NIU', name: `Niue`, numberOfThings: 0},
    'NLD': {ISO: 'NLD', name: `Netherlands`, numberOfThings: 0},
    'NOR': {ISO: 'NOR', name: `Norway`, numberOfThings: 0},
    'NPL': {ISO: 'NPL', name: `Nepal`, numberOfThings: 0},
    'NRU': {ISO: 'NRU', name: `Nauru`, numberOfThings: 0},
    'NZL': {ISO: 'NZL', name: `New Zealand`, numberOfThings: 0},
    'OMN': {ISO: 'OMN', name: `Oman`, numberOfThings: 0},
    'PAK': {ISO: 'PAK', name: `Pakistan`, numberOfThings: 0},
    'PAN': {ISO: 'PAN', name: `Panama`, numberOfThings: 0},
    'PCN': {ISO: 'PCN', name: `Pitcairn`, numberOfThings: 0},
    'PER': {ISO: 'PER', name: `Peru`, numberOfThings: 0},
    'PHL': {ISO: 'PHL', name: `Philippines`, numberOfThings: 0},
    'PLW': {ISO: 'PLW', name: `Palau`, numberOfThings: 0},
    'PNG': {ISO: 'PNG', name: `Papua New Guinea`, numberOfThings: 0},
    'POL': {ISO: 'POL', name: `Poland`, numberOfThings: 0},
    'PRI': {ISO: 'PRI', name: `Puerto Rico`, numberOfThings: 0},
    'PRK': {ISO: 'PRK', name: `Korea, Democratic People's Republic of`, numberOfThings: 0},
    'PRT': {ISO: 'PRT', name: `Portugal`, numberOfThings: 0},
    'PRY': {ISO: 'PRY', name: `Paraguay`, numberOfThings: 0},
    'PSE': {ISO: 'PSE', name: `Palestine, Stateof`, numberOfThings: 0},
    'PYF': {ISO: 'PYF', name: `French Polynesia`, numberOfThings: 0},
    'QAT': {ISO: 'QAT', name: `Qatar`, numberOfThings: 0},
    'REU': {ISO: 'REU', name: `Réunion`, numberOfThings: 0},
    'ROU': {ISO: 'ROU', name: `Romania`, numberOfThings: 0},
    'RUS': {ISO: 'RUS', name: `Russian Federation`, numberOfThings: 0},
    'RWA': {ISO: 'RWA', name: `Rwanda`, numberOfThings: 0},
    'SAU': {ISO: 'SAU', name: `Saudi Arabia`, numberOfThings: 0},
    'SDN': {ISO: 'SDN', name: `Sudan`, numberOfThings: 0},
    'SEN': {ISO: 'SEN', name: `Senegal`, numberOfThings: 0},
    'SGP': {ISO: 'SGP', name: `Singapore`, numberOfThings: 0},
    'SGS': {ISO: 'SGS', name: `South Georgia and the South Sandwich Islands`, numberOfThings: 0},
    'SHN': {ISO: 'SHN', name: `Saint Helena, Ascension and Tristanda Cunha`, numberOfThings: 0},
    'SJM': {ISO: 'SJM', name: `Svalbard and Jan Mayen`, numberOfThings: 0},
    'SLB': {ISO: 'SLB', name: `Solomon Islands`, numberOfThings: 0},
    'SLE': {ISO: 'SLE', name: `Sierra Leone`, numberOfThings: 0},
    'SLV': {ISO: 'SLV', name: `El Salvador`, numberOfThings: 0},
    'SMR': {ISO: 'SMR', name: `San Marino`, numberOfThings: 0},
    'SOM': {ISO: 'SOM', name: `Somalia`, numberOfThings: 0},
    'SPM': {ISO: 'SPM', name: `Saint Pierre and Miquelon`, numberOfThings: 0},
    'SRB': {ISO: 'SRB', name: `Serbia`, numberOfThings: 0},
    'SSD': {ISO: 'SSD', name: `South Sudan`, numberOfThings: 0},
    'STP': {ISO: 'STP', name: `Sao Tome and Principe`, numberOfThings: 0},
    'SUR': {ISO: 'SUR', name: `Suriname`, numberOfThings: 0},
    'SVK': {ISO: 'SVK', name: `Slovakia`, numberOfThings: 0},
    'SVN': {ISO: 'SVN', name: `Slovenia`, numberOfThings: 0},
    'SWE': {ISO: 'SWE', name: `Sweden`, numberOfThings: 0},
    'SWZ': {ISO: 'SWZ', name: `Swaziland`, numberOfThings: 0},
    'SXM': {ISO: 'SXM', name: `Sint Maarten (Dutchpart)`, numberOfThings: 0},
    'SYC': {ISO: 'SYC', name: `Seychelles`, numberOfThings: 0},
    'SYR': {ISO: 'SYR', name: `Syrian Arab Republic`, numberOfThings: 0},
    'TCA': {ISO: 'TCA', name: `Turks and Caicos Islands`, numberOfThings: 0},
    'TCD': {ISO: 'TCD', name: `Chad`, numberOfThings: 0},
    'TGO': {ISO: 'TGO', name: `Togo`, numberOfThings: 0},
    'THA': {ISO: 'THA', name: `Thailand`, numberOfThings: 0},
    'TJK': {ISO: 'TJK', name: `Tajikistan`, numberOfThings: 0},
    'TKL': {ISO: 'TKL', name: `Tokelau`, numberOfThings: 0},
    'TKM': {ISO: 'TKM', name: `Turkmenistan`, numberOfThings: 0},
    'TLS': {ISO: 'TLS', name: `Timor-Leste`, numberOfThings: 0},
    'TON': {ISO: 'TON', name: `Tonga`, numberOfThings: 0},
    'TTO': {ISO: 'TTO', name: `Trinidad and Tobago`, numberOfThings: 0},
    'TUN': {ISO: 'TUN', name: `Tunisia`, numberOfThings: 0},
    'TUR': {ISO: 'TUR', name: `Turkey`, numberOfThings: 0},
    'TUV': {ISO: 'TUV', name: `Tuvalu`, numberOfThings: 0},
    'TWN': {ISO: 'TWN', name: `Taiwan, Province of China`, numberOfThings: 0},
    'TZA': {ISO: 'TZA', name: `Tanzania, United Republic of`, numberOfThings: 0},
    'UGA': {ISO: 'UGA', name: `Uganda`, numberOfThings: 0},
    'UKR': {ISO: 'UKR', name: `Ukraine`, numberOfThings: 0},
    'UMI': {ISO: 'UMI', name: `United States Minor Outlying Islands`, numberOfThings: 0},
    'URY': {ISO: 'URY', name: `Uruguay`, numberOfThings: 0},
    'USA': {ISO: 'USA', name: `United States`, numberOfThings: 0},
    'UZB': {ISO: 'UZB', name: `Uzbekistan`, numberOfThings: 0},
    'VAT': {ISO: 'VAT', name: `HolySee (Vatican City State)`, numberOfThings: 0},
    'VCT': {ISO: 'VCT', name: `Saint Vincent and the Grenadines`, numberOfThings: 0},
    'VEN': {ISO: 'VEN', name: `Venezuela, Bolivarian Republic of`, numberOfThings: 0},
    'VGB': {ISO: 'VGB', name: `Virgin Islands, British`, numberOfThings: 0},
    'VIR': {ISO: 'VIR', name: `Virgin Islands, U.S.`, numberOfThings: 0},
    'VNM': {ISO: 'VNM', name: `VietNam`, numberOfThings: 0},
    'VUT': {ISO: 'VUT', name: `Vanuatu`, numberOfThings: 0},
    'WLF': {ISO: 'WLF', name: `Wallis and Futuna`, numberOfThings: 0},
    'WSM': {ISO: 'WSM', name: `Samoa`, numberOfThings: 0},
    'YEM': {ISO: 'YEM', name: `Yemen`, numberOfThings: 0},
    'ZAF': {ISO: 'ZAF', name: `South Africa`, numberOfThings: 0},
    'ZMB': {ISO: 'ZMB', name: `Zambia`, numberOfThings: 0},
    'ZWE': {ISO: 'ZWE', name: `Zimbabwe`, numberOfThings: 0},
  };
};

//Export the container
module.exports = stats;
