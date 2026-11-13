"""Built isolated selector, synthetic runtime. Actual accepted runtime tested separately."""
import json,sys
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright,expect
root=Path(sys.argv[1]).resolve(strict=True);assert (root/'locale-preview.html').is_file()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)));thread=Thread(target=server.serve_forever,daemon=True);thread.start();origin=f'http://127.0.0.1:{server.server_port}'
results=[]
try:
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True)
  for width in (320,375,1280):
   page=b.new_page(viewport={'width':width,'height':900});errors=[];external=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(origin+'/') else None)
   assert page.goto(origin+'/locale-preview.html').ok
   main=page.locator('main');selector=page.get_by_label('Language');expect(main).to_have_attribute('data-status','READY');expect(selector).to_have_value('auto');expect(main).to_have_attribute('data-locale','en');expect(selector.locator('option')).to_have_count(4)
   selector.select_option('ja');expect(main).to_have_attribute('data-locale','ja');expect(selector).to_have_value('ja');expect(page.locator('html')).to_have_attribute('lang','ja');assert page.reload().ok;expect(selector).to_have_value('ja');expect(main).to_have_attribute('data-locale','ja')
   selector.select_option('zh-Hant');expect(main).to_have_attribute('data-locale','zh-Hant');expect(page.locator('html')).to_have_attribute('lang','zh-Hant');selector.select_option('auto');expect(main).to_have_attribute('data-locale','en');expect(selector).to_have_value('auto');assert page.evaluate("localStorage.getItem('fixture-locale')===null")
   selector.focus();expect(selector).to_be_focused();assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external)
   results.append({'width':width,'autoManualReload':True,'lang':True,'focus':True,'overflow':False,'external':0,'errors':0});page.close()
  b.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(results))
