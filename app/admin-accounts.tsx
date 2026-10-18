"use client";
import {useCallback,useEffect,useState} from "react";
import {RefreshCw,Search,Users} from "lucide-react";
import {api} from "../lib/client";
import type {AccountDirectory} from "../lib/account-activity";
import {Notice} from "./components";

const date=(value:string|null)=>value?new Date(value).toLocaleString():"Not recorded";
export function AdminAccounts(){
 const [query,setQuery]=useState(""),[search,setSearch]=useState(""),[page,setPage]=useState(1),[data,setData]=useState<AccountDirectory|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>{setSearch(query.trim());setPage(1)},300);return()=>clearTimeout(timer)},[query]);
 const load=useCallback(async()=>{setBusy(true);try{const result=await api("admin/accounts?q="+encodeURIComponent(search)+"&page="+page);setData(result);setError("")}catch(e){setError((e as Error).message)}finally{setBusy(false)}},[search,page]);
 useEffect(()=>{void load();const refresh=()=>{if(document.visibilityState==="visible")void load()};const timer=setInterval(refresh,30000);document.addEventListener("visibilitychange",refresh);return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",refresh)}},[load]);
 return <section aria-labelledby="accounts-title"><div className="heading-row"><div><h2 id="accounts-title">Signed-in accounts</h2><p className="device-note">Every member who has used MindGrow while signed in, including members without a learner profile.</p></div><button className="button secondary" disabled={busy} onClick={()=>void load()}><RefreshCw size={15}/>{busy?"Updating…":"Refresh accounts"}</button></div>
 <label className="field account-search"><span><Search size={15}/>Find an account</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by account name or email" maxLength={100}/></label>
 <p className="device-note">Active recently means activity in the last {data?.activeWindowMinutes||5} minutes. This view updates every 30 seconds. Guest visits are not identified.</p>
 {error&&<Notice error>{error}</Notice>}
 <div className="admin-table-wrap" aria-busy={busy}><table className="admin-table"><thead><tr><th>Account</th><th>Email</th><th>Access</th><th>Learners</th><th>Last active</th><th>First seen</th></tr></thead><tbody>{data?.accounts.map(account=><tr key={account.id}><td><span className="learner-name"><Users size={16}/>{account.name}</span>{account.activeRecently&&<small className="account-active">Active recently</small>}</td><td>{account.email||"Not shared by sign-in"}</td><td>{account.role==="admin"?"Administrator":account.role==="moderator"?"Moderator":"Member"}</td><td>{account.profiles}</td><td>{date(account.lastSeen)}</td><td>{date(account.firstSeen)}</td></tr>)}</tbody></table>{!data&&!error?<p className="empty" role="status">Loading signed-in accounts…</p>:data&&!data.accounts.length?<p className="empty">{search?"No accounts match this search.":"No accounts recorded yet. Members appear after signing in, even before creating a learner."}</p>:null}</div>
 {data&&<div className="account-pagination"><span>{data.total} {data.total===1?"account":"accounts"}{search?" matching your search":""} · Updated {new Date(data.asOf).toLocaleTimeString()}</span><div><button className="button small secondary" disabled={busy||page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page}</span><button className="button small secondary" disabled={busy||page*data.pageSize>=data.total} onClick={()=>setPage(page+1)}>Next</button></div></div>}
 </section>;
}
