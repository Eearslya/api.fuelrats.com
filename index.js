var _,
    app,
    badge,
    bodyParser,
    config,
    cookieParser,
    cors,
    docket,
    docs,
    express,
    expressSession,
    fs,
    http,
    httpServer,
    io,
    LocalStrategy,
    logger,
    login,
    logout,
    moment,
    mongoose,
    notAllowed,
    options,
    paperwork,
    passport,
    path,
    port,
    Rat,
    rat,
    register,
    Rescue,
    rescue,
    router,
    socket,
    winston,
    ws





// IMPORT
// =============================================================================

// Import libraries
_ = require( 'underscore' )
bodyParser = require( 'body-parser' )
cors = require( 'cors' )
cookieParser = require( 'cookie-parser' )
// docket = require( './docket.js' )
docs = require( 'express-mongoose-docs' )
express = require( 'express' )
expressHandlebars = require( 'express-handlebars' )
expressSession = require( 'express-session' )
fs = require( 'fs' )
http = require( 'http' )
moment = require( 'moment' )
mongoose = require( 'mongoose' )
passport = require( 'passport' )
path = require( 'path' )
LocalStrategy = require( 'passport-local' ).Strategy
winston = require( 'winston' )
ws = require( 'ws' ).Server

// Import additional schema types
require( 'mongoose-moment' )( mongoose )

// Import config
if ( fs.existsSync( './config.json' ) ) {
  config = require( './config' )
} else {
  config = require( './config-example' )
}

// Import models
Rat = require( './api/models/rat' )
Rescue = require( './api/models/rescue' )
User = require( './api/models/user' )

// Import controllers
badge = require( './api/controllers/badge' )
login = require( './api/controllers/login' )
logout = require( './api/controllers/logout' )
paperwork = require( './api/controllers/paperwork' )
rat = require( './api/controllers/rat' )
register = require( './api/controllers/register' )
rescue = require( './api/controllers/rescue' )

// Connect to MongoDB
mongoose.connect( 'mongodb://localhost/fuelrats' )

options = {
  logging: true,
  test: false
}





// SHARED METHODS
// =============================================================================

// Function for disallowed methods
notAllowed = function notAllowed ( request, response ) {
  response.status( 405 )
  response.send()
}

// Add a broadcast method for websockets
ws.prototype.broadcast = function ( data ) {
  var clients

  clients = this.clients

  for ( var i = 0; i < clients.length; i++ ) {
    clients[i].send( data )
  }
}





// Parse command line arguments
// =============================================================================

if ( process.argv ) {
  for ( var i = 0; i < process.argv.length; i++ ) {
    var arg

    arg = process.argv[i]

    switch ( arg ) {
      case '--no-log':
        options.logging = false
        break

      case '--test':
        options.test = true
        break
    }
  }
}





// MIDDLEWARE
// =============================================================================

app = express()

app.engine( '.hbs', expressHandlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    dateFormat: function( context, block ) {
      return moment( Date( context * 1000 ) ).format( block.hash.format || "MMM Do, YYYY" )
    }
  }
}))
app.set( 'view engine', '.hbs' )

app.use( cors() )
app.use( bodyParser.urlencoded( { extended: true } ) )
app.use( bodyParser.json() )
app.use( cookieParser() )
app.use( expressSession({
  secret: config.secretSauce,
  resave: false,
  saveUninitialized: false
}))
app.use( passport.initialize() )
app.use( passport.session() )

app.set( 'json spaces', 2 )
app.set( 'x-powered-by', false )

httpServer = http.Server( app )

port = process.env.PORT || config.port

passport.use( User.createStrategy() )
passport.serializeUser( User.serializeUser() )
passport.deserializeUser( User.deserializeUser() )

app.use( expressSession({
  secret: 'foobarbazdiddlydingdongsdf]08st0agf/b',
  resave: false,
  saveUninitialized: false
}))
app.use( passport.initialize() )
app.use( passport.session() )

docs( app, mongoose )
// docket( app, mongoose )

// Combine query parameters with the request body, prioritizing the body
app.use( function ( request, response, next ) {
  request.body = _.extend( request.query, request.body )
  next()
})

// Add logging
if ( options.logging || options.test ) {
  app.use( function ( request, response, next ) {
    winston.info( '' )
    winston.info( 'TIMESTAMP:', Date.now() )
    winston.info( 'ENDPOINT:', request.originalUrl )
    winston.info( 'METHOD:', request.method )
    winston.info( 'DATA:', request.body )
    next()
  })
}





// ROUTER
// =============================================================================

// Create router
router = express.Router()





// ROUTES
// =============================================================================

router.get( '/badge/:rat', badge.get )

router.get( '/register', register.get )
router.post( '/register', register.post )

router.get( '/login', login.get )
router.post( '/login', passport.authenticate( 'local' ), login.post )

router.get( '/logout', logout.post )
router.post( '/logout', logout.post )

router.get( '/paperwork', paperwork.get )

router.get( '/rats/:id', rat.get )
router.post( '/rats/:id', rat.post )
router.put( '/rats/:id', rat.put )
router.delete( '/rats/:id', notAllowed )

router.get( '/rats', rat.get )
router.post( '/rats', rat.post )
router.put( '/rescues', notAllowed )
router.delete( '/rescues', notAllowed )

router.get( '/rescues/:id', rescue.get )
router.post( '/rescues/:id', rescue.post )
router.put( '/rescues/:id', rescue.put )
router.delete( '/rescues/:id', notAllowed )

router.get( '/rescues', rescue.get )
router.post( '/rescues', rescue.post )
router.put( '/rescues', notAllowed )
router.delete( '/rescues', notAllowed )

router.get( '/search/rescues', rescue.get )

router.get( '/search/rats', rat.get )

// Register routes
app.use( express.static( __dirname + '/static' ) )
app.use( '/', router )
app.use( '/api', router )





// SOCKET
// =============================================================================

socket = new ws({ server: httpServer })

socket.on( 'connection', function ( client ) {
  client.send( JSON.stringify({
    data: 'Welcome to the Fuel Rats API. You can check out the docs at absolutely fucking nowhere because Trezy is lazy.',
    type: 'welcome'
  }))

  client.on( 'message', function ( data ) {
    data = JSON.parse( data )
    winston.info( data )
  })
})





// START THE SERVER
// =============================================================================

module.exports = httpServer.listen( port )

if ( !module.parent ) {
  winston.info( 'Listening for requests on port ' + port + '...' )
}
