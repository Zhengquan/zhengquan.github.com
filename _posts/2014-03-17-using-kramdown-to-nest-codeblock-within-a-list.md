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

由于Liqui解析模板发生在

