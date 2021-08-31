window.onload = () => {
  window.vscode = acquireVsCodeApi()
  window.addEventListener('message', e => {
    window.collect = {}
    window.icons = e.data.icons || []
    const $content = $("#root")
    const icons = (e.data.icons || [])
    $content.html(`
<div class="header">
  <div class="searchArea">
    <input id="searchInput" onChange="onSearchChange(this)" placeholder="name or unicode" />
    <div id="searchBtn" onclick="doSearch(this)">
      <span>Search</span>
    </div>
  </div>
  <div id="opera" onclick="exportTask(this)">
      <span>Export</span>
  </div>
</div>
<div class="content" id="list">` + icons.map((icon, idx) => `
<div class="item-content" onclick="toggle(this)" data-idx="${idx}">
    <svg transform="scale(0.5, 0.5)" width="1024" height="1024" viewBox="0 0 1024 1024">
      <g>
        <path d="${icon.paths.join('')}"></path>
      </g>
    </svg>
    <div class="name">${icon.name}</div>
    <div class="unicodeName">${icon.unicodeName || '-'}</div>
</div>
    `).join("\n")) + '<div/>'
  })
}

function toggle(self) {
  const idx = $(self).data('idx')
  if (!window.icons.length || idx < 0) return
  const icon  = window.icons[idx]
  if ($(self).hasClass('selected') && window.collect[icon.name]) {
    delete window.collect[icon.name]
    $(self).removeClass('selected')
  } else {
    if (icon) {
      window.collect[icon.name] = icon
      $(self).addClass('selected')
    }
  }
}

function onSearchChange(self) {
  window.keyword = self.value
}

function doSearch() {
  console.log('window.keyword', window.keyword, 'window.icons.length', window.icons.length)
  if (!window.icons.length) return
  const results = window.keyword ?  window.icons.filter(icon => icon.name.indexOf(window.keyword) !== -1 || icon.unicodeName.indexOf(window.keyword) !== -1) : window.icons
  const resultHTMLStr = results.map((icon, idx) => `
  <div class="item-content ${window.collect[icon.name] ? 'selected' : ''}" onclick="toggle(this)" data-idx="${idx}">
    <svg transform="scale(0.5, 0.5)" width="1024" height="1024" viewBox="0 0 1024 1024">
      <g>
        <path d="${icon.paths.join('')}"></path>
      </g>
    </svg>
    <div class="name">${icon.name}</div>
    <div class="unicodeName">${icon.unicodeName ? icon.unicodeName.replace('&#x', '\\u').replace(';', '') : '-'}</div>
  </div>
  `).join('\n')
  console.log('xxxxxx', $('#list'))
  $('#list')[0].innerHTML = resultHTMLStr
}

function exportTask(self) {
  if (!Object.keys(window.collect).length) {
    vscode.postMessage({
      status: -1,
      msg: '请先勾选'
    });
  } else {
    const icons = Object.values(window.collect)
    vscode.postMessage({
      status: 0,
      icons
    });
  }
}