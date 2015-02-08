# coding=utf-8
import pyphen
import re

hyp = pyphen.Pyphen(lang='hu_HU')
def hyphenated(text):
  res = []
  for w in text.decode('utf-8').split(u' '):
    h = hyp.inserted(w, '&shy;')
    h = h.replace('cs&shy;cs', 'ccs')
    h = h.replace('dz&shy;dz', 'ddz')
    h = h.replace('dzs&shy;dzs', 'ddzs')
    h = h.replace('gy&shy;gy', 'ggy')
    h = h.replace('ly&shy;ly', 'lly')
    h = h.replace('ny&shy;ny', 'nny')
    h = h.replace('sz&shy;sz', 'ssz')
    h = h.replace('ty&shy;ty', 'tty')
    h = h.replace('zs&shy;zs', 'zzs')
    res.append(h)
  return ' '.join(res).encode('utf-8')

lines = []
prev = None
separator = False
heading = False
body = False
with file('a-csillagok-melyen.html') as f:
  for l in f:
    l = l.decode('cp1250').encode('utf-8')
    l = l.replace('iso-8859-2', 'utf-8')
    l = l.replace('<head><title></title>', '<head><title>A csillagok mélyén</title>')
    l = l.replace('&#x0151;', 'ő').replace('&#x0171;', 'ű')
    l = l.replace('>&#x00A0;', '>')
    if 'link rel="stylesheet"' in l:
      l = (
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Lora:400,400italic,700" type="text/css">\n'
        ) + l
    if separator:
      l = l.replace('"indent"', '"noindent"')
    if l.strip() == 'class="pzdr-">&#x2726;</span>':
      prev = prev.replace('"noindent"', '"separator"')
      separator = True
    else:
      separator = False
    if 'Vége' in l:
      l = l.replace('"noindent"', '"the-end"')
    if '/body' in l:
      l = '</div>\n' + l
    if l.startswith('class="bchri8t-">') and prev.endswith('</span><span \n'):
      prev = prev[:-len('</span><span \n')] + l[len('class="bchri8t-">'):]
      continue
    if prev and not heading:
      if '<' not in prev and '>' not in prev:
        prev = hyphenated(prev)
      else:
        def hypmiddle(m):
          return m.group(1) + hyphenated(m.group(2)) + m.group(3)
        prev = re.sub('(.*\>)(.*?)(\<.*)', hypmiddle, prev)
      lines.append(prev)
    prev = l
    if not body and '<p' in l:
      heading = True
    if heading and not l.strip():
      heading = False
      body = True
      lines.append('''
<div class="container title">
  <h1>A csillagok mélyén</h1>
  <h2>Darabos Dániel, 2014</h2>
</div>
<div class="container story">
      '''.strip())
lines.append(prev)

with file('index.html', 'w') as f:
  f.writelines(lines)

with file('a-csillagok-melyen.css', 'w') as f:
  f.write('''

@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .story {
    font-size: 18px;
  }
}

@media screen {
  body {
    background: rgb(240, 240, 240);
    color: rgba(0, 0, 0, 0.6);
  }
}

.story, .title {
  font-family: 'Lora', serif;
}

.title {
  text-align: center;
  margin-top: 4em;
  margin-bottom: 4em;
}
.title h1 {
  margin-bottom: 0;
}
.title h2 {
  font-size: 18px;
  margin-top: 0;
}

.story {
  text-align: justify;
}

.story p {
  margin-top: 0;
  margin-bottom: 0;
  line-height: 1.4;
}
.story p.indent {
  text-indent: 2em;
}

.story .separator,
.story .the-end {
  text-align: center;
  margin-top: 2em;
  margin-bottom: 2em;
}

.story .bchri8t- {
  font-style: italic;
}

.story dl.description {
  line-height: 1.4;
}

.story dt.description {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0;
}

  '''.strip() + '\n')
