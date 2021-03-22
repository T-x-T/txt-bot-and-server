<template>
  <div class="background-dark">
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

        <label class="checkmarkContainer">
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

div.background-dark
  display: flex
  justify-content: center
  align-items: center
  flex-direction: column
  @media screen and ($mobile)
    width: 100vw
div#wrapper
  width: 50%
  margin: 20px 0 40px 0
  @media screen and ($mobile)
    width: 90vw
    margin: 50px 0 50px 0
p
  margin-bottom: 10px
a
  color: $pax-white
  @extend .pax-semibold
  &:hover
    color: $pax-lightcyan
h3
  color: $pax-white
  margin-bottom: 5px
button
  width: 100%
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