/*global $, Mustache*/

$(function () {
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(window.navigator.userAgent)

  // Connect the socket
  var socket = window.io()

  // Listen for the keyword that we are tracking
  // and change the title
  var title = $('#title')
  socket.on('keyword', function (keyword) {
    title
    .find('span')
    .remove()

    title.append($('<span></span>', {
      text: ' ' + keyword,
      css: {
        color: 'deepskyblue'
      }
    }))
  })

  // For hiding and showing the search window
  var searchWindow = $('.search-window')
  var searchInput = searchWindow.find('input')

  $('.search-btn')
  .on('click', toggleWindow)

  function toggleWindow () {
    searchWindow
    .fadeToggle('fast', function () {
      if (!searchWindow.is(':visible')) {
        searchInput.val('')
      }else {
        searchInput.focus()
      }
    })
  }

  // Emit the entered keyword
  searchInput.on('keyup', function (evt) {
    if (evt.keyCode !== 13 ||
        !searchWindow.is(':visible') ||
        !searchInput.val()) return
    // Set new tracked keyword
    socket.emit('keyword:set', searchInput.val())
    toggleWindow()
  })

  // Fetch the template for rendering tweets
  $.get('tweet.tmpl', function fetched (template) {

    // Let mustache parse the template to speed things up
    Mustache.parse(template)

    var tweetContainer = $('#tweets')
    socket.on('tweet', function (tweet) {
      if (Array.isArray(tweet)) {
        tweet.forEach(parseTweet)
      }else {
        parseTweet(tweet)
      }
    })
    function parseTweet (tweet) {

      // For full res images on desktops
      tweet.img = isMobile ? tweet.img : stripNormalFromUrl(tweet.img)
      tweet.text = parseTwitterUserNames(tweet.text)
      tweet.text = parseURLs(tweet.text)
      tweet.text = parseHashtags(tweet.text)

      preLoadImage(tweet.img)
      .then(function () {
        addToShowTweetQueue(tweet)
      })
    }

    var tweetQueue = []
    function addToShowTweetQueue (tweet) {
      tweetQueue.push($(Mustache.render(template, {tweet: tweet})))

      runTweetQueue()
    }

    var queueRunning = false
    function runTweetQueue () {
      if (queueRunning || !tweetQueue.length) return
      queueRunning = true

      tweetQueue[0]
      .prependTo(tweetContainer)
      .hide()
      .slideDown(function () {
        tweetQueue.shift()
        queueRunning = false
        runTweetQueue()
      })
    }

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

    function parseURLs (str) {
      var pattern = /(^|[\s\n]|<br\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi
      return str.replace(pattern, '$1<a href="$2">$2</a>')
    }

    function parseTwitterUserNames (str) {
      return str.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
        var username = u.replace('@', '')
        return u.link('http://twitter.com/' + username)
      })
    }

    function parseHashtags (str) {
      return str.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
        var tag = t.replace('#', '%23')
        return t.link('http://search.twitter.com/search?q=' + tag)
      })
    }

    function preLoadImage (url) {
      var Q = $.Deferred()

      var img = $('<img />')
      .attr('src', url)
      .load(function () {
        img.remove()
        Q.resolve()
      })

      return Q.promise()
    }
  })
})
