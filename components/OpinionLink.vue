<template>
  <div v-if="opinion">
    <template v-if="$store.gettersAuth.nickName">
      <router-link id="btnMyOpinion" tag="a" :to="`/${$store.getters.lang}/opinion/${$store.gettersAuth.nickName}/${opinion.opinionAlias}`">My Opinion</router-link>
    </template>
    <template v-else>
      My Opinion <i>(Please fill in your nickName at the dashboard to get link)</i>
    </template>
  </div>  
  <div v-else>
    <router-link id="btnAddOpinion" tag="a" :to="`/${$store.getters.lang}/problem/${$route.params.alias}/opinion`">Add opinion</router-link>
  </div>
</template>
<script>
export default {
  name: 'opinionLink',
  props: ['problem'],
  computed: {
    opinion() {
      return this.$store.getters.getOpinionByProblemAlias(this.problem.alias)
    }
  }

}
</script>
