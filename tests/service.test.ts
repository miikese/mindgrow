import{it,expect,beforeEach,afterEach}from"vitest";
import{database}from"./database";import{handle,type Context}from"../lib/service";
let db:ReturnType<typeof database>,ctx:Context;
const user={userId:"guardian",displayName:"Guardian"};
async function call(path:string,method="GET",data?:unknown){const r=await handle(new Request("https://example.test/api/"+path,{method,headers:data?{"content-type":"application/json"}:{},...(data?{body:JSON.stringify(data)}:{})}),ctx);return{status:r.status,body:await r.json()as any};}
async function profile(group="Future Developers"){return(await call("records","POST",{kind:"profile",data:{name:"Test nickname",group,reminder:15}})).body.id;}
beforeEach(()=>{db=database();ctx={db,user,adminIds:[]};});afterEach(()=>db.close());
it("requires sign-in for a guardian-owned profile",async()=>{ctx.user=null;expect((await call("records","POST",{kind:"profile",data:{name:"Test",group:"Little Thinkers"}})).status).toBe(401);});
it("minimizes child profile data",async()=>{await call("records","POST",{kind:"profile",data:{name:"Little explorer",group:"Little Thinkers",email:"must-not-be-stored",birthdate:"2019-01-01",location:"must-not-be-stored"}});const r=(await call("records?mine=1")).body.records[0];expect(r.data).not.toHaveProperty("email");expect(r.data).not.toHaveProperty("birthdate");expect(r.data).not.toHaveProperty("location");});
it("never publishes learner profiles or practice history",async()=>{await profile();expect((await call("records")).body.records).toHaveLength(0);ctx.user={userId:"other",displayName:"Other"};expect((await call("records?mine=1")).body.records).toHaveLength(0);});
it("validates learning paths and session reminders",async()=>{expect((await call("records","POST",{kind:"profile",data:{name:"Test",group:"Unknown"}})).status).toBe(400);expect((await call("records","POST",{kind:"profile",data:{name:"Test",group:"Mind Fitness",reminder:-1}})).status).toBe(400);});
it("persists correctly scoped, validated practice results",async()=>{const id=await profile();const r=await call("records","POST",{kind:"progress",data:{profile:id,game:"html",level:1,attempts:2,hints:1,complete:true,difficulty:"easy",points:99999}});expect(r.status).toBe(201);const data=(await call("records?mine=1")).body.records.find((r:any)=>r.kind==="progress").data;expect(data.points).toBe(27);});
it("prevents one guardian writing another guardian's learner progress",async()=>{const id=await profile();ctx.user={userId:"other",displayName:"Other"};expect((await call("records","POST",{kind:"progress",data:{profile:id,game:"memory",level:1,attempts:1,complete:true}})).status).toBe(403);});
it("allows every game for signed-in learners in free mode",async()=>{const id=await profile("Little Thinkers");expect((await call("records","POST",{kind:"progress",data:{profile:id,game:"html",level:1,attempts:1,complete:true}})).status).toBe(201);});
it("rejects invalid levels, games and attempt counts",async()=>{const id=await profile();for(const data of [{game:"unknown",level:1,attempts:1},{game:"memory",level:0,attempts:1},{game:"memory",level:1,attempts:-1}])expect((await call("records","POST",{kind:"progress",data:{profile:id,...data,complete:true}})).status).toBe(400);});
it("deleting a learner also removes associated private progress",async()=>{const id=await profile();await call("records","POST",{kind:"progress",data:{profile:id,game:"memory",level:1,attempts:1,complete:true}});expect((await call("records/"+id,"DELETE")).status).toBe(200);expect((await call("records?mine=1")).body.records).toHaveLength(0);});
it("rejects account access without identity",async()=>{ctx.user=null;expect((await call("account","DELETE")).status).toBe(401);});

it("removes long learner histories with one atomic request and preserves other learners",async()=>{
 const id=await profile(),kept=await profile();
 const now=new Date().toISOString();
 await db.batch(Array.from({length:45},(_,i)=>db.prepare("INSERT INTO records(id,kind,owner,status,data,created,updated) VALUES(?,?,?,?,?,?,?)").bind("history-"+i,"progress",user.userId,"private",JSON.stringify({profile:id,game:"memory"}),now,now)));
 await call("records","POST",{kind:"progress",data:{profile:kept,game:"memory",level:1,attempts:1,complete:true}});
 expect((await call("records/"+id,"DELETE")).status).toBe(200);
 const records=(await call("records?mine=1")).body.records;
 expect(records).toHaveLength(2);
 expect(records.some((r:any)=>r.data.profile===id)).toBe(false);
 expect(records.some((r:any)=>r.data.profile===kept)).toBe(true);
});
it("scopes private history before limiting unrelated households",async()=>{
 const id=await profile();
 await db.batch(Array.from({length:1001},(_,i)=>db.prepare("INSERT INTO records(id,kind,owner,status,data,created,updated) VALUES(?,?,?,?,?,?,?)").bind("other-history-"+i,"progress","other-household","private",JSON.stringify({profile:"other"}),"2099-01-01","2099-01-01")));
 expect((await call("records?mine=1")).body.records.map((r:any)=>r.id)).toEqual([id]);
 expect((await call("records")).body.records).toEqual([]);
 ctx.user={userId:"other",displayName:"Other"};
 expect((await call("records/"+id,"DELETE")).status).toBe(403);
});
it("saves all new game types at level 100 through the API",async()=>{const id=await profile();for(const game of ["tiles","lights","recall","math"]){expect((await call("records","POST",{kind:"progress",data:{profile:id,game,level:100,attempts:1,complete:true}})).status).toBe(201);}expect((await call("records?mine=1")).body.records.filter((r:any)=>r.kind==="progress")).toHaveLength(4);expect((await call("records","POST",{kind:"progress",data:{profile:id,game:"tiles",level:101,attempts:1,complete:true}})).status).toBe(400);});
