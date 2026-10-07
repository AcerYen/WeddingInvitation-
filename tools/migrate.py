"""Rebuild the static invitation from a Wix HTML capture. Requires beautifulsoup4."""
import concurrent.futures, hashlib, html, json, pathlib, re, sys, urllib.request
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parents[1]
s=BeautifulSoup(pathlib.Path(sys.argv[1]).read_text(),'html.parser')
assets=root/'assets';assets.mkdir(exist_ok=True)
manifest=[]
def local(url):
 url=html.unescape(url)
 if url.startswith('//'):url='https:'+url
 ext=pathlib.PurePosixPath(url.split('?')[0]).suffix
 if len(ext)>6 or not ext:ext='.bin'
 name=hashlib.sha256(url.encode()).hexdigest()[:20]+ext
 path='assets/'+name
 if not any(x['source']==url for x in manifest):manifest.append({'source':url,'path':path})
 return path
styles='\n'.join(x.get_text() for x in s.find_all('style'))
# Retain all original breakpoints, typography, positions and shape dividers.
styles=re.sub(r'url\([\'"]?(https://[^\)\'\"]+)[\'"]?\)',lambda m:'url("'+local(m[1])+'")',styles)
site=s.select_one('#SITE_CONTAINER')
for x in site.select('script, style, #WIX_ADS'):x.decompose()
for wow in site.select('wow-image'):
 data=json.loads(wow['data-image-info'])['imageData'];url=data['url']
 # Keep the original crop but cap oversized source renditions at 1600px.
 m=re.search(r'/fill/w_(\d+),h_(\d+)',url)
 if m and int(m[1])>1600:
  h=round(int(m[2])*1600/int(m[1]));url=url[:m.start()]+re.sub(r'/fill/w_\d+,h_\d+',f'/fill/w_1600,h_{h}',url[m.start():],count=1)
 img=wow.find('img');img['src']=local(url);img['decoding']='async';img['loading']='eager' if len(manifest)<8 else 'lazy'
 wow.attrs.pop('data-image-info',None)
for a in site.find_all('a',href=True):
 if 'jackclemence#' in a['href']:a['href']='#music';a['data-start']='true'
 if 'music.wixstatic' in a['href']:a['href']=local(a['href'])
# Interactive wrappers are display:contents without the Wix runtime.
for x in site.select('interact-element'):x.unwrap()
# Google Forms and countdown are client-rendered on Wix; insert their local equivalents.
for parent,id,src,title in [('comp-mussz4io-container','comp-mustpq8m','countdown.html','距離婚禮倒數'),('comp-must9r6u-container','comp-mutdv7m7','rsvp.html','婚禮出席回覆 RSVP')]:
 p=site.select_one('.'+parent)
 if p:
  frag=BeautifulSoup(f'<div id="{id}" class="builder-root {id} html-component"><iframe src="{src}" title="{title}" loading="lazy" style="width:100%;height:100%;border:0;display:block"></iframe></div>','html.parser')
  p.append(frag)
player=site.find(id='comp-mutjz522');player['data-anchor']='music'
# Replace Wix controls with accessible native controls, preserving cover and title.
for x in list(player.children):
 if getattr(x,'attrs',None) is not None and 'controls' in str(x.get('class','')):x.decompose()
controls=player.select_one('[class*="_controls_"]')
if controls:controls.decompose()
audio=BeautifulSoup('<audio id="audio" controls preload="metadata" aria-label="would you be mine — TYSON YOSHI"></audio>','html.parser').audio
audio['src']=local('https://music.wixstatic.com/mp3/050759_bdeba8e06e4b4b6fb5a00bc69a671dd4.mp3');player.append(audio)
styles+='''\n/* Static migration: Wix runtime replacements. */
:root{--wix-ads-height:0px!important;--wix-ads-top-height:0px!important;--wix-ads-bottom-height:0px!important}
html{scroll-behavior:smooth}body{margin:0}wow-image,picture{display:block;width:100%;height:100%}wow-image img{display:block;width:100%;height:100%;object-fit:cover}#audio{width:100%;min-height:40px;margin-top:8px}#comp-mutjz522{scroll-margin-top:24px}.html-component{overflow:hidden}a:focus-visible,button:focus-visible{outline:2px solid #ba8e58;outline-offset:5px}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
'''
head=f'''<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jack &amp; Clemence｜好久不見，婚禮見。</title><meta name="description" content="2026.12.12 台中林酒店 3樓全球廳，Jack &amp; Clemence 婚禮邀請"><meta property="og:title" content="Jack &amp; Clemence｜好久不見，婚禮見。"><meta property="og:type" content="website"><meta property="og:description" content="2026.12.12 台中林酒店 3樓全球廳"><link rel="stylesheet" href="style.css"><script src="script.js" defer></script>'''
(root/'index.html').write_text('<!doctype html><html lang="zh-Hant"><head>'+head+'</head><body class="responsive">'+str(site)+'</body></html>')
(root/'style.css').write_text(styles)
(root/'countdown.html').write_text('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+urllib.request.urlopen('https://84df5c8c-0fa6-4470-8ab0-991895108fbb.filesusr.com/html/050759_204f86a64a2274cac10d7936f0836640.html').read().decode()+'</body></html>')
(root/'rsvp.html').write_text('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+urllib.request.urlopen('https://84df5c8c-0fa6-4470-8ab0-991895108fbb.filesusr.com/html/050759_a05b6034f98c1d04cf4ba6d8950ac302.html').read().decode().replace('<iframe','<iframe title="婚禮出席回覆表單"')+'</body></html>')
def download(a):
 p=root/a['path']
 if not p.exists():
  req=urllib.request.Request(a['source'],headers={'User-Agent':'Mozilla/5.0'})
  with urllib.request.urlopen(req,timeout=60) as r:p.write_bytes(r.read())
 a['bytes']=p.stat().st_size;a['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();print(a['path'],a['bytes'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(download,manifest))
(root/'assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
