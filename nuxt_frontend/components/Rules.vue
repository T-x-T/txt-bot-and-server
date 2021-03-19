<template>
  <div id="background">
    <div id="section_rules" class="scrollTarget"></div>
    <h1>Rules</h1>
    <div id="wrapper">
      <div class="grid">
        <div class="hover paxItem rules1">
          <p class="headline">Community</p>
          <ol>
            <li>Do not treat others in ways that you would not like to be treated. Any kind of insult, discrimination or harassment is unwished.</li>
            <li>Everyone is playing Minecraft to have a good time. To ensure a good time on Paxterya, be tolerant and understanding towards other players and respect their wishes.</li>
            <li>Spamming is unwished.</li>
            <li>Do not send links to websites with malicious or pornographic content.</li>
          </ol>
        </div>

        <div class="hover paxItem rules2">
          <p class="headline">Public farms</p>
          <ol>
            <li>Only XP, villager trading, iron, (cobble)stone, wool and manual farms can be made public.</li>
            <li>You shall consult a member of staff before constructing a public farm.</li>
            <li>You may construct a farm that is on the list from above and run it privately.</li>
          </ol>
        </div>

        <div class="hover paxItem rules3">
          <p class="headline">In-Game</p>
          <ol>
            <li>It is forbidden to attack, harm or kill other players against their will.</li>
            <li>It is forbidden to alter or destroy another player's building(s) against their will. When in doubt if a deserted, unprotected site is still in use, ask a moderator or administrator before destroying it.</li>
            <li>It is forbidden to steal items from chests. This counts for chests on mob farms etc, too; ask the farm's owner first.</li>
            <li>It is forbidden to steal other player's items from item frames, armor stands, barrels, hoppers etc.</li>
            <li>It is forbidden to kill, free or steal other player's animals or villagers.</li>
            <li>It is forbidden to use game modifications that give you an unfair advantage. Allowed modifications are optimization, minimap, inventory management and schematic mods.</li>
            <li>It is forbidden to exploit game bugs that give you an unfair advantage, such as item duping.</li>
            <li>It is permitted to use tnt dupers.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#background
  @media screen and ($mobile)
    width: 100vw

div
  margin-top: -4px
  padding-bottom: 1%

div.grid
  width: 75%
  display: grid
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr
  gap: 0px 100px
  grid-template-areas: "rules1 rules3" "rules2 rules3"
  margin: 0 auto
  margin-top: 30px

  @media screen and ($mobile)
    display: flex
    flex-direction: column
    .paxItem
      margin-bottom: 50px
    .headline
      width: 70vw

.rules1
  grid-area: rules1
.rules2
  grid-area: rules2
.rules3
  grid-area: rules3
</style>