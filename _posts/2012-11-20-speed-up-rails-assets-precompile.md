---
layout: post
title: "Assets Pipeline - Rails的部署和优化(静态文件篇)"
category: 'Rails'
tags: [Capistrano, Rails, Sprockets, Deployment]
---
{% include JB/setup %}

Thoughts:

* Capistrano => assets => improvments => turbo-sprockets-rails3
* CDN
* Compressor comparison
* Manifest.yml Base64
* Security => Assets Host

## 1. 概述
Rails 3.1之后，引入了Assets Pipeline的概念，Assets
Pipeline是一个可以组合、压缩JavaScript/CSS文件的框架，其具有以下特性:

1. 组装(Concatenate)静态文件   
  大多主流的浏览器都对并发连接数量做了限制，(一般对于单个域的并发连接数限制为6，如图1)，当连接数量超出限制的时候，便会有部分连接被阻塞，Assets Pipeline可以把页面使用到的静态文件，组装到单个JavaScript、CSS文件中，从而达到减少请求数量的目的。  
主流浏览器最大并发连接数比较:  
![主流浏览器最大并发连接数比较:](/assets/images/web_broswer_max_connection.png)
2. 压缩(Compression)  
  压缩可以减少网络传输流量，加速页面响应速度。    
3. 支持更高级别(High-Level)的语法  
  可以使用SCSS、Coffee、Erb等来撰写静态文件。

------------
## 2. Capistrano Assets的部署流程
如果Rails项目启用了Assets
Pipeline，则需要在Capify文件中加入下面的代码来启用静态文件预编译和压缩功能。
{% highlight ruby %}
load 'deploy/assets'
{% endhighlight %}
Capistrano编译静态文件的流程如下:  
![静态文件编译流程](/assets/images/capistrano.jpg)  
其中各个任务执行的操作如下:  

* deploy:update_code  
  更新当前的release文件夹代码
* deploy:assets_symlink  
  通常，在完成Rails项目的代码更新之后，需要重新启动Rails应用服务器（Unicorn、Passenger等)，Capistrano
通过`deploy:restart`来完成项目各个服务的重新启动，而这个任务发生在`deploy:create_symlink`之后，如果客
户端仍然请求旧的静态文件，就会发生静态文件丢失的情况(Error
404)，`deploy:assets_symlink`的作用是将**public/assets**链接至共享文件夹下的**assets**，让所有的release版本
都共享一个文件夹。
* deploy:finalize_update  
  设置release文件夹当前用户组可写、更新共享文件（tmp/pids,logs等）软链接
* bundle:install  
  安装生产环境下必须的gem环境
* deploy:assets_precompile  
  进入当前release文件夹，预编译、压缩静态文件，生成的静态文件存放在共享文件夹中
* deploy:create_symlink  
  把current链接至当前release文件夹
* deploy:restart  
  重启项目服务

## 3. 使用turbo-sprockets-rails3加速静态文件编译
## 4. 使用CDN加速静态文件获取速度
引用资源:

* [Ten slow things you don't know](https://speakerdeck.com/xdite/rubychina-2012-ten-slow-things-you-dont-know)
* [Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html)
* [Api Dock - image_tag](http://apidock.com/rails/ActionView/Helpers/AssetTagHelper/image_tag)
* [Asset Pipeline 的重大意義：Version Control Your Asset Package](http://blog.xdite.net/posts/2011/10/18/asset-pipeline-version-control-assets/)
* [Asset Pipeline](http://upgrade2rails31.com/asset-pipeline)

__EOF__
