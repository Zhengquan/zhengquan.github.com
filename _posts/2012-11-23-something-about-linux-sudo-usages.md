---
layout: post
title: "使用Linux sudo切换用户"
category: Linux
tags: [Linux, gitosis, Ubuntu]
---
{% include JB/setup %}

## 背景
在搭建[gitosis](https://github.com/res0nat0r/gitosis)环境时，需要首先创建系统用户`git`,
同时设置该用户无法使用密码登录：
{% highlight bash %}
sudo adduser \
    --system \
    --shell /bin/sh \
    --gecos 'git version control' \
    --group \
    --disabled-password \
    --home /srv/example.com/git \
    git
{% endhighlight %}
然后需要使用`git`身份执行`gitosis-init`初始化git仓库, 报错:
{% highlight bash%}
ERROR:gitosis.app:Unable to read config file: [Errno 13] Permission denied: '/home/git/.gitosis.conf'
{% endhighlight %}
## 解决办法
{% highlight ruby %}
sudo -H -u git -s && echo $USER
{% endhighlight %}
然后在这个新开启的Shell中执行操作。

__EOF__
