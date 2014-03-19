---
layout: post
title: "使用kramdown和coderay在列表中嵌入代码块"
category: jekyll
tags: ['markdown', 'jekyll', 'kradown']
---
{% include JB/setup %}

Jekyll默认的Markdown解析引擎为[Maruku](https://github.com/bhollis/maruku), 同时使用[pygments](http://pygments.org/ "Pygments")代码高亮 但是在列表中嵌入代码块时，会出现下面的问题：  

对于下面的Markdown代码
<pre>
{% raw %}
1. item 1
2. item 2
  {% highlight ruby %}
  def foo
  end
  {% endhighlight %}
3. item 3
{% endraw %}
</pre>

生成的html代码为：  

~~~ html
<ol>
  <li>item 1</li>
  <li>item 2
    <div>
      <pre>
       <code class="ruby">
        def foo
        end
       </code>
      </pre>
    </div>
  </li>
</ol>
<p></div></p>
<ol>
  <li>item 3</li>
</ol>
~~~

可以看到，**item 1** 和 **item3** 并没有在一个有序列表中，这个问题主要是由于Jekyll在解析文本之前，会首先解析嵌入的Liquid代码，同时删除`highlight`标签之前所有的空格。 原有的`highlight`标签被替换成了html, 原有的Markdown列表，被Liquid生成的html打断。  

---

### kramdown And Coderay ###

由于Liquid解析模板发生在Markdown解析之前，所以如果使用Liquid来实现代码高亮，这个问题无法回避。[Kramdown](http://kramdown.gettalong.org/ "kramdown")对标准的Markdown语言做了很多改进，就`code block`方面来说，原生地支持指定`code block`的语言，语法如下：  

<pre>
{% raw %}
~~~ ruby
def what?
  "cat"
end
~~~
{% endraw %}
</pre>

如果需要代码高亮，可以使用coderay来进行，需要在Jekyll中增加下面的配置：

~~~ yaml
markdown: kramdown
kramdown:
  use_coderay: true
  coderay:
    coderay_line_numbers: table
~~~

EOF

---

### References

1. [kramdown syntax](http://kramdown.gettalong.org/syntax.html)
2. [syntax highlight within list entry breaks the list](https://github.com/jekyll/jekyll/issues/588)
3. [Coderay](http://coderay.rubychan.de/ "coderay")
