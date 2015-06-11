var read = require('fs').readFileSync
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
var Twitter = require('node-tweet-stream')

var keyword = '#cats'
var credentials = JSON.parse(read('./twitter.json'))

// Create new twitter client
var t = new Twitter({
  consumer_key: credentials.consumer_key,
  consumer_secret: credentials.consumer_secret,
  token: credentials.access_token_key,
  token_secret: credentials.access_token_secret
})

t.on('error', function (err) {
  console.log(err)
})

// Tells twitter instance to listen on the keyword
// and parse any incoming tweets
t.track(keyword)
t.on('tweet', parseAndEmitTweet)

var prevTweets = []
function parseAndEmitTweet (tweet) {
  console.log('New tweet (%s)', keyword)
  var parsedTweet = {
    text: tweet.text,
    name: tweet.user.screen_name,
    img: tweet.user.profile_image_url
  }

  if (prevTweets.length >= 10) {
    prevTweets.shift()
  }
  prevTweets.push(parsedTweet)
  // Emit the parsed tweet to connected any clients
  io.emit('tweet', parsedTweet)
}

// Emit our keyword to the client once it connects
io.on('connection', function (socket) {
  socket.emit('keyword', keyword)
  // send the last 10 saved tweets
  if (prevTweets.length) {
    socket.emit('tweet', prevTweets)
  }

  socket.on('keyword:set', function (newKeyword) {
    t.untrack(keyword)
    keyword = newKeyword
    t.track(keyword)
    io.emit('keyword', keyword)
    console.log('Now tracking: %s', newKeyword)
  })
})

// Serve assets and index.html
app.use(express.static('public'))
app.get('/', function (req, res) {
  res.sendFile('index.html')
})

// Start server
server.listen(8080, function onListening () {
  console.log('App listening')
})
