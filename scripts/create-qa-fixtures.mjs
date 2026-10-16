// Local QA data only. Outputs are ignored and never copied into public assets.
import {build} from "esbuild";
import {mkdir,writeFile} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const directory=resolve("outputs/browser-qa");
await mkdir(directory,{recursive:true});
const fixtureModule=resolve(directory,"course-fixtures.mjs");
await build({stdin:{contents:'export {tracks} from "./lib/learning"; export {examBank} from "./lib/exam-bank"; export {hashOwnerPassword} from "./lib/owner-auth";',resolveDir:process.cwd(),loader:"ts"},bundle:true,platform:"node",format:"esm",outfile:fixtureModule});
const {tracks,examBank,hashOwnerPassword}=await import(pathToFileURL(fixtureModule).href+"?v="+Date.now());
await writeFile(resolve(directory,"course-fixtures.json"),JSON.stringify({tracks,exams:Object.fromEntries(tracks.map(track=>[track.id,examBank(track.id)]))}));
const owner={email:"owner@example.test",password:"MindGrow-QA-owner-2026"};
await writeFile(resolve(directory,"owner-fixture.json"),JSON.stringify(owner));
await writeFile(resolve(directory,"owner.env"),"OWNER_EMAIL="+owner.email+"\nOWNER_PASSWORD_HASH="+await hashOwnerPassword(owner.password)+"\n");
console.log("Created local browser QA fixtures in ignored outputs/browser-qa/.");
