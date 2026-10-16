"""Verify the expanded games, saved learning plan, and quiet activities.
Run against isolated local state: APP_URL=http://127.0.0.1:3103 python scripts/e2e-expansion.py
Requires Playwright and PLAYWRIGHT_CHROMIUM_EXECUTABLE when using system Chrome.
"""
import os
from collections import deque
from pathlib import Path
from playwright.sync_api import sync_playwright
base = os.environ.get("APP_URL", "http://127.0.0.1:3102")
output = Path("outputs/browser-qa")
output.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE"), headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.set_default_timeout(60000)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base+"/signin-with-chatgpt?return_to=/")
    page.get_by_role("heading", name="Your learning garden", exact=True).wait_for()
    assert page.locator(".game-card").count() == 13
    def nav(name):
        if page.get_by_role("button", name="Open navigation", exact=True).is_visible():
            page.get_by_role("button", name="Open navigation", exact=True).click()
        page.get_by_role("navigation", name="Main navigation").get_by_role("button", name=name, exact=True).click()
    def start(name):
        nav("Learning garden")
        page.locator(".game-card").filter(has=page.get_by_role("heading", name=name, exact=True)).click()
        page.get_by_role("heading", name=name, exact=True).wait_for()
        if page.locator(".game-hub").count():page.get_by_role("button",name="Start playing",exact=True).click()
    def complete():
        page.get_by_role("heading", name="You did it.", exact=True).wait_for()
    # Solve the actual displayed sliding board with breadth-first search.
    start("Sliding squares")
    values = tuple(int(t) if t else 0 for t in page.locator(".sliding-board button").all_text_contents())
    target = (1,2,3,4,5,6,7,8,0)
    queue = deque([(values, [])]); seen = {values}; solution = None
    while queue:
        board, route = queue.popleft()
        if board == target:
            solution = route; break
        blank = board.index(0)
        neighbors = [n for n in [blank-3,blank+3,blank-1 if blank%3 else -1,blank+1 if blank%3<2 else -1] if 0<=n<9]
        for n in neighbors:
            nxt = list(board); nxt[blank],nxt[n] = nxt[n],nxt[blank]; nxt=tuple(nxt)
            if nxt not in seen:
                seen.add(nxt); queue.append((nxt, route+[board[n]]))
    assert solution
    for value in solution: page.get_by_role("button", name="Slide tile "+str(value), exact=True).click()
    complete()
    # Solve lanterns from their visible states rather than a fixture answer.
    start("Lantern garden")
    board = [s == "true" for s in page.locator(".lantern").evaluate_all("els => els.map(el => el.getAttribute('aria-pressed'))")]
    route = None
    for mask in range(512):
        trial = board[:]
        for i in range(9):
            if mask & (1<<i):
                for j in range(9):
                    if i==j or abs(i-j)==3 or i//3==j//3 and abs(i-j)==1: trial[j]=not trial[j]
        if all(trial): route=[i for i in range(9) if mask&(1<<i)]; break
    assert route
    for index in route: page.locator(".lantern").nth(index).click()
    complete()
    start("Remember the rhythm")
    page.evaluate("""() => {window.observedRhythm=[];let last=null;new MutationObserver(()=>{const el=document.querySelector('.recall-pad.highlighted');const color=el?.textContent;if(color&&color!==last)window.observedRhythm.push(color);last=color||null;}).observe(document.querySelector('.recall-board'),{attributes:true,subtree:true,attributeFilter:['class']});}""")
    page.get_by_role("button", name="Play the rhythm", exact=True).click()
    page.get_by_text("Your turn:", exact=False).wait_for()
    rhythm = page.evaluate("window.observedRhythm")
    assert len(rhythm) == 3, rhythm
    for item in rhythm: page.get_by_role("button", name=item[1:], exact=True).click()
    complete()
    start("Make the number")
    page.get_by_role("button", name="Subtract", exact=True).click()
    page.get_by_text("Try another idea.", exact=False).wait_for()
    page.get_by_role("button", name="Add", exact=True).click(); complete()
    recorded = page.evaluate("JSON.parse(localStorage.getItem('mindgrow-guest-progress') || '[]')")
    assert {entry["game"] for entry in recorded} >= {"tiles", "lights", "recall", "math"}
    start("Robot ramble")
    first = page.locator(".maze-board").inner_html()
    page.get_by_label("Choose a level", exact=True).select_option("100")
    assert page.locator(".maze-cell").count()==49
    assert page.locator(".maze-board").inner_html()!=first
    page.get_by_role("button", name="A little hint", exact=False).click()
    route=page.locator(".game-space .notice").inner_text().removeprefix("Try this route: ").rstrip(".").split(", ")
    for direction in route: page.get_by_role("button", name="Move "+direction, exact=True).click()
    complete()
    assert page.get_by_role("button", name="Next level", exact=False).is_disabled()
    start("Word wander")
    page.get_by_label("Choose a level", exact=True).select_option("100")
    page.get_by_label("Your word", exact=True).fill("PATIENCE")
    page.get_by_role("button", name="Check my word", exact=False).click(); complete()
    start("Your first web page")
    page.get_by_label("Choose a level", exact=True).select_option("100")
    page.get_by_label("Your HTML", exact=True).fill('<main><style>h1 { color: purple; }</style><h1>A recipe for fun</h1><p>My garden is a place to explore.</p><h2>My ideas</h2><ul><li>Read</li><li>Play</li><li>Learn</li><li>Rest</li></ul><a href="#main">Back to my ideas</a></main>')
    page.get_by_role("button", name="Check my page", exact=False).click(); complete()
    # Filter can be changed after selecting a category.
    nav("Learning garden")
    page.get_by_role("button", name="Memory", exact=True).click()
    page.get_by_role("button", name="Logic", exact=True).click()
    assert page.locator(".game-card").count()==3
    nav("Learn something")
    assert page.locator(".track-card").count()==5
    page.screenshot(path=str(output/"learning-desktop.png"),full_page=True)
    page.get_by_role("button", name="Think like a programmer", exact=False).click()
    page.get_by_label("Go somewhere nice", exact=True).check()
    page.get_by_role("button", name="Check understanding", exact=True).click()
    page.get_by_text("Have another look", exact=False).wait_for()
    page.get_by_label("Move right one square", exact=True).check()
    page.get_by_role("button", name="Check understanding", exact=True).click()
    page.get_by_text("Lesson completed.", exact=False).wait_for()
    page.reload(); nav("Learn something")
    assert "1 of 6 completed" in page.locator(".track-card").first.inner_text()
    nav("Learning plan")
    page.get_by_label("What would you like to learn?", exact=True).select_option("python")
    page.get_by_label("Time for learning each day", exact=True).select_option("10")
    assert page.locator(".study-day:not(.break-day):not(.assessment-day)").count()==10
    page.reload();nav("Learning plan")
    assert page.get_by_label("What would you like to learn?", exact=True).input_value()=="python"
    assert page.get_by_label("Time for learning each day", exact=True).input_value()=="10"
    nav("Unwind")
    page.get_by_role("button", name="Your quiet garden", exact=False).click()
    page.get_by_role("button", name="Garden spot 1, empty", exact=True).click()
    page.reload();nav("Unwind")
    page.get_by_role("button", name="Your quiet garden", exact=False).click()
    assert "🌸" in page.get_by_role("button", name="Garden spot 1, 🌸", exact=True).inner_text()
    page.get_by_role("button", name="Back to quiet activities", exact=False).click()
    page.get_by_role("button", name="Cloud bubbles", exact=False).click()
    for i in range(1,25):page.get_by_role("button", name="Pop bubble "+str(i), exact=True).click()
    page.get_by_text("A little clear space.", exact=False).wait_for()
    page.get_by_role("button", name="A fresh sky", exact=False).click()
    assert page.locator(".cloud-bubble.popped").count()==0
    page.get_by_role("button", name="Back to quiet activities", exact=False).click()
    page.get_by_role("button", name="A softer moment", exact=False).click()
    page.get_by_role("button", name="Begin a gentle rhythm", exact=False).click()
    page.get_by_text("Breathe in gently", exact=True).wait_for()
    page.get_by_role("button", name="Pause rhythm", exact=False).click()
    page.get_by_text("A moment for you", exact=True).wait_for()
    for width in [320,390,768,1440]:
        page.set_viewport_size({"width":width,"height":900})
        for section in ["Learning garden","Learn something","Learning plan","Unwind"]:
            nav(section)
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), (width,section)
        if width==390:
            nav("Learn something")
            page.screenshot(path=str(output/"learning-mobile.png"),full_page=True)
    assert not errors,errors
    browser.close()
print("PASS: new games solved through UI, level 100, saved lessons and plans, quiet activities, responsive layouts, no browser errors.")
