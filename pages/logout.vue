<script>
import {AUTH_LOGOUT} from '~/common/names'
export default {
  fetch({ store, redirect }) {
    store.dispatchAuth(AUTH_LOGOUT)
    redirect(302, '/' + store.getters.lang)
  }
}
</script>