
lines = []
prev = None
separator = False
heading = False
body = False
with file('the-tree-far-away.html') as f:
  for l in f:
    l = l.replace('<head><title></title>', '<head><title>The Tree Far Away</title>')
    if 'link rel="stylesheet"' in l:
      l = (
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Libre+Baskerville:400,400italic" type="text/css">\n'
        ) + l
    if separator:
      l = l.replace('"indent"', '"noindent"')
    if l.strip() == 'class="pzdr-">&#x2766;</span>':
      prev = prev.replace('"noindent"', '"separator"')
      separator = True
    else:
      separator = False
    if 'The End' in l:
      l = l.replace('"noindent"', '"the-end"')
      l += '</div>\n'
    if not heading:
      lines.append(prev)
    prev = l
    if not body and '<p' in l:
      heading = True
    if heading and not l.strip():
      heading = False
      body = True
      lines.append('''
<div class="container title">
  <h1>The Tree Far Away</h1>
  <h2>by Daniel Darabos, 2015</h2>
</div>
<div class="container story">
      '''.strip())
lines.append(prev)
lines.pop(0)

with file('index.html', 'w') as f:
  f.writelines(lines)

with file('the-tree-far-away.css', 'w') as f:
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
    background: rgb(250, 240, 220);
    color: rgba(0, 0, 0, 0.6);
  }
}

.story, .title {
  font-family: 'Libre Baskerville', serif;
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

.story .verse {
  margin: 2em;
  margin-left: 4em;
  text-indent: -2em;
  text-align: left;
}

.story .verse .noindent {
  margin-top: 1em;
}

.story .bchri7t- {
  font-style: italic;
}

  '''.strip() + '\n')
