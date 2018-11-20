let mapActions = (store, prefix) => {
  return (methodName, obj) =>  store.dispatch(prefix + methodName, obj)
}

let mapGetters = (store, prefix) => {
  let obj = {}
  var commentGetters = Object.keys(store.getters).filter(key => key.indexOf(prefix) === 0)
  for (let g of commentGetters) {
    let propName = g.substr(prefix.length)
    Object.defineProperty(obj, propName, {
      get: () => store.getters[prefix + propName]
    })
  }
  return obj
}

export const storeModule = store => {
  // called when the store is initialized
  store.dispatchComment = mapActions(store, 'comment/')
  store.gettersComment = mapGetters(store, 'comment/') 

  store.dispatchAuth = mapActions(store, 'auth/')
  store.gettersAuth = mapGetters(store, 'auth/')

  store.dispatchCountry = mapActions(store, 'country/')
  store.gettersCountry = mapGetters(store, 'country/')

  store.dispatchDivision = mapActions(store, 'division/')
  store.gettersDivision = mapGetters(store, 'division/')
}
