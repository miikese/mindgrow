"""Visitor previews, first-play welcome screens, and password-protected administration.
Run only against isolated local state with APP_ENV_FILE pointing to the generated
outputs/browser-qa/owner.env. The fixture is unrelated to the real owner account.
"""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
base=os.environ.get("APP_URL","http://127.0.0.1:3103")
owner=json.loads(Path("outputs/browser-qa/owner-fixture.json").read_text())
output=Path("outputs/browser-qa");output.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE"),headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1440,"height":1000});page.set_default_timeout(60000)
    errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
    def nav(name):
        if page.get_by_role("button",name="Open navigation",exact=True).is_visible():page.get_by_role("button",name="Open navigation",exact=True).click()
        page.get_by_role("navigation",name="Main navigation").get_by_role("button",name=name,exact=True).click()
    def choose(name):page.locator(".game-card").filter(has=page.get_by_role("heading",name=name,exact=True)).click()
    page.goto(base)
    assert page.locator(".game-card").count()==13
    assert page.get_by_role("navigation",name="Main navigation").get_by_role("button",name="Game rules",exact=True).count()==0
    choose("Fruit friends")
    page.get_by_role("heading",name="How to play",exact=False).count()
    assert page.locator(".game-hub").count()==1 and page.locator(".memory-grid").count()==0
    assert "your progress" in page.locator(".game-hub").inner_text().lower()
    page.get_by_role("button",name="Start playing",exact=True).click()
    deck=list(range(8));seed=10
    for i in range(7,0,-1):
        seed=(1664525*seed+1013904223)&0xffffffff;j=seed%(i+1);deck[i],deck[j]=deck[j],deck[i]
    for value in range(4):
        for i,card in enumerate(deck):
            if card%4==value:page.locator(".memory-card").nth(i).click()
    page.get_by_role("heading",name="You did it.",exact=True).wait_for()
    nav("Learning garden");choose("Fruit friends")
    assert page.locator(".game-hub").count()==0
    assert page.get_by_label("Choose a level",exact=True).input_value()=="2"
    page.locator(".inline-rules summary").click()
    assert "1 of 100 levels explored" in page.locator(".inline-rules").inner_text()
    nav("Learning garden");choose("Word wander")
    page.get_by_text("Sign up to unlock this game.",exact=True).wait_for()
    assert page.locator(".answer-form").count()==0
    page.screenshot(path=str(output/"game-welcome-desktop.png"),full_page=True,animations="disabled")
    for width in [320,390,768,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),(width,"game preview")
        if width==390:page.screenshot(path=str(output/"game-welcome-mobile.png"),full_page=True,animations="disabled")
    nav("Learn something")
    assert page.locator(".member-preview-card").count()==5
    assert page.get_by_role("button",name="Check understanding",exact=True).count()==0
    nav("Unwind");assert page.locator(".calm-playground").count()==0
    page.goto(base+"/signin-with-chatgpt?return_to=/")
    page.get_by_text("Free member access",exact=True).wait_for()
    nav("Learn something");assert page.locator(".member-preview-card").count()==0
    assert page.locator(".track-card").count()==5
    nav("Learning garden")
    page.get_by_role("button",name="Save your progress",exact=False).click()
    page.get_by_label("Learner nickname").fill("Member QA learner")
    page.get_by_label("Age-appropriate path").select_option(label="Little Thinkers")
    page.get_by_role("button",name="Create private learner",exact=False).click()
    page.get_by_text("Hello, Member QA learner.",exact=True).wait_for()
    profile=next(r for r in page.request.get(base+"/api/records?mine=1").json()["records"] if r["kind"]=="profile" and r["data"]["name"]=="Member QA learner")
    choose("Word wander");page.get_by_role("button",name="Start playing",exact=True).click()
    page.get_by_label("Your word",exact=True).fill("BENUE")
    page.get_by_role("button",name="Check my word",exact=False).click()
    page.get_by_role("heading",name="You did it.",exact=True).wait_for()
    nav("Learn something")
    page.locator(".track-card").filter(has=page.get_by_role("heading",name="Python for beginners",exact=True)).get_by_role("button",name="Start this path",exact=False).click()
    page.locator(".lesson-quiz").get_by_label("5",exact=True).check()
    page.get_by_role("button",name="Check understanding",exact=True).click()
    page.get_by_text("Quiz verified and saved",exact=False).wait_for()
    page.goto(base+"/admin")
    page.get_by_role("heading",name="Owner sign-in.",exact=True).wait_for()
    assert page.request.get(base+"/api/admin/overview").status==403
    page.get_by_label("Admin email",exact=False).fill(owner["email"])
    page.get_by_label("Password",exact=True).fill("wrong-password")
    page.get_by_role("button",name="Sign in to administration",exact=False).click()
    page.get_by_text("Email or password is incorrect.",exact=True).wait_for()
    page.get_by_label("Password",exact=True).fill(owner["password"])
    page.get_by_role("button",name="Sign in to administration",exact=False).click()
    page.get_by_role("heading",name="Your learning community.",exact=True).wait_for()
    page.locator(".admin-stats").wait_for()
    summary=page.request.get(base+"/api/admin/overview").json()
    assert summary["totals"]["learners"]>=1 and summary["totals"]["sessions"]>=1 and summary["totals"]["lessons"]>=1
    assert any(l["data"]["name"]=="Member QA learner" for l in summary["learners"])
    page.screenshot(path=str(output/"admin-overview-desktop.png"),full_page=True,animations="disabled")
    page.get_by_role("button",name="Learners",exact=True).click()
    page.get_by_text("Member QA learner",exact=True).wait_for()
    page.get_by_role("button",name="Access & pricing",exact=True).click()
    page.get_by_label("Future membership price",exact=False).fill("2500")
    page.get_by_label("Currency",exact=False).select_option("NGN")
    page.get_by_role("button",name="Save access settings",exact=True).click()
    page.get_by_text("Settings saved.",exact=False).wait_for()
    settings=page.request.get(base+"/api/admin/settings").json()["settings"]
    assert settings["mode"]=="free" and settings["priceMinor"]==250000 and not settings["billingConnected"]
    assert page.request.patch(base+"/api/admin/settings",data={"mode":"paid"}).status==409
    assert page.request.get(base+"/api/access").json()["mode"]=="free"
    for width in [320,390,768,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),(width,"admin pricing")
        if width==390:page.screenshot(path=str(output/"admin-pricing-mobile.png"),full_page=True,animations="disabled")
    assert page.request.delete(base+"/api/records/"+profile["id"]).status==200
    page.get_by_role("button",name="Sign out",exact=True).click()
    page.get_by_role("heading",name="Small puzzles. Big possibilities.",exact=True).wait_for()
    assert page.request.get(base+"/api/admin/overview").status in [401,403]
    assert not errors,errors
    browser.close()
print("PASS: one guest game, locked previews, first-play rules/progress, free member access, owner password login/logout, private monitoring, pricing drafts, mobile layouts.")
