"""Run against the isolated local QA server, never a production database."""
import os,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
base=os.getenv('APP_URL','http://127.0.0.1:3104')
owner=json.loads(Path('outputs/browser-qa/owner-fixture.json').read_text())
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1440,'height':1000});page.set_default_timeout(60000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def nav(name):
  if page.get_by_role('button',name='Open navigation',exact=True).is_visible():page.get_by_role('button',name='Open navigation',exact=True).click()
  page.get_by_role('navigation',name='Main navigation').get_by_role('button',name=name,exact=True).click()
 def choose(name):page.locator('.game-card').filter(has=page.get_by_role('heading',name=name,exact=True)).click()
 page.goto(base);assert page.locator('.game-card').count()==8
 page.get_by_role('button',name='More challenges · 5 activities',exact=True).click();assert page.locator('.game-card').count()==13
 page.goto(base+'/signin-with-chatgpt?return_to=/')
 page.get_by_role('button',name='Save your progress',exact=False).click();page.get_by_label('Learner nickname').fill('Rewards QA '+str(int(time.time())));page.get_by_role('button',name='Create private learner',exact=False).click();page.locator('.dialog').wait_for(state='hidden')
 choose('Robot ramble');page.get_by_role('button',name='Start playing',exact=True).click()
 page.locator('.wallet-bar').get_by_text('3',exact=True).wait_for()
 page.get_by_role('button',name='Move down',exact=True).click();page.get_by_role('button',name='Use hint · 1',exact=True).click();page.get_by_text('From your current position, move down next.',exact=False).wait_for();assert '7 moves away' in page.locator('.notice').last.inner_text()
 page.get_by_role('button',name='Use hint · 1',exact=True).click();page.get_by_role('button',name='Use hint · 1',exact=True).click();page.wait_for_function("document.querySelector('.game-toolbar button').disabled")
 for d in ['down','down','right','right','down','right','right']:page.get_by_role('button',name='Move '+d,exact=True).click()
 page.get_by_role('heading',name='You did it.',exact=True).wait_for();page.locator('.wallet-bar').get_by_text('1',exact=True).wait_for()
 nav('Learning garden');choose('Spelling studio');page.get_by_role('button',name='Start playing',exact=True).click()
 for letter in ['L','E','A','R','N']:page.get_by_role('button',name='Add letter '+letter,exact=False).click()
 page.get_by_role('button',name='Check my word',exact=False).click();page.get_by_role('heading',name='You did it.',exact=True).wait_for()
 page.get_by_role('button',name='Next level',exact=False).click();page.locator('.spelling-slots').wait_for();page.get_by_label('Your word',exact=True).fill('WRONG');page.get_by_role('button',name='Check my word',exact=False).click();page.locator('.spelling-feedback').wait_for();page.get_by_label('Your word',exact=True).fill('GROW');page.get_by_role('button',name='Check my word',exact=False).click();page.get_by_role('heading',name='You did it.',exact=True).wait_for()
 page.get_by_role('button',name='Next level',exact=False).click();page.locator('.spelling-study').wait_for();assert page.get_by_label('Your word',exact=True).count()==0
 page.get_by_role('button',name='Ready, hide the word',exact=True).click();page.get_by_label('Your word',exact=True).fill('THINK');page.get_by_role('button',name='Check my word',exact=False).click();page.get_by_role('heading',name='You did it.',exact=True).wait_for()
 page.goto(base+'/admin');page.get_by_label('Admin email',exact=False).fill(owner['email']);page.get_by_label('Password',exact=True).fill(owner['password']);page.get_by_role('button',name='Sign in to administration',exact=False).click();page.get_by_role('button',name='Rewards',exact=True).click()
 page.get_by_label('Learner',exact=False).select_option(index=0);page.get_by_label('XP to grant',exact=True).fill('500');page.get_by_label('Hints to grant',exact=True).fill('8');page.get_by_label('Reason',exact=True).fill('Careful practice during browser QA');page.get_by_role('button',name='Grant reward',exact=True).click();page.get_by_text('Reward granted.',exact=False).wait_for();assert page.locator('.reward-history article').count()>=1
 for width in [320,390,768,1440]:
  page.set_viewport_size({'width':width,'height':1000});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
 page.screenshot(path='outputs/browser-qa/rewards-admin.png',full_page=True)
 assert not errors,errors;b.close()
print('PASS: earned hints, live-position robot hints, zero balance, spelling modes, owner grants, and responsive layouts.')
