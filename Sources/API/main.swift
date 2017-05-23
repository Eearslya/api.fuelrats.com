import Kitura
import HeliumLogger
import SwiftKuery
import SwiftKueryPostgreSQL

print("API Starting")

let users = Users()
let rats = Rats()

print("Making Connection")
let connection = PostgreSQLConnection(host: "127.0.0.1", port: 5432, options: [
    .databaseName("fuelrats"),
    .userName("fuelrats")
])

connection.connect() { error in
    if let error = error {
        print(error)
        return
    }
    
    print("Connected")
    let userQuery = Select(from: [users])
    connection.execute(query: userQuery) { result in
        if let results = result.asResultSet.toResultType(model: User.self) {
            print(results)
        } else if let queryError = result.asError {
            print(queryError)
        }
    
    }
    
    let ratQuery = Select(from: [rats]).where(rats.name == "xlexious")
    connection.execute(query: ratQuery) { result in
        if let results = result.asResultSet.toResultType(model: Rat.self) {
            print(results)
        } else if let queryError = result.asError {
            print(queryError)
        }
        
    }
}





let router = Router()

router.get("/") {
    request, response, next in
    response.send("Hello, World, this is a swift web server bitch")
    next()
}

Kitura.addHTTPServer(onPort: 8090, with: router)
Kitura.run()
