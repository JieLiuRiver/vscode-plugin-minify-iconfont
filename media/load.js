window.onload = () => {
  window.vscode = acquireVsCodeApi()
  window.addEventListener('message', e => {
    window.collect = {}
    window.icons = e.data.icons || []
    const $content = $("#root")
    const icons = (e.data.icons || [])
    $content.html(`<div id="opera" onclick="exportTask(this)"><span>导出</span></div><div class="content">` + icons.map((icon, idx) => `
<div class="item-content" onclick="toggle(this)" data-idx="${idx}">
    <svg transform="scale(0.5, 0.5)" width="1024" height="1024" viewBox="0 0 1024 1024">
      <g>
        <path d="${icon.paths.join('')}"></path>
      </g>
    </svg>
    <div class="name">${icon.name}</div>
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