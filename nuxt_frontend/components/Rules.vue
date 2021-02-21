<template>
  <div id="background">
    <h1>Rules</h1>
    <div id="wrapper">
      <div class="hover paxItem">
        <p class="headline">Community</p>
        <ul>
          <li>Do not treat others in ways that you would not like to be treated. Any kind of insult, discrimination or harassment is unwished.</li>
          <li>Everyone is playing Minecraft to have a good time. To ensure a good time on Paxterya, be tolerant and understanding towards other players and respect their wishes.</li>
          <li>Spamming is unwished.</li>
          <li>Do not send links to websites with malicious or pornographic content.</li>
        </ul>
      </div>

      <div class="hover paxItem">
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

      <div class="hover paxItem">
        <p class="headline">Shopping District</p>
        <ul>
          <li>A 16x16 plot can be purchased for the price of 1 diamond block from staff.</li>
          <li>All proceeds from selling plots go towards a big diamond pile, which may be used for community events.</li>
        </ul>
      </div>

      <div class="hover paxItem">
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

div#background
  @media screen and ($mobile)
    width: 100vw

div
  margin-top: -4px
  padding-bottom: 1%

div#wrapper
  display: grid
  grid-template-columns: 50vw 50vw
  div
    padding: 2%
    padding-left: 15%
    padding-right: 15%
  @media screen and ($mobile)
    display: flex
    flex-direction: column
    .paxItem
      margin-bottom: 50px
    .headline
      width: 70vw
</style>