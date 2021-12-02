<template>
  <main>
    <Header />
    <div id="wrapper">
      <h1>Apply now!<span class="subtitle">Become a Paxteryan</span></h1>

      <div class="grid" v-if="!discordId">
        <p class="join2">To gain access to our Minecraft server, you will need to write an application. We're looking forward to hearing from you!</p>
        
        <ol class="join3">
          <li>Authenticate with Discord</li>
          <li>Write your application</li>
          <li>Wait for the response mail</li>
        </ol>
      </div>

      <form method="POST" @submit.prevent="submit()">

        <div class="paxItem" v-if="!discordId">
          <p class="headline" v-if="!discordId">Step 1:</p>
          <div class="ItemContainer">
            <div v-if="!discordId">
              <p>
                Authenticate with Discord to start your application. We will just get your visible data (nickname, discriminator, ID). We need this data to give you roles automatically.
              </p>
              <p>
                <b>Please log in with the Discord account you'll join our server with! If you use a different account, we won't be able to whitelist you.</b>
              </p>
              <button id="discordLogin" type="button" :onclick="`window.location.href = '${$config.discordOauthJoinUs}'`">Authenticate with Discord</button>
            </div>
          </div>
        </div>

        <div class="paxItem" v-if="discordId">
          <p class="headline" v-if="discordId">Hi {{discordNick}}!</p>
          <div class="ItemContainer personalInfo">
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
                <input id="countryInput" v-model="country" @focus="makeActive" @blur="closeCountryDropdown" @input="countryDropdownOpen = true" type="text" placeholder="Your Home Country" required />
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
                <h3>Birth Month and Year</h3>
                <select v-model="birthMonth" @focus="makeActive" @blur="makeInactive" required>
                  <option selected value="01" label="January">January</option>
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
                <span class="hoverInfo">We'd like to know your approximate age for our statistics. Your age is not a crucial factor in your application. <b>However, you need to be at least 13 years old!</b> You can choose not to publish your age further down.</span>
              </div>
            </div>
          </div>

            <div class="formInput active">
              <p class="headline small">About me</p>
              <span class="hoverInfo hoverInfoTextarea">Tell us something about yourself so we get to know you. What you're doing with your life, what you love about Minecraft, what pizza flavor is your favorite, anything you'd like to share with us! (150-1500 characters)</span>
              <textarea v-model="aboutMe" placeholder="Type text..." maxlength="1500" minlength="150" required></textarea>
              <p class="characterCount">{{1500 - aboutMe.length}} characters remaining</p>
            </div>
            <div class="formInput active">
              <p class="headline small">Why do you want to join Paxterya?</p>
              <span class="hoverInfo hoverInfoTextarea">What is your first goal on our server, what project do you want to realize, what do you think you can contribute to our community? (150-1500 characters)</span>
              <textarea v-model="motivation" placeholder="Type text..." maxlength="1500" minlength="150" required></textarea>
              <p class="characterCount">{{1500 - motivation.length}} characters remaining</p>
            </div>
            <div class="formInput active">
              <p class="headline small">Your previous buildings</p>
              <span class="hoverInfo hoverInfoTextarea">
                Please show us some screenshots of your previous Minecraft buildings, the ones you're most proud of! Don't worry, it doesn't have to be anything big.
                <br>
                If you don't know where to upload your images, use imgur or copy an image from discord and paste the link here.
              </span>
              <textarea v-model="buildImages" placeholder="Type text..." maxlength="1500" required></textarea>
              <p class="characterCount">{{1500 - buildImages.length}} characters remaining</p>
            </div>
            
            <p class="headline small">Privacy Settings</p>
            <div class="ItemContainer">
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
              <span class="divider"></span>
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
            </div>

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

main
  margin-top: 120px

div.grid
  display: grid
  grid-template-columns: 1fr 1fr
  grid-template-rows: 140px
  gap: 0px 0px
  grid-template-areas: "join2 join3"
  width: fit-content
  margin: 0 auto
  margin-top: 20px
  padding-bottom: 10px
  @media screen and ($mobile)
    grid-template-columns: 1fr
    grid-template-rows: 1fr 1fr
    grid-template-areas: "join2" "join3"
    width: 90%
  p
    background: $pax-darkestcyan
    width: 275px
    padding: 10px 20px
    box-sizing: border-box
    @media screen and ($mobile)
      width: 100%
      margin-bottom: 20px
  ol
    border: none
    background: none
    padding: 0
    li
      background: $pax-darkestcyan
      padding: 5px 15px
      margin-bottom: 7px
      @media screen and ($mobile)
        padding: 5px 20px 5px 30px
      &::before
        margin: -5px 0 0 -45px
        font-size: 100%
        padding: 5px 12px
.join2
  grid-area: join2
.join3
  grid-area: join3
  align-self: start

.ItemContainer
  @extend .pax-regular
  background: $pax-darkestcyan
  color: white
  padding: 10px 15px
  font-size: 12pt
  line-height: 1.5
  width: 100%
  border-left: 5px solid $pax-darkmodecyan1
  list-style-type: none
  box-sizing: border-box
  p
    width: 75%
    @media screen and ($mobile)
      width: 100%

.headline
  margin-top: 20px

button#discordLogin
  width: 75%
  margin: 20px 0
  &:hover
    transform: scale(.95)
  @media screen and ($mobile)
    width: 100%

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

form
  width: 50vw
  margin-bottom: 100px
  @media screen and ($mobile)
    width: 90%

p#ignWrong
  background: $pax-red
  color: $pax-white
  padding: 5px

select#country
  display: none

#countryInput
  position: relative

div#countryList
  position: absolute
  z-index: 5
  top: 100%
  max-height: 300px
  overflow-y: scroll
  width: 300px
  padding: 0
  margin: 0

p.entry
  @extend .pax-regular
  background: $pax-cyan
  font-size: 12pt
  border-bottom: 1px solid $pax-lightcyan
  padding: 10px 2vw 10px 1vw
  &:hover
    cursor: pointer
    background: $pax-darkcyan

span.divider
  margin-top: 15px
  border-bottom: 3px solid $pax-lightcyan
  display: block
  width: 100%

button#submit
  font-size: 16pt
  width: 100%
  margin-top: 20px
  svg
    height: 20pt
    transform: rotate(45deg)
    margin-bottom: -4pt

div.formInput
  position: relative
  span.hoverInfo
    opacity: 0
    @extend .pax-regular
    color: $pax-white
    position: absolute
    width: 20vw
    right: 50%
    bottom: 50%
    transform: translateY(50%)
    background: $pax-darkestcyan
    border-radius: 30px 0 0 30px
    padding: 10px 20px
    user-select: none
    z-index: -1
    a
      color: $pax-lightcyan
      &:hover
        color: $pax-white
    @media screen and ($mobile)
      position: relative
      width: 100%
      right: 0
      transform: none
      z-index: 10
      padding: 5px 15px
      display: block
      border-radius: 0px
      box-sizing: border-box
      .personalInfo &
        display: none
  
  &:hover
    @media screen and ($desktop)
      span.hoverInfo
        opacity: 1
        right: 100%
div.active
  @media screen and ($mobile)
    span.hoverInfo
      opacity: 1

svg.status
  color: $pax-white
  height: 48px

.checkmarkContainer a
  color: $pax-lightcyan
  &:hover
    color: $pax-white
  

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
    await this.turnCodeintoDiscordNick();
    this.generateValidBirthYears();
  },

  mounted(){
    window.history.replaceState({}, null, "/join-us");
  },

  methods: {
    async submit(){
      if(!this.buildImages.includes("https://cdn.discordapp.com") && !this.buildImages.includes("https://media.discordapp.com") && !this.buildImages.includes("https://cdn.discord.com") && !this.buildImages.includes("https://media.discord.com") && !this.buildImages.includes("https://imgur.com") && !this.buildImages.includes("https://i.imgur.com")) {
        window.alert("Please put image links from imgur or discord into the previous builds section");
        return;
      }

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