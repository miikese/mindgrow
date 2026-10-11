export type Point={x:number;y:number};
export const WALLS:Point[]=[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:3,y:1},{x:3,y:2},{x:3,y:3}];
export const START={x:0,y:0},GOAL={x:4,y:4};
export const MOVE:Record<string,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export function move(point:Point,direction:string){
 const d=MOVE[direction];if(!d)throw new Error("Unknown instruction.");
 const next={x:point.x+d.x,y:point.y+d.y};
 if(next.x<0||next.y<0||next.x>4||next.y>4||WALLS.some(p=>p.x===next.x&&p.y===next.y))return{point,blocked:true};
 return{point:next,blocked:false};
}
export function runCommands(commands:string[],start=START){
 if(commands.length>100)throw new Error("A program can have at most 100 steps.");
 let point=start;const frames:Point[]=[];let blocked=false;
 for(const cmd of commands){const step=move(point,cmd);if(step.blocked){blocked=true;break;}point=step.point;frames.push(point);}
 return{point,frames,blocked,won:point.x===GOAL.x&&point.y===GOAL.y};
}
export type Instruction={type:"move";direction:string}|{type:"repeat";times:number;body:Instruction[]};
export function flatten(program:Instruction[],depth=0):string[]{
 if(depth>5)throw new Error("Use at most five nested loops.");
 let commands:string[]=[];
 for(const instruction of program){
  if(instruction.type==="move"){if(!MOVE[instruction.direction])throw new Error("Unknown instruction.");commands.push(instruction.direction);}
  else{if(!Number.isInteger(instruction.times)||instruction.times<1||instruction.times>10)throw new Error("Repeat 1–10 times.");const body=flatten(instruction.body,depth+1);for(let i=0;i<instruction.times;i++)commands.push(...body);}
  if(commands.length>100)throw new Error("This program is too long. Use at most 100 steps.");
 }
 return commands;
}
export function shuffle<T>(values:T[],seed=1){
 const a=[...values];let n=seed>>>0;
 for(let i=a.length-1;i>0;i--){n=(1664525*n+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function memoryDeck(pairs=6,seed=1){return shuffle(Array.from({length:pairs*2},(_,i)=>({id:i,value:i%pairs})),seed);}
export function pattern(level:number){const colors=["coral","gold","mint","blue"],width=Math.min(4,2+Math.floor((level-1)/3)),cycle=colors.slice(0,width),sequence=Array.from({length:width*2+1},(_,i)=>cycle[i%width]);return{sequence,answer:cycle[sequence.length%width],choices:colors};}
export function numberSequence(level:number,difficulty="easy"){const step=difficulty==="hard"?level+3:level+1,start=level;return{numbers:[start,start+step,start+2*step,start+3*step],answer:start+4*step,step};}
export const SUDOKU_SOLUTION=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
export function sudokuPuzzle(level:number,difficulty="easy"){const solution=SUDOKU_SOLUTION.map(row=>row.map(v=>((v+level-2)%4)+1));return{solution,puzzle:solution.map((row,y)=>row.map((v,x)=>(x+y+level)%(difficulty==="hard"?3:2)===0?0:v))};}
export function validSudoku(grid:number[][]){
 if(grid.length!==4||grid.some(r=>r.length!==4))return false;
 const valid=(a:number[])=>a.every(v=>Number.isInteger(v)&&v>=1&&v<=4)&&new Set(a).size===4;
 if(!grid.every(valid))return false;
 for(let x=0;x<4;x++)if(!valid(grid.map(r=>r[x])))return false;
 for(let y=0;y<4;y+=2)for(let x=0;x<4;x+=2)if(!valid([grid[y][x],grid[y][x+1],grid[y+1][x],grid[y+1][x+1]]))return false;
 return true;
}
export function wordPuzzle(level:number){const words=["BENUE","LEARN","GROW","THINK","CODE"],answer=words[(level-1)%words.length];return{answer,letters:shuffle(answer.split(""),level+17),hint:{BENUE:"A Nigerian state where Otukpo is located.",LEARN:"What we do when we discover something new.",GROW:"To become bigger, or develop over time.",THINK:"To use your mind to consider an idea.",CODE:"Instructions written for a computer."}[answer]};}
export function validateHtml(code:string){
 if(code.length>6000)return{valid:false,message:"Keep your page under 6,000 characters."};
 const heading=/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i.exec(code)?.[1]?.replace(/<[^>]*>/g,"").trim();
 const paragraph=/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i.exec(code)?.[1]?.replace(/<[^>]*>/g,"").trim();
 if(heading!=="Hello, world!")return{valid:false,message:"Add an h1 heading with the text Hello, world!"};
 if(!paragraph||paragraph.length<12)return{valid:false,message:"Add a paragraph with at least 12 characters about a place you like."};
 return{valid:true,message:"Your first web page is ready. Nicely done!"};
}
export function nextDifficulty(results:{complete:boolean;attempts:number}[]){
 const recent=results.slice(-3);
 if(recent.length>=2&&recent.filter(r=>!r.complete||r.attempts>4).length>=2)return"easy";
 if(recent.length===3&&recent.every(r=>r.complete&&r.attempts<=2))return"hard";
 return"medium";
}
