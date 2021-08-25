## minify-iconfont

### `WHAT` 是什么
`minify-iconfont`， 是一个用于按需导出字体图标的`vscode`插件。

### `HOW` 怎么用

##### `step.1`
打开项目中的字体图标

![image.png](https%3A%2F%2Fnote.youdao.com%2Fyws%2Fpublic%2Fresource%2F70a8093e0706296480d3854773222b2a%2FWEBRESOURCE5a247971de17fb33e539babf995dd659)


##### `step.2`
单击`xxx.svg`文件， 会解析出所有图标，显示在右面板
![image.png](https%3A%2F%2Fnote.youdao.com%2Fyws%2Fpublic%2Fresource%2F70a8093e0706296480d3854773222b2a%2FWEBRESOURCE27b1e8d337af50a6a79439cdfa45bdf6)

##### `step.3`
选中需要使用的图标， 点击“导出”。 提示导出成功后，会在当前目录下，生成一个`__minify__`目录的文件

![image.png](https://note.youdao.com/yws/public/resource/70a8093e0706296480d3854773222b2a/WEBRESOURCEb351d8c8a0f78af89c9527d06e0bab85?ynotemdtimestamp=1629861588270)

![image.png](https%3A%2F%2Fnote.youdao.com%2Fyws%2Fpublic%2Fresource%2F70a8093e0706296480d3854773222b2a%2FWEBRESOURCE9f25b1fd289c0f697cfe791be1f58d4a)

##### `step.4`

使用`live-server`预览`index.html`

![image.png](https%3A%2F%2Fnote.youdao.com%2Fyws%2Fpublic%2Fresource%2F70a8093e0706296480d3854773222b2a%2FWEBRESOURCEc4659e259193c121b83d9b7043afd970)


##### 注意
目前只支持，svg格式的字体图标，其他格式不支持。  其中单个图标的svg文件也不支持。