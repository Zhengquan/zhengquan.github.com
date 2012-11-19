---
layout: post
title: "zsh下修改iTerm2的标题"
category: osx
tags: [zsh, osx, iterm2]
---
{% include JB/setup %}

把终端模拟器切换为[iTerm](http://www.iterm2.com/)之后，在切换目录的时候，标签页的标题不发生变化，用起来不太方便，于是做了些许改进，可以显示当前目录和git仓库的分支名称，仅供参考
##代码
{% highlight ruby %}
# ~/.zshrc
function mybranch() {
  ref=$(git symbolic-ref HEAD 2> /dev/null)  || return
  echo "${ref#refs/heads/}"
}
function precmd() {
  echo -ne "\e]1;$(basename $PWD) $(mybranch)\a"
}
{% endhighlight %}

##效果
![iTerm2 Title](http://i.imgur.com/Mh0tV.jpg)

引用资源:

* [Automatically set title on iTerm tabs](http://charles.lescampeurs.org/2008/05/07/automatically-set-title-on-iterm-tabs)
