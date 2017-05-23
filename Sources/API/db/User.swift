/*
 Copyright (c) 2017, The Fuel Rats Mischief
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 
 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 
 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 
 3. Neither the name of the copyright holder nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
