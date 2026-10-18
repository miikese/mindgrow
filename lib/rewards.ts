import type {Context,DB} from "./service";
import {catalogue,MAX_LEVEL} from "./catalogue";
export type Wallet={xp:number;hints:number;completed:number;nextBonus:number};
export async function wallet(db:DB,profile:string):Promise<Wallet>{
 // Import earlier practice once per learner, outside schema migrations. At most
 // 13 games × 100 levels × 3 difficulties can earn a first-completion reward.
 const marker="legacy:"+profile;
 if(!await db.prepare("SELECT id FROM learner_rewards WHERE id=?").bind(marker).first()){
  await db.prepare(`INSERT OR IGNORE INTO learner_rewards(id,profile,kind,xp,hints,reason,actor,created,context)
    SELECT 'level:'||profile||':'||game||':'||difficulty||':'||level,profile,'level',points,
     1+CASE WHEN ROW_NUMBER() OVER(ORDER BY created,game,difficulty,level)%5=0 THEN 2 ELSE 0 END,
     'Earlier completed practice','practice',created,json_object('game',game,'level',level,'difficulty',difficulty)
    FROM (SELECT p.id AS profile,json_extract(g.data,'$.game') AS game,COALESCE(json_extract(g.data,'$.difficulty'),'easy') AS difficulty,
     json_extract(g.data,'$.level') AS level,MIN(g.created) AS created,MIN(MAX(5,MIN(30,COALESCE(json_extract(g.data,'$.points'),30)))) AS points
     FROM records g JOIN records p ON p.id=json_extract(g.data,'$.profile') AND p.kind='profile' AND p.owner=g.owner
     WHERE p.id=? AND g.kind='progress' AND json_extract(g.data,'$.complete')=1
      AND json_extract(g.data,'$.level') BETWEEN 1 AND 100 AND COALESCE(json_extract(g.data,'$.difficulty'),'easy') IN ('easy','medium','hard')
      AND json_extract(g.data,'$.game') IN ('memory','pattern','sequence','maze','blockly','sudoku','word','html','tiles','lights','recall','math','falling')
     GROUP BY profile,game,difficulty,level LIMIT 3900)` ).bind(profile).run();
  await db.prepare("INSERT OR IGNORE INTO learner_rewards(id,profile,kind,xp,hints,reason,actor,created,context) SELECT ?,?,'migration',0,0,'Earlier practice checked','system',?,'{}' WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND kind='profile')").bind(marker,profile,new Date().toISOString(),profile).run();
 }

 const row=await db.prepare("SELECT COALESCE(SUM(xp),0) AS xp,3+COALESCE(SUM(hints),0) AS hints,COALESCE(SUM(CASE WHEN kind='level' THEN 1 ELSE 0 END),0) AS completed FROM learner_rewards WHERE profile=?").bind(profile).first();
 const completed=Number(row?.completed||0);return{xp:Number(row?.xp||0),hints:Number(row?.hints??3),completed,nextBonus:5-completed%5};
}
export function levelReward(db:DB,data:Record<string,any>,now:string){
 return db.prepare("INSERT OR IGNORE INTO learner_rewards(id,profile,kind,xp,hints,reason,actor,created,context) SELECT ?,?,'level',?,1+CASE WHEN ((SELECT COUNT(*) FROM learner_rewards WHERE profile=? AND kind='level')+1)%5=0 THEN 2 ELSE 0 END,?,'practice',?,? WHERE EXISTS(SELECT 1 FROM records WHERE id=? AND kind='profile')").bind(`level:${data.profile}:${data.game}:${data.difficulty}:${data.level}`,data.profile,data.points,data.profile,`Completed ${data.game} level ${data.level} (${data.difficulty})`,now,JSON.stringify({game:data.game,level:data.level,difficulty:data.difficulty}),data.profile);
}
export function rewardContext(d:Record<string,any>){
 if(!catalogue.some(g=>g.id===d.game&&g.id!=="falling")||!Number.isInteger(d.level)||d.level<1||d.level>MAX_LEVEL||!["easy","medium","hard"].includes(d.difficulty))throw new Error("Choose a valid puzzle level.");
 return JSON.stringify({game:d.game,level:d.level,difficulty:d.difficulty});
}
export function requestId(value:unknown){if(typeof value!=="string"||!(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)))throw new Error("A valid request ID is required.");return value;}
export async function handleRewards(req:Request,ctx:Context,readBody:()=>Promise<any>):Promise<Response|null>{
 const url=new URL(req.url),path=url.pathname.replace(/^\/api\/?/,"");if(!["rewards","rewards/hint"].includes(path))return null;
 const json=(v:unknown,s=200)=>Response.json(v,{status:s,headers:{"cache-control":"no-store"}});
 if(!ctx.user)return json({error:"Sign in and choose a learner to save hints."},401);
 const d=req.method==="GET"?{profile:url.searchParams.get("profile")}:await readBody(),profile=String(d.profile||"");
 const own=await ctx.db.prepare("SELECT id FROM records WHERE id=? AND kind='profile' AND owner=?").bind(profile,ctx.user.userId).first();if(!own)return json({error:"Choose your own learner profile."},403);
 if(path==="rewards"&&req.method==="GET"){
  const history=(await ctx.db.prepare("SELECT kind,xp,hints,reason,created FROM learner_rewards WHERE profile=? ORDER BY created DESC,id DESC LIMIT 30").bind(profile).all()).results;
  return json({wallet:await wallet(ctx.db,profile),history});
 }
 if(path==="rewards/hint"&&req.method==="POST"){
  await wallet(ctx.db,profile);
  const context=rewardContext(d),id="hint:"+profile+":"+requestId(d.requestId);
  const previous=await ctx.db.prepare("SELECT context FROM learner_rewards WHERE id=?").bind(id).first();if(previous&&previous.context!==context)return json({error:"This request was already used for another puzzle."},409);
  await ctx.db.prepare("INSERT OR IGNORE INTO learner_rewards(id,profile,kind,xp,hints,reason,actor,created,context) SELECT ?,?,'hint',0,-1,'Used a puzzle hint',?,?,? WHERE 3+COALESCE((SELECT SUM(hints) FROM learner_rewards WHERE profile=?),0)>0").bind(id,profile,ctx.user.userId,new Date().toISOString(),context,profile).run();
  const saved=await ctx.db.prepare("SELECT id,context FROM learner_rewards WHERE id=?").bind(id).first();if(saved&&saved.context!==context)return json({error:"This request was already used for another puzzle."},409);if(!saved)return json({error:"No hints left. Complete a new level to earn another. Rules and resets are always free.",wallet:await wallet(ctx.db,profile)},409);
  return json({used:true,wallet:await wallet(ctx.db,profile)});
 }
 return json({error:"Endpoint not found."},404);
}
