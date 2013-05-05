---
layout: post
title: "Svn Practices"
category: scm
tags: [svn, scm]
---
{% include JB/setup %}

* 创建本地SVN仓库, 且需要带有trunk, branches, tags目录

      # create repository
      svnadmin create /Users/yangkit/svnrepo/document
      
      # create directory of repository
      svn mkdir file:///Users/yangkit/svnrepo/document/trunk
      svn mkdir file:///Users/yangkit/svnrepo/document/branches
      svn mkdir file:///Users/yangkit/svnrepo/document/tags
      
      # checkout the trunk
      svn co file:///Users/yangkit/svnrepo/document/trunk document

* 创建新分支

      svn copy file:///Users/yangkit/svnrepo/document/trunk file:///Users/yangkit/svnrepo/document/branches/refactor 
* 切换新分支
      
      svn switch file:///Users/yangkit/svnrepo/document/branches/refactor
      # show infomation
      svn info |grep URL
* 显示当前分支的提交日志
      
      svn log -v -l 5 -r HEAD:1

* 显示Revision的修改记录

      svn diff -c Revision
      or
      svn diff -r Revison - 1:Revison
      
* 切换到指定分支的指定Revision

      svn switch file:///Users/yangkit/svnrepo/document/branches/refactor -r Revison
* 新建标签

      svn copy file:///Users/yangkit/svnrepo/document/trunk file:///Users/yangkit/svnrepo/document/tags/release-1.0 -m 'Tagging the 1.0 release'
* 查看当前已有分支、标签

      svn list file:///Users/yangkit/svnrepo/document/[tags|branches]
* 合并分支
      
      svn merge -c 14  file:///Users/yangkit/svnrepo/document/branches/refactor
* 解决冲突
      
      Select: (p) postpone, (df) diff-full, (e) edit,
        (mc) mine-conflict, (tc) theirs-conflict,
        (s) show all options:
  * postpone  
      延时解决，让文件在更新完成之后保持冲突状态
  * diff-full

        begin
          require 'rmagick'
        rescue LoadError
          +    require 'oj'
          require 'RMagick'
          +<<<<<<< .working
          +    require 'json'
          +=======
            +    require 'pry'
          +    binding.pry
          +>>>>>>> .merge-right.r14
        rescue LoadError
          puts "WARNING: Failed to require rmagick, image processing may fail!"
        end
    关于`.merge-right`, `.merge-left`, `.working`更详细的解释[链接](http://stackoverflow.com/a/12673788)
  * edit  
    根据`EDITOR`变量选择编辑器手动解决冲突
  * mine-full 或者 theirs-full  
    使用当前工作目录或者从服务器新接受到的变更
  * resovled  
    冲突已经解决
* 撤销已有的提交

      svn merge -c -13
  和`git revert commit`类似，但是需要自己手动提交
* 代码审阅

      svn blame PATH
  和`git blame PATH`类似，可以显示特定文件每一行的URL内嵌的作者和修订版本信息
