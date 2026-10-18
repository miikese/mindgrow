"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Lightbulb,Sparkles} from "lucide-react";
import {api} from "../lib/client";
import type {Wallet} from "../lib/rewards";
type Puzzle={game:string;level:number;difficulty:string};
export function guestWallet():Wallet{
 let rows:any[]=[];try{rows=JSON.parse(localStorage.getItem("mindgrow-guest-progress")||"[]")}catch{}
 const seen=new Set<string>();let xp=0;for(const r of rows){const key=[r.game,r.level,r.difficulty||"easy"].join(":");if(r.complete&&!seen.has(key)){seen.add(key);xp+=Number(r.points)||0;}}
 let spent=0;try{spent=JSON.parse(localStorage.getItem("mindgrow-guest-hints")||"[]").length}catch{}
 return{xp,hints:Math.max(0,3+seen.size+Math.floor(seen.size/5)*2-spent),completed:seen.size,nextBonus:5-seen.size%5};
}
export function useRewardWallet(profile:string){
 const [value,setValue]=useState<Wallet|null>(null),[error,setError]=useState(""),busy=useRef(false),generation=useRef(0),pending=useRef<{context:string;id:string}|null>(null);
 const refresh=useCallback(async()=>{const tick=++generation.current;try{const w=profile==="device-guest"?guestWallet():(await api("rewards?profile="+encodeURIComponent(profile))).wallet;if(tick===generation.current){setValue(w);setError("")}}catch(e){if(tick===generation.current){setValue(null);setError((e as Error).message)}}},[profile]);
 useEffect(()=>{setValue(null);pending.current=null;void refresh();const f=()=>void refresh();window.addEventListener("mindgrow-rewards",f);window.addEventListener("focus",f);return()=>{generation.current++;window.removeEventListener("mindgrow-rewards",f);window.removeEventListener("focus",f)}},[refresh]);
 const spend=async(puzzle:Puzzle)=>{if(busy.current)return false;busy.current=true;setError("");try{
  const context=profile+":"+JSON.stringify(puzzle);if(pending.current?.context!==context)pending.current={context,id:crypto.randomUUID()};const requestId=pending.current.id;
  if(profile==="device-guest"){
   const current=guestWallet();if(!current.hints)throw new Error("No hints left. Finish a new level to earn one. Rules and resets are free.");
   const ids=JSON.parse(localStorage.getItem("mindgrow-guest-hints")||"[]");if(!ids.includes(requestId)){ids.push(requestId);localStorage.setItem("mindgrow-guest-hints",JSON.stringify(ids))}setValue(guestWallet());
  }else{const r=await api("rewards/hint","POST",{profile,...puzzle,requestId});setValue(r.wallet)}pending.current=null;return true;
 }catch(e){setError((e as Error).message);return false}finally{busy.current=false}};
 return{wallet:value,error,spend,refresh};
}
export function WalletBar({wallet}:{wallet:Wallet|null}){return <div className="wallet-bar" aria-label="Learner rewards"><span><Sparkles size={17}/><strong>{wallet?.xp??"…"}</strong> XP</span><span><Lightbulb size={17}/><strong>{wallet?.hints??"…"}</strong> hints</span><small>Start with 3 · +1 per new level · +2 bonus every 5</small></div>}
