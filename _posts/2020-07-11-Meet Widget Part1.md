---
layout: post
title: "WWDC2020-Meet Widget Part1"
description: "Create a Great Widget"
category: WWDC
tags: [iOS]
modified: 2020-07-11
imagefeature: bg/signinwithapple.png
comments: true
share: true
---

<section id="table-of-contents" class="toc">
<header>
<h1>Features</h1>
</header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

#### 0.前言

这个系列博客的主题是Meet Widget，`Widget`是苹果在WWDC2020中推出的新特性，也是`iOS14`主要新功能之一，它可以运行在各个苹果平台之中，尤其是在`iPhone`上，方便的使用方式加上在用户手机中醒目的呈现位置，都使得`Widget`这个新功能成为了兵家必争之地，有幸被用户添加到移动App之中，成为了今年各大移动应用适配的重中之重。

主题分为以下几个方面来阐述:

> 1.什么是Widget? (ppt)

> 2.结合WWDC Session来谈谈如何设计一款优秀的Widget (ppt)

> 3.如何实现Widget？WidgetKit的工作原理是什么？(ppt)

> 4.结合Demo聊聊如何使用SwiftUI来创建我们的Widget页面 (ppt+code)

> 5.如何使得我们的Widget 变得更加的`聪明` (ppt+code)

而第一部分Part1 主要是前两小部分的内容，什么是Widget以及如何设计一款优秀的Widget。

本文目前基于Xcode12 beta1，目前无论是从实现角度，还是debug环节，都存在各种各样的小问题。文章也会有提及，会随着时间推移而做出更新。如果你也遇到了同样的问题，先别慌，等待苹果爹爹的修复=。=


#### 1.什么是Widget
其实第一次从苹果开发者App当中看到的时候，以为这是一个曾经功能的pro版本，这个曾经的功能叫做Today Widget，2014年苹果在iOS8中推出的新特性，随着不断的了解，会发现今天的Widget所具备的气质和能力，是Today widget远远所不及的。

<figure>
<a href="{{ site.url }}/images/WidgetPart1/Simulator Screen Shot - iPhone Xs Max - 2020-07-04 at 16.50.48.png"><img src="{{ site.url }}/images/WidgetPart1/Simulator Screen Shot - iPhone Xs Max - 2020-07-04 at 16.50.48.png"></a>
</figure>


Today Widget的弊端其实有挺多的，虽然负一屏的位置很方便，但是其实就是这一划，感觉就像是一个无法逾越的鸿沟，阻碍着用户看到这个页面，所以Today Widget的成绩并不好。更新时机也只有在用户进到这个页面的时候，reload一下。内容无法编辑，用户添加到屏幕上之后，看久了，想看看别的分类，则无法改变。而对于移动端的App来说，迭代速度越来越快，新功能越来越多，每一个新功能都加入一个Widget 的代价看上去费力不讨好，所以其实这个负一屏的Today Widget现在有点尴尬。

而崭新的Widget则不同，它有着优质的展示位置，用户可以肆无忌惮的添加到他的任何一个主屏幕上；它有着优质的编辑特性，用户可以看北京的天气，当去了大连之后，则可以修改为看大连的天气；它有着更优秀的时间线，方便我们的App更新更精准的内容。而对于开发者最重要的，是他的实现成本，以SwiftUI来承载所有的工作，这其实也是苹果在引导开发者逐渐的学习并使用Swift战略的重要一步吧，我相信未来的新功能越来越的是必须用纯粹的Swift来实现，这也方便了我们国内大部分的祖传项目，在无法转变OC的基础上，更好的学习和使用Swift。

<figure>
<a href="{{ site.url }}/images/WidgetPart1/Simulator Screen Shot - iPhone SE (2nd generation) - 2020-07-04 at 17.00.29.png"><img src="{{ site.url }}/images/WidgetPart1/Simulator Screen Shot - iPhone SE (2nd generation) - 2020-07-04 at 17.00.29.png"></a>
</figure>

2.如何设计一款优秀的Widget

相关Session-Design Great Widgets

动手之前，需要了解如何设计一款优秀的Widget，在各个今年关于Widget的Session中，提及到的最多的一句话就是:

Widgets are not mini-apps
它是我们App主要功能的一个缩影，给用户提供在短时间内即可理解并掌握的关键信息。它需要和用户有着密切的联系，有着紧密的上下文，Session中举了很多系统App的例子来说明设计Widget的一些原则。

2.1Principles

系统日历Widget为例:

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.22.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.22.png"></a>
</figure>

最大的元素是日期，和用户最紧密的是未来时刻的一些事件，用户可以在一瞬间知晓未来将要去做的事情，而在某些特性的时间，例如生日的时候，给出一个生日的小icon来增强个性化，都是一个优秀Widget所需要具备的。

2.2Editing

长按我们的Widget，可以激活编辑态，用户可以自由选择想在这个Widget上所看到的内容，丰富了用户的选择，用户才会更喜欢我们的Widget，天气App为例，我可以选择当前位置北京的天气，同样的我也可以查看我老家大连的天气。

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.36.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.36.png"></a>
</figure>

关于可编辑性，系统提供了统一的UI，我们可以定义不同的页面参数来让系统帮我们把页面呈现出来，而参数的类型的不同，系统会给出不同的展示样式，例如数字的编辑

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.42.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.42.png"></a>
</figure>

这部分灵活度不高，我们只能定制这个面板的背景颜色，和控件的小背景颜色，下边我修改成了红色和小灰色

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.49.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.49.png"></a>
</figure>

而多亏了可编辑性，用户可以同时在一个屏幕内看到两个同样的Widget，来展示不同的信息，最大化满足用户的需求

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.58.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.06.58.png"></a>
</figure>

2.3Multiples

多样性，我们的App可以同时提供多种功能的Widget给用户来选择，极大了方便了我们的App把更多的核心功能呈现在用户的桌面上

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.10.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.10.png"></a>
</figure>

2.4大小和交互意见

Widget分为小，中，大，如图所示，分别占用了4、8、16个icon的大小

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.17.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.17.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.22.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.22.png"></a>
</figure>

Small仅仅支持整个区域的点击，而中和大则可以提供更加丰富的点击，来进入到我们的主App来展示更细化的内容

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.29.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.29.png"></a>
</figure>

2.5Content

我们不能大中小的Widget内容等比放大来处理，我们要充分利用面积来展示更多有用的信息

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.43.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.43.png"></a>
</figure>

2.6Patterns

三种尺寸的大小，苹果都给出了一定的模板，但是其实这只是一个参考，尽量贴合即可。

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.49.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.49.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.54.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.54.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.58.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.07.58.png"></a>
</figure>

2.7 其他Tips

剩下的一些都是设计Widget的一些红线，整理如下

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.04.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.04.png"></a>
</figure>

关于整个容器，padding.all 需要保持在16pt，而在代码层面，我们使用default padding即可展示正确

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.08.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.08.png"></a>
</figure>

关于圆形内容，我们的最小边距是11pt

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.13.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.13.png"></a>
</figure>

圆角处理使用的是同心圆圆角，这一部分我不是很专业哈，不是很理解，对于开发者来说我们也不需要专业，苹果爸爸给我们提供了非常牛皮的Api，使用这个Api之后，无论这个图片(或者Background) 在Widget哪里，都会展示成同心圆角，这个在后边的demo里边会有提及

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.19.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.19.png"></a>
</figure>

在我们的Widget还没有被添加的时候，或者在Widget Library中，或者在刚被添加的时候，我们需要提供一个默认的站位View，来给用户一个好的体验，大概了解到Widget的样子，苹果爸爸同样很贴心的提供了isPlaceHolder(true) Api来给开发者来使用，自动生成相应的站位View，非常的方便，很遗憾在Xcode beta1中，这个Api还无法被使用到。

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.26.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.26.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.30.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.30.png"></a>
</figure>

苹果推荐内容源很杂的App来放一个logo在Widget上，但是切记不能直接放原生App的icon，可以是一个简易的Logo，且只能放在右上角

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.35.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.35.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.42.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.08.42.png"></a>
</figure>

另外我们不能把App名称放在Widget上，也不能有任何暗示性的语言，仿佛在说快来点我啊快来点我啊这样的文案都是不被推荐的

最后提一嘴WidgetKit的限制，也是设计Widget需要考虑的点

<figure>
<a href="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.37.29.png"><img src="{{ site.url }}/images/WidgetPart1/截屏2020-07-04 下午5.37.29.png"></a>
</figure>

不能滚动，不能有视频或者动图，交互上只支持点击~

3 结语

预知后事...

Part 2 会走进WidgetKit，解析WidgetKit的工作原理，只有真正了解了工作原理，才能更好的设计我们的Widget。
