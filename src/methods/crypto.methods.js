import CryptoJS from "crypto-js";

export const encrypt = (data) => {
    try {
        const secret = process.env.ENC_DEC_KEY;
        return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
    } catch (error) {
        console.error("Error encrypting data:", error);
        return null;
    }
}

export const decrypt = (ciphertext) => {
    try {
        const secret = process.env.ENC_DEC_KEY;
        const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error("Error decrypting data:", error);
        return null;
    }
}
