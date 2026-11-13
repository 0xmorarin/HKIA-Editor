"""Actual compiled V33 candidate, accepted catalogs; synthetic Account only, no Writer/export."""
import argparse,json,threading,hashlib
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright,expect
p=argparse.ArgumentParser();p.add_argument('candidate');p.add_argument('--chrome');a=p.parse_args();root=Path(a.candidate).resolve(strict=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();url=f'http://127.0.0.1:{server.server_port}/'
locales=['en','en-GB','ja','de','fr','fr-CA','es','it','nl','pt-BR','ru','tr','ko','zh-Hans','zh-Hant']
catalog={l:json.loads((root/'localization/ui'/f'{l}.json').read_text()) for l in locales}
guid=json.loads((root/'data/achievement-definitions.json').read_text())[0]['guid'];fixture={'Achievements':{guid:{'IsComplete':False,'CurrentValue':0,'CompletedTime':None}},'Counters':{}}
def probe(browser,width):
 page=browser.new_page(viewport={'width':width,'height':900},locale='zh-TW');errors=[];external=[];downloads=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None);page.on('download',lambda d:downloads.append(d.suggested_filename))
 try:
  assert page.goto(url).ok;expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000);mark=page.locator('[data-hkia-locale-chrome]');expect(mark).to_have_attribute('data-hkia-locale-chrome','zh-Hant',timeout=30000);ctrl=page.locator('#hkiaLocale');expect(ctrl.locator('option')).to_have_count(16)
  page.locator('#saveInput').set_input_files({'name':'synthetic-settings.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()});expect(page.locator('#fileStatus')).to_have_text('Account JSON');page.locator('#achievementsList .achievement-row').first.click();expect(page.locator('#editorPanel')).to_contain_text(guid)
  page.locator('#achievementSearch').fill(guid);page.locator('#achievementFilter').select_option('incomplete');page.locator('#achievementSort').select_option('name');page.locator('#editorPanel form input[type=number]').fill('3')
  page.evaluate('''()=>{window.__localeRefs=['achTab','colTab','achPanel','colPanel','achievementSearch','achievementFilter','achievementSort','editorPanel','saveInput'].map(id=>document.getElementById(id));}''')
  def witness():return page.evaluate('''()=>{const ids=['achTab','colTab','achPanel','colPanel','achievementSearch','achievementFilter','achievementSort','editorPanel','saveInput'];return {same:window.__localeRefs.every((n,i)=>n===document.getElementById(ids[i])),query:document.getElementById('achievementSearch').value,filter:document.getElementById('achievementFilter').value,sort:document.getElementById('achievementSort').value,tab:document.getElementById('achTab').getAttribute('aria-selected'),detail:document.getElementById('editorPanel').innerText,draft:document.querySelector('#editorPanel form input[type=number]').value,file:document.getElementById('fileStatus').innerText,undo:document.getElementById('undoAccount').disabled,writer:document.documentElement.dataset.nativePreview};}''')
  before=witness();assert before['same'] and before['draft']=='3' and before['writer']=='off'
  for l in locales:
   ctrl.select_option(l);expect(mark).to_have_attribute('data-hkia-locale-chrome',l);expect(mark).to_have_attribute('data-locale-status','READY');expect(page.locator('#achTab > span')).to_have_text(catalog[l]['nav.achievements']);expect(page.locator('#collectionSort option[value="name"]')).to_have_text(catalog[l]['col.sort.name']);assert witness()==before;assert page.locator('#achievementSearch').get_attribute('placeholder')=='日本語名・英語名・GUIDで検索';assert page.evaluate("document.documentElement.lang==='ja'")
  assert page.evaluate("JSON.parse(localStorage.getItem('hkia-editor.locale.preference.v1')).locale==='zh-Hant'");assert not errors and not external and not downloads,(errors,external,downloads);assert page.locator('#nativeDownload').is_disabled() and page.locator('#downloadEdited').is_disabled();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.reload();expect(mark).to_have_attribute('data-hkia-locale-chrome','zh-Hant',timeout=30000);expect(ctrl).to_have_value('zh-Hant');ctrl.select_option('auto');expect(mark).to_have_attribute('data-locale-status','READY');expect(ctrl).to_have_value('auto');assert page.evaluate("localStorage.getItem('hkia-editor.locale.preference.v1')===null")
  return {'width':width,'locales':15,'stateInvariant':True,'nativeWriterOff':True,'noExternal':True}
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if a.chrome:opts['executable_path']=a.chrome
  b=p.chromium.launch(**opts);reports=[probe(b,w) for w in (320,375,1280)];b.close();print(json.dumps({'reports':reports,'scope':'compiled actual product chrome only'}))
finally:server.shutdown();server.server_close();thread.join()
