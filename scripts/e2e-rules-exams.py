"""Rules, timed falling blocks, account-verified courses, and manual owner review.
Use an isolated APP_STATE_DIR on the local server. Generate the ignored course
fixtures as described in docs/testing.md before running this script.
"""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
base=os.environ.get("APP_URL","http://127.0.0.1:3103")
fixtures=json.loads(Path("outputs/browser-qa/course-fixtures.json").read_text())
output=Path("outputs/browser-qa");output.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE"),headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1440,"height":1000})
    page.set_default_timeout(60000)
    errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
    def nav(name):
        if page.get_by_role("button",name="Open navigation",exact=True).is_visible():page.get_by_role("button",name="Open navigation",exact=True).click()
        page.get_by_role("navigation",name="Main navigation").get_by_role("button",name=name,exact=True).click()
    page.goto(base)
    assert page.get_by_role("navigation",name="Main navigation").get_by_role("button",name="Game rules",exact=True).count()==0
    page.locator(".game-card").filter(has=page.get_by_role("heading",name="Falling blocks",exact=True)).click()
    assert page.locator(".game-hub").count()==1
    assert page.locator(".blocks-board").count()==0
    page.get_by_text("Sign up to unlock this game.",exact=True).wait_for()
    page.goto(base+"/signin-with-chatgpt?return_to=/")
    page.locator(".game-card").filter(has=page.get_by_role("heading",name="Falling blocks",exact=True)).click()
    assert "Space: hard drop" in page.locator(".game-hub").inner_text()
    page.get_by_role("button",name="Start playing",exact=True).click()
    assert page.locator(".blocks-board .block-cell").count()==200
    page.clock.install()
    page.get_by_role("button",name="Start stacking",exact=False).click()
    page.get_by_role("button",name="Rotate piece clockwise",exact=True).click()
    page.get_by_role("button",name="Move piece left",exact=True).click()
    page.get_by_role("button",name="Hold / swap",exact=True).click()
    assert page.get_by_role("button",name="Hold / swap",exact=True).is_disabled()
    page.get_by_role("button",name="Drop",exact=True).click()
    assert not page.get_by_role("button",name="Hold / swap",exact=True).is_disabled()
    page.clock.run_for(31000)
    assert int(page.locator(".blocks-stat").nth(2).locator("strong").inner_text())>=2
    page.get_by_role("button",name="Pause",exact=True).click()
    stage=page.locator(".blocks-stat").nth(2).inner_text()
    page.clock.run_for(5000)
    assert page.locator(".blocks-stat").nth(2).inner_text()==stage
    page.screenshot(path=str(output/"falling-blocks-desktop.png"),full_page=True,animations="disabled")
    page.once("dialog",lambda dialog:dialog.accept())
    page.get_by_role("button",name="New game",exact=True).click()
    page.get_by_role("button",name="Start stacking",exact=False).wait_for()
    assert page.locator(".blocks-stat").first.locator("strong").inner_text()=="0"
    for width in [320,390,768,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),(width,"blocks")
    nav("Learn something")
    assert page.locator(".track-card").count()==5
    for title in ["Python for beginners","Go for beginners","CSS for beginners"]:page.get_by_role("heading",name=title,exact=True).wait_for()
    nav("Final exams")
    assert page.get_by_role("button",name="Start final exam",exact=False).is_disabled()
    page.get_by_text("A private learner profile is required.",exact=True).wait_for()
    # Complete the learner journey as an ordinary local member.
    page.goto(base+"/signin-with-chatgpt?return_to=/")
    for old in page.request.get(base+"/api/records?mine=1").json()["records"]:
        if old["kind"]=="profile" and old["data"]["name"]=="Exam QA learner":page.request.delete(base+"/api/records/"+old["id"])
    nav("Family space")
    page.get_by_role("button",name="Add learner",exact=False).click()
    page.get_by_label("Learner nickname").fill("Exam QA learner")
    page.get_by_label("Age-appropriate path").select_option(label="Future Developers")
    page.get_by_role("button",name="Create private learner",exact=False).click()
    page.get_by_role("dialog").wait_for(state="hidden")
    nav("Learning garden")
    page.get_by_text("Hello, Exam QA learner.",exact=True).wait_for()
    profile=next(r for r in page.request.get(base+"/api/records?mine=1").json()["records"] if r["kind"]=="profile" and r["data"]["name"]=="Exam QA learner")
    nav("Final exams")
    page.get_by_label("Choose an exam track",exact=True).select_option("go")
    assert page.get_by_role("button",name="Start final exam",exact=False).is_disabled()
    nav("Learn something")
    go=next(t for t in fixtures["tracks"] if t["id"]=="go")
    card=page.locator(".track-card").filter(has=page.get_by_role("heading",name="Go for beginners",exact=True))
    card.get_by_role("button",name="Start this path",exact=False).click()
    for index,lesson in enumerate(go["lessons"]):
        page.get_by_role("heading",name=lesson["title"],exact=True).wait_for()
        page.locator(".lesson-quiz").get_by_label(lesson["options"][lesson["answer"]],exact=True).check()
        page.get_by_role("button",name="Check understanding",exact=True).click()
        page.get_by_text("Quiz verified and saved to your account",exact=False).wait_for()
        if index<5:page.get_by_role("button",name="Next lesson",exact=False).click()
    page.get_by_role("button",name="Go to final exam",exact=False).click()
    page.get_by_text("6 of 6 account-verified lessons complete",exact=True).wait_for()
    page.get_by_role("button",name="Start final exam",exact=False).click()
    page.locator(".exam-question").first.wait_for()
    exam=next(e for e in page.request.get(base+"/api/exams?profile="+profile["id"]).json()["exams"] if e["status"]=="in-progress")
    assert "answer" not in exam["data"]["questions"][0]
    bank={q["id"]:q for q in fixtures["exams"]["go"]}
    for i,question in enumerate(exam["data"]["questions"]):
        source=bank[question["id"]]
        page.locator(".exam-question").nth(i).get_by_label(source["options"][source["answer"]],exact=True).check()
    practical=[
        '''func sum(values []int) (int, error) {
    total := 0
    for _, value := range values {
        if value < 0 { return 0, fmt.Errorf("negative input") }
        total += value
    }
    return total, nil
}
// main: value, err := sum(values); if err != nil { fmt.Println(err); return }; fmt.Println(value)
// Tests: [] returns (0,nil), [0,2,4] returns (6,nil), [2,-1] returns a non-nil error.
// The loop reads the input without modifying it. Returning an error ends the function before an invalid total is used.''',
        '''func countPassing(scores []int) int {
    passing := 0
    for _, score := range scores {
        if score >= 5 { passing++ }
    }
    return passing
}
// main: fmt.Println(countPassing([]int{2,5,8})) gives 2.
// range supplies index and element; _ ignores the index. The score is read only, so the input is unchanged.
// Integer percentage can use passing*100/len(scores), with an empty-input check before division.
// Tests: [] gives 0; [0] gives 0; [2,5,8] gives 2; [5,5] gives 2. An empty list needs a defined percentage, for example zero.'''
    ]
    for i,text in enumerate(practical):page.get_by_label("Practical "+str(i+1)+" response",exact=True).fill(text)
    # Drafts survive leaving and resuming the page.
    page.get_by_role("button",name="Back to exams",exact=False).click()
    page.get_by_label("Choose an exam track",exact=True).select_option("go")
    page.get_by_role("button",name="Resume exam",exact=False).click()
    assert page.get_by_label("Practical 1 response",exact=True).input_value()==practical[0]
    assert page.locator(".exam-question input:checked").count()==12
    page.get_by_role("button",name="Submit final exam",exact=False).click()
    page.get_by_role("heading",name="100% reasoning score",exact=True).wait_for()
    page.get_by_text("Awaiting owner review",exact=True).wait_for()
    assert not page.get_by_role("button",name="Award certificate personally",exact=False).count()
    result=page.request.get(base+"/api/exams?profile="+profile["id"]).json()["exams"][0]
    assert result["status"]=="awaiting-review" and "certificateReference" not in result["data"]
    owner_fixture=json.loads(Path("outputs/browser-qa/owner-fixture.json").read_text())
    assert page.request.post(base+"/api/owner/login",data=owner_fixture).status==200
    page.goto(base)
    nav("Owner review")
    page.locator(".exam-history button").filter(has_text="Exam QA learner").click()
    assert page.get_by_role("button",name="Award certificate personally",exact=False).is_disabled()
    page.get_by_label("Feedback for the learner",exact=False).fill("I reviewed both solutions, the boundary cases, and the expected outputs. This test submission meets the rubric.")
    page.get_by_label("I have reviewed both practical solutions",exact=False).check()
    page.get_by_label("Certificate reference you are assigning",exact=False).fill("QA-ONLY-001")
    page.get_by_role("button",name="Award certificate personally",exact=False).click()
    page.get_by_text("Certificate reference: QA-ONLY-001",exact=False).wait_for()
    result=next(e for e in page.request.get(base+"/api/exams/review").json()["exams"] if e["id"]==exam["id"])
    assert result["status"]=="certified" and result["data"]["certificateReference"]=="QA-ONLY-001"
    page.screenshot(path=str(output/"owner-exam-result.png"),full_page=True,animations="disabled")
    for width in [320,390,768,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),(width,"owner review")
        for section in ["Learning garden","Final exams","Learn something"]:
            nav(section)
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"),(width,section)
        if width==390:
            nav("Learning garden")
            page.locator(".game-card").filter(has=page.get_by_role("heading",name="Falling blocks",exact=True)).click()
            page.screenshot(path=str(output/"rules-mobile.png"),full_page=True,animations="disabled")
    assert page.request.delete(base+"/api/records/"+profile["id"]).status==200
    assert not any(r["data"].get("profile")==profile["id"] for r in page.request.get(base+"/api/records?mine=1").json()["records"])
    assert not errors,errors
    browser.close()
print("PASS: rules, falling-block controls/speed/pause/reset, five tracks, verified Go lessons, exam draft/submission, manual owner award, privacy, mobile layouts.")
