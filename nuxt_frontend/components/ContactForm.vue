<template>
  <div class="background">
    <div id="section_contactForm" class="scrollTarget"></div>
    <h1>Contact us</h1>
    <div id="wrapper" class="hover">
      <p>For inquiries of any kind, please use the contact form below or send an e-mail to <a href="mailto:contact@paxterya.com">contact@paxterya.com</a>.<br>If you want to become a member of the Paxterya community, please use the <a href="join-us.html">application form</a>.</p>
      <form method="POST" @submit.prevent="submit()">
        <label for="name">Your Name</label>
        <input v-model="name" type="text" name="name" placeholder="Your Name" required />
        <span class="bar"></span>

        <label for="email">Your E-Mail</label>
        <input v-model="email" type="email" name="email" placeholder="Your E-Mail" required />
        <span class="bar"></span>

        <label for="subject">Subject</label>
        <input v-model="subject" type="text" name="subject" placeholder="Subject" required />
        <span class="bar"></span>

        <div>
          <h3>Your message</h3>
          <textarea v-model="text" maxlength="10000" placeholder="Type here..."></textarea>
        </div>

        <label class="container">
          <span class="label">I accept the privacy policy of Paxterya. None of my entered data will be published or transmitted to third parties without my consent.</span>
          <input type="checkbox" name="accept" required />
          <span class="checkmark"></span>
        </label>
        
        <button type="submit">Send</button>
      </form>
      <p v-if="error">That didn't work: {{error}}</p>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@import ~/assets/_vars.sass

div.background
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
  @media screen and ($mobile)
    width: 100vw

div#wrapper
  background: $pax-cyan
  width: 50%
  margin: 2%
  padding: 1%
  @media screen and ($mobile)
    width: 90vw
    margin: 50px 0 50px 0
    button
      font-size: 20pt
      background: $pax-darkcyan
      padding: 10px 20px 10px 20px
      margin: 1vw 5vw 5vw 5vw

input
  @extend .pax-regular
  padding: 10px 5px 5px 5px
  border: none
  border-bottom: 1px solid #bebebe
  width: 100%
  font-size: 12pt
  margin: 1% 0 1% 0
  background: transparent
  &:focus
    outline: none
    box-shadow: 0px 0px 15px #102f36
  &::placeholder
    color: white
    opacity: 1
  @media screen and ($mobile)
    width: 90vw
    padding-left: 0
    padding-right: 0

textarea
  width: 100%
  height: 250px
  margin-bottom: 1%
  resize: vertical
  padding: 5px
  outline: none
  border: 2px solid white
  &:focus
    border: 2px solid $pax-darkcyan
    box-shadow: 0px 0px 15px #102f36
  @media screen and ($mobile)
    width: 85vw

label
  position: absolute
  top: -5px
  left: 0
  font-size: 14px
  opacity: 0
  &.container
    position: relative
    opacity: 1
    font-size: 12pt
    color: #1a1a1a
    font-weight: normal
    @extend .pax-regular
    color: white

.checkmark
  position: absolute
  top: -2px
  left: 0
  height: 25px
  width: 25px
  background-color: $pax-gray
  border: 1px solid #bebebe
  border-radius: 7px
  &:hover
    box-shadow: 0px 0px 15px #102f36
  &:after
    content: ""
    position: absolute
    display: none
    left: 9px
    top: 5px
    width: 5px
    height: 10px
    border: solid $pax-white
    border-width: 0 3px 3px 0
    -webkit-transform: rotate(45deg)
    -ms-transform: rotate(45deg)
    transform: rotate(45deg)

.container
  display: block
  padding-left: 35px
  cursor: pointer
  font-size: 22px
  -webkit-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none
  margin: 20px 0 10px 0
  &:hover input ~ .checkmark
    background-color: #bebebe
  input:checked ~ .checkmark
    background-color: $pax-cyan
    border-color: $pax-darkcyan
  .label
    @extend .pax-regular
  input
    position: absolute
    opacity: 0
    cursor: pointer
    height: 0
    width: 0
    &:checked ~ .checkmark:after
      display: block

button:hover
  background-color: $pax-cyan
  box-shadow: 0px 0px 15px #102f36

a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan
</style>

<script>
export default {
  data: () => ({
    name: "",
    email: "",
    subject: "",
    text: "",
    error: null
  }),

  methods: {
    submit: async function (){
      try {
        const res = await this.$axios.post("/api/contact", {
        name: this.name,
        email: this.email,
        subject: this.subject,
        text: this.text
        });

        console.log(res);
        this.name = "";
        this.email = "";
        this.subject = "";
        this.text = "";

      }catch(e){
        this.error = e.response.data.err; 
      }
    }
  }
}
</script>