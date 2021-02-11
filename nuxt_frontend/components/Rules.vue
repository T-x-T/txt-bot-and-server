<template>
  <div>
    <p id="header">Rules</p>
    <div id="wrapper">
      <div>
        <p class="headline">Community</p>
        <ul>
          <li>Do not treat others in ways that you would not like to be treated. Any kind of insult, discrimination or harassment is unwished.</li>
          <li>Everyone is playing Minecraft to have a good time. To ensure a good time on Paxterya, be tolerant and understanding towards other players and respect their wishes.</li>
          <li>Spamming is unwished.</li>
          <li>Do not send links to websites with malicious or pornographic content.</li>
        </ul>
      </div>

      <div>
        <p class="headline">In-Game</p>
        <ul>
          <li>It is forbidden to attack, harm or kill other players against their will.</li>
          <li>It is forbidden to alter or destroy another player's building(s) against their will. When in doubt if a deserted, unprotected site is still in use, ask a moderator or administrator before destroying it.</li>
          <li>It is forbidden to steal items from chests. This counts for chests on mob farms etc, too; ask the farm's owner first.</li>
          <li>It is forbidden to steal other player's items from item frames, armor stands, barrels, hoppers etc.</li>
          <li>It is forbidden to kill, free or steal other player's animals or villagers.</li>
          <li>It is forbidden to use game modifications that give you an unfair advantage. Allowed modifications are optimization, minimap, inventory management and schematic mods.</li>
          <li>It is forbidden to exploit game bugs that give you an unfair advantage, such as item duping.</li>
          <li>It is permitted to use tnt dupers.</li>
        </ul>
      </div>

      <div>
        <p class="headline">Shopping District</p>
        <ul>
          <li>A 16x16 plot can be purchased for the price of 1 diamond block from staff.</li>
          <li>All proceeds from selling plots go towards a big diamond pile, which may be used for community events.</li>
        </ul>
      </div>

      <div>
        <p class="headline">Public farms</p>
        <ul>
          <li>Only XP, villager trading, iron, (cobble)stone, wool and manual farms can be made public.</li>
          <li>You shall consult a member of staff before constructing a public farm.</li>
          <li>You may construct a farm that is on the list from above and run it privately.</li>
        </ul>
      </div>
    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div
  background: $pax-darkcyan
  margin-top: -4px
  margin-bottom: 1%
div#wrapper
  display: grid
  grid-template-columns: 50vw 50vw
  div
    padding: 2%
    padding-left: 15%
    padding-right: 15%

p#header
  @extend .pax-semibold
  text-align: center
  color: white
  font-size: 30pt
  text-shadow: 0px 0px 5px #102f36
  padding: 1%

.headline
  @extend .pax-semibold
  background: $pax-white
  color: $pax-cyan
  margin-left: -30px
  font-size: 20pt
  padding: 0px 0px 15px 25px
  height: 32px
  position: relative
  white-space: nowrap
  width: 20vw
  &:before
    content: ""
    border-style: solid
    border-width: 0 30px 30px 0
    border-color: transparent #b8b8b8 transparent transparent
    position: absolute
    left: 0px
    top: 47px

ul
  @extend .pax-regular
  background: #007787
  color: white
  padding: 10px 15px
  font-size: 14pt
  text-shadow: 0px 1px 0px #00515c
  line-height: 1.5
  width: 100%
  box-shadow: 0px 0px 5px #102f36 inset
  li:before
    content: "▪"
    color: $pax-darkcyan
    padding-right: 5px
</style>