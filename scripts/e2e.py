"""Run all eight playable games against the built app. pip install playwright."""
import os,time
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
base=os.environ.get("APP_URL","http://127.0.0.1:3102")
for _ in range(60):
 try:
  if urlopen(base+"/api/health",timeout=2).status==200:break
 except Exception:time.sleep(1)
else:raise RuntimeError("Server not ready")
with sync_playwright() as p:
 executable=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
 browser=p.chromium.launch(**({"executable_path":executable}if executable else {}),headless=True,args=["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"])
 page=browser.new_page(viewport={"width":1440,"height":1000})
 errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
 page.goto(base+"/signin-with-chatgpt?return_to=/")
 for old in page.request.get(base+"/api/records?mine=1").json()["records"]:
  if old["kind"]=="profile"and old["data"]["name"]=="Browser QA learner":page.request.delete(base+"/api/records/"+old["id"])
 page.get_by_role("button",name="Save your progress",exact=False).click()
 page.get_by_label("Learner nickname").fill("Browser QA learner")
 page.get_by_label("Age-appropriate path").select_option(label="Future Developers")
 page.get_by_role("button",name="Create private learner",exact=False).click()
 page.get_by_text("Hello, Browser QA learner.",exact=True).wait_for()
 records=page.request.get(base+"/api/records?mine=1").json()["records"]
 learner=next(r for r in records if r["kind"]=="profile"and r["data"]["name"]=="Browser QA learner")
 def start(name):
  page.get_by_role("button",name=name,exact=False).click()
  page.get_by_role("heading",name=name,exact=True).wait_for()
 def done():
  page.get_by_role("heading",name="You did it.",exact=True).wait_for()
  page.get_by_text("Practice saved. Keep exploring at your own pace.",exact=True).wait_for()
  page.get_by_role("button",name="Back to your garden",exact=False).click()
 # Memory: deterministic deck, real UI flips for every matching pair.
 start("Fruit friends")
 deck=list(range(8));n=10
 for i in range(7,0,-1):
  n=(1664525*n+1013904223)&0xffffffff;j=n%(i+1);deck[i],deck[j]=deck[j],deck[i]
 for value in range(4):
  indices=[i for i,item in enumerate(deck)if item%4==value]
  page.locator(".memory-card").nth(indices[0]).click();page.locator(".memory-card").nth(indices[1]).click()
 done()
 start("What comes next?")
 page.get_by_role("button",name="coral",exact=True).click()
 page.get_by_text("Try another idea.",exact=False).wait_for()
 page.get_by_role("button",name="gold",exact=True).click();done()
 start("Number trails");page.get_by_label("Your next number").fill("1");page.get_by_role("button",name="Check my answer",exact=False).click()
 page.get_by_text("Try another idea.",exact=False).wait_for()
 page.get_by_label("Your next number").fill("9");page.get_by_role("button",name="Check my answer",exact=False).click();done()
 start("Robot ramble")
 for d in ["down","down","down","right","right","down","right","right"]:page.get_by_role("button",name="Move "+d,exact=True).click()
 done()
 start("Code your adventure")
 page.locator(".accessible-program summary").click()
 page.get_by_role("button",name="Run blocks",exact=False).wait_for()
 for d in ["down","down","down","right","right","down","right","right"]:page.get_by_role("button",name="Add "+d,exact=True).click()
 page.get_by_role("button",name="Run blocks",exact=False).click();done()
 start("A moment of Sudoku")
 solution=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]]
 for y,row in enumerate(solution):
  for x,n in enumerate(row):
   cell=page.get_by_label("Sudoku row "+str(y+1)+" column "+str(x+1),exact=True)
   if cell.get_attribute("readonly")is None:cell.fill(str(n))
 page.get_by_role("button",name="Check puzzle",exact=False).click();done()
 start("Word wander");page.get_by_label("Your word",exact=True).fill("BENUE");page.get_by_role("button",name="Check my word",exact=False).click();done()
 start("Your first web page")
 page.get_by_label("Your HTML",exact=True).fill("<h1>Hello, world!</h1><p>Otukpo is a place I like.</p><script>window.top.location='https://example.test'</script>")
 assert page.locator("iframe").get_attribute("sandbox")==""
 page.get_by_role("button",name="Check my page",exact=False).click();done()
 page.reload();page.get_by_text("Hello, Browser QA learner.",exact=True).wait_for()
 records=page.request.get(base+"/api/records?mine=1").json()["records"]
 completed=[r for r in records if r["kind"]=="progress"and r["data"]["profile"]==learner["id"]]
 assert len(completed)==8,(len(completed),completed)
 assert page.request.get(base+"/api/records").json()["records"]==[],"Child records became public"
 page.get_by_role("button",name="My progress",exact=True).click()
 page.get_by_role("heading",name="Look how far you’ve explored.",exact=True).wait_for()
 assert page.locator(".practice-list article").count()==8
 # Remove test-only learner and all associated progress before screenshots.
 deletes=[]
 page.on("request",lambda request:deletes.append(request.url) if request.method=="DELETE" else None)
 page.get_by_role("button",name="Family space",exact=True).click()
 page.once("dialog",lambda dialog:dialog.accept())
 card=page.locator("article.card").filter(has=page.get_by_role("heading",name="Browser QA learner",exact=True))
 card.get_by_role("button",name="Remove learner",exact=True).click()
 page.get_by_role("heading",name="Browser QA learner",exact=True).wait_for(state="hidden")
 assert deletes==[base+"/api/records/"+learner["id"]],deletes
 assert not any(r["id"]==learner["id"] or r["data"].get("profile")==learner["id"] for r in page.request.get(base+"/api/records?mine=1").json()["records"])
 page.goto(base+"/signout-with-chatgpt?return_to=/")
 page.get_by_role("heading",name="Small puzzles. Big possibilities.",exact=True).wait_for()
 page.screenshot(path="docs/screenshots/desktop.png",full_page=True)
 page.set_viewport_size({"width":390,"height":844});page.reload()
 page.get_by_role("heading",name="Small puzzles. Big possibilities.",exact=True).wait_for()
 assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth")
 page.get_by_role("button",name="Open navigation").click();page.get_by_role("button",name="Daily five",exact=True).click()
 page.get_by_role("heading",name="A little daily five.",exact=True).wait_for()
 page.goto(base);page.get_by_role("heading",name="Small puzzles. Big possibilities.",exact=True).wait_for()
 page.screenshot(path="docs/screenshots/mobile.png",full_page=True)
 # Exercise compact phones, tablets and desktop after the complete feature journey.
 for width in [320,390,768,1440]:
  page.set_viewport_size({"width":width,"height":844});page.goto(base)
  assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth"),("Horizontal overflow",width)
 assert not errors,errors
 browser.close()
print("PASS: eight games playable; wrong/correct answers; real Blockly execution; safe iframe; account progress survives reload; child privacy; guardian deletion; mobile navigation/overflow. No browser errors.")
