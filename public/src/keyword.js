/*global $*/
'use strict'

var socket = require('./socket')
var tweetHandler = require('./tweet')

var TITLE = $('#js-title')
var SEARCH_BTN = $('#js-search-btn')
var SEARCH_WIN = $('#js-search-win')
var SEARCH_INP = SEARCH_WIN.find('input')
debugger;
var KEY_ENT = 13
var KEY_ESC = 27

function toggleSearchWindow () {
  SEARCH_WIN
  .fadeToggle('fast', function () {
    if (!SEARCH_WIN.is(':visible')) {
      SEARCH_INP.val('')
    }else {
      SEARCH_INP.focus()
    }
  })
}

function handleNewKeyword (keyword) {
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
}

// Emit the entered keyword
function handleSearchInputKeyup (evt) {
  if (evt.keyCode === KEY_ESC) return toggleSearchWindow()
  if (evt.keyCode !== KEY_ENT) return
  if (!SEARCH_WIN.is(':visible') || !SEARCH_INP.val()) return

  // Set new tracked keyword
  socket.setKeyword(SEARCH_INP.val())
  toggleSearchWindow()
}

exports = module.exports = {
  init: function init () {
    socket.onKeyword(handleNewKeyword)
    SEARCH_BTN.click(toggleSearchWindow)
    SEARCH_INP.on('keyup', handleSearchInputKeyup)
  }
}
