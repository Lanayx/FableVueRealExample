<template>
  <div>
    <svg :width="width" :height="height" :viewBox="mapViewBox"
      @wheel="mapPinch" v-hammer:pinch="mapPinch" v-hammer:pan="mapPan" 
      v-hammer:panstart="mapPanStart">
      <g>              
        <path v-for="(path,i) in allCountriesPaths" :key="i"
          :d="geoPath().projection(projection())(path)"
          :fill="problem.stats.find(stat => stat.countryId === path.id) ? 'red' : 'black'"
          stroke="white"
          :stroke-width="strokeWidth"
          @mouseover="onCountryMouseOver($event, path)"
          @mouseout="onCountryMouseOut()"
        />
      </g>
    </svg>
    <div class="tooltip" :style="{left: tooltip.left, top: tooltip.top, opacity: (tooltip.visible ? 1 : 0)}">
      {{tooltip.countryName}}
      <br/>
      {{tooltip.yesCount}}/{{tooltip.noCount}}
    </div>
  </div>
</template>
<script>

import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import * as Http from '~/common/http.js'

export default {
  name: 'worldMap',
  props: ['problem', 'width', 'height'],
  data() {
    return {
      mapMinX: 0,
      mapMinY: 0,
      mapWidth: this.width,
      mapHeight: this.height,
      viewCenter: { x: this.width / 2, y: this.height / 2 },
      strokeWidth: 0.5,
      allCountriesPaths: {},
      tooltip: {
        visible: false,
        left: 0,
        top: 0,
        countryName: '',
        yesCount: 0,
        noCount: 0
      },
      panStart: { x: 0, y: 0, offsetX: 0, offsetY: 0 }
    }
  },
  computed: {
    mapViewBox() {
      return `${Math.round(this.mapMinX)} ${Math.round(this.mapMinY)} ${Math.round(this.mapWidth)} ${Math.round(this.mapHeight)}`
    }
  },
  mounted() {
    Http.fetchJson('https://unpkg.com/world-atlas@1/world/110m.json').then(worldData => {
      this.allCountriesPaths = feature(worldData, worldData.objects.countries).features
    })
  },
  methods: {
    geoPath() {
      return geoPath()
    },
    projection() {
      return geoMercator()
        .scale(100)
        .translate([this.width / 2, this.height / 1.5])
    },
    onCountryMouseOver(event, path) {
      let country = this.$store.gettersCountry.getCountryById(path.id)
      let stats = this.problem.stats.find(stat => stat.countryId === path.id)
      this.tooltip.yesCount = stats ? stats.yesCount : 0
      this.tooltip.noCount = stats ? stats.noCount : 0
      this.tooltip.countryName = country ? country.N : ''
      this.tooltip.visible = true
      this.tooltip.left = event.layerX + 'px'
      this.tooltip.top = event.layerY + 'px'
    },
    onCountryMouseOut() {
      this.tooltip.visible = false
    },
    mapPinch(event) {
      let mapWidth, mapHeight
      let stepDivisor = 20
      let layerX = event.layerX || event.srcEvent.layerX
      let layerY = event.layerY || event.srcEvent.layerY
      let initialRatio = this.width / this.mapWidth
      let initialLayerX = this.mapMinX + layerX / initialRatio
      let initialLayerY = this.mapMinY + layerY / initialRatio
      if (event.deltaY > 0) {
        mapWidth = this.mapWidth + this.width / stepDivisor
        mapHeight = this.mapHeight + this.height / stepDivisor
        let ratio = mapWidth / this.mapWidth
        if (mapWidth > 1000) {
          return
        } else {
          this.strokeWidth *= ratio
          this.mapWidth = mapWidth
          this.mapHeight = mapHeight
        }
        this.viewCenter.x -= (initialLayerX - this.viewCenter.x) * ((ratio - 1) / ratio)
        this.viewCenter.y -= (initialLayerY - this.viewCenter.y) * ((ratio - 1) / ratio)
      } else {
        mapWidth = this.mapWidth - this.width / stepDivisor
        mapHeight = this.mapHeight - this.height / stepDivisor
        let ratio = this.mapWidth / mapWidth
        if (mapWidth < 100) {
          return
        } else {
          this.strokeWidth /= ratio
          this.mapWidth = mapWidth
          this.mapHeight = mapHeight
        }
        this.viewCenter.x += (initialLayerX - this.viewCenter.x) * ((ratio - 1) / ratio)
        this.viewCenter.y += (initialLayerY - this.viewCenter.y) * ((ratio - 1) / ratio)
      }
      this.mapMinX = this.viewCenter.x - this.mapWidth / 2
      this.mapMinY = this.viewCenter.y - this.mapHeight / 2
    },
    mapPan(event) {
      let ratio = this.mapWidth / this.width
      this.viewCenter.x = this.panStart.x - event.deltaX * ratio
      this.viewCenter.y = this.panStart.y - event.deltaY * ratio
      this.mapMinX = this.panStart.offsetX - event.deltaX * ratio
      this.mapMinY = this.panStart.offsetY - event.deltaY * ratio
      this.tooltip.visible = false
    },
    mapPanStart(event) {
      this.panStart = {
        x: this.viewCenter.x,
        y: this.viewCenter.y,
        offsetX: this.mapMinX,
        offsetY: this.mapMinY
      }
    }
  }
}
</script>
<style scoped>
.tooltip {
  position: absolute;
  background-color: white;
  border-radius: 5px;
  padding: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  transition: visibility 0s, opacity 0.2s linear;
  font-weight: bold;
}
</style>
