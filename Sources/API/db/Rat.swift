import Foundation
import SwiftKuery
import SwiftyJSON

final class Rats: Table {
    let tableName = "\"Rats\""
    
    let id = Column("id")
    let name = Column("name")
    let data = Column("data")
    let platform = Column("platform")
    let joined = Column("joined")
    let createdAt = Column("createdAt")
    let updatedAt = Column("updatedAt")
    let deletedAt = Column("deletedAt")
}

struct Rat {
    let id: UUID
    let name: String
    let data: [String : Any]?
    let platform: Platform
    let joined: Date
    let createdAt: Date
    let updatedAt: Date
    let deletedAt: Date?
    
}

extension Rat: DatabaseModel {
    init?(fields: [String: Any]) {
        guard
            let idString  = fields["id"] as? String, let id = UUID(uuidString: idString),
            let name      = fields["name"] as? String,
            let platform  = (fields["platform"] as? Data)?.platform,
            let joined    = fields["joined"] as? Date,
            let createdAt = fields["createdAt"] as? Date,
            let updatedAt = fields["updatedAt"] as? Date
            else {
                return nil
        }
        
        let data = (fields["data"] as? Data)?.jsonDataField
        self.init(id: id, name: name, data: data, platform: platform, joined: joined, createdAt: createdAt, updatedAt: updatedAt, deletedAt: nil)
    }
}

enum Platform: String {
    case pc
    case xb
    case ps
}
