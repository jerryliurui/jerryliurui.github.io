---
layout: post
title: "Apple Watch 开发调研一：总览"
description: "Developing for Apple Watch"
category: iOS Programming
tags: [AppleWatch]
modified: 2014-12-08
imagefeature: blog_bg_applewatch.png
comments: true
share: true
---

**苹果在最近发布了WatchKit，也相应的放出了Xcode 6.2 来让我们练练手啥的，虽然手表应该要等到明年。。。不过这个毕竟是个新鲜的东西，公司也需要调研一下这块儿可以做什么，怎么做，因此通读一边苹果的开发文档显得很有必要了。借着这个机会，总结一下，就按照官方给的顺序和步骤来吧，大致分两到三篇。这篇主要是领会一下官方文档中的总览这一章节的精神。**[官方文档AppleWatch总览](https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/WatchKitProgrammingGuide/index.html#//apple_ref/doc/uid/TP40014969-CH8-SW1)

<section id="table-of-contents" class="toc">
  <header>
    <h1>Features</h1>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

## 一: Apple Watch 开发总览 ##
`Apple Watch requires the presence of an iPhone to run third-party apps.` 也就是说**Apple Watch**需要和一台**iPhone**搭配来使用。

创建一个**Apple Watch**需要去构建两部分可执行块儿，第一个是运行在iPhone上的扩展程序(extension),第二个是运行在Watch上的Watch App了。这个和之前去实现today widget有那么一些相似，不同的是Watch程序要去做的事情更少了一些，往往我们使用的最多的**MVC**开发iOS程序这个设计模式，在开发Apple Watch的时候，把View抛给了Watch去呈现了。剩下的活儿都留给了iPhone上后台运行的扩展程序中。

>The Watch app contains only the storyboards and resource files associated with your app’s user interface. The WatchKit extension contains the code for managing the Watch app’s user interface and responding to user interactions.

官方文档中介绍了手表可以呈现的三种呈现信息的方式，由于手表尺寸的限制，交互的不同，着三种模式都和之前iOS 设备的有些许的不同。

### 1.Watch App
首先这个是必须的(`A Watch app is required for all interactions on Apple Watch`)，额。。。没有这个不是作死么。。。另外两个是可选的，当然了看完之后觉得如果想要实现比较友好的功能的话还是需要勾选上的。顾名思义，这个就是承载了所有需要展示在Watch上的UI元素，不会存在自己编写的代码，只会存储一些故事版上的素材啊什么的，因此大脑还是运行在iOS设备后台的那个扩展Extension。

### 2.Glance
这个有点类似于之前的通知、推送，会呈现一些最新的资讯啊，好友请求啊等等重要的即时消息，有意思的是这个是只读的(read-only)，所以是不能够包含按钮等可交互的元素的。这个我觉得新闻类的应用比如网易新闻、今日头条等等还是很需要这个东西的。这个不是必须的，可以自行选择添加编写。点击这个界面，就可以进入到相应的Watch App 中，深度的阅读或者操作。这个还可以自定义点击这个界面进入程序的时候的“启动画面”，这个到后边再介绍。

### 3.Customizing the Display of Notifications
当用户需要阅读更多内容的时候，丰富页面的填充就需要这类的通知了，Watch同样也支持iOS8 之后引进的那种可以交互的通知，例子：来了一个日历的行程，这个通知带着按钮，可以让用户去选择拒绝还是接受。同样的，Watch上支持这样的通知，主程序注册了这种通知，那么Apple Watch就会自动的填充我们配置好的动作按钮了。

<figure>
<img src="{{ site.url }}/images/applewatch/three.png" alt="Three Styles">
<figcaption>Three Styles</figcaption>
</figure>

## 二.开发开始：配置Xode项目 ##
第一步去Developer中心去下载一个Xcode6.2.....每次遇到这种情况就很不爽，犹记得那个时候做today widget 的时候就是需要下deta版本的。
然后是在主程序中新建一个target，选择AppleWatch，选择Apple App，Next，这里可以选择是否需要上边说道的Glance以及Notifications，都勾选上吧，当然了之后还是可以后补上的。

<figure>
<img src="{{ site.url }}/images/applewatch/creatapplewatch.png" alt="Creat Apple Watch App">
</figure>
<figure>
<img src="{{ site.url }}/images/applewatch/creatapplewatch2.jpg" alt="Creat Apple Watch App">
<figcaption>Creat Apple Watch App</figcaption>
</figure>

完成之后Xcode会自动的把这些的bundle ID 给配置好，需要记住的就是在主程序的bundle ID换掉之后，不要忘记把这几个也给改掉，这个地方就和today widget 很像了也可以说和Extension那些很类似了。
> If you change your iOS app’s bundle ID, you must update the other bundle IDs accordingly

下面这个图简单的介绍了一下主程序、中介扩展、watchApp三者之间的一个关系：

<figure>
<img src="{{ site.url }}/images/applewatch/structureforwatch.png" alt="Structure for Apple Watch">
<figcaption>Structure for Apple Watch</figcaption>
</figure>

对于Watch APP来说，build、run、debug都是自动配置好的，但是对于glance以及notification需要自己手动的配置，编辑它们的Scheme就可以了。

<figure>
<img src="{{ site.url }}/images/applewatch/editscheme.jpg" alt="Editing Scheme">
<figcaption>Editing Scheme</figcaption>
</figure>

苹果这次提供了一个JSON文件，就在supporting files里边叫做`RemoteNotificationPayload.json`,可以看到这是一个字典，可以在里边配置很多的东西，比如按钮的名字和身份标识。

{% highlight css %}
{
"aps": {
"alert": "Test message content",
"title": "Optional title",
"category": "myCategory"
},

"WatchKit Simulator Actions": [
{
"title": "First Button",
"identifier": "firstButtonAction"
}
],

"customKey": "Use this file to define a testing payload for your notifications. The aps dictionary specifies the category, alert text and title. The WatchKit Simulator Actions array can provide info for one or more action buttons in addition to the standard Dismiss button. Any other top level keys are custom payload. If you have multiple such JSON files in your project, you'll be able to choose between them in when selecting to debug the notification interface of your Watch App."
}
{% endhighlight %}

## 三.Watch App 整体架构、生命周期、主要方法 ##
当用户操作手表的时候，手表就会去“寻找”合适的故事板去呈现合适的画面，取决于用户是在查看一个通知、还是当glance发生、又或者是就在APP之内。找到某一个场景之后，watch OS就会告诉“配对的”iPhone去加载相应的UI界面，所有的一切都在无缝的进行着。

下边这个图片讲述的是他俩之间是如何通信的`Communication between a Watch app and WatchKit extension`.

<figure>
<img src="{{ site.url }}/images/applewatch/Communication betweenaWatchappandWatchKitextension.png" alt="Communication between a Watch app and WatchKit extension">
<figcaption>Communication between a Watch app and WatchKit extension</figcaption>
</figure>

这里一个非常重要的控制器叫做`WKInterfaceController` 它负责手表呈现内容和负责交互，如果用户直接在手表上进入了相应的程序，就会触发主要的故事板文件，用户交互的时候，各个控制器相互切换就行，去呈现相应的内容。WatchKit支持两种呈现方式，` page-based style`,`hierarchical style`.在下一篇介绍三种Watch交互方式的时候会详细的介绍。

> 这里要注意的一点就是glance 以及 notification 都有且仅有一个控制器去呈现对应的内容。

### 生命周期
用户启动Watch上的App，iPhone就会自动的运行WatchKit，官网的原话是经过一系列的握手之后建立连接，保证信息在之间的正常流动，直到用户停止操作，退出，iOS就会挂起这个扩展操作。

<figure>
<img src="{{ site.url }}/images/applewatch/Lifecycleof aninterfacecontroller.png" alt="Life cycle of an interface controller">
<figcaption>Life cycle of an interface controller</figcaption>
</figure>

只要用户打开app或者有交互，watchkit就会保持运行，否则就会被iOS认为是无效的，停止运行手表上的一系列内部操作非常简洁，因此整个过程轻松无痛，我们要做的就是自己写的控制器避免太复杂、长时间的任务，只需要提供用户想要知道和了解的就可以了。

下面这个表格列出了主要的一些方法。

| Method | Tasks to perform|
| :--------: | :--------: |
| initWithContext:  | This method is your first chance to prepare your interface for display. Use it to load data and update labels, images, tables, and other interface objects in your storyboard scene. |
| willActivate:  | This method lets you know that your interface is visible to the user. Use this method to update interface objects and perform any tasks that should only happen while the interface is active. For example, you might use this method to set up timers, start animations, or begin streaming video content. |
| didDeactivate:  | Use the didDeactivate method to perform any clean up tasks. For example, use this method to invalidate timers and stop animations, or stop streaming video content.You cannot set values for any interface objects from this method. **From the time this method is called to the time the willActivate method is called again, any attempts to set values for interface objects are ignored.** |

除了这些方法之外还要实现一些和界面相关联的方法，比如交互上的,主要使用的是`Action-Target`的模式去响应。

> 文档再次强调了：Glance 不支持动作操作，点击就会直接进入到Watch App 的。

### 共享数据
这点和Today Widget又是一样的,需要打开两个Target 的 App Group 去实现。一直没有时间总结之前做的widget，等整理好了如何实现这个数据共享的我会在那里写，呵呵呵呵呵，我的那个大bug就是因为这个！！！！


## 四.建议和善意提醒 ##
最后一部分就是说了一些“心里话”。。。大致意思呢就是说，WatchKit可以使用大部分的iOS App 的技术，但是呢，也是要有约束的，比如：

> 1.Avoid using technologies that request user permission, like Core Location. 需要用户授权的就别了，还是算了。

> 2.Do not use background execution modes for a technology. 明着来，别暗着。

> 3.Avoid performing long-running tasks with a technology. 我的理解是本来用watch的就是图个方便，不大可能去等很久去看一个东西，而且只要用户停止操作，数据就很难过来了。

下一篇主要介绍Watch App、 Glance、 Notifications，然后动手写点儿代码~

> Stay Hungrg
