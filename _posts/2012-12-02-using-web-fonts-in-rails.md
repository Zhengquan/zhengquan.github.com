---
layout: post
title: "Rails 3 Assets Pipeline 环境下使用Web字体"
category: rails
tags: ['css3', 'assets pipeline', 'woff', 'font-awesome', 'font']
---
{% include JB/setup %}

## 1. @font-face和Font-Awesome
根据 CSS3 草案中的描述，`@font-face` 规则允许使用链接到需要时自动激活的字体。这使得用户可以使用在线的字体，
而不仅仅拘泥于使用用户端系统内的字体。字体资源的位置可以是本地也可以是其他地方，以及自定义个性化字体风格。  

[Font-Awesome](http://fortawesome.github.com/Font-Awesome/#overview)是专门为[Twitter Bootstrap](http://twitter.github.com/bootstrap/index.html)设计的图标化字体，下面以Font-Awesome为例，引用web字体的方式如下：
{% highlight css %}
@font-face {
  font-family: 'FontAwesome';
  src: url('../font/fontawesome-webfont.eot');
  src: url('../font/fontawesome-webfont.eot?#iefix') format('embedded-opentype'),
     url('../font/fontawesome-webfont.woff') format('woff'),
     url('../font/fontawesome-webfont.ttf') format('truetype'),
     url('../font/fontawesome-webfont.svg#FontAwesome') format('svg');
  font-weight: normal;
  font-style: normal;
}
{% endhighlight %}

定义多个字体URI的目的在于兼容更多的浏览器，他们将按顺序查找，直到找到支持的格式。
外部引用包含一个 URI，后面有一个可选的 `format` 参数可以提示该资源URI 所引用的字体格式。  
常见的格式字体列表如下：
<table class='table table-bordered table-striped'>
   <thead>
    <tr>
     <th>String

     </th><th>Font Format

     </th><th>Common extensions

   </th></tr></thead><tbody>
    <tr>
     <th>woff

     </th><td><a href="http://www.w3.org/TR/WOFF/">WOFF (Web Open Font Format)</a>
      

     </td><td>.woff

    </td></tr><tr>
     <th>truetype

     </th><td><a href="http://www.microsoft.com/typography/otspec/default.htm">TrueType</a>
      

     </td><td>.ttf

    </td></tr><tr>
     <th>opentype

     </th><td><a href="http://www.microsoft.com/typography/otspec/default.htm">OpenType</a>
      

     </td><td>.ttf, .otf

    </td></tr><tr>
     <th>embedded-opentype

     </th><td><a href="http://www.w3.org/Submission/2008/SUBM-EOT-20080305/">Embedded
      OpenType</a>

     </td><td>.eot

    </td></tr><tr>
     <th>svg

     </th><td><a href="http://www.w3.org/TR/SVG/fonts.html">SVG Font</a>

     </td><td>.svg, .svgz
  </td></tr>
  </tbody>
</table>
---
## 2. 设置MIME类型和gzip_static
在CSS文件中定义使用的web字体之后，还需要对Web服务器做对应的配置，定义MIME类型，通过
设置http响应头中`Content-Type`,来告诉Web浏览器的资源类型，否则浏览器会出现类似下面
的警告：
{% highlight bash %}
Resource interpreted as Font but transferred with MIME type application/octet-stream: "http://assets.example.com/assets/fontawesome-webfont.woff".
{% endhighlight %}  
以nginx配置为例：

{% highlight nginx %}
# /path/conf/mime.types
#application/octet-stream           eot;
 application/x-font-ttf             ttf;
 font/opentype                      ott;
 application/x-font-woff            woff;

# /path/conf/nginx.conf
gzip_types text/plain text/xml text/css
           text/comma-separated-values
           text/javascript application/x-javascript
           application/atom+xml application/x-font-ttf 
           application/octet-stream font/opentype;

# /path/conf.d/assets_host.conf
location ~* ^/(assets)/ {
   gzip_static on;
   expires 604800;
}
{% endhighlight %}  
由于WOFF格式的字体本身已经经过压缩，所以nginx无需对.woff文件做压缩处理。  
执行：
{% highlight bash %}
curl -I -H "Accept-Encoding: gzip,deflate" http://assets.example.com/assets/fontawesome-webfont.(woff|ttf)
{% endhighlight %}

响应头：
{% highlight bash %}
# woff format without Content-Encoding header
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 02 Dec 2012 15:02:21 GMT
Content-Type: application/x-font-woff
Content-Length: 41752
Last-Modified: Fri, 20 Jul 2012 15:06:20 GMT
Connection: keep-alive
Expires: Sun, 09 Dec 2012 15:02:21 GMT
Cache-Control: max-age=604800
Accept-Ranges: bytes

# ttf format with Content-Encoding header
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 02 Dec 2012 15:02:52 GMT
Content-Type: application/x-font-ttf
Last-Modified: Fri, 20 Jul 2012 15:06:20 GMT
Connection: keep-alive
Expires: Sun, 09 Dec 2012 15:02:52 GMT
Cache-Control: max-age=604800
Content-Encoding: gzip
{% endhighlight %}

---
## 3. Assets Pipeline和跨域请求
如果Rails项目启用了Assets
Pipeline，而且定义了`asset_host`,则在使用的时候，需要注意跨域问题，在IE和Firefox中，
会发生下面报错，导致字体文件无法加载：

{% highlight bash %}
[22:42:25.468] downloadable font: download failed (font-family: "FontAwesome" style:normal weight:normal stretch:normal src index:1): bad URI or cross-site access not allowed
{% endhighlight %}

Firefox显示地拒绝了字体的下载请求（可能是出于字体授权方面的考虑，所以需要在Web服务器中针对字体文件
做允许跨域的声明：
{% highlight nginx %}
location ~* ^/(assets)/ {
   gzip_static on;
   expires 604800;
   location ~* \.(eot|ttf|woff|svg|svgz|otf)$ {
      # 或者设置为主域名http://example.com
      add_header Access-Control-Allow-Origin *;
   }
}
{% endhighlight %}
响应头：
{% highlight bash %}
# woff
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 02 Dec 2012 15:04:47 GMT
Content-Type: application/x-font-woff
Content-Length: 41752
Last-Modified: Fri, 20 Jul 2012 15:06:20 GMT
Connection: keep-alive
Expires: Sun, 09 Dec 2012 15:04:47 GMT
Cache-Control: max-age=604800
Access-Control-Allow-Origin: *
Accept-Ranges: bytes
{% endhighlight %}


引用资源:

* [W3C](http://www.w3.org/TR/css3-fonts/#the-font-face-rule)
* [W3C Helpe](http://w3help.org/zh-cn/causes/RF1001)
* [Gzipping @font-face With Nginx](http://blog.bigdinosaur.org/gzipping-at-font-face-with-nginx/)
* [字体数字化简史与 WOFF](http://www.typeisbeautiful.com/2009/11/1617)
* [Tips for Rails Asset Pipeline ](http://www.aloop.org/2012/06/03/tips-for-rails-asset-pipeline/)

__EOF__

