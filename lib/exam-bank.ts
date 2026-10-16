// Server-only assessment keys. This module must never be imported by app components.
import {type ExamQuestion,type PracticalTask,PASS_MARK} from "./exam-types";
import {shuffle} from "./rules";
type Question=ExamQuestion&{answer:number;explanation:string};
const q=(prompt:string,options:string[],answer:number,explanation:string,code?:string)=>({prompt,options,answer,explanation,code});
const banks:Record<string,ReturnType<typeof q>[]>={
 foundations:[
 q("A robot must move down 3 squares, right 2, then down 1. Which algorithm preserves that order?",["Repeat [down, right] 3 times","Repeat down 3; repeat right 2; down","Repeat [down 3, right 2, down] twice","Move toward the goal"],1,"Loops must preserve the sequence of individual moves."),
 q("What is the final value of seeds?",["5","8","10","13"],3,"seeds becomes 5, then 8; 8 + 5 gives 13.","seeds = 2\nseeds = seeds + 3\nother = seeds\nseeds = seeds + 3\nseeds = seeds + other"),
 q("Which inputs make score >= 8 and ready true?",["score 7, ready true","score 8, ready false","score 9, ready true","score 0, ready false"],2,"Both conditions must be true."),
 q("What is returned for input 4?",["8","5","9","Nothing"],0,"The first return exits the function.","def result(n):\n    if n > 3:\n        return n * 2\n    return n + 1"),
 q("A loop repeats [right, down] four times. How many movement instructions run?",["4","6","8","16"],2,"Two instructions per repetition, repeated four times, makes eight."),
 q("A program should add 1 through 4. Which test best catches a loop that stops before 4?",["Expect 10 from 1 + 2 + 3 + 4","Expect 6","Check that it has four lines","Check only that it runs"],0,"An expected result of 10 exposes the missing final addition."),
 q("What is the final value of total?",["6","7","8","10"],1,"The updates add 1, then 2, then 4 to zero.","total = 0\nstep = 1\n# Repeat the following two lines 3 times:\ntotal = total + step\nstep = step * 2"),
 q("Which variable name is most useful for the number of waterings remaining?",["x","data","remaining_waterings","green"],2,"The name describes both the quantity and its meaning."),
 q("An algorithm says 'repeat until water is zero', but increases water each time. What is the problem?",["It necessarily finishes sooner","It may never reach its stop condition","Variable names cannot contain water","Repeating is always incorrect"],1,"The update moves away from the terminating condition."),
 q("How many times is move called?",["2","3","5","6"],3,"The inner three calls happen in each of two outer repetitions.","# Repeat 2 times:\n    # Repeat 3 times:\n        move()"),
 q("Two functions calculate the same total, but one also prints it. What must a caller still receive to reuse the number?",["A return value","A longer function name","Only a printed message","A comment"],0,"Printing displays output; return gives a value back to the caller."),
 q("Which debugging plan provides the strongest evidence that a fix works?",["Change several unrelated lines","Test the previously failing input and a normal input with expected results","Delete the failing test","Test only the program name"],1,"The regression case and a normal case check both the fix and existing behavior."),
 ],
 web:[
 q("Which outline gives a page a meaningful heading hierarchy?",["h1, h2 for sections, h3 for subsections","h3, h1, h5 chosen only for size","Only paragraphs styled large","Six h1 tags for six small notes"],0,"Headings should express document structure."),
 q("Which link is the clearest section navigation?",['<a>Goals</a>','<a href="#goals">Read my learning goals</a>','<p href="#goals">Go</p>','<a href="">Click here</a>'],1,"The anchor has a destination and descriptive link text."),
 q("Which markup forms a list of two goals?",['<ul><li>Read</li><li>Build</li></ul>','<ul>Read, Build</ul>','<li><ul>Read</ul></li>','<p><li>Read</li></p>'],0,"Each list item belongs inside the list container."),
 q("What color is the heading?",["green","purple","blue","No color"],2,"The later rule wins when the selectors have equal specificity.","h1 { color: green; }\nh1 { color: purple; }\nh1 { color: blue; }"),
 q("A 200px content box has 10px padding and 2px border on both sides. What is its border-box width?",["200px","212px","224px","244px"],2,"200 + 20 padding + 4 border = 224."),
 q("What does max-width: 640px accomplish on a main element?",["It forces every screen to be 640px","It caps the element's width while allowing it to be smaller","It makes the font 640px","It disables mobile layout"],1,"A maximum is a cap, not a fixed minimum."),
 q("What is the main benefit of flex-wrap: wrap on a row of cards?",["It forces horizontal overflow","It allows items to move onto another row","It changes HTML into CSS","It automatically labels images"],1,"Wrapping allows another row when space is tight."),
 q("Which fix helps a paragraph that is difficult to read?",["Reduce contrast and font size","Use readable contrast, sufficient text size, and comfortable line length","Hide it on phones","Replace all text with color alone"],1,"Readability depends on contrast, size, and line length."),
 q("Which structure places the main page content in the appropriate element?",['<main><h1>My goals</h1><p>Keep learning.</p></main>','<style><h1>My goals</h1></style>','<p><main>My goals</main></p>','<h1><p>My goals</p></h1>'],0,"main contains the primary document content."),
 q("Which CSS declaration creates space inside a card?",["margin: 16px","padding: 16px","color: 16px","href: 16px"],1,"Padding creates internal space."),
 q("A link is reachable by keyboard but its outline is removed. What should be restored?",["A visible focus style","A forced animation","A larger image only","A second href"],0,"Keyboard users need a visible indication of focus."),
 q("Which final review best checks a beginner website?",["Only view a wide screenshot","Test links, heading structure, keyboard focus, and a narrow screen","Check only the title color","Remove all paragraphs"],1,"The review covers meaning, behavior, accessibility, and layout."),
 ],
 python:[
 q("What is printed?",["8","9","10","15"],0,"range(1,5) visits 1,2,3,4; continue skips 2, leaving 1+3+4.","total = 0\nfor n in range(1, 5):\n    if n == 2:\n        continue\n    total += n\nprint(total)"),
 q("What is printed?",["[1, 2]","[1, 2, 3]","[3]","An error"],1,"Both names refer to the same list.","a = [1, 2]\nb = a\nb.append(3)\nprint(a)"),
 q("What is printed?",["3 1","3 2","3.5 1","4 1"],0,"Integer floor division gives 3; the remainder is 1.","print(7 // 2, 7 % 2)"),
 q("What does choose(4) return?",["8","5","9","None"],0,"Returning exits immediately, so the last return is not reached.","def choose(n):\n    if n > 3:\n        return n * 2\n    return n + 1"),
 q("What is printed?",["12","123","6","An error"],1,"All values are strings, so + concatenates them.",'result = ""\nfor n in ["1", "2", "3"]:\n    result = result + n\nprint(result)'),
 q("What is the value of ok?",["True","False","8","None"],0,"and is evaluated before or: the final True makes the result True.","score = 7\nready = False\nok = score >= 8 and ready or True"),
 q("What is printed?",["10","6","3","0"],2,"The loop adds 1 and 2, then stops before adding 3.","total = 0\nfor n in range(1, 5):\n    if n == 3:\n        break\n    total += n\nprint(total)"),
 q("Which implementation returns a sum that another function can use?",['def add(a, b): return a + b','def add(a, b): print(a + b)','def add(a, b): a + b','def add(a, b): return "a + b"'],0,"return gives the numeric result to the caller."),
 q("What is printed?",["2 3","3 3","2 2","An error"],0,"The slice makes a new list, so appending to b does not change a.","a = [2, 4]\nb = a[:]\nb.append(6)\nprint(len(a), len(b))"),
 q("A function uses items=[] as its default and appends to it. What is the risk?",["The same list can be reused across calls","A new list is always made for every call","The list cannot be changed","append changes every list in Python"],0,"Mutable defaults are created once when the function is defined."),
 q("Which set of tests best checks a function that totals a list?",["Only [1,2]","An empty list, one item, several items, and a case with zero","Only the function name","Only strings"],1,"Boundary and ordinary inputs reveal different mistakes."),
 q("What is printed on the second line of output?",["Hello","None","0","An error"],1,"greet prints a message but has no return statement, so result is None.",'def greet():\n    print("Hello")\nresult = greet()\nprint(result)'),
 ],
 go:[
 q("What is printed?",["3 1","3.5 1","4 1","3 2"],0,"Both operands are integers, so division yields 3 with remainder 1.","fmt.Println(7 / 2, 7 % 2)"),
 q("Which line correctly updates the existing score in the same scope?",["score := score + 1","score = score + 1","score == score + 1","score => score + 1"],1,"= assigns to the existing variable."),
 q("What is total after the loop?",["15","12","9","6"],1,"1+2+4+5 is 12; continue skips 3.","total := 0\nfor i := 1; i <= 5; i++ {\n    if i == 3 { continue }\n    total += i\n}"),
 q("What is printed?",["2","3","4","6"],1,"The condition i < 3 allows i = 0,1,2.","count := 0\nfor i := 0; i < 3; i++ { count++ }\nfmt.Println(count)"),
 q("What is printed?",["10 2","6 2","10 3","9 2"],0,"Changing b[0] changes the shared first array element; b has two items.","a := []int{2, 4, 6}\nb := a[:2]\nb[0] = 9\nfmt.Println(a[0]+1, len(b))"),
 q("In for i, value := range items, what are i and value?",["Both indexes","The index and the element value","The value and the length","Two independent copies of the slice"],1,"range supplies an index followed by its element value."),
 q("What does choose(4) return?",["8","5","9","0"],0,"The first return ends execution of the function.","func choose(n int) int {\n    if n > 3 { return n * 2 }\n    return n + 1\n}"),
 q("Which values make score >= 8 && ready true?",["7 and true","8 and false","9 and true","0 and false"],2,"Both sides of && must hold."),
 q("A function returns (int, error). Which caller handles failure correctly?",["Ignore the error","Check err != nil and handle it before using the int","Use the int only when err != nil","Print the function name"],1,"An error must be handled before trusting the result."),
 q("What is the final total?",["10","6","3","1"],2,"The loop adds 1 and 2, then breaks before adding 3.","total := 0\nfor i := 1; i <= 4; i++ {\n    if i == 3 { break }\n    total += i\n}"),
 q("What prevents this assignment from compiling?",["score is inferred as int, but the new value is a string","Go does not support strings","The name is too short","The number is positive"],0,'The types are incompatible.', 'score := 5\nscore = "five"'),
 q("Which test set best checks a Go function that sums non-negative integers and reports invalid input?",["Only a list of positives","Empty slice, zero, positives, and a negative input that must report an error","Only strings","Only an uncalled function"],1,"These test both expected values and the error path."),
 ],
 css:[
 q("What color is the paragraph with id intro and class note?",["green","purple","coral","blue"],2,"The ID selector has higher specificity than a class or element selector.","p { color: green; }\n.note { color: purple; }\n#intro { color: coral; }\n.note { color: blue; }"),
 q("What is the border-box width with content-box?",["200px","220px","244px","264px"],2,"200 content + 40 padding + 4 border = 244.","width: 200px;\npadding: 20px;\nborder: 2px solid;\nbox-sizing: content-box;"),
 q("What is the content width with border-box?",["200px","156px","160px","244px"],1,"200 - 40 padding - 4 border = 156.","width: 200px;\npadding: 20px;\nborder: 2px solid;\nbox-sizing: border-box;"),
 q("At exactly 600px viewport width, how many columns are shown?",["One","Two","Three","Zero"],0,"max-width includes the exact boundary.",".cards { grid-template-columns: 1fr 1fr; }\n@media (max-width: 600px) {\n  .cards { grid-template-columns: 1fr; }\n}"),
 q("A 632px grid has two equal columns and a 16px gap. How wide is each column?",["316px","308px","300px","632px"],1,"(632 - 16) / 2 = 308."),
 q("Which rule wins for a note inside main, assuming normal declarations in the same origin and layer?",[".note { color: green; }","main .note { color: blue; }","p { color: coral; }","The first rule always wins"],1,"The class plus element selector has greater specificity than the class alone."),
 q("Which rule supports reduced motion without hiding content?",['@media (prefers-reduced-motion: reduce) { .card { transition: none; } }','.card { display: none; }','button { outline: none; }','.card { width: 0; }'],0,"It removes a nonessential transition while keeping content available."),
 q("An element inherits purple from its parent but has color: green itself. What is its color?",["purple","green","A blend","Transparent"],1,"A declaration on the element takes precedence over an inherited value."),
 q("Which pair helps long content fit a flexible card?",["min-width: 0 and overflow-wrap: anywhere","min-width: 1000px and white-space: nowrap","width: 2000px and overflow: visible","display: none and color: white"],0,"The item can shrink and long words can wrap."),
 q("Which declaration adds space outside a border?",["padding","margin","color","font-size"],1,"Margin is outside the border box."),
 q("Two .note rules have equal specificity. Which color wins?",["green","blue","Neither","Both"],1,"The later equal-specificity rule wins.",".note { color: green; }\n.note { color: blue; }"),
 q("Which is the strongest keyboard accessibility choice?",["Remove outlines from every control","Keep a clearly visible :focus-visible outline","Use color alone to indicate all errors","Hide buttons until hover"],1,"A focus indicator remains available without mouse hover."),
 ]
};
const projectPrompts:Record<string,[string,string]>={
 foundations:["Design an algorithm for a robot that waters each dry plant once. Include a loop, a decision, a reusable function, and a stop condition. Explain what happens for an empty garden and for a garden with no dry plants.","Debug a program that counts 1 through n but misses the final value and repeats forever for n = 0. Write corrected pseudocode and trace it for n = 0, 1, and 4, including expected results."],
 web:["Write HTML and CSS for a learning page: one main heading, two sections, a three-item list, a descriptive section link, a readable card style, and visible keyboard focus. Explain the purpose of each major element.","A two-column learning page overflows at 320px, has low contrast text, and uses a link labelled 'click here'. Show concrete HTML/CSS fixes. Describe how you would test keyboard use, narrow screens, and working destinations."],
 python:["Write a Python function that takes a list of scores and returns the total of scores at least 5 without changing the input list. Include an empty-list case and tests for [2,5,8], [0], and []. Explain your expected results.","Write a three-question Python quiz as a function. Keep questions and correct answers in a list, compare submitted responses, and return the score. Avoid a shared mutable default. Show a fully correct attempt, a partially correct one, and a short explanation of debugging."],
 go:["Write a Go function that takes []int, sums only non-negative values, and returns (int, error), reporting an error for a negative value. Show how main handles the error. Include tests or traces for an empty slice, [0,2,4], and [2,-1].", "Write a Go program that loops over a slice of scores, counts scores >= 5, and returns a result through a typed function. Explain indexes versus values in range, integer division when calculating a percentage, and how you avoid changing a caller's slice."],
 css:["Write HTML and CSS for two learning cards: a two-column grid on wide screens, one column at 600px and below, consistent border-box sizing, comfortable spacing, visible keyboard focus, and reduced-motion support. Explain the cascade and responsive boundary.","A card with width: 240px, padding: 24px, and 2px borders overflows its 250px parent. Explain the current rendered width, then provide two valid fixes. Add a strategy for long text and explain how your focus styles remain visible on keyboard navigation."]
};
export function examBank(track:string):Question[]{return (banks[track]||[]).map((question,i)=>({...question,id:track+"-q"+(i+1)}));}
export function examPaper(track:string,seed:number){return shuffle(examBank(track),seed).map(({answer:_answer,explanation:_explanation,...question},i)=>({...question,options:shuffle(question.options,seed+i*59)}));}
export function practicalTasks(track:string):PracticalTask[]{return(projectPrompts[track]||[]).map((prompt,i)=>({id:track+"-task"+(i+1),title:i===0?"Build and explain":"Debug, test, and justify",prompt,rubric:["A complete solution that meets every requirement","A clear explanation of the reasoning","Concrete normal and edge-case tests with expected results"]}));}
export function gradeExam(track:string,paper:ExamQuestion[],answers:Record<string,number>){const bank=examBank(track);if(paper.length!==12||new Set(paper.map(q=>q.id)).size!==12)throw new Error("Invalid exam paper.");let correct=0;for(const question of paper){const original=bank.find(q=>q.id===question.id),choice=answers[question.id];if(!original||!Number.isInteger(choice)||choice<0||choice>=question.options.length)throw new Error("Answer every reasoning question.");if(question.options[choice]===original.options[original.answer])correct++;}const score=Math.round(correct/paper.length*100);return{score,correct,total:paper.length,qualified:score>=PASS_MARK};}
export function reviewKey(track:string){return examBank(track).map(q=>({id:q.id,answer:q.options[q.answer],explanation:q.explanation}));}
