---
layout: post
title: '在Rails 3中使用carrierwave和ffmpeg处理音频上传、转换、下载'
category: rails
tags: [carrierwave, ffmpeg, audio convertion, curl, html5]
---
{% include JB/setup %}

Thoughts:

* uploader -> carrierwave => file | mongo
* ffmpeg arguments
* download => authentication => nginx sendfile
* rails & curl
* carrierWave backgrounder
* sendfile

在Rails、Sinatra等Rack应用中，可以使用[ Carrierwave ](https://github.com/jnicklas/carrierwave)
来实现图像的上传、处理等功能，还可以使用Carrierwave生成多种格式的上传文件，这里我们也可以采用
Carrierwave来实现Rails应用的音频上传。  
在使用Html5的`audio`元素显示音频时，由于各主流浏览器对于音频的支持各不相同：
<table class='table table-bordered table-striped'>
  <thead>
    <tr>
      <th>Browser</th>
      <th>Ogg</th>
      <th>MP3</th>
      <th>WAV</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>FireFox 3.6+</td>
      <td>✓</td>
      <td></td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Safari 5+</td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Chrome 6+</td>
      <td>✓</td>
      <td>✓</td>
      <td></td>
    </tr>
    <tr>
      <td>Opera 10.5+</td>
      <td>✓</td>
      <td></td>
      <td>✓</td>
    </tr>
    <tr>
      <td>Internet Explorer 9 </td>
      <td></td>
      <td>✓</td>
      <td>✓</td>
    </tr>
  </tbody>
</table>

因此需要把用户上传的音频文件，通过`ffmpeg`转换为`ogg`,`mp3`两种格式的音频文件供不同的
浏览器使用。
{% highlight html %}
<audio controls="controls">
  <source src="/audios/song.ogg" type="audio/ogg">
  <source src="/audios/song.mp3" type="audio/mpeg">
</audio>
{% endhighlight %}  
这样使用source元素链接不同的音频文件，浏览器将使用第一个可识别的格式，这样无需Flash便可以在
主流浏览器上实现音频的播放功能。

---
## 1. ffmpeg的编译安装
{% highlight bash %}
# install  package's dependencies 
sudo apt-get install  libx264-dev x264 libfaac-dev libfaac0 yasm libmp3lame-dev libopencore-amrwb-dev libtheora-dev libogg-dev libvorbis-dev libvpx-dev libxvidcore-dev libopencore-amrnb-dev unzip

# ffmpeg source
wget http://ffmpeg.org/releases/ffmpeg-1.0.tar.gz
 ./configure --prefix=/opt/ffmpeg \
             --enable-gpl \
             --enable-version3 \
             --enable-nonfree \
             --enable-postproc \
             --enable-libfaac \
             # 启用mp3编码
             --enable-libmp3lame \
             --enable-libopencore-amrnb \
             --enable-libopencore-amrwb \
             --enable-libtheora \
             # 启用ogg编码，也可以使用libogg
             --enable-libvorbis \
             --enable-libxvid \
             --enable-x11grab

# compile and install
make && make install
{% endhighlight %}

---
## 2.streamio-ffmpeg 和 carrierwave-video
[streamio-ffmpeg](https://github.com/streamio/streamio-ffmpeg)实现了对于ffmpeg的封装，
[
carrierwave-video](https://github.com/rheaton/carrierwave-video)通过streamio-ffmpeg这个
gem实现了Carrierwave的音频、视频处理模块。  
首先需要在Gemfile中增加：
{% highlight ruby %}
gem 'streamio-ffmpeg'
gem 'carrierwave-video'
{% endhighlight %}
配置`ffmpeg`可执行文件路径等:
{% highlight ruby %}
# config/initialize/ffmpeg.rb
FFMPEG.ffmpeg_binary = '/usr/local/bin/ffmpeg'
FFMPEG::Transcoder.timeout  = 60 * 10
unless Rails.env.development?
  FFMPEG.logger = Logger.new(File.join(Rails.root, 'log/ffmpeg_transcoder.log'))
end
{% endhighlight %}

`VoiceUploader`的实现如下:
{% highlight ruby %}
# encoding: utf-8

class VoiceUploader < CarrierWave::Uploader::Base

  include CarrierWave::Video
  include CarrierWave::MimeTypes
  
  process :set_content_type
  storage :file

  def self.need?
    Proc.new{|version, current_version|  current_version[:file].extension != version.to_s }
  end

  def filename 
    "#{secure_token}.#{model.audio.file.extension}" if original_filename 
  end 

  def move_to_cache
    true
  end

  def move_to_store
    true
  end

  def store_dir
    File.join( '/data', "#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}")
  end

  version :mp3, :if => need? do
    process :encode_video => [:mp3]
    def full_filename (for_file = model.audio.file.filename)
      for_file[0...for_file.rindex('.')] + '.mp3'
    end
  end

  version :ogg, :if => need? do
    process :encode_video => [:ogg]
    def full_filename (for_file = model.audio.file.filename)
      for_file[0...for_file.rindex('.')] + '.ogg'
    end
  end

  def extension_white_list
    %w(amr mp3 ogg)
  end
  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end
end
{% endhighlight %}

定义`Voice`模型，并挂载`:audio`至`VoiceUploader`
{% highlight ruby %}
class Voice < ActiveRecord::Base
  attr_accessible :audio

  mount_uploader :audio,  VoiceUploader

  def access_url version=nil
    name = self.audio.file.filename
    [name[0...name.rindex('.')], version || self.audio.file.extension ].join('.')
  end
end
{% endhighlight %}

注意到由于权限控制的因素，音频并没有存储在public路径下，所以也就无法直接通过
一个固定链接公开获取到该音频文件，需要应用自身来实现文件的下载功能：
{% highlight ruby %}
class VoicesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :load_voice, :only => [ :download ]
  skip_before_filter :verify_authenticity_token, :if => Proc.new { |c| c.request.format == 'application/json' }
  def create
    @voice = current_user.voices.build(audio: params[:audio])
    if @voice.save
      render json:true
    end
  end

  def download
    if current_user.id == @voice.user_id
      send_file "/data/voice/audio/#{params[:id]}/#{@voice.access_url(params[:extension]) }"
    else
      render :text => "Not authorized", :status => 403
    end
  end

  def load_voice
    @voice = Voice.find_by_id params[:id]
  end
end
{% endhighlight %}

---
## 3. 使用Resque后台异步处理音频转码
---
## 4. Nginx 和 X-Accel-Mapping
在`VoicesController`中，所有的音频下载请求都由后端处理，这样无疑会增加服务器的压力，解决的办法就是使用`X-Sendfile`把文件下载请求由后端应用转交给前端 web 服务器处理。  
X-Sendfile 通过一个特定的 HTTP header 来实现：在 X-Sendfile 头中指定一个文件的地址来通告前端 web 服务器。当 web 服务器检测到后端发送的这个 header 后，它将忽略后端的其他输出，而使用自身的组件（包括 缓存头 和 断点重连 等优化）机制将文件发送给用户。  
不同的 web 服务器实现了不同的 HTTP 头：  
   
<table class='table table-bordered table-striped'>
  <tbody>
  <tr>
    <th>sendfile 头</th>
    <th>使用的 web 服务器</th>
  </tr>
  <tr>
    <td>X-Sendfile</td>
    <td>Apache, Lighttpd v1.5, Cherokee</td>
  </tr>
  <tr>
    <td>X-LIGHTTPD-send-file</td>
    <td>Lighttpd v1.4</td>
  </tr>
  <tr>
    <td>X-Accel-Redirect</td>
    <td>Nginx, Cherokee</td>
  </tr>
  </tbody>
</table>
以nginx结合Rails应用为例:  
`Rack::Sendfile`中间件拦截控制器的`send_file`响应，设置`X-Accel-Redirect`头，
清空响应正文，并设置报头`Content-Length`为0, 这里需要注意的是`Rack::Sendfile`
替换文件路径的方法：

{% highlight ruby %}
def map_accel_path(env, file)
  if mapping = env['HTTP_X_ACCEL_MAPPING']
     internal, external = mapping.split('=', 2).map{ |p| p.strip }
     file.sub(/^#{internal}/i, external)
  end
end
{% endhighlight %}
`HTTP_X_ACCEL_MAPPING`的格式为:
{% highlight nginx %}
internal(文件系统路径)=external(受保护的私有路径)
{% endhighlight %}
nginx配置如下：
{% highlight nginx %}
location  /archives/ {
      internal;
      alias /data/;
 }
 
location / {
  proxy_redirect off;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Host $http_host;
  proxy_set_header X-Real-IP $remote_addr;

  proxy_set_header X-Sendfile-Type X-Accel-Redirect;
  proxy_set_header X-Accel-Mapping /data/=/archives/;

  proxy_pass http://unicorn_server;
}
{% endhighlight %}
production.rb配置如下：
{% highlight ruby %}
config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx
{% endhighlight %}
请求音频文件：
{% highlight bash %}
curl --header 'Cookie:remember_user_token=xxxx;_blog_session=xxxx' http://0.0.0.0:8080/downloads/voices/10/b49bf541-784a-4e38-ab76-aa9c5eda5a8f.mp3
{% endhighlight %}
未处理之前的响应报文：
{% highlight ruby %}
# env
"HTTP_X_FORWARDED_FOR"=>"127.0.0.1",
"HTTP_HOST"=>"0.0.0.0:8080",
"HTTP_X_REAL_IP"=>"127.0.0.1",
"HTTP_X_SENDFILE_TYPE"=>"X-Accel-Redirect",
"HTTP_X_ACCEL_MAPPING"=>"/data/=/archives/",

# header
{
 "Content-Disposition"=>
 "attachment; filename=\"b49bf541-784a-4e38-ab76-aa9c5eda5a8f.mp3\"",
 "Content-Transfer-Encoding"=>"binary",
 "Content-Type"=>"application/octet-stream",
 "Cache-Control"=>"private",
 "X-UA-Compatible"=>"IE=Edge",
 "Set-Cookie"=> "..."
}
# body
<ActionDispatch::BodyProxy:0x007fdb02443038 ... >
{% endhighlight %}

`Rack::Sendfile`处理后：
{% highlight bash %}
# header
{
 "Content-Disposition"=>
 "attachment; filename=\"b49bf541-784a-4e38-ab76-aa9c5eda5a8f.mp3\"",
 "Content-Transfer-Encoding"=>"binary",
 "Content-Type"=>"application/octet-stream",
 "Cache-Control"=>"private",
 "X-UA-Compatible"=>"IE=Edge",
 "Set-Cookie"=> "_blog_session=...",
 "Content-Length"=>"0",
 "X-Accel-Redirect"=> "/archives/voice/audio/10/b49bf541-784a-4e38-ab76-aa9c5eda5a8f.mp3"
}
# body
[]
{% endhighlight %}

引用资源:

* [上文使用的完整的nginx配置](https://gist.github.com/241d9fc0a38d787c0ea5)
* [Video encoding processor for CarrierWave](http://trackingrails.com/posts/video-encoding-processor-for-carrierwave)
* [streamio-ffmpeg](https://github.com/streamio/streamio-ffmpeg)
* [curl manpage](http://curl.haxx.se/docs/manpage.html)
* [FFMPEG编译参数解析](http://blog.csdn.net/zyc851224/article/details/8073136)
* [使用 Nginx 的 X-Sendfile 机制提升 PHP 文件下载性能](http://www.lovelucy.info/x-sendfile-in-nginx.html)
* [RoR网站如何利用lighttpd的X-sendfile功能提升文件下载性能](http://robbin.iteye.com/blog/154538)
* [How Rails, Nginx and X-Accel-Redirect Work Together](http://thedataasylum.com/articles/how-rails-nginx-x-accel-redirect-work-together.html)

__EOF__
