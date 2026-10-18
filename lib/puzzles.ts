import {type Point} from "./rules";
function shuffled<T>(values:T[],seed:number){const out=[...values];let n=seed>>>0;const random=()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export type MazeLayout={size:number;walls:Point[];start:Point;goal:Point;solution:string[]};
// A seeded depth-first maze: every open cell is reachable, without retry loops.
export function mazePuzzle(level:number,difficulty="easy"):MazeLayout {
 if(level===1&&difficulty==="easy")return {size:5,start:{x:0,y:0},goal:{x:4,y:4},walls:[{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:3,y:1},{x:3,y:2},{x:3,y:3}],solution:["down","down","down","right","right","down","right","right"]};
 const size=difficulty==="hard"?9:difficulty==="medium"||level>25?7:5,open=new Set(["0,0"]),visited=new Set(["0,0"]),stack=[{x:0,y:0}],directions=[{x:0,y:-2},{x:2,y:0},{x:0,y:2},{x:-2,y:0}];
 let tick=0;
 while(stack.length){const p=stack[stack.length-1],options=shuffled(directions,level*137+(++tick)*31+(difficulty==="hard"?991:0)).map(d=>({x:p.x+d.x,y:p.y+d.y})).filter(n=>n.x>=0&&n.y>=0&&n.x<size&&n.y<size&&!visited.has(n.x+","+n.y));
 if(!options.length){stack.pop();continue;}const n=options[0];visited.add(n.x+","+n.y);open.add(n.x+","+n.y);open.add((p.x+n.x)/2+","+(p.y+n.y)/2);stack.push(n);}
 const walls=Array.from({length:size*size},(_,i)=>({x:i%size,y:Math.floor(i/size)})).filter(p=>!open.has(p.x+","+p.y)),goal={x:size-1,y:size-1};
 const queue=[{point:{x:0,y:0},path:[] as string[]}],seen=new Set(["0,0"]);let solution:string[]=[];
 for(let i=0;i<queue.length;i++){const {point,path}=queue[i];if(point.x===goal.x&&point.y===goal.y){solution=path;break;}for(const [name,d] of Object.entries({up:{x:0,y:-1},right:{x:1,y:0},down:{x:0,y:1},left:{x:-1,y:0}})){const n={x:point.x+d.x,y:point.y+d.y},key=n.x+","+n.y;if(open.has(key)&&!seen.has(key)){seen.add(key);queue.push({point:n,path:[...path,name]});}}}
 return {size,walls,start:{x:0,y:0},goal,solution};
}
export function moveInMaze(point:Point,direction:string,maze:MazeLayout){const d=({up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}} as Record<string,Point>)[direction];if(!d)throw new Error("Unknown instruction.");const next={x:point.x+d.x,y:point.y+d.y};return next.x<0||next.y<0||next.x>=maze.size||next.y>=maze.size||maze.walls.some(p=>p.x===next.x&&p.y===next.y)?{point,blocked:true}:{point:next,blocked:false};}
export function tileNeighbors(index:number){return [index-3,index+3,index%3?index-1:-1,index%3<2?index+1:-1].filter(i=>i>=0&&i<9);}
export function slidingPuzzle(level:number,difficulty="easy"){const board=[1,2,3,4,5,6,7,8,0];let blank=8,previous=-1;for(let i=0;i<6+level+(difficulty==="hard"?24:difficulty==="medium"?12:0);i++){const next=shuffled(tileNeighbors(blank).filter(n=>n!==previous),level*83+i*17)[0];[board[blank],board[next]]=[board[next],board[blank]];previous=blank;blank=next;}if(board.every((v,i)=>v===(i+1)%9)){const n=tileNeighbors(blank)[0];[board[blank],board[n]]=[board[n],board[blank]];}return board;}
export function toggleLantern(board:boolean[],index:number){return board.map((v,i)=>i===index||Math.floor(i/3)===Math.floor(index/3)&&Math.abs(i-index)===1||Math.abs(i-index)===3?!v:v);}
export function lanternPuzzle(level:number){let board=Array(9).fill(true) as boolean[];const mask=(level*73)%512;for(let index=0;index<9;index++)if(mask&(1<<index))board=toggleLantern(board,index);return board;}
export function recallPuzzle(level:number,difficulty="easy"){return shuffled(Array.from({length:20},(_,i)=>i%4),level*71).slice(0,Math.min(9,3+Math.floor((level-1)/15)+(difficulty==="hard"?2:difficulty==="medium"?1:0)));}
export function mathPuzzle(level:number,difficulty="easy"){const a=2+level,b=2+level%9,op=level%3===0?"×":level%3===1?"+":"−";return{a:difficulty==="easy"?2+level%15:a,b,op,target:op==="×"?(difficulty==="easy"?2+level%15:a)*b:op==="+"?(difficulty==="easy"?2+level%15:a)+b:(difficulty==="easy"?2+level%15:a)-b};}

// Breadth-first search starts from the live position, including after a detour.
export function mazeRoute(maze:MazeLayout,from:Point){
 const queue=[{point:from,path:[] as string[]}],seen=new Set([from.x+","+from.y]);
 for(let i=0;i<queue.length;i++){const {point,path}=queue[i];if(point.x===maze.goal.x&&point.y===maze.goal.y)return path;
  for(const direction of ["up","right","down","left"]){const next=moveInMaze(point,direction,maze),key=next.point.x+","+next.point.y;if(!next.blocked&&!seen.has(key)){seen.add(key);queue.push({point:next.point,path:[...path,direction]})}}
 }return [];
}
export function lanternSolution(board:boolean[]){
 for(let mask=0;mask<512;mask++){let next=board;const taps:number[]=[];for(let i=0;i<9;i++)if(mask&(1<<i)){next=toggleLantern(next,i);taps.push(i)}if(next.every(Boolean))return taps}return [];
}
