"""Actual built isolated Vite fixture. No save, no live product or external requests."""
import json, sys
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
root=Path(sys.argv[1]).resolve(strict=True)
assert (root/'index.html').is_file()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
origin=f'http://127.0.0.1:{server.server_port}'
records=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width in (320,375,1280):
            page=browser.new_page(viewport={'width':width,'height':900}); errors=[]; external=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda req:external.append(req.url) if not req.url.startswith(origin+'/') else None)
            assert page.goto(origin+'/').ok
            root=page.locator('main'); search=page.get_by_role('searchbox',name='実績を検索')
            assert search.input_value()=='' and not page.locator('#achievementImageFilter').is_visible()
            search.fill('  日本語 GUID  '); assert search.input_value()=='  日本語 GUID  '
            page.locator('#achievementFilter').select_option('missing'); page.locator('#achievementSort').select_option('progress-desc')
            assert root.get_attribute('data-ach-filter-renders')=='3' and root.get_attribute('data-batch-clears')=='3' and root.get_attribute('data-ach-limit')=='120'
            page.locator('#colTab').click(); page.locator('#collectionSearch').fill('家具'); page.locator('#collectionStatusFilter').select_option('unknown');page.locator('#collectionSort').select_option('record-desc')
            assert root.get_attribute('data-col-filter-renders')=='3'
            assert root.get_attribute('data-legacy-renders')=='1'
            page.locator('#achTab').click();assert search.input_value()=='  日本語 GUID  ';assert page.locator('#achievementFilter').input_value()=='missing';assert page.locator('#achievementSort').input_value()=='progress-desc'
            search.fill('');assert root.get_attribute('data-ach-filter-renders')=='4'
            page.locator('#colTab').click();assert page.locator('#collectionSearch').input_value()=='家具';assert page.locator('#collectionStatusFilter').input_value()=='unknown';assert page.locator('#collectionSort').input_value()=='record-desc'
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            for id in ('collectionSearch','collectionStatusFilter','collectionSort'):
                el=page.locator('#'+id); assert el.count()==1 and el.is_visible(); box=el.bounding_box();assert box and box['width']>0 and box['x']>=0 and box['x']+box['width']<=width+1
            assert not errors and not external,(errors,external)
            records.append({'viewport':width,'achievementEvents':4,'collectionEvents':3,'retainedAcrossTabs':True,'hiddenImage':True,'pageErrors':0,'externalRequests':0})
            page.close()
        browser.close()
finally:
    server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
