/*
 *  GENERAL STATS RETRIEVER
 *  This is used to get various predefined statistic templates for mc and member stats
 */

//Dependencies
import mc = require("./minecraft.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import log = require("../log/index.js");

import type Member = require("../user/member.js");

const main = {
  //Gets the basic stats for the statistics.html overview
  async overview() {
    let members = await memberFactory.getAllWhitelisted();
    if(members.length === 0) throw new Error("No Members received");

    const overview = await main.mcGetAll("overview");

    let averageAge = 0;
    members.forEach((member: Member) => averageAge += member.getAge());
    averageAge = Math.round(averageAge / members.length);

    members = members.sort((a: Member, b: Member) => a.getAge() - b.getAge());
    const medianAge = members[Number.parseInt((members.length / 2).toString())].getAge();

    return {
      total_members: members.length,
      average_age: averageAge,
      median_age: medianAge,
      total_playtime: overview.playtime,
      silly: Math.round(overview.cobblestone_mined_per_death_by_zombie as number)
    };
  },

  async memberOverview() {
    const members = await memberFactory.getAllWhitelisted();
    return await Promise.all(members.map(member => main.singleMemberOverview(member.getDiscordId())));
  },

  async singleMemberOverview(discordId: string) {
    const member = await memberFactory.getByDiscordId(discordId);
    let playtime = 0;
    try {
      playtime = await main.mcGetSingle(member.getMcUuid(), "playtime");
    } catch (e) {
      log.write(0, "stats", "singleMemberOverview couldnt get playtime of member", {err: e.message, discordId: discordId});
    }

    return {
      discord_nick: member.getDiscordUserName(),
      mc_nick: member.getMcIgn(),
      age: member.getAgeConsiderPrivacy(),
      country: member.getCountryConsiderPrivacy(),
      playtime: playtime ? playtime : 0,
      mc_render_url: member.getMcSkinUrl(),
      joined_date: member.getJoinedDate()
    };
  },

  async countryList() {
    const members = await memberFactory.getAllWhitelisted();
    //Get the country list
    let countries = _internal.getCountries();

    //Add the data of each member to countries
    await Promise.allSettled(members.map(async member => {
      const iso = _internal.getCountryIsoByName(countries, member.getCountry());
      if(iso) {
        countries[iso].numberOfThings++;
        countries[iso].count++;
        countries[iso].playtime.push(await main.mcGetSingle(member.getMcUuid(), "playtime"));
      } else {
        log.write(2, "stats", "stats.countryList doesnt contain a country", {country: member.getCountry()})
      }
    }));

    //Combine the playtime arrays
    for(let country in countries) {
      countries[country].playtime = countries[country].playtime.reduce((a: number, b: number) => a + b, 0);
    }

    return countries;
  },

  mcGetRanked: mc.getRanked,
  mcGetSingle: mc.getSingle,
  mcGetAll: mc.getAll
};

//Internal stuff
var _internal: any = {};

//Finds an objects key by its value
_internal.getCountryIsoByName = function(object: any, value: string) {
  let iso = false;
  for(let key in object) if(object[key].name === value) iso = object[key].ISO;
  return iso;
};

//Returns an object containing all countries as keys, with an empty object as a value
_internal.getCountries = function() {
  return {
    "ABW": {ISO: "ABW", name: `Aruba`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AFG": {ISO: "AFG", name: `Afghanistan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AGO": {ISO: "AGO", name: `Angola`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AIA": {ISO: "AIA", name: `Anguilla`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ALA": {ISO: "ALA", name: `Åland Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ALB": {ISO: "ALB", name: `Albania`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AND": {ISO: "AND", name: `Andorra`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ARE": {ISO: "ARE", name: `United Arab Emirates`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ARG": {ISO: "ARG", name: `Argentina`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ARM": {ISO: "ARM", name: `Armenia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ASM": {ISO: "ASM", name: `American Samoa`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ATA": {ISO: "ATA", name: `Antarctica`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ATF": {ISO: "ATF", name: `French Southern Territories`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ATG": {ISO: "ATG", name: `Antigua and Barbuda`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AUS": {ISO: "AUS", name: `Australia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AUT": {ISO: "AUT", name: `Austria`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "AZE": {ISO: "AZE", name: `Azerbaijan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BDI": {ISO: "BDI", name: `Burundi`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BEL": {ISO: "BEL", name: `Belgium`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BEN": {ISO: "BEN", name: `Benin`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BES": {ISO: "BES", name: `Bonaire, Sint Eustatius and Saba`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BFA": {ISO: "BFA", name: `Burkina Faso`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BGD": {ISO: "BGD", name: `Bangladesh`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BGR": {ISO: "BGR", name: `Bulgaria`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BHR": {ISO: "BHR", name: `Bahrain`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BHS": {ISO: "BHS", name: `Bahamas`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BIH": {ISO: "BIH", name: `Bosnia and Herzegovina`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BLM": {ISO: "BLM", name: `Saint Barthélemy`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BLR": {ISO: "BLR", name: `Belarus`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BLZ": {ISO: "BLZ", name: `Belize`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BMU": {ISO: "BMU", name: `Bermuda`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BOL": {ISO: "BOL", name: `Bolivia, Plurinational State of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BRA": {ISO: "BRA", name: `Brazil`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BRB": {ISO: "BRB", name: `Barbados`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BRN": {ISO: "BRN", name: `Brunei Darussalam`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BTN": {ISO: "BTN", name: `Bhutan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BVT": {ISO: "BVT", name: `Bouvet Island`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "BWA": {ISO: "BWA", name: `Botswana`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CAF": {ISO: "CAF", name: `Central African Republic`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CAN": {ISO: "CAN", name: `Canada`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CCK": {ISO: "CCK", name: `Cocos (Keeling) Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CHE": {ISO: "CHE", name: `Switzerland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CHL": {ISO: "CHL", name: `Chile`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CHN": {ISO: "CHN", name: `China`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CIV": {ISO: "CIV", name: `Côted"Ivoire`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CMR": {ISO: "CMR", name: `Cameroon`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "COD": {ISO: "COD", name: `Congo, the Democratic Republic of the`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "COG": {ISO: "COG", name: `Congo`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "COK": {ISO: "COK", name: `Cook Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "COL": {ISO: "COL", name: `Colombia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "COM": {ISO: "COM", name: `Comoros`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CPV": {ISO: "CPV", name: `Cabo Verde`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CRI": {ISO: "CRI", name: `Costa Rica`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CUB": {ISO: "CUB", name: `Cuba`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CUW": {ISO: "CUW", name: `Curaçao`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CXR": {ISO: "CXR", name: `Christmas Island`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CYM": {ISO: "CYM", name: `Cayman Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CYP": {ISO: "CYP", name: `Cyprus`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "CZE": {ISO: "CZE", name: `Czech Republic`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DEU": {ISO: "DEU", name: `Germany`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DJI": {ISO: "DJI", name: `Djibouti`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DMA": {ISO: "DMA", name: `Dominica`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DNK": {ISO: "DNK", name: `Denmark`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DOM": {ISO: "DOM", name: `Dominican Republic`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "DZA": {ISO: "DZA", name: `Algeria`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ECU": {ISO: "ECU", name: `Ecuador`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "EGY": {ISO: "EGY", name: `Egypt`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ERI": {ISO: "ERI", name: `Eritrea`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ESH": {ISO: "ESH", name: `Western Sahara`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ESP": {ISO: "ESP", name: `Spain`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "EST": {ISO: "EST", name: `Estonia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ETH": {ISO: "ETH", name: `Ethiopia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FIN": {ISO: "FIN", name: `Finland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FJI": {ISO: "FJI", name: `Fiji`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FLK": {ISO: "FLK", name: `Falkland Islands (Malvinas)`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FRA": {ISO: "FRA", name: `France`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FRO": {ISO: "FRO", name: `Faroe Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "FSM": {ISO: "FSM", name: `Micronesia, Federated States of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GAB": {ISO: "GAB", name: `Gabon`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GBR": {ISO: "GBR", name: `United Kingdom`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GEO": {ISO: "GEO", name: `Georgia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GGY": {ISO: "GGY", name: `Guernsey`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GHA": {ISO: "GHA", name: `Ghana`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GIB": {ISO: "GIB", name: `Gibraltar`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GIN": {ISO: "GIN", name: `Guinea`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GLP": {ISO: "GLP", name: `Guadeloupe`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GMB": {ISO: "GMB", name: `Gambia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GNB": {ISO: "GNB", name: `Guinea-Bissau`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GNQ": {ISO: "GNQ", name: `Equatorial Guinea`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GRC": {ISO: "GRC", name: `Greece`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GRD": {ISO: "GRD", name: `Grenada`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GRL": {ISO: "GRL", name: `Greenland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GTM": {ISO: "GTM", name: `Guatemala`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GUF": {ISO: "GUF", name: `French Guiana`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GUM": {ISO: "GUM", name: `Guam`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "GUY": {ISO: "GUY", name: `Guyana`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HKG": {ISO: "HKG", name: `Hong Kong`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HMD": {ISO: "HMD", name: `Heard Island and McDonald Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HND": {ISO: "HND", name: `Honduras`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HRV": {ISO: "HRV", name: `Croatia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HTI": {ISO: "HTI", name: `Haiti`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "HUN": {ISO: "HUN", name: `Hungary`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IDN": {ISO: "IDN", name: `Indonesia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IMN": {ISO: "IMN", name: `Isle of Man`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IND": {ISO: "IND", name: `India`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IOT": {ISO: "IOT", name: `British Indian Ocean Territory`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IRL": {ISO: "IRL", name: `Ireland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IRN": {ISO: "IRN", name: `Iran, Islamic Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "IRQ": {ISO: "IRQ", name: `Iraq`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ISL": {ISO: "ISL", name: `Iceland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ISR": {ISO: "ISR", name: `Israel`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ITA": {ISO: "ITA", name: `Italy`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "JAM": {ISO: "JAM", name: `Jamaica`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "JEY": {ISO: "JEY", name: `Jersey`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "JOR": {ISO: "JOR", name: `Jordan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "JPN": {ISO: "JPN", name: `Japan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KAZ": {ISO: "KAZ", name: `Kazakhstan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KEN": {ISO: "KEN", name: `Kenya`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KGZ": {ISO: "KGZ", name: `Kyrgyzstan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KHM": {ISO: "KHM", name: `Cambodia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KIR": {ISO: "KIR", name: `Kiribati`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KNA": {ISO: "KNA", name: `Saint Kitts and Nevis`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KOR": {ISO: "KOR", name: `Korea, Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "KWT": {ISO: "KWT", name: `Kuwait`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LAO": {ISO: "LAO", name: `Lao People"s Democratic Republic`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LBN": {ISO: "LBN", name: `Lebanon`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LBR": {ISO: "LBR", name: `Liberia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LBY": {ISO: "LBY", name: `Libya`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LCA": {ISO: "LCA", name: `Saint Lucia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LIE": {ISO: "LIE", name: `Liechtenstein`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LKA": {ISO: "LKA", name: `Sri Lanka`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LSO": {ISO: "LSO", name: `Lesotho`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LTU": {ISO: "LTU", name: `Lithuania`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LUX": {ISO: "LUX", name: `Luxembourg`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "LVA": {ISO: "LVA", name: `Latvia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MAC": {ISO: "MAC", name: `Macao`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MAF": {ISO: "MAF", name: `Saint Martin (Frenchpart)`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MAR": {ISO: "MAR", name: `Morocco`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MCO": {ISO: "MCO", name: `Monaco`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MDA": {ISO: "MDA", name: `Moldova, Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MDG": {ISO: "MDG", name: `Madagascar`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MDV": {ISO: "MDV", name: `Maldives`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MEX": {ISO: "MEX", name: `Mexico`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MHL": {ISO: "MHL", name: `Marshall Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MKD": {ISO: "MKD", name: `Macedonia, the former Yugoslav Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MLI": {ISO: "MLI", name: `Mali`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MLT": {ISO: "MLT", name: `Malta`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MMR": {ISO: "MMR", name: `Myanmar`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MNE": {ISO: "MNE", name: `Montenegro`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MNG": {ISO: "MNG", name: `Mongolia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MNP": {ISO: "MNP", name: `Northern Mariana Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MOZ": {ISO: "MOZ", name: `Mozambique`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MRT": {ISO: "MRT", name: `Mauritania`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MSR": {ISO: "MSR", name: `Montserrat`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MTQ": {ISO: "MTQ", name: `Martinique`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MUS": {ISO: "MUS", name: `Mauritius`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MWI": {ISO: "MWI", name: `Malawi`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MYS": {ISO: "MYS", name: `Malaysia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "MYT": {ISO: "MYT", name: `Mayotte`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NAM": {ISO: "NAM", name: `Namibia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NCL": {ISO: "NCL", name: `New Caledonia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NER": {ISO: "NER", name: `Niger`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NFK": {ISO: "NFK", name: `Norfolk Island`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NGA": {ISO: "NGA", name: `Nigeria`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NIC": {ISO: "NIC", name: `Nicaragua`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NIU": {ISO: "NIU", name: `Niue`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NLD": {ISO: "NLD", name: `Netherlands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NOR": {ISO: "NOR", name: `Norway`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NPL": {ISO: "NPL", name: `Nepal`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NRU": {ISO: "NRU", name: `Nauru`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "NZL": {ISO: "NZL", name: `New Zealand`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "OMN": {ISO: "OMN", name: `Oman`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PAK": {ISO: "PAK", name: `Pakistan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PAN": {ISO: "PAN", name: `Panama`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PCN": {ISO: "PCN", name: `Pitcairn`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PER": {ISO: "PER", name: `Peru`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PHL": {ISO: "PHL", name: `Philippines`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PLW": {ISO: "PLW", name: `Palau`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PNG": {ISO: "PNG", name: `Papua New Guinea`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "POL": {ISO: "POL", name: `Poland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PRI": {ISO: "PRI", name: `Puerto Rico`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PRK": {ISO: "PRK", name: `Korea, Democratic People"s Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PRT": {ISO: "PRT", name: `Portugal`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PRY": {ISO: "PRY", name: `Paraguay`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PSE": {ISO: "PSE", name: `Palestine, Stateof`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "PYF": {ISO: "PYF", name: `French Polynesia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "QAT": {ISO: "QAT", name: `Qatar`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "REU": {ISO: "REU", name: `Réunion`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ROU": {ISO: "ROU", name: `Romania`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "RUS": {ISO: "RUS", name: `Russian Federation`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "RWA": {ISO: "RWA", name: `Rwanda`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SAU": {ISO: "SAU", name: `Saudi Arabia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SDN": {ISO: "SDN", name: `Sudan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SEN": {ISO: "SEN", name: `Senegal`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SGP": {ISO: "SGP", name: `Singapore`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SGS": {ISO: "SGS", name: `South Georgia and the South Sandwich Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SHN": {ISO: "SHN", name: `Saint Helena, Ascension and Tristanda Cunha`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SJM": {ISO: "SJM", name: `Svalbard and Jan Mayen`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SLB": {ISO: "SLB", name: `Solomon Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SLE": {ISO: "SLE", name: `Sierra Leone`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SLV": {ISO: "SLV", name: `El Salvador`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SMR": {ISO: "SMR", name: `San Marino`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SOM": {ISO: "SOM", name: `Somalia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SPM": {ISO: "SPM", name: `Saint Pierre and Miquelon`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SRB": {ISO: "SRB", name: `Serbia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SSD": {ISO: "SSD", name: `South Sudan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "STP": {ISO: "STP", name: `Sao Tome and Principe`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SUR": {ISO: "SUR", name: `Suriname`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SVK": {ISO: "SVK", name: `Slovakia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SVN": {ISO: "SVN", name: `Slovenia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SWE": {ISO: "SWE", name: `Sweden`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SWZ": {ISO: "SWZ", name: `Swaziland`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SXM": {ISO: "SXM", name: `Sint Maarten (Dutchpart)`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SYC": {ISO: "SYC", name: `Seychelles`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "SYR": {ISO: "SYR", name: `Syrian Arab Republic`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TCA": {ISO: "TCA", name: `Turks and Caicos Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TCD": {ISO: "TCD", name: `Chad`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TGO": {ISO: "TGO", name: `Togo`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "THA": {ISO: "THA", name: `Thailand`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TJK": {ISO: "TJK", name: `Tajikistan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TKL": {ISO: "TKL", name: `Tokelau`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TKM": {ISO: "TKM", name: `Turkmenistan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TLS": {ISO: "TLS", name: `Timor-Leste`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TON": {ISO: "TON", name: `Tonga`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TTO": {ISO: "TTO", name: `Trinidad and Tobago`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TUN": {ISO: "TUN", name: `Tunisia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TUR": {ISO: "TUR", name: `Turkey`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TUV": {ISO: "TUV", name: `Tuvalu`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TWN": {ISO: "TWN", name: `Taiwan, Province of China`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "TZA": {ISO: "TZA", name: `Tanzania, United Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "UGA": {ISO: "UGA", name: `Uganda`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "UKR": {ISO: "UKR", name: `Ukraine`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "UMI": {ISO: "UMI", name: `United States Minor Outlying Islands`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "URY": {ISO: "URY", name: `Uruguay`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "USA": {ISO: "USA", name: `United States`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "UZB": {ISO: "UZB", name: `Uzbekistan`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VAT": {ISO: "VAT", name: `HolySee (Vatican City State)`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VCT": {ISO: "VCT", name: `Saint Vincent and the Grenadines`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VEN": {ISO: "VEN", name: `Venezuela, Bolivarian Republic of`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VGB": {ISO: "VGB", name: `Virgin Islands, British`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VIR": {ISO: "VIR", name: `Virgin Islands, U.S.`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VNM": {ISO: "VNM", name: `VietNam`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "VUT": {ISO: "VUT", name: `Vanuatu`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "WLF": {ISO: "WLF", name: `Wallis and Futuna`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "WSM": {ISO: "WSM", name: `Samoa`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "YEM": {ISO: "YEM", name: `Yemen`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ZAF": {ISO: "ZAF", name: `South Africa`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ZMB": {ISO: "ZMB", name: `Zambia`, numberOfThings: 0, count: 0, playtime: [] as any[]},
    "ZWE": {ISO: "ZWE", name: `Zimbabwe`, numberOfThings: 0, count: 0, playtime: [] as any[]},
  };
};

export = main;