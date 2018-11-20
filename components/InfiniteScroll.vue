<template>
  <div ref="wrapData">
    <slot></slot>
    <mugen-scroll :handle-on-mount="false" :handler="loadMoreData" :should-handle="!loading" scroll-container="wrapData" v-if="!allDataLoaded">
    </mugen-scroll>
  </div>  
</template>
<script>
export default {
  name: 'infiniteScroll',
  props: ['data', 'loadStep'],
  data() {
    return {
      allDataLoaded: false,
      loading: false
    }
  },
  methods: {
    loadMoreData() {
      this.loading = true
      this.loadStep()
        .then(newData => {
          if (newData && newData.length > 0) {
            this.data.push(...newData)
            this.loading = false
          } else {
            this.allDataLoaded = true
          }
        })
        .catch((reason) => {
          this.loading = false
          this.allDataLoaded = true
        })
    }
  }
}
</script>
