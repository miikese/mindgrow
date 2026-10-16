export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const SHAPES = [
 [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
 [[1,1],[1,1]],
 [[0,1,0],[1,1,1],[0,0,0]],
 [[0,1,1],[1,1,0],[0,0,0]],
 [[1,1,0],[0,1,1],[0,0,0]],
 [[1,0,0],[1,1,1],[0,0,0]],
 [[0,0,1],[1,1,1],[0,0,0]],
];
export type Piece = {type:number;rotation:number;x:number;y:number};
export type BlocksState = {board:number[][];piece:Piece;queue:number[];seed:number;held:number|null;canHold:boolean;status:"ready"|"running"|"paused"|"over";score:number;lines:number;seconds:number;base:number};
export type BlocksAction = {type:"reset";seed:number;base:number}|{type:"start"|"pause"|"resume"|"tick"|"second"|"drop"|"hold"}|{type:"move";dx:number;dy:number}|{type:"rotate";direction:1|-1};
export function pieceMatrix(piece:Piece){let matrix=SHAPES[piece.type].map(row=>[...row]);for(let turn=0;turn<piece.rotation;turn++)matrix=matrix[0].map((_,x)=>matrix.map(row=>row[x]).reverse());return matrix;}
export function pieceCells(piece:Piece){return pieceMatrix(piece).flatMap((row,y)=>row.flatMap((value,x)=>value?[{x:piece.x+x,y:piece.y+y}]:[]));}
export function fits(board:number[][],piece:Piece){return pieceCells(piece).every(p=>p.x>=0&&p.x<BOARD_WIDTH&&p.y>=0&&p.y<BOARD_HEIGHT&&!board[p.y][p.x]);}
function bag(seed:number){const pieces=[0,1,2,3,4,5,6];let next=seed>>>0;for(let i=6;i>0;i--){next=(Math.imul(next,1664525)+1013904223)>>>0;const j=Math.floor((next/4294967296)*(i+1));[pieces[i],pieces[j]]=[pieces[j],pieces[i]];}return {pieces,seed:next};}
function spawn(type:number):Piece{return{type,rotation:0,x:type===1?4:3,y:0};}
function take(queue:number[],seed:number){const list=[...queue];let next=seed;if(list.length<8){const b=bag(next);next=b.seed;list.push(...b.pieces);}return{piece:spawn(list[0]),queue:list.slice(1),seed:next};}
export function newBlocksGame(seed:number,base=1):BlocksState{const next=take([],seed);return{board:Array.from({length:BOARD_HEIGHT},()=>Array(BOARD_WIDTH).fill(0)),...next,held:null,canHold:true,status:"ready",score:0,lines:0,seconds:0,base};}
export function blocksStage(state:Pick<BlocksState,"base"|"seconds"|"lines">){return state.base+Math.floor(state.seconds/30)+Math.floor(state.lines/5);}
export function fallInterval(state:Pick<BlocksState,"base"|"seconds"|"lines">){return Math.max(90,850-(state.base-1)*90-Math.floor(state.seconds/30)*55-Math.floor(state.lines/5)*65);}
export function clearLines(board:number[][]){const remaining=board.filter(row=>row.some(cell=>!cell)),cleared=BOARD_HEIGHT-remaining.length;return{board:[...Array.from({length:cleared},()=>Array(BOARD_WIDTH).fill(0)),...remaining],cleared};}
export function ghostPiece(state:BlocksState){let piece={...state.piece};while(fits(state.board,{...piece,y:piece.y+1}))piece={...piece,y:piece.y+1};return piece;}
function lock(state:BlocksState):BlocksState{const board=state.board.map(row=>[...row]);for(const p of pieceCells(state.piece))board[p.y][p.x]=state.piece.type+1;const cleared=clearLines(board),next=take(state.queue,state.seed);return{...state,...next,board:cleared.board,canHold:true,lines:state.lines+cleared.cleared,score:state.score+[0,100,300,500,800][cleared.cleared]*blocksStage(state),status:fits(cleared.board,next.piece)?"running":"over"};}
export function blocksReducer(state:BlocksState,action:BlocksAction):BlocksState{
 if(action.type==="reset")return newBlocksGame(action.seed,action.base);
 if(action.type==="start"&&state.status==="ready"||action.type==="resume"&&state.status==="paused")return{...state,status:"running"};
 if(action.type==="pause"&&state.status==="running")return{...state,status:"paused"};
 if(state.status!=="running")return state;
 if(action.type==="second")return{...state,seconds:state.seconds+1};
 if(action.type==="tick"){const piece={...state.piece,y:state.piece.y+1};return fits(state.board,piece)?{...state,piece}:lock(state);}
 if(action.type==="move"){const piece={...state.piece,x:state.piece.x+action.dx,y:state.piece.y+action.dy};return fits(state.board,piece)?{...state,piece,score:state.score+(action.dy>0?1:0)}:state;}
 if(action.type==="rotate"){const rotated={...state.piece,rotation:(state.piece.rotation+action.direction+4)%4};for(const y of [0,-1])for(const x of [0,-1,1,-2,2]){const piece={...rotated,x:rotated.x+x,y:rotated.y+y};if(fits(state.board,piece))return{...state,piece};}return state;}
 if(action.type==="drop"){const piece=ghostPiece(state);return lock({...state,piece,score:state.score+(piece.y-state.piece.y)*2});}
 if(action.type==="hold"&&state.canHold){const next=state.held===null?take(state.queue,state.seed):{piece:spawn(state.held),queue:state.queue,seed:state.seed};return{...state,...next,held:state.piece.type,canHold:false,status:fits(state.board,next.piece)?"running":"over"};}
 return state;
}
