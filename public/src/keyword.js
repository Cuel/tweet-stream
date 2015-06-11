/*global $*/
'use strict'

var socket = require('./socket')
var tweetHandler = require('./tweet')

var TITLE = $('#title')
var SEARCH_BTN = $('.search-btn')
var SEARCH_WIN = $('.search-window')
var SEARCH_INP = SEARCH_WIN.find('input')

var KEY_ENT = 13
var KEY_ESC = 27

socket.onKeyword(function (keyword) {
  tweetHandler.clearQueue()

  TITLE
  .find('span')
  .remove()

  TITLE.append($('<span></span>', {
    text: ' ' + keyword,
    css: {
      color: 'deepskyblue'
    }
  }))
})

SEARCH_BTN.click(toggleWindow)
function toggleWindow () {
  SEARCH_WIN
  .fadeToggle('fast', function () {
    if (!SEARCH_WIN.is(':visible')) {
      SEARCH_INP.val('')
    }else {
      SEARCH_INP.focus()
    }
  })
}

// Emit the entered keyword
SEARCH_INP.on('keyup', function (evt) {
  if (evt.keyCode === KEY_ESC) return toggleWindow()
  if (evt.keyCode !== KEY_ENT) return
  if (!SEARCH_WIN.is(':visible') || !SEARCH_INP.val()) return

  // Set new tracked keyword
  socket.setKeyword(SEARCH_INP.val())
  toggleWindow()
})
