"""Run on a built isolated Vite dist, not on a synthetic inline DOM."""
import json, sys
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(sys.argv[1]).resolve(strict=True)
assert (root/'index.html').is_file()
server = ThreadingHTTPServer(('127.0.0.1',0), partial(SimpleHTTPRequestHandler,directory=str(root)))
thread=Thread(target=server.serve_forever, daemon=True);thread.start()
origin=f'http://127.0.0.1:{server.server_port}'
records=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width in (320,375,1280):
            page=browser.new_page(viewport={'width':width,'height':900})
            errors=[]; external=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda req:external.append(req.url) if not req.url.startswith(origin+'/') else None)
            assert page.goto(origin+'/').ok
            ach=page.locator('#achTab'); col=page.locator('#colTab')
            def expect(tab):
                for name,button,panel in [('achievements',ach,'#achPanel'),('collections',col,'#colPanel')]:
                    selected=name==tab
                    assert button.get_attribute('aria-selected')==str(selected).lower()
                    assert button.get_attribute('tabindex')==('0' if selected else '-1')
                    assert page.locator(panel).is_visible()==selected
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            expect('achievements'); assert page.locator('main').get_attribute('data-legacy-renders')=='0'
            col.click();expect('collections');assert page.locator('main').get_attribute('data-legacy-renders')=='1'
            col.click();expect('collections');assert page.locator('main').get_attribute('data-legacy-renders')=='2'
            col.press('ArrowLeft');expect('achievements');assert ach.evaluate('el=>el===document.activeElement')
            ach.press('End');expect('collections');assert col.evaluate('el=>el===document.activeElement')
            col.press('Home');expect('achievements');assert ach.evaluate('el=>el===document.activeElement')
            ach.press('ArrowRight');expect('collections');assert col.evaluate('el=>el===document.activeElement')
            col.press('ArrowRight');expect('achievements');assert ach.evaluate('el=>el===document.activeElement')
            assert page.locator('main').get_attribute('data-legacy-renders')=='4'
            assert page.locator('#achPanel').evaluate('el=>el.tagName')=='DIV'
            assert page.locator('#colPanel').evaluate('el=>el.tagName')=='DIV'
            assert not errors and not external,(errors,external)
            records.append({'viewport':width,'keyboardAndClick':'PASS','horizontalOverflow':False,'externalRequests':0,'pageErrors':0,'legacyCollectionRenders':4,'tabpanelRole':'DIV'})
            page.close()
        browser.close()
finally:
    server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
