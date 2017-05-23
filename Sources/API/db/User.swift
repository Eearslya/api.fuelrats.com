import Foundation
import SwiftKuery
import SwiftKueryPostgreSQL

final class Users: Table {
    let tableName = "\"Users\""
    
    let id = Column("id")
    let email = Column("email")
    let password = Column("password")
    let nicknames = Column("nicknames")
    let groups = Column("groups")
    let image = Column("image")
    let createdAt = Column("createdAt")
    let updatedAt = Column("updatedAt")
    let deletedAt = Column("deletedAt")
}

struct User {
    let id: UUID
    let email: String
    let password: String
    let nicknames: [String]
    let groups: [UserGroup]
    let image: Data?
    let createdAt: Date
    let updatedAt: Date
    let deletedAt: Date?
    
}

extension User: DatabaseModel {
    init?(fields: [String: Any]) {
        guard
            let idString  = fields["id"] as? String, let id = UUID(uuidString: idString),
            let email     = fields["email"] as? String,
            let nicknames = (fields["nicknames"] as? Data)?.stringArray,
            let password  = fields["password"] as? String,
            let groups    = ((fields["groups"] as? Data)?.stringArray)?.toUserGroupList(),
            let createdAt = fields["createdAt"] as? Date,
            let updatedAt = fields["updatedAt"] as? Date
        else {
            return nil
        }
        let image     = fields["image"] as? Data
        let deletedAt = fields["deletedAt"] as? Date
        self.init(id: id, email: email, password: password, nicknames: nicknames, groups: groups, image: image, createdAt: createdAt, updatedAt: updatedAt, deletedAt: deletedAt)
    }
}

enum UserGroup: String {
    case rat
    case dispatch
    case overseer
    case moderator
    case admin
}

extension Array where Element == String {
    func toUserGroupList() -> [UserGroup] {
        return self.map({
            (group: String) -> UserGroup in
            return UserGroup(rawValue: group)!
        })
    }
}
