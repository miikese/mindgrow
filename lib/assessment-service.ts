import type {Context,Stored} from "./service";
import {tracks,lessonKey} from "./learning";
import {examPaper,practicalTasks,gradeExam,reviewKey} from "./exam-bank";
import {MIN_PRACTICAL_LENGTH,type ExamData} from "./exam-types";
type Args={req:Request;ctx:Context;path:string;now:string;readBody:()=>Promise<any>};
const failure=(message:string,status=400):never=>{throw Object.assign(new Error(message),{status});};
const response=(value:unknown,status=200)=>Response.json(value,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
export async function handleAssessments({req,ctx,path,now,readBody}:Args):Promise<Response|null>{
 if(path!=="learning"&&!path.startsWith("lessons/")&&path!=="exams"&&!path.startsWith("exams/"))return null;
 const {db,user}=ctx;
 const signed=()=>user||failure("Sign in and select a private learner profile to use final exams.",401);
 const query=(sql:string,...args:(string|number)[])=>db.prepare(sql).bind(...args);
 const rows=async(sql:string,...args:(string|number)[])=>(await query(sql,...args).all()).results as Stored[];
 const ownedProfile=async(id:unknown)=>{const u=signed();if(typeof id!=="string")failure("Choose a learner profile.");const row=await query("SELECT * FROM records WHERE id=? AND kind='profile' AND owner=?",id as string,u.userId).first();if(!row)failure("Choose your own learner profile.",403);return JSON.parse(row.data) as {name:string;group:string};};
 const owner=async()=>{const u=signed(),record=await query("SELECT role FROM users WHERE id=?",u.userId).first();if(!ctx.adminIds.includes(u.userId)&&!(u.email&&ctx.adminEmails?.includes(u.email.toLowerCase()))&&record?.role!=="admin")failure("Only the site owner can review exams and award certificates.",403);return u;};
 const serialize=(row:Stored)=>({...row,data:JSON.parse(row.data) as ExamData});
 const url=new URL(req.url);
 if(path==="learning"&&req.method==="GET"){
  const profile=url.searchParams.get("profile");await ownedProfile(profile);
  const lessons=await rows("SELECT * FROM records WHERE kind='lesson' AND owner=? AND json_extract(data,'$.profile')=?",signed().userId,profile!);
  return response({completed:lessons.map(row=>{const d=JSON.parse(row.data);return lessonKey(d.track,d.lesson)})});
 }
 if(path.startsWith("lessons/")&&req.method==="POST"){
  const [,trackId,lessonId]=path.split("/"),track=tracks.find(t=>t.id===trackId),lesson=track?.lessons.find(l=>l.id===lessonId);if(!lesson)failure("Lesson not found.",404);
  const d=await readBody();await ownedProfile(d.profile);if(!Number.isInteger(d.answer))failure("Choose an answer.");if(d.answer!==lesson!.answer)return response({correct:false});
  const id="lesson:"+d.profile+":"+trackId+":"+lessonId;
  await query("INSERT OR IGNORE INTO records(id,kind,owner,status,data,created,updated) VALUES(?,?,?,?,?,?,?)",id,"lesson",signed().userId,"private",JSON.stringify({profile:d.profile,track:trackId,lesson:lessonId}),now,now).run();
  return response({correct:true,id});
 }
 if(path==="exams/review"&&req.method==="GET"){
  await owner();const exams=await rows("SELECT * FROM records WHERE kind='exam' AND status!='in-progress' ORDER BY created DESC LIMIT 200");
  return response({exams:exams.map(row=>({...serialize(row),reviewKey:reviewKey(JSON.parse(row.data).track)}))});
 }
 if(path==="exams"&&req.method==="GET"){
  const profile=url.searchParams.get("profile");await ownedProfile(profile);
  return response({exams:(await rows("SELECT * FROM records WHERE kind='exam' AND owner=? AND json_extract(data,'$.profile')=? ORDER BY created DESC LIMIT 100",signed().userId,profile!)).map(serialize)});
 }
 if(path==="exams/start"&&req.method==="POST"){
  const d=await readBody(),learner=await ownedProfile(d.profile),track=tracks.find(t=>t.id===d.track);if(!track)failure("Choose a learning track.");
  const lessons=await rows("SELECT * FROM records WHERE kind='lesson' AND owner=? AND json_extract(data,'$.profile')=? AND json_extract(data,'$.track')=?",signed().userId,d.profile,track!.id),completed=new Set(lessons.map(row=>JSON.parse(row.data).lesson));
  if(!track!.lessons.every(lesson=>completed.has(lesson.id)))failure("Complete every lesson quiz in this track while signed in before starting its final exam.",403);
  const active=await query("SELECT * FROM records WHERE kind='exam' AND owner=? AND status='in-progress' AND json_extract(data,'$.profile')=? AND json_extract(data,'$.track')=? ORDER BY created DESC LIMIT 1",signed().userId,d.profile,track!.id).first();
  if(active)return response({exam:serialize(active)});
  const id=crypto.randomUUID(),seed=parseInt(id.replaceAll("-","").slice(0,8),16),data:ExamData={profile:d.profile,learner:learner.name,track:track!.id,version:1,questions:examPaper(track!.id,seed),tasks:practicalTasks(track!.id)};
  await query("INSERT INTO records(id,kind,owner,status,data,created,updated) VALUES(?,?,?,?,?,?,?)",id,"exam",signed().userId,"in-progress",JSON.stringify(data),now,now).run();
  return response({exam:{id,kind:"exam",status:"in-progress",data,created:now,updated:now}},201);
 }
 const match=/^exams\/([^/]+)\/(submit|review)$/.exec(path);
 if(match&&req.method==="POST"){
  const row:Stored|null=await query("SELECT * FROM records WHERE id=? AND kind='exam'",match[1]).first();if(!row)failure("Exam not found.",404);
  if(match[2]==="review")await owner();else if(row!.owner!==signed().userId)failure("This exam belongs to another learner.",403);
  const data=JSON.parse(row!.data) as ExamData,d=await readBody();
  if(match[2]==="submit"){
   if(row!.status!=="in-progress")failure("This attempt has already been submitted. Start a new attempt to retake it.",409);
   if(!d.answers||Array.isArray(d.answers)||typeof d.answers!=="object"||!d.practical||Array.isArray(d.practical)||typeof d.practical!=="object")failure("Answer every question and both practical tasks.");
   const answers:Record<string,number>={},practical:Record<string,string>={};for(const q of data.questions)answers[q.id]=d.answers[q.id];
   for(const task of data.tasks){const value=d.practical[task.id];if(typeof value!=="string"||value.trim().length<MIN_PRACTICAL_LENGTH||value.length>3000)failure("Each practical response must contain 180–3,000 characters of solution, explanation, and tests.");practical[task.id]=value.trim();}
   const grade=gradeExam(data.track,data.questions,answers),status=grade.qualified?"awaiting-review":"needs-practice",updated={...data,answers,practical,score:grade.score,correct:grade.correct,total:grade.total,submitted:now};
   const changed=await query("UPDATE records SET data=?,status=?,updated=? WHERE id=? AND status='in-progress' RETURNING id",JSON.stringify(updated),status,now,row!.id).first();if(!changed)failure("This attempt changed. Refresh to view its result.",409);
   return response({exam:{...row,status,data:updated,updated:now}});
  }
  const reviewer=await owner();if(row!.status!=="awaiting-review")failure("Only an exam awaiting owner review can be awarded or returned for revision.",409);
  if(d.decision!=="award"&&d.decision!=="revise")failure("Choose an owner review decision.");
  const feedback=typeof d.feedback==="string"?d.feedback.trim():"";if(feedback.length<10||feedback.length>1200)failure("Add 10–1,200 characters of review feedback.");
  const reference=typeof d.certificateReference==="string"?d.certificateReference.trim():"";
  if(d.decision==="award"){
   if(d.practicalApproved!==true)failure("Confirm that you have personally reviewed and approved both practical solutions.");
   if((data.score||0)<85)failure("This attempt has not met the reasoning pass mark.",409);
   if(reference.length<3||reference.length>80)failure("Enter your certificate reference (3–80 characters) to award it.");
   const duplicate=await query("SELECT id FROM records WHERE kind='exam' AND status='certified' AND json_extract(data,'$.certificateReference')=?",reference).first();if(duplicate)failure("That certificate reference is already assigned.",409);
  }
  const status=d.decision==="award"?"certified":"needs-revision",updated={...data,feedback,reviewedBy:reviewer.displayName,reviewedAt:now,...(d.decision==="award"?{certificateReference:reference}:{})};
  const changed=await query("UPDATE records SET data=?,status=?,updated=? WHERE id=? AND status='awaiting-review' RETURNING id",JSON.stringify(updated),status,now,row!.id).first();if(!changed)failure("Another review changed this attempt. Refresh before continuing.",409);
  await query("INSERT INTO audit(id,record,actor,status,note,created) VALUES(?,?,?,?,?,?)",crypto.randomUUID(),row!.id,reviewer.userId,status,feedback,now).run();
  return response({exam:{...row,status,data:updated,updated:now}});
 }
 return response({error:"Assessment endpoint not found."},404);
}
