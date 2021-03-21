<template>
  <main>
    <Header />
    <div id="wrapper">
      <h1>Apply now!<span class="subtitle">Become a Paxteryan</span></h1>
      <form method="POST" @submit.prevent="submit()">
        <h4 v-if="!discordId">Step 1:</h4>
        <div v-if="!discordId">
          <button id="discordLogin" type="button" :onclick="`window.location.href = '${$config.discordOauthJoinUs}'`">Authenticate with Discord</button>
          <p>
            Authenticate with Discord to start your application. We will just get your visible data (nickname, discriminator, ID). We need this data to give you roles automatically.
          </p>
          <p>
            <b>Please log in with the Discord account you'll join our server with! If you use a different account, we won't be able to whitelist you.</b>
          </p>
        </div>

        <h4 v-if="discordId">Hi {{discordNick}}</h4>
        <div v-if="discordId">
          <div class="formInput">
            <label for="mcIgn">Your Minecraft Username</label>
            <input v-model="mcIgn" @blur="validateMcIgn" @focus="makeActive" type="text" name="mcIgn" placeholder="Your Minecraft Username" required />
            <span class="hoverInfo" v-if="!ignIsWrong">You need a legit version bought from Mojang. Cracked accounts won't work.</span>
            <p id="ignWrong" v-if="ignIsWrong">The entered Minecraft username seems to be invalid. You need a legit version bought from Mojang. Cracked accounts won't work.</p>
          </div>

          <div class="formInput">
            <label for="email">Your E-Mail</label>
            <input v-model="email" @focus="makeActive" @blur="makeInactive" type="email" name="email" placeholder="Your E-Mail" required />
            <span class="hoverInfo">We will contact you via e-mail. Staff can't see your e-mail and we don't give it to any third parties. We will only contact you twice regarding your application.</span>
          </div>

          <div class="formInput">
            <input v-model="country" @focus="makeActive" @blur="closeCountryDropdown" @input="countryDropdownOpen = true" type="text" placeholder="Your Home Country" required />
            <div id="countryList" ref="countryList" v-if="countryDropdownOpen">
              <div v-for="(item, index) in countryList" :key="index">
                <div v-if="countryFitsInput(item)">
                  <p class="entry" @click="country = item">{{item}}</p>
                </div>
              </div>
            </div>
            <span class="hoverInfo">We'd like to know where you're from for our statistics. Your home country does not influence the outcome of your application. You can choose not to publish your home country further down.</span>
          </div>

          <div class="formInput">
            <p>Birth Month and Year</p>
            <select v-model="birthMonth" @focus="makeActive" @blur="makeInactive" required>
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

            <select v-model="birthYear" @focus="makeActive" @blur="makeInactive" required>
              <option v-for="(item, index) in validBirthYears" :key="index" :value="item" :label="item">{{item}}</option>
            </select>
            <br>
            <span class="hoverInfo">We'd like to know your approximate age for our statistics. Your age is not a crucial factor in your application. You can choose not to publish your age further down.</span>
          </div>
          <br><br>
          <div class="formInput active">
            <h4>About me</h4>
            <span class="hoverInfo hoverInfoTextarea">Tell us something about yourself so we get to know you. What you're doing with your life, what you love about Minecraft, what pizza flavor is your favorite, anything you'd like to share with us!</span>
            <textarea v-model="aboutMe" placeholder="Type text..." maxlength="1500" required></textarea>
            <p class="characterCount">{{1500 - aboutMe.length}} characters remaining</p>
          </div>
          <br><br>
          <div class="formInput active">
            <h4>Why do you want to join Paxterya?</h4>
            <span class="hoverInfo hoverInfoTextarea">What is your first goal on our server, what project do you want to realize, what do you think you can contribute to our community?</span>
            <textarea v-model="motivation" placeholder="Type text..." maxlength="1500" required></textarea>
            <p class="characterCount">{{1500 - motivation.length}} characters remaining</p>
          </div>
          <br><br>
          <div class="formInput active">
            <h4>Your previous buildings</h4>
            <span class="hoverInfo hoverInfoTextarea">
              Please show us some screenshots of your previous Minecraft buildings, the ones you're most proud of! Don't worry, it doesn't have to be anything big.
              <br>
              If you don't know where to upload your images, use <a href="https://imgur.com/upload" target="blank">imgur</a> and paste the link here.
            </span>
            <textarea v-model="buildImages" placeholder="Type text..." maxlength="1500" required></textarea>
            <p class="characterCount">{{1500 - buildImages.length}} characters remaining</p>
          </div>
          <br><br>
          <h4>Privacy Settings</h4>
          <label class="checkmarkContainer">
            <span class="label">Publish my "About me" text on the Paxterya Discord server, so other members can get to know me.</span>
            <input type="checkbox" name="accept" v-model="publishAboutMe" />
            <span class="checkmark"></span>
          </label>
          <label class="checkmarkContainer">
            <span class="label">Publish my home country in the member list.</span>
            <input type="checkbox" name="accept" v-model="publishCountry" />
            <span class="checkmark"></span>
          </label>
          <label class="checkmarkContainer">
            <span class="label">Publish my age in the member list.</span>
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

          <button v-if="!submitSuccess" type="submit" id="submit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>  
            Submit
          </button>
          <div v-if="submitSuccess">
            <p>
              <svg class="status" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <br>
              Success!
              <br>
              Our staff will soon send you a response via e-mail. An automatic arrival notice has already been sent. If you didn't receive the arrival notice, please <NuxtLink to="/#section_contactForm">contact us</NuxtLink>.<br>
              While waiting for your response, feel free to <a href="https://discord.gg/mAjZCTG" target="blank"><b>join our Discord</b></a> to already get in touch with the community!<br><br>
            </p>
            <h4>See you soon!</h4>  
          </div>
          <div v-if="errorMessage">
            <p>
              <svg class="status" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <br>
              That didn't work and here's why: <br>
              {{errorMessage}} <br>
              You should tell us about that on our <a href="https://discord.gg/mAjZCTG" target="blank"><b>Discord Server</b></a>.
            </p>
          </div>
        </div>
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
  overflow-x: hidden
  margin-top: 100px

.subtitle
  text-align: center
  margin: -7px 0 7px 0
  display: block
  color: $pax-white
  font-size: 12pt

h4
  color: white
  font-size: 22pt

form
  width: 50vw
  padding: 1vw
  margin-top: 25px
  margin-bottom: 100px
  box-shadow: 0px 0px 25px #102f36
  @media screen and ($mobile)
    width: 98vw
    box-shadow: none

p#ignWrong
  color: $pax-red

input
  color: $pax-white
  &::placeholder
    opacity: 0.8
  @media screen and ($mobile)
    width: 100%

textarea
  @media screen and ($mobile)
    width: 98%

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
  input
    width: 0

hr
  margin-bottom: 20px

button#submit
  font-size: 24pt
  width: 40vw
  margin-left: 5vw
  margin-right: 5vw
  height: 75px
  svg
    height: 32pt
    transform: rotate(45deg)
    margin-bottom: -4pt
  @media screen and ($mobile)
    width: 90%

div.formInput
  span.hoverInfo
    display: none
    @extend .pax-regular
    color: $pax-white
    position: absolute
    z-index: 10
    margin-top: -70px
    margin-left: -22.5vw
    padding: 25px
    padding-right: 2.5vw
    width: 20vw
    a:hover
      color: $pax-white
    @media screen and ($mobile)
      margin: 0
      padding: 0
      position: relative
      opacity: 0.8
  span.hoverInfoTextarea
    margin-top: -25px
  &:hover
    @media screen and ($desktop)
      span.hoverInfo
        display: initial
div.active
  @media screen and ($mobile)
    span.hoverInfo
      display: initial

svg.status
  color: $pax-white
  height: 48px

</style>

<script>
import countries from "~/assets/countries.json";
export default {
  head: {
    title: "Apply"
  },

  data: () => ({
    discordId: null,
    discordNick: null,
    mcIgn: "",
    ignIsWrong: false,
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
    submitSuccess: null,
    errorMessage: "",
  }),

  async fetch(){
    this.generateValidBirthYears();
    await this.turnCodeintoDiscordNick();
  },

  mounted(){
    window.history.replaceState({}, null, "/join-us");
  },

  methods: {
    async submit(){
      const application = {
        discord_id: this.discordId,
        mc_ign: this.mcIgn,
        email_address: this.email,
        country: this.country,
        birth_month: this.birthMonth,
        birth_year: this.birthYear,
        about_me: this.aboutMe,
        motivation: this.motivation,
        build_images: this.buildImages,
        publish_about_me: this.publishAboutMe,
        publish_age: this.publishAge,
        publish_country: this.publishCountry,
        accept_rules: this.acceptRules,
        accept_privacy_policy: this.acceptPrivacyPolicy
      }

      try{
        const res = await this.$axios.post("/api/application", application);
        if(res.status === 201){
          this.submitSuccess = true;
          this.errorMessage = "";
        }else{
          this.errorMessage = res.data.err;
          this.submitSuccess = false;
        }
      }catch(e){
        this.errorMessage = e.response.data.err;
        this.submitSuccess = false;
      }
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
    closeCountryDropdown(e){
      this.makeInactive(e);

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
    },

    async turnCodeintoDiscordNick(){
      if(this.$route.query.code){
        try{
          const res = await this.$axios.$get("/api/discorduserfromcode?code=" + this.$route.query.code);
          this.discordNick = res.discordNick;
          this.discordId = res.discordId;
        }catch(e){
          console.error("Received error trying to turn code into discordId: ", e.response.data.err);
        }
      }
    },

    async validateMcIgn(e){
      this.makeInactive(e);

      if(!this.mcIgn) return;
      const res = await this.$axios.$get(`/users/profiles/minecraft/${encodeURIComponent(this.mcIgn)}?at=${Date.now()}`)
      if(!res){
        this.mcIgn = "";
        this.ignIsWrong = true;
      }else{
        this.mcIgn = res.name;
        this.ignIsWrong = false;
      }
    },

    makeActive(e){
      e.target.parentNode.classList.add("active");
    },

    makeInactive(e){
      e.target.parentNode.classList.remove("active");
    }
  },
}
</script>