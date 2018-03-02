import {encrypt, decrypt} from "../Encryption"

test("test private key gets encrypted then decrypted", () => {
    const key = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"
    const password = "sometestpassword"

    const encrypted = encrypt(key, password)
    const decrypted = decrypt(encrypted, password)

    expect(decrypted).toEqual(key)
})


test("Exception thrown for wrong password", () => {
    const key = "222941a07030ef2477b547da97259a33f4e3a6febeb081da8210cffc86dd138f"

    const encrypted = encrypt(key, "sometestpassword")

    try {
        decrypt(encrypted, "wrongpassword")
        fail("Expected exception not thrown")
    } catch (error) {
    }
})
