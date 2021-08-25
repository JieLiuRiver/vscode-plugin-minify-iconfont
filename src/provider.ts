import * as vscode from 'vscode';
import * as path from 'path';
import { Disposable } from './dispose';
import * as fs from 'fs'
import cheerio from 'cheerio';
import Svg2font from './svg2font/index'
const svgpath = require('svgpath')

// const log = (title: string, content: any) => {
//   console.log(title +' ===========', content)
//   console.log('')
// }

interface IconItem {
  code: number
  heightt: number
  width: number
  mirrorImagePaths: string[]
  name: string
  paths: string[]
}

export class Provider implements vscode.CustomReadonlyEditorProvider<TTFDocument>{

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider("svg.minify", new Provider(context), {
      supportsMultipleEditorsPerDocument: true,
      webviewOptions:{
        retainContextWhenHidden:true
      }
    })
  }

  icons: IconItem[] = []
  fsPath: string = ''
  constructor(
    private readonly _context: vscode.ExtensionContext
  ) { }
  openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): TTFDocument | Thenable<TTFDocument> {
    return TTFDocument.create(uri)
  } 
  resolveCustomEditor(document: TTFDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    }
    const svgPath = document.uri.path
    this.fsPath = document.uri.fsPath
    if (!svgPath || !svgPath.endsWith('.svg')) return
    this.parseSvgFile(svgPath)
    const html = this.getHtmlForWebView(webviewPanel.webview)
    webviewPanel.webview.postMessage({ icons: this.icons })
    webviewPanel.webview.html = html
    webviewPanel.webview.onDidReceiveMessage((data) => {
      data && typeof data.msg === 'string' && vscode.window.showErrorMessage(data.msg)
      if (data && data.status === 0) {
        this.doExport(data.icons, path.parse(document.uri.path))
      } 
    }, undefined)
  }    
    
  parseSvgFile(svgPath: string) {
    const htmlStr = fs.readFileSync(svgPath,{encoding:'utf-8'});
    const $ = cheerio.load(htmlStr)
    let $fontface = $('font-face:first'),
      $glyph = $('glyph'),
      width = $fontface.attr('units-per-em'),
      height = width;
    const icons: any[] = []
    const scale = 1024/parseInt(width!);
    $glyph.each((index,glyph)=>{
      let {attribs} = glyph;
      if(attribs.d && attribs.d.length > 0){
        icons.push({
            width: 1024,
            height: parseInt(height!) * scale,
            paths: parsePath(Array.from($(glyph)), scale),
            mirrorImagePaths: mirrorImagePath([attribs.d], parseInt(height!) * scale),
            name: attribs['glyph-name'] || randomWord(8),
            code: attribs['unicode'] ? attribs['unicode'].charCodeAt(0) : null,
        })
      }
    });
    this.icons = icons
  }
  
  getHtmlForWebView(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(
      path.join(this._context.extensionPath, 'media', 'load.js')
    ));  
    const cssUri = webview.asWebviewUri(vscode.Uri.file(
      path.join(this._context.extensionPath, 'media', 'load.css')
    )); 
    return `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script src="https://code.jquery.com/git/jquery-3.x-git.min.js"></script>
      <script src="${scriptUri}" type='text/javascript'></script>
    </head> 
     
    <body> 
      <link href="${cssUri}" rel="stylesheet" type="text/css" />
      <div id="root">
      </div>
    </body>
    </html>`  
  } 
 
  nodeBufferToArrayBuffer(buffer: Uint8Array) {
    var view = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return view;
  }

  doExport(icons: IconItem[], pathMap: path.ParsedPath) {
    const fontName =  pathMap.name || 'custom'
    const dir = path.dirname(this.fsPath)
    Svg2font.baseDir = dir + '/__minify__'
    if(!fs.existsSync(Svg2font.baseDir)){
      fs.mkdirSync(Svg2font.baseDir);
    }
    new Svg2font(icons, fontName)
  }
 
}
class TTFDocument extends Disposable implements vscode.CustomDocument {

  private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    if (uri.scheme === 'untitled') {
      return new Uint8Array();
    }
    return vscode.workspace.fs.readFile(uri);
  }
  static async create(uri: vscode.Uri) {
    const fileData = await TTFDocument.readFile(uri)
    console.log(uri, fileData)
    return new TTFDocument(uri, fileData)
  }

  private readonly _uri: vscode.Uri;
  private _documentData: Uint8Array;
  // private readonly _delegate: TTFDocumentDelegate;
  private constructor(
    uri: vscode.Uri,
    initialContent: Uint8Array
  ) {
    super();
    this._uri = uri;
    this._documentData = initialContent;
  }

  public get uri() { return this._uri; }
  public get documentData(): Uint8Array { return this._documentData; }
}

function randomWord(length: number){
  let words = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      wordsLength = words.length
  let word = '',
      count = 0
  while(count < length){
      const a = Math.random() * (wordsLength -1 - 10)
      const b = Math.random() * (wordsLength -1)
      word += count === 0 ? words[parseInt(a + '')] : words[parseInt(b + '')];
      count++;
  }
  return word;
}

function parsePath($path: any[], scale: number){
  let paths: any[] = [];
  $path.forEach(path => {
    let d = path.attribs.d;
    paths.push(d.replace(/[\d\.]+/g,(num: any) => (num * scale).toFixed(8)))
  })
  return paths;
}

function mirrorImagePath(paths: any[],height: number){
  return paths.map((path) => svgpath(path).matrix([1,0,0,-1,0,0]).matrix([1,0,0,1,0,height]).toString());
}