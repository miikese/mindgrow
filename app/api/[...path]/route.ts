import {env} from "cloudflare:workers";
import {getChatGPTUser} from "../../chatgpt-auth";
import {handle,json} from "../../../lib/service";
async function route(req:Request){
 if(!env.DB)return json({error:"Database unavailable."},503);
 return handle(req,{db:env.DB,user:await getChatGPTUser(),adminIds:((env as unknown as {ADMIN_USER_IDS?:string}).ADMIN_USER_IDS||"").split(",").filter(Boolean),ownerEmail:(env as unknown as {OWNER_EMAIL?:string}).OWNER_EMAIL,ownerPasswordHash:(env as unknown as {OWNER_PASSWORD_HASH?:string}).OWNER_PASSWORD_HASH});
}
export const GET=route,POST=route,PATCH=route,DELETE=route;
