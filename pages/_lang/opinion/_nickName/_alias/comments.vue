<template>
  
</template>
<script>
import * as PubApi from '~/api/public.js'
import { SET_CURRENT_COMMENTS, CHANGE_COMMENTS_VISIBILITY } from '~/common/names'
export default {
  name: 'opinionComments',
  beforeRouteLeave(to, from, next) {
    this.$store.dispatchComment(CHANGE_COMMENTS_VISIBILITY, false)
    next()
  },
  fetch({ store, route }) {
    store.dispatchComment(CHANGE_COMMENTS_VISIBILITY, true)
    let currentComments = store.gettersComment.currentComments
    let commentsTask =
      currentComments && (currentComments.alias === route.params.alias)
        ? Promise.resolve(currentComments)
        : PubApi.GetOpinionComments(route.params.alias, route.params.nickName)
    return commentsTask
      .then(data => {
        data.alias = route.params.alias
        store.dispatchComment(SET_CURRENT_COMMENTS, data)
      })
      .catch(error => {
        console.log('Request failed', error)
      })
  }
}
</script>