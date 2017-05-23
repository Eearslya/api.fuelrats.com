//
//  DatabaseModel.swift
//  FuelRatsAPI
//
//  Created by Alex S. Glomsaas on 23/05/2017.
//
//

import Foundation
import SwiftKuery

extension Data {
    var stringArray: [String] {
        let byteArray = self.withUnsafeBytes {
            Array(UnsafeBufferPointer<UInt8>(start: $0, count: self.count/MemoryLayout<UInt8>.size))
        }
        
        let byteArrayCollection = byteArray.split(separator: 0).dropFirst(4)
        
        return byteArrayCollection.flatMap({
            return String(bytes: $0.dropFirst(), encoding: .utf8)
        })
    }
    
    var jsonDataField: [String: Any]? {
        let byteArray = self.withUnsafeBytes {
            Array(UnsafeBufferPointer<UInt8>(start: $0, count: self.count/MemoryLayout<UInt8>.size))
        }
        
        do {
            return try JSONSerialization.jsonObject(with: Data(bytes: byteArray.dropFirst(1)), options: []) as? [String: Any]
            
        } catch {
            return nil
        }
    }
    
    var platform: Platform? {
        if let platformString = String(data: self, encoding: .utf8) {
            return Platform(rawValue: platformString)
        }
        return nil
    }
}


public protocol DatabaseModel {
    init?(fields: [String: Any])
}


extension Optional where Wrapped == ResultSet {
    func toResultType<T>(model: T.Type) -> [T]? where T: DatabaseModel {
        switch self {
        case .some(let value):
            let titles = value.rows.map { zip(value.titles, $0) }
            let rows: [T] = titles.map {
                var dicts = [String: Any]()
                $0.forEach {
                    let (title, value) = $0
                    dicts[title] = value
                }
                return T(fields: dicts)!
            }
            return rows
            
        case _:
            return nil
        }
    }
}
