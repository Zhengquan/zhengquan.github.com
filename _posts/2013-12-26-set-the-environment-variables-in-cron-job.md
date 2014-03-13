---
layout: post
title: "Cron job与环境变量"
category: linux
tags: [crontab, bash]
---
{% include JB/setup %}

### Background
在添加系统的cron job时，或多或少都会遇到cron job不能按照预期工作的情况，这个时候就要大胆的把问题定位在系统环境变量的设置上。cron进程在启动cron job时，只会自动设置一些默认的变量，如：

~~~
SHELL = /bin/sh
PATH=/usr/bin:/bin
PWD=/home/yangkit
LANG=en_US.UTF-8
SHLVL=2
LANGUAGE=en_US:en
# set from the specific line in /etc/passwd
HOME=/home/yangkit
LOGNAME=yangkit
_=/usr/bin/env
~~~
{:.language-bash}

---

### Questions

1.如何设置cron job所需环境变量?

不要期望cron进程会自动设置JAVA_HOME, GEM_HOME,
GEM_PATH等自定义变量，一个比较好的实践是除了默认变量之外，在cron job脚本中设置好所有必要的路径和变量值。

{% highlight bash %}
#!/bin/bash

export JAVA_HOME=/opt/java
export GEM_HOME=$HOME/gems/ruby-2.0.0-p195
# commands
# ...
{% endhighlight %}
为了减少在各个脚本中重复设置变量，也可以把变量添加到crontab文件里面，如下：
{% highlight bash %}
# m h  dom mon dow   command
SHELL=/bin/bash
* */1 * * * ~/Scripts/mysql_full_backup.sh > ~/database_backup.log 2>&1
{% endhighlight %}

2.为什么`source ~/.bashrc`失效

对于如下的cron job:
{% highlight bash %}
* */1 * * * source ~/.bashrc && /foo/bar/script.sh
{% endhighlight %}
Cron job执行时,
仍然无法获取`~/.bashrc`设置的变量，这是由于`~/.bashrc`文件中下面代码造成的:

{% highlight bash %}
# If not running interactively, don't do anything
[ -z "$PS1" ] && return
{% endhighlight %}

需要区别这样一组概念:

* interactive shell 和 non-interactive shell  
interactive shell可以接受来自终端设备的命令，响应用户命令，所以通过SSH登录打开的Shell、手动打开的Shell都是interactive
shell，而通常运行一个脚本的shell都是non-interactive shell, 这种类型的shell不需要和用户进行交互，执行cron job的shell也是non-interactive shell。  
区别这两种shell的方法之一，就是判断`$PS1`(用户提示符)变量是否被设置，所以cron job无法加载这段代码之后设置的环境变量。

### Reference
1. [crontab环境变量](http://justwinit.cn/post/3377/)
2. [login shell和non-login shell的区别](http://www.isayme.org/linux-diff-between-login-and-non-login-shell.html)
3. [交互式shell和非交互式shell、登录shell和非登录shell的区别](http://www.cnblogs.com/yangqionggo/p/3280891.html)
4. [Interactive and non-interactive shells and scripts](http://www.tldp.org/LDP/abs/html/intandnonint.html)
5. [CRONTAB BEST PRACTICE](http://blog.endpoint.com/2008/12/best-practices-for-cron.html)

---
