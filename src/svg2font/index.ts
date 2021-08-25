import * as fs from 'fs';
import * as vscode from 'vscode';
import * as nunjucks from 'nunjucks';
import * as path from 'path'
import { join as pathJoin } from 'path';
import * as svg2ttf from 'svg2ttf';
import * as  child_process from 'child_process';

const ttf2woff = require('ttf2woff')

export default class Svg2font {
    static env = new nunjucks.Environment(new nunjucks.FileSystemLoader(
      path.resolve(__dirname, '../../', 'src/svg2font/templates')
    ))
    static baseDir = ''
    static exporting: boolean = false
    data: {
      icons: any[]
      fontName: string
      prefix: string
    }
    distDir: string = ''
    distTree: {
      svg: string
      ttf: string
      woff: string
      css: string
      html: string
    } = {
      svg: '',
      ttf: '',
      woff: '',
      css: '',
      html: ''
    }
    svgContent: any
    cssContent: any
    htmlContent: any
    ttfBuf: any
    woffBuf: any
    constructor(icons: any[], fontName: string){
      if (Svg2font.exporting) return
      Svg2font.exporting = true
      this.data = {
        icons,
        fontName,
        prefix: 'icon-'
      };
      this.init();
      Svg2font.exporting = false
    }

    init(){
      try {
        this.distDir = pathJoin(Svg2font.baseDir,`${this.data.fontName}${Date.now()}`);
        this.distTree = {
          svg:pathJoin(this.distDir,`./fonts/${this.data.fontName}.svg`),
          ttf:pathJoin(this.distDir,`./fonts/${this.data.fontName}.ttf`),
          woff:pathJoin(this.distDir,`./fonts/${this.data.fontName}.woff`),
          html:pathJoin(this.distDir,'index.html'),
          css:pathJoin(this.distDir,'index.css'),
        }
        this.createDir();
        this.dist();
      } catch (error) {
        console.log('catch.......', error)
        Svg2font.exporting = false
        vscode.window.showErrorMessage(error)
      }
    }
    createDir(){
        if(!fs.existsSync(Svg2font.baseDir)){
            fs.mkdirSync(Svg2font.baseDir);
        }
        if(!fs.existsSync(this.distDir)){
            fs.mkdirSync(this.distDir);
            fs.mkdirSync(pathJoin(this.distDir,'fonts'));
        }
    }
    templeteRender(){
        this.svgContent = Svg2font.env.render('svg.njk', this.data);
        fs.writeFileSync(this.distTree.svg.toString(),this.svgContent);
        this.cssContent = Svg2font.env.render('css.njk',this.data);
        fs.writeFileSync(this.distTree.css,this.cssContent);
        this.htmlContent = Svg2font.env.render('html.njk',this.data);
        fs.writeFileSync(this.distTree.html,this.htmlContent);
    }
    ttf(){
        this.ttfBuf = Buffer.from(svg2ttf(this.svgContent,{}).buffer);
        fs.writeFileSync(this.distTree.ttf,this.ttfBuf);
    }
    woff(){
        this.woffBuf = Buffer.from(ttf2woff(this.ttfBuf,{}).buffer);
        fs.writeFileSync(this.distTree.woff,this.woffBuf);
    }
    dist(){
        this.templeteRender();
        this.ttf();
        this.woff();
    }
    getZip(){
        child_process.execSync(`tar czvf ${this.data.fontName}.tar.gz *`, {
            cwd: this.distDir
        });
        return fs.readFileSync(pathJoin(this.distDir,`${this.data.fontName}.tar.gz`));
    }
}