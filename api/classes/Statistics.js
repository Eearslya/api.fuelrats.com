'use strict'
let Rescue = require('../db').Rescue
let Rat = require('../db').Rat
let User = require('../db').User
let db = require('../db').db


class Statistics {
  static getLeaderboardRats () {
    return new Promise(function (resolve, reject) {
      try {
        Rat.findAll({
          where: {},
          include: [{
            model: Rescue,
            as: 'firstLimpet',
            attributes: [],
            where: {
              successful: true
            },
            required: true
          }],
          attributes: [
            'id',
            [db.fn('COUNT', 'Rescue.id'), 'rescueCount'],
            [db.fn('bool_or', db.col('epic')), 'epic'],
            [db.fn('bool_or', db.col('codeRed')), 'codeRed'],
            'CMDRname',
            'joined'
          ],
          group: ['Rat.id'],
          order: [[db.fn('COUNT', 'Rescue.id'), 'DESC']]
        }).then(function (ratInstances) {
          let rats = ratInstances.map(function (ratInstance) {
            let rat = ratInstance.toJSON()
            let pips = Math.floor(rat.rescueCount / 100)
            rat.pips = pips > 4 ? 4 : pips
            return rat
          })
          resolve(rats)
        }).catch(function (error) {
          reject(error)
        })
      } catch(ex) {
        reject(ex)
      }
    })
  }

  static getPopularSystemsCount () {
    return new Promise(function (resolve, reject) {
      Rescue.findAll({
        where: {},
        attributes: [
          'system',
          [db.fn('COUNT', 'system'), 'count']
        ],
        group: ['system'],
        order: [[db.fn('COUNT', 'system'), 'DESC']],
        limit: 50
      }).then(function (systemInstances) {
        let systems = systemInstances.map(function (systemInstance) {
          let system = systemInstance.toJSON()
          return system
        })
        resolve(systems)
      })
    }).catch(function (error) {
    })
  }

  static getTotalStatistics () {
    return new Promise(function (resolve, reject) {
      Rescue.findAll({
        where: {},
        attributes: [
          [db.fn('date_trunc', 'day', db.col('createdAt')), 'date'],
          [db.fn('SUM', db.cast(db.col('successful'), 'INTEGER')), 'successCount'],
          [db.fn('COUNT', 'id'), 'total']
        ],
        group: [db.fn('date_trunc', 'day', db.col('createdAt'))],
        order: [[db.fn('date_trunc', 'day', db.col('createdAt')), 'DESC']]
      }).then(function (rescueDaysInstances) {
        let rescueDays = rescueDaysInstances.map(function (rescueDaysInstance) {
          let rescueDay = rescueDaysInstance.toJSON()
          return rescueDay
        })
        resolve(rescueDays)
      }).catch(function (error) {
      })
    })
  }
}
module.exports = Statistics
