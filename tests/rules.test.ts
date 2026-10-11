import{describe,it,expect}from"vitest";
import{memoryDeck,shuffle,pattern,numberSequence,move,runCommands,flatten,sudokuPuzzle,validSudoku,wordPuzzle,validateHtml,nextDifficulty,START,GOAL}from"../lib/rules";
describe("deterministic game rules",()=>{
 it("deals every memory symbol exactly twice",()=>{for(const n of [4,6,8]){const deck=memoryDeck(n,123);expect(deck).toHaveLength(n*2);for(let i=0;i<n;i++)expect(deck.filter(c=>c.value===i)).toHaveLength(2);}});
 it("keeps seeded shuffles deterministic and preserves all items",()=>{expect(shuffle([1,2,3,4],19)).toEqual(shuffle([1,2,3,4],19));expect(shuffle([1,2,3,4],19).sort()).toEqual([1,2,3,4]);});
 it("returns the next repeating pattern color",()=>{expect(pattern(1).answer).toBe("gold");for(let n=1;n<=50;n++)expect(pattern(n).choices).toContain(pattern(n).answer);});
 it("evaluates arithmetic sequence answers at each difficulty",()=>{expect(numberSequence(1).answer).toBe(9);expect(numberSequence(3,"hard").answer).toBe(27);});
 it("blocks walls and maze boundaries without changing position",()=>{expect(move(START,"right")).toEqual({point:START,blocked:true});expect(move(START,"up").blocked).toBe(true);expect(()=>move(START,"jump")).toThrow();});
 it("runs an actual valid maze program to the seedling",()=>{const r=runCommands(["down","down","down","right","right","down","right","right"]);expect(r.won).toBe(true);expect(r.point).toEqual(GOAL);expect(r.frames).toHaveLength(8);});
 it("reports blocked and incomplete programs honestly",()=>{expect(runCommands(["right"]).blocked).toBe(true);expect(runCommands(["down"]).won).toBe(false);});
 it("interprets loops without eval",()=>{const code=flatten([{type:"repeat",times:3,body:[{type:"move",direction:"down"}]},{type:"repeat",times:2,body:[{type:"move",direction:"right"}]},{type:"move",direction:"down"},{type:"repeat",times:2,body:[{type:"move",direction:"right"}]}]);expect(runCommands(code).won).toBe(true);});
 it("bounds program steps, loop sizes, and nesting",()=>{expect(()=>runCommands(Array(101).fill("down"))).toThrow();expect(()=>flatten([{type:"repeat",times:100,body:[]}])).toThrow();expect(()=>flatten([{type:"repeat",times:10,body:[{type:"repeat",times:10,body:[{type:"repeat",times:10,body:[{type:"move",direction:"down"}]}]}]}])).toThrow();});
 it("generates valid Sudoku solutions for all 50 levels",()=>{for(let n=1;n<=50;n++)expect(validSudoku(sudokuPuzzle(n).solution)).toBe(true);});
 it("rejects empty, duplicate, out-of-range, or non-square Sudoku",()=>{expect(validSudoku([[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]])).toBe(false);expect(validSudoku([[1,1,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]])).toBe(false);expect(validSudoku([[1]])).toBe(false);});
 it("keeps every word puzzle solvable with the provided letters",()=>{for(let n=1;n<=50;n++){const w=wordPuzzle(n);expect(w.letters.sort().join("")).toBe(w.answer.split("").sort().join(""));}});
 it("requires the actual HTML heading and paragraph",()=>{expect(validateHtml("<h1>Hello, world!</h1><p>Otukpo is a place I like.</p>").valid).toBe(true);expect(validateHtml("<h1>Hello!</h1><p>Otukpo is a place I like.</p>").valid).toBe(false);expect(validateHtml("<h1>Hello, world!</h1>").valid).toBe(false);expect(validateHtml("x".repeat(6001)).valid).toBe(false);});
 it("adapts only from practice history without paid AI",()=>{expect(nextDifficulty([{complete:false,attempts:5},{complete:true,attempts:6}])).toBe("easy");expect(nextDifficulty([{complete:true,attempts:1},{complete:true,attempts:1},{complete:true,attempts:2}])).toBe("hard");expect(nextDifficulty([])).toBe("medium");});
});
