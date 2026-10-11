export const groups = ["Little Thinkers","Young Coders","Future Developers","Mind Fitness"];
export const allowedGames:Record<string,string[]>={"Little Thinkers":["memory","pattern","sequence","maze"],"Young Coders":["memory","pattern","sequence","maze","blockly","word"],"Future Developers":["memory","pattern","sequence","maze","blockly","sudoku","word","html"],"Mind Fitness":["memory","pattern","sequence","maze","blockly","sudoku","word","html"]};
export const games = ["memory","pattern","sequence","maze","blockly","sudoku","word","html"];
export const publicKinds:string[]=[];
export const privateKinds=["profile","progress"];
export const publicStatuses:string[]=[];
export const initialStatus=(_kind:string)=>"private";
export function text(v:unknown,name:string,min=1,max=200) {
 if(typeof v!=="string"||v.trim().length<min||v.trim().length>max)throw new Error(name+" must be "+min+"–"+max+" characters.");
 return v.trim();
}
export function validate(kind:string,d:Record<string,unknown>):Record<string,any> {
 if(kind==="profile"){
  if(!groups.includes(String(d.group)))throw new Error("Choose a learning path.");
  const reminder=Number(d.reminder||0);if(!Number.isInteger(reminder)||reminder<0||reminder>120)throw new Error("Reminder must be 0–120 minutes.");
  return {name:text(d.name,"Nickname",2,24),group:d.group,reminder,private:true};
 }
 if(kind==="progress"){
  if(!games.includes(String(d.game)))throw new Error("Unknown game.");
  const level=Number(d.level),attempts=Number(d.attempts),hints=Number(d.hints||0);
  if(!Number.isInteger(level)||level<1||level>50||!Number.isInteger(attempts)||attempts<1||attempts>10000||!Number.isInteger(hints)||hints<0||hints>10000)throw new Error("Invalid practice result.");
  if(typeof d.complete!=="boolean")throw new Error("Invalid completion result.");
  return {profile:text(d.profile,"Profile",1,100),game:d.game,level,attempts,hints,complete:d.complete,difficulty:["easy","medium","hard"].includes(String(d.difficulty))?d.difficulty:"easy",points:d.complete?Math.max(5,30-hints*3):0,private:true};
 }
 throw new Error("Unsupported record.");
}
export function canTransition(_kind:string,_from:string,_to:string){return false;}
// A compatible export for the companion runner; MindGrow does not collect location.
export function coordinates(_lat:unknown,_lng:unknown){throw new Error("Location is not collected by MindGrow.");}
