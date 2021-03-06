'use strict'

// safety net as we are going to be trashing the DB
if (process.env.NODE_ENV !== 'testing') {
  throw new Error('Please use NODE_ENV=testing')
}

const { db, User, Client, Group, Reset } = require('../../api/db')

const group = {}

const idRegExp = /^[0-9a-f]+-[0-9a-f]+-[0-9a-f]+-[0-9a-f]+$/

// expose some user details for auth requests etc..
const user = {
  admin : {
    password: 'testuser',
    // this is the result of bcrypt.hash('testuser', 12)
    hash: '$2a$12$QM4/plOu7n9BThFGbG8USO1jWnwJq6Lk7GnPtzhb./o2jHhbXayTy',
    email: 'admintestuser@fuelrats.com',
    groups: ['admin', 'rat', 'dispatch'],
    nicknames: ['admintestnick']
  },
  test : {
    password: 'testuser',
    // this is the result of bcrypt.hash('testuser', 12)
    hash: '$2a$12$QM4/plOu7n9BThFGbG8USO1jWnwJq6Lk7GnPtzhb./o2jHhbXayTy',
    email: 'testuser@fuelrats.com',
    groups: ['rat'],
    nicknames: ['testnick']
  }
}

const client = {
  admin : {
    name: 'admin-oauth-client',
    password: 'testuser',
    // this is the result of bcrypt.hash('testuser', 12)
    hash: '$2a$12$QM4/plOu7n9BThFGbG8USO1jWnwJq6Lk7GnPtzhb./o2jHhbXayTy'
  }
}

/**
 * Create a test user
 * @param user user information
 * @returns {Promise.<*>} a test user
 */
async function createUser (user) {

  const nicknames = "ARRAY['" + user.nicknames.join("','") + "']::citext[]"

  const testUser = await User.create({
    email: user.email,
    password: user.hash,
    nicknames: db.literal(nicknames)
  })

  // save the ID
  user.id = testUser.id

  if (user.groups.length) {
    await testUser.addGroups(user.groups.map(gid => group[gid]))
  }
    
  return testUser
    
}
/**
 * Create an OAuth client for a user
 * @param {*} user 
 */
async function createClient (user, client) {

  const testClient = await Client.create({
    name: client.name,
    userId: user.id,
    secret: client.hash
  })

  client.id = testClient.id
  return testClient

}

/**
 * Initialize the testing
 * @returns {Promise.<void>}
 */
async function init () {

  // clear out the database
  await db.sync({ force: true })

  // create all the groups
  group.default = await Group.create({
    id: 'default',
    vhost: 'recruit.fuelrats.com',
    isAdministrator: false,
    priority: 0,
    permissions: [
      'rescue.read',
      'rescue.read.me',
      'rescue.write.me',
      'rat.read',
      'rat.write.me',
      'client.read.me',
      'client.write.me',
      'client.delete.me',
      'user.read.me',
      'user.write.me'
    ]
  })

  group.rat = await Group.create({
    id: 'rat',
    vhost: 'rat.fuelrats.com',
    isAdministrator: false,
    priority: 10,
    permissions: []
  })

  group.dispatch = await Group.create({
    id: 'dispatch',
    vhost: null,
    isAdministrator: false,
    priority: 10,
    permissions: []
  })

  group.overseer = await Group.create({
    id: 'overseer',
    vhost: 'overseer.fuelrats.com',
    isAdministrator: false,
    priority: 50,
    permissions: [
      'rescue.write',
      'rat.write',
      'rescue.delete'
    ]
  })

  group.moderator = await Group.create({
    id: 'moderator',
    vhost: 'op.fuelrats.com',
    isAdministrator: false,
    priority: 90,
    permissions: [
      'rescue.write',
      'rat.write',
      'user.read',
      'user.write',
      'client.read',
      'rescue.delete'
    ]
  })

  group.netadmin = await Group.create({
    id: 'netadmin',
    vhost: 'netadmin.fuelrats.com',
    isAdministrator: true,
    priority: 100,
    permissions: [
      'user.read',
      'rescue.read',
      'rescue.write',
      'rescue.delete',
      'rat.read',
      'rat.write',
      'rat.delete',
      'user.read',
      'user.write',
      'user.delete',
      'user.groups',
      'client.read',
      'client.write',
      'client.delete'
    ]
  })

  group.admin = await Group.create({
    id: 'admin',
    vhost: 'admin.fuelrats.com',
    isAdministrator: true,
    priority: 100,
    permissions: [
      'user.read',
      'rescue.read',
      'rescue.write',
      'rescue.delete',
      'rat.read',
      'rat.write',
      'rat.delete',
      'user.read',
      'user.write',
      'user.delete',
      'user.groups',
      'client.read',
      'client.write',
      'client.delete',
      'ship.read',
      'ship.write',
      'ship.delete'
    ]
  })

  await createUser(user.admin)
  await createClient(user.admin, client.admin)
  await createUser(user.test)

}

module.exports = {
  init, user, client, group, idRegExp, Reset, createClient, createUser 
}

