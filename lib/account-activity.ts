import type {Context, DB} from "./service";

export const ACTIVE_MINUTES = 5;
export type Account = {id:string;name:string;email:string|null;role:string;firstSeen:string|null;lastSeen:string|null;profiles:number;activeRecently:boolean};
export type AccountDirectory = {accounts:Account[];total:number;page:number;pageSize:number;activeWindowMinutes:number;asOf:string};

export async function rememberAccount(ctx:Context, now:string) {
 const user=ctx.user;if(!user)return;
 const email=user.email?.trim().toLowerCase()||null;
 const role=ctx.adminIds.includes(user.userId)||(email&&ctx.adminEmails?.includes(email))?"admin":"member";
 // One activity write per minute, or immediately when verified account details change.
 const cutoff=new Date(Date.parse(now)-60000).toISOString();
 await ctx.db.prepare(`INSERT INTO users(id,name,role,email,first_seen,last_seen) VALUES(?,?,?,?,?,?)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=COALESCE(excluded.email,users.email),
 role=CASE WHEN excluded.role='admin' THEN 'admin' ELSE users.role END,
 first_seen=COALESCE(users.first_seen,excluded.first_seen),last_seen=excluded.last_seen
 WHERE users.last_seen IS NULL OR users.last_seen<? OR users.name<>excluded.name
 OR (excluded.email IS NOT NULL AND users.email IS NOT excluded.email)
 OR (excluded.role='admin' AND users.role<>'admin')`).bind(user.userId,user.displayName,role,email,now,now,cutoff).run();
}

export async function accountTotals(db:DB, now:string) {
 const cutoff=new Date(Date.parse(now)-ACTIVE_MINUTES*60000).toISOString();
 const row=await db.prepare("SELECT COUNT(*) AS accounts,COUNT(CASE WHEN last_seen>=? THEN 1 END) AS activeAccounts FROM users").bind(cutoff).first();
 return {accounts:Number(row?.accounts||0),activeAccounts:Number(row?.activeAccounts||0)};
}

export async function accountDirectory(db:DB, url:URL, now:string):Promise<AccountDirectory> {
 const query=(url.searchParams.get("q")||"").trim().slice(0,100).toLowerCase(),pageSize=50;
 const requested=Number(url.searchParams.get("page")||1),page=Number.isSafeInteger(requested)&&requested>0?Math.min(requested,1000000):1;
 const term="%"+query.replace(/[\\%_]/g,"\\$&")+"%";
 const where="WHERE LOWER(u.name) LIKE ? ESCAPE '\\' OR LOWER(COALESCE(u.email,'')) LIKE ? ESCAPE '\\'";
 const count=await db.prepare("SELECT COUNT(*) AS count FROM users u "+where).bind(term,term).first();
 const rows=(await db.prepare(`SELECT u.id,u.name,u.email,u.role,u.first_seen AS firstSeen,u.last_seen AS lastSeen,
 (SELECT COUNT(*) FROM records p WHERE p.owner=u.id AND p.kind='profile') AS profiles
 FROM users u ${where} ORDER BY u.last_seen IS NULL,u.last_seen DESC,u.id LIMIT ? OFFSET ?`).bind(term,term,pageSize,(page-1)*pageSize).all()).results;
 const cutoff=new Date(Date.parse(now)-ACTIVE_MINUTES*60000).toISOString();
 return {accounts:rows.map((r:Account)=>({...r,profiles:Number(r.profiles),activeRecently:!!r.lastSeen&&r.lastSeen>=cutoff})),total:Number(count?.count||0),page,pageSize,activeWindowMinutes:ACTIVE_MINUTES,asOf:now};
}
