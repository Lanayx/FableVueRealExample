export default function({ store, redirect }) {
  if (!store.gettersAuth.isAuthenticated) {
    return redirect(302, '/' + store.getters.lang)
  }
}
