'use strict'
let _ = require('underscore')
let Anope = require('../Anope')
let Errors = require('../errors')
let User = require('../db').User

class Controller {
  static info (data, connection, query) {
    return new Promise(function (resolve, reject) {
      if (!query.nickname || query.nickname.length === 0) {
        reject({ meta: {}, error: Errors.throw('missing_required_field', 'nickname') })
        return
      }

      Anope.info(query.nickname).then(function (info) {
        if (!info) {
          reject({ meta: {}, error: Errors.throw('not_found') })
          return
        }

        resolve({ meta: {}, data: anopeInfoToAPIResult(info, connection.user.group) })
      }).catch(function (error) {
        reject({ meta: {}, error: Errors.throw('server_error', error) })
      })
    })
  }

  static register (data, connection) {
    return new Promise(function (resolve, reject) {
      console.log('register')
      let fields = ['nickname', 'password']


      console.log(data)
      for (let field of fields) {
        if (!data[field]) {
          console.log('rejecting')
          reject({ meta: {}, error: Errors.throw('missing_required_field', field) })
          return
        }
      }

      console.log('calling anope')
      Anope.register(data.nickname, data.password, connection.user.email).then(function (nickname) {
        console.log('success')
        let nicknames = connection.user.nicknames
        nicknames.push(nickname)

        Anope.confirm(nickname).then(function () {
          console.log('confirmed')
          User.update({ nicknames: nicknames }, {
            where: { id: connection.user.id }
          }).then(function () {
            console.log('updated')

            Anope.setVirtualHost(connection.user, data.nickname)
            resolve({ meta: {}, data: data.nickname })
          }).catch(function (error) {
            reject({ meta: {}, error: Errors.throw('server_error', error) })
          })
        }).catch(function (error) {
          reject({ meta: {}, error: Errors.throw('server_error', error) })
        })
      }).catch(function (error) {
        reject({ meta: {}, error: Errors.throw('server_error', error) })
      })
    })
  }

  static connect (data, connection) {
    return new Promise(function (resolve, reject) {
      let fields = ['nickname', 'password']

      for (let field of fields) {
        if (!data[field]) {
          reject({ meta: {}, error: Errors.throw('missing_required_field', field) })
          return
        }
      }

      Anope.authenticate(data.nickname, data.password).then(function () {
        let nicknames = connection.user.nicknames
        nicknames.push(data.nickname)

        User.update({ nicknames: nicknames }, {
          where: { id: connection.user.id }
        }).then(function () {
          resolve({ meta: {}, data: data.nickname })
        }).catch(function (error) {
          reject({ meta: {}, error: Errors.throw('server_error', error) })
        })
      }).catch(function () {
        reject({ meta: {}, error: Errors.throw('no_permission') })
      })
    })
  }

  static delete (data, connection, query) {
    return new Promise(function (resolve, reject) {
      if (!query.nickname) {
        reject({ meta: {}, error: Errors.throw('missing_required_field', query.nickname) })
      }


    })
  }
}

class HTTP {
  static get (request, response, next) {
    response.model.meta.params = _.extend(response.model.meta.params, request.params)

    Controller.info(request.body, request, request.query).then(function (res) {
      let data = res.data

      response.model.data = data
      response.status = 200
      next()
    }, function (error) {
      response.model.errors.push(error.error)
      response.status(error.error.code)
      next()
    })
  }

  static post (request, response, next) {
    response.model.meta.params = _.extend(response.model.meta.params, request.params)

    Controller.register(request.body, request, request.query).then(function (res) {
      response.model.data = res.data
      response.status(201)
      next()
    }, function (error) {
      response.model.errors.push(error)
      response.status(500)
      next()
    })
  }

  static put (request, response, next) {
    response.model.meta.params = _.extend(response.model.meta.params, request.params)

    Controller.connect(request.body, request, request.query).then(function (data) {
      response.model.data = data.data
      response.status(201)
      next()
    }).catch(function (error) {
      response.model.errors.push(error)
      response.status(error.error.code)
      next()
    })
  }

  static delete (request, response, next) {
    response.model.meta.params = _.extend(response.model.meta.params, request.params)

    Controller.delete(request.body, request, request.query).then(function () {
      response.status(204)
      next()
    }).catch(function (error) {
      response.model.errors.push(error)
      response.status(error.error.code)
      next()
    })
  }
}


function anopeInfoToAPIResult (result, group) {
  if (group !== 'admin') {
    if (result.vhost) {
      result.hostmask = result.vhost
      delete result.vhost
    }
    delete result.email
  }
  return result
}

module.exports = { HTTP: HTTP, Controller: Controller }