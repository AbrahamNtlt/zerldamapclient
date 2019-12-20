import $ from './lib/jquery-2.2.0.js'
import L from './lib/Leaflet/leaflet-src.js'
import './lib/Leaflet/leaflet.css'

import './assets/font/font.css'

import MarkerCatalog from './assets/json/Catalog.json'
import MarkerData from './assets/json/Marker.json'
import shrines from './assets/json/shrines.json'

const ShrinesToJapanese = (function() {
  const result = {}
  for (let i = 0; i < shrines.length; i++) {
    if (!shrines[i]) continue
    const shrine = shrines[i].split('|')
    if (!result[shrine[1]]) {
      result[shrine[1]] = shrine[0]
    } else {
      console.log('same shrine in English: ' + shrine[1])
    }
  }
  return result
})()

$(function() {
  var bounds = new L.LatLngBounds(
    new L.LatLng(-49.875, 34.25),
    new L.LatLng(-206, 221)
  )

  var map = L.map('MapContainer', {
    crs: L.CRS.Simple,
    attributionControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  }).setView([0, 0], 2)

  var layer = L.tileLayer('../static/Map/{z}_{x}_{y}.png', {
    attribution: '&copy; David',
    minZoom: 2,
    maxZoom: 7,
    noWrap: true,
    bounds: bounds
  }).addTo(map)

  var markerStyle = {}
  var visibleMarker = {}
  var css = ''
  var typeChinese = {
    quest: '任务',
    miniboss: '头目',
    treasure: '宝箱',
    shrine: '神庙',
    stable: '马宿',
    tower: '塔',
    town: '城镇',
    'great-fairy-fountain': '大精灵',
    'korok-seed': '种子',
    memory: '记忆'
  }
  var listContainer = $('#TypeSwitch ul')
  $('<li>')
    .attr('data-type', 'all')
    .text('全部')
    .appendTo(listContainer)
  $('<li>')
    .attr('data-type', 'none')
    .text('无')
    .appendTo(listContainer)
  $.each(MarkerCatalog, function() {
    var name = this.name
    $('<li>')
      .text(typeChinese[name] || name)
      .appendTo(listContainer)
      .addClass('title')
    $.each(this.children, function() {
      var name = this.name
      $('<li>')
        .attr('data-type', this.id)
        .text(typeChinese[name] || name)
        .appendTo(listContainer)
        .addClass('icon-' + this.img)
      markerStyle[this.id] = this.img
      visibleMarker[this.id] = false
      css +=
        '.icon-' +
        this.img +
        ', .icon-' +
        this.img +
        ':after {background-color:' +
        this.color +
        ';}'
    })
  })
  $('<style>')
    .text(css)
    .insertBefore($('head').find('*')[0])

  $('#TypeSwitch li').click(function() {
    if ($(this).attr('data-type')) toggleVisible($(this).attr('data-type'))
  })

  function toggleVisible(type) {
    if (type === 'all' || type === 'none') {
      for (var o in visibleMarker) {
        if (visibleMarker.hasOwnProperty(o)) {
          visibleMarker[o] = type === 'all' ? true : false
        }
      }
    } else {
      if (event.ctrlKey) {
        if (visibleMarker[type]) {
          visibleMarker[type] = false
        } else {
          visibleMarker[type] = true
        }
      } else {
        for (var p in visibleMarker) {
          if (visibleMarker.hasOwnProperty(p)) {
            visibleMarker[p] = false
          }
        }
        visibleMarker[type] = true
      }
    }
    refreshFilter()
    refreshMarker('filter')
  }

  function refreshFilter() {
    var allVisible = true
    var allHidden = true
    for (var o in visibleMarker) {
      if (visibleMarker.hasOwnProperty(o)) {
        if (!visibleMarker[o]) {
          allVisible = false
        } else {
          allHidden = false
        }
      }
    }
    $('#TypeSwitch li').removeClass('current')
    if (allVisible) {
      $('#TypeSwitch li[data-type=all]').addClass('current')
    } else if (allHidden) {
      $('#TypeSwitch li[data-type=none]').addClass('current')
    } else {
      for (var p in visibleMarker) {
        if (visibleMarker.hasOwnProperty(p)) {
          if (visibleMarker[p]) {
            $("#TypeSwitch li[data-type='" + p + "']").addClass('current')
          }
        }
      }
    }
  }

  var cacheMarker = []
  function refreshMarker(from) {
    $.each(cacheMarker, function() {
      this.remove()
    })
    cacheMarker = []

    $.each(MarkerData, function() {
      var visible = false
      if (from === 'filter' && visibleMarker[this.markerCategoryId])
        visible = true
      if (from === 'search') {
        var keyword = $('#KeyWords').val()
        if (
          this.name
            .toLowerCase()
            .replace(/^\s+|\s+$/g, '')
            .indexOf(keyword.toLowerCase().replace(/^\s+|\s+$/, '')) !== -1
        )
          visible = true
        if (
          this.description
            .toLowerCase()
            .replace(/^\s+|\s+$/g, '')
            .indexOf(keyword.toLowerCase().replace(/^\s+|\s+$/, '')) !== -1
        )
          visible = true
      }
      if (visible) {
        var key =
          this.markerCategoryId +
          '-' +
          this.id +
          '-' +
          this.name.replace(/[^A-Z]/gi, '-')
        var popupHtml = '<div class="popupContainer">'
        popupHtml += '<strong class="name">' + this.name + '</strong>'
        popupHtml += '<div class="buttonContainer">'
        popupHtml +=
          '<span class="markButton" onclick="MarkPoint(this)" data-key="' +
          key +
          '">标记</span>'
        popupHtml +=
          '<a class="markButton" onClick="openDefaultBrowser(\'http://www.ign.com/search?q=' +
          encodeURIComponent(this.name) +
          '\')" href="#">IGN</a>'
        popupHtml +=
          '<a class="markButton" onClick="openDefaultBrowser(\'http://www.polygon.com/search?q=' +
          encodeURIComponent(this.name) +
          '\')" href="#">Polygon</a>'
        popupHtml +=
          '<a class="markButton" onClick="openDefaultBrowser(\'https://c.gufen.ga/#q=' +
          encodeURIComponent(this.name) +
          '\')" href="#">Google</a>'
        popupHtml +=
          '<a class="markButton" onClick="openDefaultBrowser(\'http://www.baidu.com/baidu?word=' +
          encodeURIComponent(this.name) +
          '\')" href="#">百度</a>'
        popupHtml += '</div>'

        if (this.markerCategoryId === '1925') {
          if (ShrinesToJapanese[this.name]) {
            var jName = ShrinesToJapanese[this.name]
            popupHtml += '<strong class="name">' + jName + '</strong>'
            popupHtml += '<div class="buttonContainer">'
            popupHtml +=
              '<a class="markButton" onClick="openDefaultBrowser(\'https://zelda-bow.gamepedia.jp/?s=' + 
              jName +
              '\')" href="#">GamePedia</a>'
            popupHtml +=
              '<a class="markButton" onClick="openDefaultBrowser(\'http://wiki2.h1g.jp/zelda_bow/index.php?' + 
              jName +
              '\')" href="#">H1G</a>'
            popupHtml +=
              '<a class="markButton" onClick="openDefaultBrowser(\'https://c.gufen.ga/#q=' + 
              jName +
              '\')" href="#">Google</a>'
            popupHtml +=
              '<a class="markButton" onClick="openDefaultBrowser(\'http://www.baidu.com/baidu?word=' + 
              jName +
              '\')" href="#">百度</a>'
            popupHtml += '</div>'
          } else {
            console.log('no find shrine janpanese: ' + this.name)
          }
        }

        popupHtml += '</div>'

        var className = 'mark-' + key
        if (localStorage.getItem(key)) {
          className += ' marked'
        }
        className += ' markIcon'
        className += ' icon-' + markerStyle[this.markerCategoryId]

        var marker = L.marker([this.y, this.x], {
          title: this.name,
          icon: L.divIcon({
            className: className,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
          })
        })
          .addTo(map)
          .bindPopup(popupHtml)
        cacheMarker.push(marker)
      }
    })
  }

  toggleVisible('1925')

  var lastKeyworld = ''
  setInterval(function() {
    var newKeyword = $('#KeyWords').val()
    if (newKeyword !== lastKeyworld) {
      if (newKeyword) {
        lastKeyworld = newKeyword
        refreshMarker('search')
      } else {
        refreshMarker('filter')
      }
    }
  }, 500)
  $('#ClearKeyword').click(function() {
    $('#KeyWords').val('')
  })
})

function MarkPoint(element) {
  var that = $(element)
  var key = that.attr('data-key')

  var oldValue = localStorage.getItem(key)
  var newValue = !oldValue
  localStorage.setItem(key, newValue ? '1' : '')

  $('#MapContainer .leaflet-marker-pane .mark-' + key).toggleClass(
    'marked',
    newValue
  )
}
window.MarkPoint = MarkPoint
