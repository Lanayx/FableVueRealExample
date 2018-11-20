<template>
  <v-container fluid text-xs-center id="enter" class="pa-0">
    <v-layout column fill-height>
      <commonHeader title="Enter the site"></commonHeader>  
      <v-layout>
        <v-flex xs6>
            <h2>External Enter</h2>     
            <div id="btnGoogleSignin"></div>
            {{name}}
        </v-flex>
        <v-flex xs6 class="grey darken-4 white--text">
          <h2>Email enter</h2> 
          <v-form class="ma-4">
            <v-text-field
              label="Email"
              :type="'email'"            
              required
              dark
            ></v-text-field>
            <v-text-field
              label="Password"
              :type="'password'"            
              required
              dark
            ></v-text-field>
          </v-form>
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>
</template>

<script>
import { GOOGLE_AUTH } from '~/common/names.js'

function renderButton() {
  gapi.signin2.render('btnGoogleSignin', {
    scope: 'profile email',
    width: 240,
    height: 50,
    longtitle: true,
    theme: 'dark',
    onsuccess: onSuccess.bind(this),
    onfailure: onFailure.bind(this)
  })
}
function onSuccess(googleUser) {
  let name = googleUser.getBasicProfile().getName()
  this.name = name
  let idToken = googleUser.getAuthResponse().id_token
  this.$store.dispatchAuth(GOOGLE_AUTH, idToken)
    .then(() => {
      alert('Signin successful!')
      this.$router.push('/')
    })
    .catch(error => {
      console.error(error)
    })
}
function onFailure(error) {
  console.log(error)
}

export default {
  name: 'enter',
  data() {
    return {
      name: ''
    }
  },
  mounted() {
    renderButton.call(this)
  }
}
</script>

<style scoped>
</style>
