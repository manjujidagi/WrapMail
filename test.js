import dotenv from "dotenv";
import CryptoJS from "crypto-js";

dotenv.config({
  path: ".env"
});

const data = {
  smtp: true,
  imap: true
};

const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(data),
  process.env.ENC_DEC_KEY
).toString();

console.log(encrypted);