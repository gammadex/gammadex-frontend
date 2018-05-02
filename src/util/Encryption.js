import sjcl from 'sjcl'

const salt = "9cf97bed2e2f9f23146c38faf3aaabe256cba90e35e1adfe93fb7fa71c4ab3ea"

export function encrypt(message, password) {
    return JSON.stringify(sjcl.encrypt(password, message, {count: 2048, salt: salt, ks: 256}))
}

export function decrypt(encrypted, password) {
    return sjcl.decrypt(password, JSON.parse(encrypted))
}
