// Credentials arrive through hidden stdin, never command-line arguments.
import {randomBytes,scrypt} from "node:crypto";
import {readFileSync,writeFileSync,existsSync} from "node:fs";
if(process.argv.length>2)throw new Error("Provide credentials through stdin, not command-line arguments.");
const input=await new Promise((resolve,reject)=>{let data="";const terminal=process.stdin.isTTY;if(terminal){process.stdin.setRawMode(true);process.stderr.write("Ready for owner credentials JSON on stdin (input is hidden).\n")}process.stdin.setEncoding("utf8");const finish=()=>{if(terminal)process.stdin.setRawMode(false);process.stdin.pause();process.stdin.removeAllListeners("data");try{resolve(JSON.parse(data))}catch{reject(new Error("Provide one JSON object with email and password."))}};process.stdin.on("data",chunk=>{data+=chunk;if(data.includes("\u0003"))process.exit(130);if(data.length>4096)reject(new Error("Input too large."));if(data.includes("\n")||data.includes("\r"))finish()});process.stdin.once("end",finish)});
if(typeof input.email!=="string"||!input.email.includes("@")||typeof input.password!=="string"||input.password.length<8||input.password.length>256)throw new Error("Enter an email and a password between 8 and 256 characters.");
const salt=randomBytes(16).toString("hex"),key=await new Promise((resolve,reject)=>scrypt(input.password,Buffer.from(salt,"hex"),64,{N:32768,r:8,p:3,maxmem:64*1024*1024},(error,value)=>error?reject(error):resolve(value)));
const hash=`scrypt$32768$8$3$${salt}$${key.toString("hex")}`;
const original=existsSync(".env.local")?readFileSync(".env.local","utf8"):"",retained=original.split("\n").filter(line=>!/^OWNER_(EMAIL|PASSWORD_HASH)=/.test(line)).join("\n").trim();
writeFileSync(".env.local",(retained?retained+"\n":"")+"OWNER_EMAIL="+input.email.trim().toLowerCase()+"\nOWNER_PASSWORD_HASH="+hash+"\n",{mode:0o600});
console.log("Owner credentials configured in ignored .env.local. The password was not saved.");
