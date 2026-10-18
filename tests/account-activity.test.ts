import {afterEach,beforeEach,expect,it} from "vitest";
import {database} from "./database";
import {handle,type Context} from "../lib/service";
import {rememberAccount} from "../lib/account-activity";
let db:ReturnType<typeof database>,ctx:Context;
beforeEach(()=>{db=database();ctx={db,user:{userId:"owner",displayName:"Owner"},adminIds:["owner"]}});
afterEach(()=>db.close());
async function call(path:string){const response=await handle(new Request("https://example.test/api/"+path),ctx);return{status:response.status,body:await response.json() as any}}

it("lists authenticated members without requiring a learner profile and protects the directory",async()=>{
 ctx.user={userId:"member",displayName:"New member",email:"MEMBER@example.test"};
 expect((await call("me")).status).toBe(200);
 expect((await call("admin/accounts")).status).toBe(403);
 ctx.user={userId:"owner",displayName:"Owner"};
 const list=await call("admin/accounts");expect(list.status).toBe(200);
 expect(list.body.accounts.find((a:any)=>a.id==="member")).toMatchObject({name:"New member",email:"member@example.test",profiles:0,role:"member",activeRecently:true});
 const overview=await call("admin/overview");expect(overview.body.totals).toMatchObject({accounts:2,activeAccounts:2,learners:0});
 ctx.user=null;expect((await call("admin/accounts")).status).toBe(401);
 expect((await call("records")).body.records).toEqual([]);
});

it("preserves legacy members and roles and records first and last activity without replacing identity",async()=>{
 await db.prepare("INSERT INTO users(id,name,role) VALUES('legacy','Before tracking','admin')").run();
 ctx.user={userId:"legacy",displayName:"Updated name",email:"legacy@example.test"};
 const first="2026-01-01T10:00:00.000Z";
 await rememberAccount(ctx,first);await rememberAccount(ctx,"2026-01-01T10:00:20.000Z");
 let row=await db.prepare("SELECT * FROM users WHERE id='legacy'").first();
 expect(row).toMatchObject({role:"admin",first_seen:first,last_seen:first,name:"Updated name"});
 ctx.user={...ctx.user!,email:undefined};await rememberAccount(ctx,"2026-01-01T10:06:00.000Z");
 row=await db.prepare("SELECT * FROM users WHERE id='legacy'").first();
 expect(row).toMatchObject({first_seen:first,last_seen:"2026-01-01T10:06:00.000Z",email:"legacy@example.test"});
 ctx.user={userId:"owner",displayName:"Owner"};const list=(await call("admin/accounts?q=legacy")).body;
 expect(list.accounts[0].activeRecently).toBe(false);
});

it("searches and paginates accounts without duplicates and treats wildcard characters literally",async()=>{
 for(let i=0;i<55;i++)await db.prepare("INSERT INTO users(id,name,role,email) VALUES(?,?,'member',?)").bind("member-"+String(i).padStart(2,"0"),"Member "+i,"member"+i+"@example.test").run();
 await db.prepare("INSERT INTO users(id,name,role) VALUES('percent','100% learner','member')").run();
 const first=(await call("admin/accounts")).body,second=(await call("admin/accounts?page=2")).body;
 expect(first.total).toBe(57);expect(first.accounts).toHaveLength(50);expect(second.accounts).toHaveLength(7);
 expect(new Set([...first.accounts,...second.accounts].map(a=>a.id)).size).toBe(57);
 const match=(await call("admin/accounts?q=member54%40example.test")).body;
 expect(match.accounts.map((a:any)=>a.id)).toEqual(["member-54"]);
 expect((await call("admin/accounts?q=%25")).body.accounts.map((a:any)=>a.id)).toEqual(["percent"]);
 expect((await call("admin/accounts?page=-1")).body.page).toBe(1);
});
