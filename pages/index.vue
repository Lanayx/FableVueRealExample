<script>
export default {
  fetch({ store, params, redirect }) {
    redirect(302, '/' + store.getters.lang)
  }
}
</script>