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
来实现图像的上传、处理等功能，Carrierwave可以生成多种格式的上传文件，这里我们也可以采用
Carrierwave来实现Rails应用的音频上传。  
但是不同的浏览器的`audio`元素，并不支持所有的音频格式：  
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
使用source元素链接不同的音频文件，浏览器将使用第一个可识别的格式，这样无需Flash便可以在
主流浏览器上实现音频的播放功能。

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
class VoiceUploader < CarrierWave::Uploader::Base

  include CarrierWave::Video
  
  storage :file

  def self.need?
    Proc.new{|version, current_version|  current_version[:file].extension != version.to_s }
  end

  def filename 
    "#{secure_token}.#{model.audio.file.extension}" if original_filename 
  end 

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
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
end
{% endhighlight %}



引用资源:

* [Video encoding processor for CarrierWave](http://trackingrails.com/posts/video-encoding-processor-for-carrierwave)
* [streamio-ffmpeg](https://github.com/streamio/streamio-ffmpeg)
* [curl manpage](http://curl.haxx.se/docs/manpage.html)
* [FFMPEG编译参数解析](http://blog.csdn.net/zyc851224/article/details/8073136)

__EOF__
