var moment, mongoose, RatSchema, Rescue, Schema, winston

moment = require( 'moment' )
mongoose = require( 'mongoose' )
mongoosastic = require( 'mongoosastic' )
winston = require( 'winston' )

Rescue = require( './rescue' )

Schema = mongoose.Schema

RatSchema = new Schema({
  archive: {
    default: false,
    type: Boolean
  },
  CMDRname: {
    type: String
  },
  createdAt: {
    type: 'Moment'
  },
  drilled: {
    default: {
      dispatch: false,
      rescue: false
    },
    type: {
      dispatch: {
        type: Boolean
      },
      rescue: {
        type: Boolean
      }
    }
  },
  gamertag: {
    type: String
  },
  lastModified: {
    type: 'Moment'
  },
  joined: {
    default: Date.now(),
    type: 'Moment'
  },
  netlog: {
    type: {
      commanderId: {
        type: String
      },
      data: {
        type: Schema.Types.Mixed
      },
      userId: {
        type: String
      }
    }
  },
  nicknames: {
    type: [String]
  },
  rescues: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Rescue'
    }]
  }
})

RatSchema.index({
  'CMDRname': 'text',
  'gamertag': 'text',
  'nickname': 'text'
})

RatSchema.pre( 'save', function ( next ) {
  var timestamp

  timestamp = new moment

  if ( this.isNew ) {
    this.createdAt = this.createdAt || timestamp
    this.joined = this.joined || timestamp
  }

  this.lastModified = timestamp

  next()
})

RatSchema.post( 'init', function ( doc ) {
  doc.createdAt = doc.createdAt.valueOf()
  doc.lastModified = doc.lastModified.valueOf()
})

RatSchema.set( 'toJSON', {
  virtuals: true
})

RatSchema.plugin( mongoosastic )

if ( mongoose.models.Rat ) {
  module.exports = mongoose.model( 'Rat' )
} else {
  module.exports = mongoose.model( 'Rat', RatSchema )
}
