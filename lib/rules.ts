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
 const commands:string[]=[];
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
export function pattern(level:number){const colors=["coral","gold","mint","blue"],width=Math.min(5,2+Math.floor((level-1)/16)),cycle=level===1?["coral","gold"]:Array.from({length:width},(_,i)=>colors[(Math.floor((level-2)/4**i)+i)%4]),sequence=Array.from({length:cycle.length*2+1},(_,i)=>cycle[i%cycle.length]);return{sequence,answer:cycle[sequence.length%cycle.length],choices:colors};}
export function numberSequence(level:number,difficulty="easy"){const step=difficulty==="hard"?level+3:level+1,start=level;return{numbers:[start,start+step,start+2*step,start+3*step],answer:start+4*step,step};}
export const SUDOKU_SOLUTION=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
export function sudokuPuzzle(level:number,difficulty="easy"){
 const digits=level===1?[1,2,3,4]:shuffle([1,2,3,4],level*13),bands=level===1?[0,1]:shuffle([0,1],level*17),stacks=level===1?[0,1]:shuffle([0,1],level*19),rows=bands.flatMap(b=>level===1?[b*2,b*2+1]:shuffle([b*2,b*2+1],level*23+b)),cols=stacks.flatMap(b=>level===1?[b*2,b*2+1]:shuffle([b*2,b*2+1],level*29+b)),solution=rows.map(y=>cols.map(x=>digits[SUDOKU_SOLUTION[y][x]-1])),blanks=new Set(shuffle(Array.from({length:16},(_,i)=>i),level*37).slice(0,difficulty==="hard"?8:difficulty==="medium"?6:4));
 return{solution,puzzle:solution.map((row,y)=>row.map((v,x)=>blanks.has(y*4+x)?0:v))};
}
export function validSudoku(grid:number[][]){
 if(grid.length!==4||grid.some(r=>r.length!==4))return false;
 const valid=(a:number[])=>a.every(v=>Number.isInteger(v)&&v>=1&&v<=4)&&new Set(a).size===4;
 if(!grid.every(valid))return false;
 for(let x=0;x<4;x++)if(!valid(grid.map(r=>r[x])))return false;
 for(let y=0;y<4;y+=2)for(let x=0;x<4;x+=2)if(!valid([grid[y][x],grid[y][x+1],grid[y+1][x],grid[y+1][x+1]]))return false;
 return true;
}
export const wordBank:[string,string][]=[
 ["BENUE","A Nigerian state where Otukpo is located."],["LEARN","Discover a skill or a new idea."],["GROW","Develop over time, like a seedling."],["THINK","Use your mind to consider an idea."],["CODE","Instructions written for a computer."],
 ["SEED","The tiny beginning of a plant."],["LEAF","A green part that grows on a branch."],["TREE","A tall plant with a woody trunk."],["RAIN","Water falling from clouds."],["SUN","The star that lights our day."],
 ["MOON","Our natural satellite in the night sky."],["STAR","A distant light in the night sky."],["CLOUD","A group of tiny water droplets in the sky."],["RIVER","Water flowing toward a lake or sea."],["OCEAN","A vast body of salt water."],
 ["GARDEN","A place to grow flowers and food."],["FLOWER","A colorful blossom."],["FOREST","A large area full of trees."],["MEADOW","An open field of grass and wildflowers."],["BREEZE","A gentle wind."],
 ["CALM","Peaceful and unhurried."],["REST","Pause to recover your energy."],["PAUSE","A short stop before continuing."],["DREAM","An imagined adventure during sleep."],["SMILE","A happy expression on a face."],
 ["PLAY","Have fun with an activity."],["CREATE","Make something new."],["BUILD","Put parts together to make something."],["SOLVE","Find an answer to a problem."],["IDEA","A thought about something possible."],
 ["LOGIC","Reasoning carefully from what you know."],["PUZZLE","A problem made for you to figure out."],["NUMBER","A value used for counting."],["PATTERN","A repeated arrangement or rhythm."],["MEMORY","The ability to remember something."],
 ["FOCUS","Give your attention to one thing."],["NOTICE","Become aware of a small detail."],["EXPLORE","Look around and discover."],["WONDER","Feel curious about something."],["QUESTION","Something you ask to learn more."],
 ["ANSWER","A response to a question."],["PRACTICE","Repeat a skill to become more comfortable."],["PROGRESS","Moving forward a little at a time."],["JOURNEY","A trip with many small steps."],["BEGIN","Make a start."],
 ["STEP","One small action in a sequence."],["PATH","A route from one place to another."],["MAZE","A puzzle of winding paths."],["ROBOT","A machine that follows instructions."],["LOOP","Code that repeats an action."],
 ["VALUE","A piece of data stored in a program."],["STRING","Text in a programming language."],["BOOLEAN","A true-or-false value."],["VARIABLE","A name that holds a value."],["FUNCTION","A named, reusable group of instructions."],
 ["RETURN","Give a result back from a function."],["INPUT","Data given to a program."],["OUTPUT","The result produced by a program."],["PRINT","Display text or a value in Python."],["DEBUG","Find and fix a mistake in code."],
 ["LIST","An ordered collection of items."],["INDEX","A position used to find an item in a list."],["ARRAY","A collection of values at numbered positions."],["OBJECT","A collection of named properties."],["METHOD","A function that belongs to an object."],
 ["BROWSER","An application used to visit websites."],["WEBSITE","A collection of connected web pages."],["PAGE","One document on a website."],["HEADING","A title that introduces a section."],["PARAGRAPH","A group of sentences about one idea."],
 ["LINK","A clickable connection to another place."],["STYLE","The appearance of an element."],["COLOR","A property such as blue or green."],["LAYOUT","How elements are arranged in a space."],["PADDING","Space inside an element’s border."],
 ["MARGIN","Space outside an element’s border."],["BORDER","The edge around an element."],["BUTTON","A control you press to perform an action."],["FORM","A group of fields for entering information."],["LABEL","Text that names a field or control."],
 ["SCREEN","The display you look at on a device."],["PIXEL","A tiny unit in a digital image."],["IMAGE","A picture on a page."],["ICON","A small symbol representing an action or idea."],["CURSOR","The pointer that moves on your screen."],
 ["KEYBOARD","Keys used to type and navigate."],["SCRIPT","A file of programming instructions."],["PYTHON","A programming language named after a comedy group."],["SYNTAX","The rules for writing valid code."],["COMMENT","A note in code for people to read."],
 ["INTEGER","A whole number."],["DECIMAL","A number that can have a fractional part."],["COMPARE","Look for similarities or differences."],["CONDITION","A test that is true or false."],["REPEAT","Do an action again."],
 ["ALGORITHM","A step-by-step method for solving a problem."],["PROJECT","Something you plan and build."],["LESSON","A small piece of learning."],["CURIOUS","Eager to discover or understand."],["PATIENCE","Giving yourself time without rushing."]
];
export function wordPuzzle(level:number){const [answer,hint]=wordBank[(level-1)%wordBank.length];let letters=shuffle(answer.split(""),level+17);if(letters.join("")===answer)letters=[...letters.slice(1),letters[0]];return{answer,letters,hint};}
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

export function spellingPuzzle(level:number,difficulty="easy"){
 const vocabulary=wordBank.filter(([w])=>w!=="BENUE");
 const band=difficulty==="hard"?vocabulary.filter(([w])=>w.length>=7):difficulty==="medium"?vocabulary.filter(([w])=>w.length>=5&&w.length<=7):vocabulary.filter(([w])=>w.length<=5);
 const [answer,clue]=band[(level-1)%band.length];let letters=shuffle(answer.split(""),level*53+19);if(letters.join("")===answer)letters=[...letters.slice(1),letters[0]];
 const mode=(["tiles","missing","recall"] as const)[(level-1)%3],blanks=new Set(shuffle(Array.from({length:answer.length},(_,i)=>i),level*71).slice(0,Math.max(1,Math.floor(answer.length/2))));
 return{answer,clue,letters,mode,pattern:answer.split("").map((c,i)=>blanks.has(i)?"_":c)};
}
