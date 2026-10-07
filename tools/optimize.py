from pathlib import Path
from bs4 import BeautifulSoup
from fontTools import subset
from PIL import Image
import json,hashlib
p=Path(__file__).resolve().parents[1];s=BeautifulSoup((p/'index.html').read_text(),'html.parser');text=s.get_text()+'OUR DAY DAYS HOURS MINUTES SECONDS0123456789好久不見婚禮見載入中出席回覆播放暫停'
m=json.loads((p/'assets-manifest.json').read_text());css=(p/'style.css').read_text();page=(p/'index.html').read_text()
for a in m:
 f=p/a['path']
 if f.suffix in ['.woff','.woff2','.ttf']:
  font=subset.load_font(str(f),subset.Options());sub=subset.Subsetter();sub.populate(text=text);sub.subset(font);subset.save_font(font,str(f),subset.Options())
 elif f.suffix in ['.png','.jpg','.webp']:
  im=Image.open(f);out=f.with_suffix('.webp');im.save(out,format='WEBP',quality=90,method=6)
  old=a['path'];a['path']=str(out.relative_to(p));css=css.replace(old,a['path']);page=page.replace(old,a['path'])
  if f!=out:f.unlink()
 a['bytes']=(p/a['path']).stat().st_size;a['sha256']=hashlib.sha256((p/a['path']).read_bytes()).hexdigest()
(p/'style.css').write_text(css);(p/'index.html').write_text(page);(p/'assets-manifest.json').write_text(json.dumps(m,indent=2,ensure_ascii=False))
print('optimized bytes',sum(x['bytes'] for x in m))
