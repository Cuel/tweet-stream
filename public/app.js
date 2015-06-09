/*global $, Mustache*/

$(function () {
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(window.navigator.userAgent)

  // Connect the socket
  var socket = window.io.connect(window.location.host)

  // Listen for the keyword that we are tracking
  // and change the title
  socket.once('keyword', function (keyword) {
    $('#title').append(' for ')
    .append($('<span></span>', {
      text: keyword,
      css: {
        color: 'deepskyblue'
      }
    }))
  })

  // Fetch the template
  $.get('tweet.tmpl', function fetched (template) {

    // Let mustache parse the template to speed things up
    Mustache.parse(template)

    var tweetContainer = $('#tweets')
    socket.on('tweet', showTweet)
    function showTweet (tweet) {
      // For full res images on desktops
      tweet.img = isMobile ? tweet.img : stripNormalFromUrl(tweet.img)

      $(Mustache.render(template, {tweet: tweet}))
      .prependTo(tweetContainer)
      .hide()
      .slideDown()
    }
  })

  function stripNormalFromUrl (url) {
    return url
    .split(' ')
    .reverse()
    .join(' ')
    .replace('_normal', '')
    .split(' ')
    .reverse()
    .join(' ')
  }
})
