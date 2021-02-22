<template>
  <main>
    <Header />
    <div id="wrapper">
      <h1>Apply now!</h1>
      <form method="POST" @submit.prevent="submit()">
        <h4>General Information</h4>
        <label for="dicordNick">Your Discord Username</label>
        <input v-model="dicordNick" type="text" name="discordNick" placeholder="Your Discord Username" required />
  
        <label for="mcIgn">Your Minecraft Username</label>
        <input v-model="mcIgn" type="text" name="mcIgn" placeholder="Your Minecraft Username" required />
        
        <label for="email">Your E-Mail</label>
        <input v-model="email" type="email" name="email" placeholder="Your E-Mail" required />

        <input v-model="country" type="text" @blur="closeCountryDropdown" @input="countryDropdownOpen = true" placeholder="Your Home Country" required />
        <div id="countryList" ref="countryList" v-if="countryDropdownOpen">
          <div v-for="(item, index) in countryList" :key="index">
            <div v-if="countryFitsInput(item)">
              <p class="entry" @click="country = item">{{item}}</p>
            </div>
          </div>
        </div>

        <h4>Your approximate Age</h4>
        <select v-model="birthMonth" required>
          <option value="01" label="January">January</option>
          <option value="02" label="February">February</option>
          <option value="03" label="March">March</option>
          <option value="04" label="April">April</option>
          <option value="05" label="May">May</option>
          <option value="06" label="June">June</option>
          <option value="07" label="July">July</option>
          <option value="08" label="August">August</option>
          <option value="09" label="September">September</option>
          <option value="10" label="October">October</option>
          <option value="11" label="November">November</option>
          <option value="12" label="December">December</option>
        </select>

        <select v-model="birthYear" required>
          <option v-for="(item, index) in validBirthYears" :key="index" :value="item" :label="item">{{item}}</option>
        </select>
      </form>
    </div>
    <Footer />
  </main>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div#wrapper
  display: flex
  flex-direction: column
  align-items: center

form
  width: 50vw
  padding: 1vw
  margin-top: 25px
  margin-bottom: 100px
  box-shadow: 0px 0px 25px #102f36
  @media screen and ($mobile)
    width: 90vw

input
  color: white

select#country
  display: none

div#countryList
  position: absolute
  z-index: 5
  margin-top: -14px
  max-height: 200px
  overflow-y: scroll
  width: max-content

p.entry
  @extend .pax-regular
  background: $pax-cyan
  font-size: 12pt
  border-bottom: 1px solid #bebebe
  padding: 10px 2vw 10px 1vw
  &:hover
    cursor: pointer
    background: $pax-darkcyan

</style>

<script>
import countries from "~/assets/countries.json";
export default {
  data: () => ({
    dicordNick: null,
    mcIgn: null,
    email: null,
    country: null,
    countryDropdownOpen: false,
    countryList: Object.keys(countries),
    birthMonth: null,
    birthYear: null,
    validBirthYears: []
  }),

  mounted(){
    this.generateValidBirthYears();
  },

  methods: {
    async submit(){

    },
    countryFitsInput(currentCountry){
      let fits = false;

      if(currentCountry.toLowerCase().includes(this.country.trim().toLowerCase())){
        fits = true;
      }
      countries[currentCountry].alternatives.forEach(x => {
        if(x.toLowerCase().includes(this.country.trim().toLowerCase())){
          fits = true;
        }
      });

      return fits;
    },
    closeCountryDropdown(){
      setTimeout(() => {
        this.countryDropdownOpen = false
      
        let countryOk = false;
        this.countryList.forEach(x => {
          if(x === this.country) countryOk = true;
        });
        if(!countryOk) this.country = "";

      }, 150);
    },
    generateValidBirthYears(){
      const curYear = new Date().getFullYear();
      for(let i = curYear - 12; i > curYear - 113; i--) this.validBirthYears.push(i);
    }
  },
}
</script>