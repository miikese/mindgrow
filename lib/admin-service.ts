import {wallet,requestId} from "./rewards";
import type {Context,Stored} from "./service";
import {DEFAULT_ACCESS} from "./access";
export async function handleAdministration(req:Request,ctx:Context,readBody:()=>Promise<any>):Promise<Response|null>{
 const path=new URL(req.url).pathname.replace(/^\/api\/?/,"");
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{"cache-control":"no-store"}});
 if(path==="access"&&req.method==="GET")return json(DEFAULT_ACCESS);
 if(!path.startsWith("admin/"))return null;
 const user=ctx.user;if(!user)return json({error:"Owner sign-in required."},401);
 const role=await ctx.db.prepare("SELECT role FROM users WHERE id=?").bind(user.userId).first();
 if(!ctx.adminIds.includes(user.userId)&&!(user.email&&ctx.adminEmails?.includes(user.email.toLowerCase()))&&role?.role!=="admin")return json({error:"Only the site owner can use administration."},403);
 if(path==="admin/rewards"&&req.method==="POST"){
  const d=await readBody(),profile=String(d.profile||""),xp=d.xp??0,hints=d.hints??0,reason=typeof d.reason==="string"?d.reason.trim():"";
  if(!Number.isInteger(xp)||xp<0||xp>100000||!Number.isInteger(hints)||hints<0||hints>1000||!(xp||hints)||reason.length<5||reason.length>300)return json({error:"Grant 1–100,000 XP or 1–1,000 hints and give a reason of 5–300 characters."},400);
  const learner=await ctx.db.prepare("SELECT id,owner FROM records WHERE id=? AND kind='profile'").bind(profile).first();if(!learner)return json({error:"Learner not found."},404);
  const id="grant:"+profile+":"+requestId(d.requestId),context=JSON.stringify({xp,hints,reason}),now=new Date().toISOString();
  const previous=await ctx.db.prepare("SELECT context FROM learner_rewards WHERE id=?").bind(id).first();if(previous&&previous.context!==context)return json({error:"This grant request was already used. Start a new grant."},409);
  await ctx.db.batch([
   ctx.db.prepare("INSERT OR IGNORE INTO learner_rewards(id,profile,kind,xp,hints,reason,actor,created,context) VALUES(?,?,'grant',?,?,?,?,?,?)").bind(id,profile,xp,hints,reason,user.userId,now,context),
   ctx.db.prepare("INSERT INTO audit(id,record,actor,status,note,created) SELECT ?,?,?,'reward',?,? WHERE NOT EXISTS(SELECT 1 FROM audit WHERE id=?)").bind(id,profile,user.userId,`Granted ${xp} XP and ${hints} hints: ${reason}`,now,id),
   ctx.db.prepare("INSERT INTO notifications(id,owner,message,created) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(id,learner.owner,`Your learner received ${xp} XP and ${hints} hints: ${reason}`,now)
  ]);
  return json({granted:true,wallet:await wallet(ctx.db,profile)});
 }
 if(path==="admin/settings"){
  const row=await ctx.db.prepare("SELECT data FROM site_settings WHERE id='access'").first(),saved=row?JSON.parse(row.data):{};
  if(req.method==="GET")return json({settings:{...DEFAULT_ACCESS,...saved,mode:"free",billingConnected:false}});
  if(req.method==="PATCH"){
   const data=await readBody();if(data.mode&&data.mode!=="free")return json({error:"Payments are not connected. Free access remains active until a verified payment integration is configured."},409);
   const priceMinor=Number(data.priceMinor??saved.priceMinor??0),currency=String(data.currency||saved.currency||"USD").toUpperCase();
   if(!Number.isInteger(priceMinor)||priceMinor<0||priceMinor>10000000||!["USD","NGN","EUR","GBP","MAD","GHS","KES","ZAR"].includes(currency))return json({error:"Choose a supported currency and a valid future price."},400);
   const settings={...DEFAULT_ACCESS,priceMinor,currency},now=new Date().toISOString();
   await ctx.db.prepare("INSERT INTO site_settings(id,data,updated,actor) VALUES('access',?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated,actor=excluded.actor").bind(JSON.stringify(settings),now,user.userId).run();
   return json({settings,saved:true});
  }
 }
 if(path==="admin/rewards"&&req.method==="GET")return json({grants:(await ctx.db.prepare("SELECT r.id,r.profile,r.xp,r.hints,r.reason,r.actor,r.created,json_extract(p.data,'$.name') AS name FROM learner_rewards r JOIN records p ON p.id=r.profile WHERE r.kind='grant' ORDER BY r.created DESC LIMIT 50").all()).results});
 if(path==="admin/overview"&&req.method==="GET"){
  const all=async(sql:string)=>(await ctx.db.prepare(sql).all()).results as any[];
  const totals=await all("SELECT kind,COUNT(*) AS count FROM records GROUP BY kind"),counts=Object.fromEntries(totals.map(r=>[r.kind,Number(r.count)]));
  const households=await ctx.db.prepare("SELECT COUNT(DISTINCT owner) AS count FROM records WHERE kind='profile'").first();
  const pending=await ctx.db.prepare("SELECT COUNT(*) AS count FROM records WHERE kind='exam' AND status='awaiting-review'").first();
  const certified=await ctx.db.prepare("SELECT COUNT(*) AS count FROM records WHERE kind='exam' AND status='certified'").first();
  const learners=await all("SELECT p.id,p.data,p.created, (SELECT COUNT(*) FROM records g WHERE g.kind='progress' AND json_extract(g.data,'$.profile')=p.id) AS sessions, (SELECT COUNT(*) FROM records l WHERE l.kind='lesson' AND json_extract(l.data,'$.profile')=p.id) AS lessons FROM records p WHERE p.kind='profile' ORDER BY p.created DESC LIMIT 200");
  const recent=await all("SELECT id,kind,status,data,created FROM records WHERE kind IN ('progress','lesson','exam') ORDER BY created DESC LIMIT 30");
  return json({totals:{households:Number(households?.count||0),learners:counts.profile||0,sessions:counts.progress||0,lessons:counts.lesson||0,exams:counts.exam||0,pending:Number(pending?.count||0),certified:Number(certified?.count||0)},learners:await Promise.all(learners.map(async r=>({...r,data:JSON.parse(r.data),wallet:await wallet(ctx.db,r.id)}))),recent:recent.map((r:Stored)=>{const d=JSON.parse(r.data);return{id:r.id,kind:r.kind,status:r.status,created:r.created,profile:d.profile,game:d.game,track:d.track,lesson:d.lesson,level:d.level,score:d.score}})});
 }
 return json({error:"Administration endpoint not found."},404);
}
