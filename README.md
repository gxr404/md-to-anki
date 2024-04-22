# md-to-anki

> fork自[mdanki](https://github.com/ashlinchak/mdanki), 优化了卡片样式

## 安装

```bash
npm i -g md-to-anki
```

## 使用

```bash
$ md-to-anki --help

  Usage:
    $ md-to-anki <mdFile>

  Commands:
    <mdFile>  markdown文件

  For more info, run any command with the `--help` flag:
    $ md-to-anki --help

  Options:
    -t, --target <targetFile>  输出的anki文件名 eg: "-d targe.apkg" 
    -c, --config <configFile>  配置文件 eg: "-c ./config.json" 
    -d, --deckName <deckName>  卡片组名 eg: "-d Test", Default: 取md文件中的"# xx" 
    -h, --help                 Display this message 
    -v, --version              Display version number 
```

## example

```bash
md-to-anki ./example/simple.md

# ✅ Simple Card: /xx/xxx/xx/example/simple.apkg
```

![example](./example/resources/example.png)

## TODO

- [ ] 更多模板主题选择
