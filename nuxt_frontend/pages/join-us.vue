<template>
  <main>
    <Header />
    <div id="wrapper">
      <h1>Apply now!</h1>
      <form method="POST" @submit.prevent="submit()">
        <h4>General Information</h4>
        <div class="formInput">
          <label for="dicordNick">Your Discord Username</label>
          <input v-model="dicordNick" type="text" name="discordNick" placeholder="Your Discord Username" required />
          <span class="hoverInfo">
            Our bot will automatically whitelist you and give you roles on our Discord Server as soon as you joined it and got accepted.
            <br>
            Format like this: Txt#0001 or ExxPlore#3705
            <br><br>
            <button>Get Username automatically</button><br>
            This will redirect you to Discord. Login and follow the instructions. Once you're back here the Username will be entered for you.
          </span>
        </div>

        <div class="formInput">
          <label for="mcIgn">Your Minecraft Username</label>
          <input v-model="mcIgn" type="text" name="mcIgn" placeholder="Your Minecraft Username" required />
          <span class="hoverInfo">You need a legit version bought from mojang. Cracked Accounts won't work.</span>
        </div>

        <div class="formInput">
          <label for="email">Your E-Mail</label>
          <input v-model="email" type="email" name="email" placeholder="Your E-Mail" required />
          <span class="hoverInfo">We will contact you via E-Mail. Staff can't see your E-Mail and we don't give it to any third parties. We will only contact you twice regarding your application.</span>
        </div>

        <div class="formInput">
          <input v-model="country" type="text" @blur="closeCountryDropdown" @input="countryDropdownOpen = true" placeholder="Your Home Country" required />
          <div id="countryList" ref="countryList" v-if="countryDropdownOpen">
            <div v-for="(item, index) in countryList" :key="index">
              <div v-if="countryFitsInput(item)">
                <p class="entry" @click="country = item">{{item}}</p>
              </div>
            </div>
          </div>
          <span class="hoverInfo">We'd like to know where you're from for statistical purposes. Your home country does not influence the outcome of your application. You can tell us to not share your home country publically further down.</span>
        </div>

        <div class="formInput">
          <h4>Birthy Month and Year</h4>
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
          <br>
          <span class="hoverInfo">We'd like to know your approximate age for statistical purposes. Your age is not a crucial factor in your application. You can tell us to not share your age publically further down.</span>
        </div>

        <div class="formInput">
          <h4>About me</h4>
          <span class="hoverInfo hoverInfoTextarea">Tell us something about yourself so we get to know you. What you're doing with your life, what you love about Minecraft, what pizza flavor is your favorite, anything you'd like to share with us.</span>
          <textarea v-model="aboutMe" placeholder="Type text..." maxlength="1500" required></textarea>
          <p class="characterCount">{{1500 - aboutMe.length}} characters remaining</p>
        </div>

        <div class="formInput">
          <h4>Why do you want to join Paxterya?</h4>
          <span class="hoverInfo hoverInfoTextarea">What is your first goal on our server, what project do you want to realize, what do you think you can contribute to our community?</span>
          <textarea v-model="motivation" placeholder="Type text..." maxlength="1500" required></textarea>
          <p class="characterCount">{{1500 - motivation.length}} characters remaining</p>
        </div>
        
        <div class="formInput">
          <h4>Your previous buildings</h4>
          <span class="hoverInfo hoverInfoTextarea">Please show us some screenshots of your previous Minecraft buildings, the ones you're most proud of! Don't worry, it doesn't have to be anything big.</span>
          <textarea v-model="buildImages" placeholder="Type text..." maxlength="1500" required></textarea>
          <p class="characterCount">{{1500 - buildImages.length}} characters remaining</p>
        </div>
        
        <h4>Privacy Settings</h4>
        <label class="checkmarkContainer">
          <span class="label">Publish my "About me" text on the Paxterya Discord server, so other members can get to know me.</span>
          <input type="checkbox" name="accept" v-model="publishAboutMe" />
          <span class="checkmark"></span>
        </label>
        <label class="checkmarkContainer">
          <span class="label">Show my home country publically in places like the member list.</span>
          <input type="checkbox" name="accept" v-model="publishCountry" />
          <span class="checkmark"></span>
        </label>
        <label class="checkmarkContainer">
          <span class="label">Show my age publically in places like the member list.</span>
          <input type="checkbox" name="accept" v-model="publishAge" />
          <span class="checkmark"></span>
        </label>
        <hr>
        <label class="checkmarkContainer">
          <span class="label">I accept the <a target="_blank" href="/privacy-policy">privacy policy</a> of Paxterya. None of my entered data will be published or transmitted to third parties without my consent.</span>
          <input type="checkbox" name="accept" v-model="acceptPrivacyPolicy" required />
          <span class="checkmark"></span>
        </label>
        <label class="checkmarkContainer">
          <span class="label">I accept the <a target="_blank" href="/#section_rules">rules of Paxterya</a>. I'm aware that a violation of those rules can lead to an exclusion from the Paxterya community.</span>
          <input type="checkbox" name="accept" v-model="acceptRules" required />
          <span class="checkmark"></span>
        </label>

        <button type="submit" id="submit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>  
          Submit
        </button>
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

.checkmark
  position: relative
  left: inherit
  right: 35px
  bottom: 25px
  display: block

.checkmarkContainer
  margin: 0

hr
  margin-bottom: 20px

button#submit
  font-size: 24pt
  width: 40vw
  margin-left: 5vw
  margin-right: 5vw
  height: 75px
  filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  &:hover
    filter: drop-shadow( 0px 0px 16px rgba(0, 0, 0, .9))
    background: $pax-cyan
  svg
    height: 32pt
    transform: rotate(45deg)
    margin-bottom: -4pt

div.formInput
  span.hoverInfo
    display: none
    @extend .pax-p
    color: white
    position: absolute
    z-index: 10
    margin-top: -70px
    margin-left: -22.5vw
    padding: 25px
    padding-right: 2.5vw
    width: 20vw
    button:hover
      background: $pax-cyan
      filter: drop-shadow( 0px 0px 8px rgba(0, 0, 0, .7))
  span.hoverInfoTextarea
    margin-top: -25px
  &:hover
    span.hoverInfo
      display: initial

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
    validBirthYears: [],
    aboutMe: "",
    motivation: "",
    buildImages: "",
    publishAboutMe: false,
    publishCountry: false,
    publishAge: false,
    acceptPrivacyPolicy: false,
    acceptRules: false,
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