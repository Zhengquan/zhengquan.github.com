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
* X-Accel-Redirect => on|off

## 1. 概述
Rails 3.1之后，引入了Assets Pipeline的概念，Assets
Pipeline是一个可以组合、压缩JavaScript/CSS文件的框架，其具有以下特性:

1. 组装(Concatenation)  
  大多主流的浏览器都对并发连接数量做了限制，(一般对于单个域的并发连接数限制为6，如图1)，当连接数量超出限制的时候，便会有部分连接被阻塞，Assets Pipeline可以把页面使用到的静态文件，组装到单个JavaScript、CSS文件中，从而达到减少请求数量的目的。  
主流浏览器最大并发连接数比较:  
![主流浏览器最大并发连接数比较:](/assets/images/web_broswer_max_connection.png)
2. 缩减(Minification)、压缩(Compression)  
  可以减少网络传输流量，加速页面响应速度。    
3. 预编译(Precompilation)  
  支持更高级别(High-Level)的语法，可以使用CoffeeScript, Sass, SCSS, LESS等来撰写静态文件。

------------
## 2. Sprockets和Tilt
* Sprockets  
  完成对静态文件的打包、编译、压缩并存放在目标目录**public/assets**下
* Tilt  
  Sprockets使用Tilt作为静态文件的模板引擎，可以通过下面的方式查看当前的Sprockets环境中
  已经注册的模板引擎  
{% highlight ruby %}
MyApp::Application.assets.engines
=> 
{".coffee"=>Tilt::CoffeeScriptTemplate,
 ".jst"=>Sprockets::JstProcessor,
 ".eco"=>Sprockets::EcoTemplate,
 ".ejs"=>Sprockets::EjsTemplate,
 ".less"=>Less::Rails::LessTemplate,
 ".sass"=>Sass::Rails::SassTemplate,
 ".scss"=>Sass::Rails::ScssTemplate,
 ".erb"=>Tilt::ERBTemplate,
 ".str"=>Tilt::StringTemplate,
 ".hbs"=>HandlebarsAssets::TiltHandlebars
}  
{% endhighlight %}  
Assets Pipeline编译、压缩静态文件的流程如下：  
![Assets Pipeline Flow](/assets/images/asset_pipeline_flow.png)  

* Sprockets和Rack  
`Sprockets::Server`模块是一个Rack协议的实现，接受一个传入的代表当前env的Hash，`Sprockets::Server`通过综合Last-Modified、Etag等请求信息，返回一个带有状态行、消息报头、响应正文的数组，其中响应报头的格式如下：
{% highlight ruby %}
def headers(env, asset, length)
  Hash.new.tap do |headers|
    # Set content type and length headers
    headers["Content-Type"]   = asset.content_type
    headers["Content-Length"] = length.to_s

    # Set caching headers
    headers["Cache-Control"]  = "public"
    headers["Last-Modified"]  = asset.mtime.httpdate
    headers["ETag"]           = etag(asset)

    # If the request url contains a fingerprint, set a long
    # expires on the response
    if attributes_for(env["PATH_INFO"]).path_fingerprint
      headers["Cache-Control"] << ", max-age=31536000"

    # Otherwise set `must-revalidate` since the asset could be modified.
    else
      headers["Cache-Control"] << ", must-revalidate"
    end
  end
end
{% endhighlight %}

------------
## 3. Capistrano Assets的部署流程
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
* deploy:assets:symlink  
  通常，在完成Rails项目的代码更新之后，需要重新启动Rails应用服务器（Unicorn、Passenger等)，Capistrano
通过`deploy:restart`来完成项目各个服务的重新启动，而这个任务发生在`deploy:create_symlink`之后，如果客
户端仍然请求旧的静态文件，就会发生静态文件丢失的情况(Error
404)，`deploy:assets:symlink`的作用是将**public/assets**链接至共享文件夹下的**assets**，让所有的release版本
都共享一个文件夹。
* deploy:finalize_update  
  设置release文件夹当前用户组可写、更新共享文件（tmp/pids,logs等）软链接
* bundle:install  
  安装生产环境下必须的gem环境
* deploy:assets:precompile  
  进入当前release文件夹，预编译、压缩静态文件，生成的静态文件存放在共享文件夹中
* deploy:create_symlink  
  把当前release文件夹链接至current
* deploy:restart  
  重启项目服务

这种方式的优点在于实现了生产环境下几乎零宕机的部署方式，但是这种方案每次部署都会重新预编译所有的静态文件，
当项目的JavaScript、CSS逐渐增加时，执行预编译任务会变得越来越慢，有时甚至需要5-10分钟，[czarneckid](https://github.com/czarneckid)
提出了一种方案来加速编译过程：
{% gist 3072362 %}
在每次编译静态文件之前，执行`git log current_revision.. assets_paths |
wc
-l`来判断这次部署有没有静态文件的改变，当分支没有静态文件修改时，无需重新编译静态文件便可完成部署，这种方式的缺陷在于：
即使是对静态文件只做了很小的变动，下次部署时Capistrnao也会把所有的静态文件重新编译一遍。

##4. 使用turbo-sprockets-rails3加速静态文件编译
[turbo-sprockets-rails3](https://github.com/ndbroadbent/turbo-sprockets-rails3) 通过生成代码的Hash值，来判断本次**rake assets:precompile**是否需要编译该静态文件，每次部署只编译那些有变动的文件，来加速部署流程，ndbroadbent 同时也提供了turbo-sprockets-rails3
和Capistrano的集成方案。

* 用法：
  {% highlight ruby %}
  #Gemfile
  group :assets do
    ...
    gem 'turbo-sprockets-rails3'
  end
  {% endhighlight %}
  
  配置deploy.rb
  {% highlight ruby %}
  set :rake,      "rake"      #不要设置为symbol类型
  set :rails_env, "production"
  set :asset_env, "RAILS_GROUPS=assets"
  {% endhighlight %}

* 处理过期的静态文件
* 回滚(rollback)
* 部署流程

## 5. 使用CDN加速静态文件获取速度
引用资源:

* [Ten slow things you don't know](https://speakerdeck.com/xdite/rubychina-2012-ten-slow-things-you-dont-know)
* [Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html)
* [Api Dock - image_tag](http://apidock.com/rails/ActionView/Helpers/AssetTagHelper/image_tag)
* [Asset Pipeline](http://upgrade2rails31.com/asset-pipeline)
* [3 招實用 Asset Pipeline 加速術](http://blog.xdite.net/posts/2012/07/09/3-way-to-speedup-asset-pipeline/)
* [Asset Pipeline for Dummies](http://coderberry.me/blog/2012/04/24/asset-pipeline-for-dummies/)

__EOF__
