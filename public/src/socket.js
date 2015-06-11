'use strict'

var socket = window.io()

function sub (event) {
  return function (cb) {
    socket.on(event, function receivedEmit () {
      cb.apply(null, arguments)
    })
  }
}

function pub (event) {
  return function (val) {
    socket.emit(event, val)
  }
}

module.exports = {
  onTweet: sub('tweet'),
  onKeyword: sub('keyword'),
  setKeyword: pub('keyword:set')
}
