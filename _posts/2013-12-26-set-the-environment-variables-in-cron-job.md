---
layout: post
title: "cron job与环境变量"
category: linux
tags: [crontab, bash]
---
{% include JB/setup %}

### Cron Job默认环境变量
在添加系统的cron job时，或多或少都会遇到cron job不能按照预期工作的情况，这个时候就要大胆的把问题定位在系统环境变量的设置上。cron进程在启动cron job时，只会自动设置一些默认的变量，如：

{% highlight bash %}
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
{% endhighlight %}

---

### Questions

1.如何在设置cron job所需环境变量?

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

再解释这个问题之前，需要区别这样两组概念:

* login shell 和 non-login shell  
* interactive shell 和 non-interactive shell



### Reference
1. [crontab环境变量](http://justwinit.cn/post/3377/)
2. [login shell和non-login shell的区别](http://www.isayme.org/linux-diff-between-login-and-non-login-shell.html)

