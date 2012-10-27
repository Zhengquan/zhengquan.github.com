---
layout: post
title: 正则表达式- 零宽断言
category: coding
tags: [regexp, ruby, vim]
---
{% include JB/setup %}
## 基本概念
零宽断言(zero-width assertions)用来指定字符中的位置之前或者之后必须满足一定的条件，其是零宽度匹配的，而不像 \[a-z\] 一样能匹配一个字符，零宽断言有以下四种：
它用来匹配表达式前面的字符,其后必须匹配或者不匹配指定的**exp**表达式。  

* 零宽度正预测先行断言 (?=**exp**)  
零宽度正预测先行断言也叫做先行断言，用来匹配**exp**前面的位置，如字符串`HELLO
WORLD, WELCOME TO RAILS WORLD`,现在需要把后面是`L`的`E`替换为`M`

      str = "HELLO WORLD, WELCOME TO RAILS WORLD"
      str.gsub(/E/,'M')           #=> "HMLLO WORLD, WMLCOMM TO RAILS WORLD"
      str.gsub(/E(?=L)/,'M')      #=> "HMLLO WORLD, WMLCOME TO RAILS WORLD"

* 零宽度负预测先行断言 (?!**exp**)  
和(?=**e /my\(sql\)\@=xp**)不同的是，零宽度负预测先行断言要求匹配位置之后，不能和**exp**表达式匹配，对于上面的例子，如果需要把所有**后面不是`L`的`E`**替换为`M`，则使用负预测先行断言的写法如下：

      str = "HELLO WORLD, WELCOME TO RAILS WORLD"
      str.gsub(/E(?!L)/, 'M')    #=> 'HELLO WORLD, WELCOMM TO RAILS WORLD'

* 零宽度正回顾后发断言 (?<=**exp**)  
零宽度正回顾后发断言也叫做后发断言，用于匹配表达式后面的位置，如果需要匹配`str`中前面为`R`的`L`,并把其替换为`M`,则使用后发断言，写法如下：

      str = "HELLO WORLD, WELCOME TO RAILS WORLD"
      str.gsub(/(?<=R)L/,'M'),    #=> "HELLO WORMD, WELCOME TO RAILS WORMD"

* 零宽度负回顾后发断言 (?<!**exp**)  
需要匹配的位置之前，不能和**exp**表达式匹配，匹配`str`中前面不为`R`的`L`，写法如下：

      str = "HELLO WORLD, WELCOME TO RAILS WORLD"
      str.gsub(/(?<!R)L/, 'M')   #=> "HEMMO WORLD, WEMCOME TO RAIMS WORLD"

## Vim查找技巧 - 零宽断言
使用Vim查找、替换时，也可以使用零宽断言来查找满足特定条件的字符串，同样有以下四种类型的零宽断言:  

* (**exp**)@=         先行断言  
* (**exp**)@<=        后发断言
* (**exp**)@!         零宽度负预测先行断言
* (**exp**)@<!        零宽度负回顾后发断言

需要注意的是，在搜索、替换时，需要把其中的`(`，`)`，`@`转义，如需要把英文句子中的中文引号，替换为英文引号，则使用零宽断言替换的写法如下:  

    :%s/\([A-Za-z]\)\@<=，\([A-Za-z\ ]\)\@=/,/g 
## 实例
* markdown解析   
在解析markdown的过程中，需要使用大量的正则表达式，来将markdown标签转化为Html标签，其中有很多地方都用到了零宽断言。[gollum_editor](https://github.com/samknight/gollum_editor)是一个markdown富文本编辑器，gollum_editor可以实时地在前端预览markdown文件，其中用来解析列表的正则表达式如下：  

      /(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/m 

    可以分解如下：

       (\n)?                                    // 换行符
      (^[ \t]*)                                 //开头的空白字符，空格或者制表符
      ([*+-]|\d+[.]) [ \t]+                     // 列表标记
      ([^\r]+?(\n{1,2}))                        // 列表项
      (?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))  //先行断言，限定分组之后必须匹配指定的格式
    其中使用的先行断言要求列表项(也可能是带有子列表的列表项)之后，只能是列表的结束或者是下一个列表的开始，对于下面文本：  

      * Hello
        1. Sub A
        2. Sub B
      * World  
      ~0 
    其中`~0`为列表结束标记，解析得到的分组如下：

      Match 1
      1.	 
      2.	 
      3.	*
          Hello
      4   1. Sub A
          2. Sub B
      5.	
      6.	*
      7.	*
      Match 2
      1.	 
      2.	 
      3.	*
      4.	World
      5.	
      6.	~0
      7.	 
    这样可以把`Match1`中匹配到的列表项，继续递归进行列表解析，直到搜索不到`/\n{2,}/`,如果没有使用先行断言，则解析结果如下：

      Match 1
      1.	 
      2.	 
      3.	*
      4.	Hello
      5.	
      Match 2
      1.	 
      2.	 
      3.	1.
      4.	Sub A
      5.	
      Match 3
      1.	 
      2.	 
      3.	2.
      4.	Sub B
      5.	
      Match 4
      1.	 
      2.	 
      3.	*
      4.	World
      5.	
    可以看到，上面的匹配并没有体现出列表的层级关系，`Hello`与`Sub A`成为了同一级的列表项。  

相关资料：  
  \[1\] [正则表达式30分钟入门教程](http://deerchao.net/tutorials/regex/regex.htm)  
  \[2\] [rubular:正则表达式测试](http://rubular.com/)  
  \[3\] [正则表达式–零宽断言详解](http://hooopo.iteye.com/blog/407062)

__EOF__
