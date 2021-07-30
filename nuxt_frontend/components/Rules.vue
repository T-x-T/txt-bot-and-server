<template>
  <div id="background-bright">
    <div id="section_rules" class="scrollTarget"></div>
    <h1>Rules</h1>
    <div id="wrapper">
      <div class="grid">
        <div class="hover paxItem rules1">
          <p class="headline">Community</p>
          <ol>
            <li>Treat others like you want to be treated. Insults, discrimination or harassment are not tolerated.</li>
            <li>Everyone plays Minecraft to have a good time. Be tolerant and understanding towards other players and their wishes.</li>
            <li>Spamming is unwished.</li>
            <li>Do not share malicious or pornographic content.</li>
            <li>Be at least 13 years old.</li>
          </ol>
        </div>

        <div class="hover paxItem rules3">
          <p class="headline">In-Game</p>
          <ol>
            <li>Don't attack, harm or kill other players against their will.</li>
            <li>Don't alter or destroy another player's building(s) against their will. When in doubt if a deserted site is still in use, ask a staff member before using it.</li>
            <li>Don't steal. This applies to farms, too: ask its owner first.</li>
            <li>Don't kill or steal other player's mobs.</li>
            <li>Don't use mods that give you an unfair advantage. Allowed mods are optimization, minimap, inventory management and schematic mods.</li>
            <li>Don't exploit game bugs that give you an unfair advantage, such as item duping.</li>
            <li>TNT dupers are allowed.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>  
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div.grid
  width: 75%
  display: grid
  grid-template-columns: 1fr 1fr
  grid-template-rows: 1fr
  gap: 0px 100px
  grid-template-areas: "rules1 rules3" "rules2 rules3"
  margin: 50px auto

  @media screen and ($mobile)
    display: flex
    flex-direction: column
    width: 90%
    .paxItem
      margin-bottom: 20px

.rules1
  grid-area: rules1
.rules2
  grid-area: rules2
  @media screen and ($desktop)
    margin-top: 20px
.rules3
  grid-area: rules3
</style>