---
layout: post
title: "iOS10 TodayWidget 适配"
description: "iOS10 TodayWidget"
category: iOS Programming
tags: [iOS10, TodayWidget]
modified: 2016-09-01
imagefeature: bg/459_570b401a8a6f2.jpg
comments: true
share: true
---

##### 更前先说点题外话，貌似有一年半没有更新博客了，讲道理有点太久了。2015年的大部分时间我都在和论文做着激烈的斗争，合肥、苏州、北京、大连四个地方来回跑，最后的结果是两个证儿，一件硕士毕业服，无数张毕业照，一篇90多页的论文，按照惯例，看自己的这个论文还是像翔一样好吧。当然了，还有场数蹭蹭涨的Dota2比赛场数。。。你懂得，劳逸结合嘛。

不知道是不是曝光的太多了，这两年的发布会都很少会看完，基本上都是事后看看文档，看看都有哪些东西更新了。今年也差不多，因为去年没怎么关注`watchOS2`的变化，所以感觉watch 的改动对我来说很有挑战性。。。

### 1.Today Widget iOS10的总体印象
加上回到公司之后，`Today Widge`t的适配工作就要开始进行了，所以就开始关注的多了起来。`iOS10`操作方式发生了一定的变化，之前的屏幕下拉的通知中心，分成了左右滑动的两部分，不再是两个Tag那种形式。这也是`Widget`会出现的第一个地方。另一个会出现的地方是在主屏Home 的时候一直向左滑动屏幕，也会进入到`Widget`页面，增加了插件出现的几率。讲道理的话还有一处，在6S之后具备`Force Touch`功能的手机上，按住图标，也是可以直接添加`Widget`的。
<figure>
<a href="{{ site.url }}/images/widgethome.jpg"><img src="{{ site.url }}/images/widgethome.jpg"></a>
</figure>
<figure>
<a href="{{ site.url }}/images/forcetouch.jpg"><img src="{{ site.url }}/images/forcetouch.jpg"></a>
</figure>
这次外观上也有了一些变化，貌似限制更多了，开发者论坛上也有很多人去尝试性的问这是不是beta版本的bug。。。例如高度最低是110这样的问题，其实应该是苹果对于`Widget`的一次小小的约束吧。还有背景颜色的再次统一。另外一点就是，如果还是iOS9 SDK编译出来的App背景色应该还是黑色的，字体颜色这块儿需要做一些适配工作，包括颜色和大小，行间距等。

### 2.APi增加的部分
适配之前，还是先看看APi的变化吧。还记得`Today Widget` 刚出来的时候，是可以用代码去实现折叠和展开两种显示模式的。在`iOS10`中，这个就要成为标配了。新增加了一个方法：
{% highlight css %}
- (void)widgetActiveDisplayModeDidChange:(NCWidgetDisplayMode)activeDisplayMode withMaximumSize:(CGSize)maxSize NS_AVAILABLE_IOS(10_0);
{% endhighlight %}
当`Today Widget`发生折叠或者展开的时候会在这个方法中处理整体的高度。
比如：
{% highlight css %}
-(void)widgetActiveDisplayModeDidChange:(NCWidgetDisplayMode)activeDisplayMode withMaximumSize:(CGSize)maxSize
{
    if (activeDisplayMode == NCWidgetDisplayModeCompact) {
        self.preferredContentSize = CGSizeMake([UIScreen mainScreen].bounds.size.width, NCWidgetDisplayModeCompact_Height);
    }else
    {
        self.preferredContentSize = CGSizeMake([UIScreen mainScreen].bounds.size.width, TW_Height_TableView+TW_Height_ReadMoreArea);
    }
}
{% endhighlight %}
`TW_Height_TableView+TW_Height_ReadMoreArea`这里是我定义的一个宏，用来约束展开情况下的整体高度。如果想像系统插件那样流出来一条线的话（提示用户下边还有内容可以查看），并且还是一个`TableView`的话，可以把`Cell`高度设置成`100 < 110`。效果还可以。

iOS10同时也引入了一个新的属性`NCWidgetDisplayMode`：
{% highlight css %}
typedef NS_ENUM(NSInteger, NCWidgetDisplayMode) {
    NCWidgetDisplayModeCompact, // Fixed height
    NCWidgetDisplayModeExpanded, // Variable height
} NS_ENUM_AVAILABLE_IOS(10_0);
{% endhighlight %}

<figure>
<a href="{{ site.url }}/images/showless.png"><img src="{{ site.url }}/images/showless.png"></a>
</figure>
<figure>
<a href="{{ site.url }}/images/showmore.png"><img src="{{ site.url }}/images/showmore.png"></a>
</figure>

如果我们想根据当前具体设备来适配的话，可以通过下边这个方法：
{% highlight css %}
- (CGSize)widgetMaximumSizeForDisplayMode:(NCWidgetDisplayMode)displayMode NS_AVAILABLE_IOS(10_0);
{% endhighlight %}

来得到两个最大`Size` 根据这个Size 来进行相应的布局。自己做了一个小实验吧，不同尺寸的设备，包括横竖两个方向的高度都是不同的。
{% highlight css %}
CGSize maxExpandedSize = [self.extensionContext widgetMaximumSizeForDisplayMode:NCWidgetDisplayModeExpanded];
CGSize maxCompactSize = [self.extensionContext widgetMaximumSizeForDisplayMode:NCWidgetDisplayModeCompact];
{% endhighlight %}

### 3.APi废弃的部分
有增有减吧，相应的有一些东西已经被废弃掉了，或者说`isiOS10Later`是不用的了。
首先是之前的一个方法，可以设置`Widget`左边间距的方法，由于`iOS10`总体UI视觉的改变，这个方法也不是很需要了：
{% highlight css %}
- (UIEdgeInsets)widgetMarginInsetsForProposedMarginInsets:(UIEdgeInsets)defaultMarginInsets NS_DEPRECATED_IOS(8_0, 10_0, "This method will not be called on widgets linked against iOS versions 10.0 and later.");
{% endhighlight %}

之前的**通知中心样式的**毛玻璃效果也有了替代品，之前我们这样去获得毛玻璃效果，
`[UIVibrancyEffect notificationCenterVibrancyEffect]`进而将这个效果运用到相应的`View`上，而现在`widgetPrimaryVibrancyEffect`代替了它。并且为了更好的显示效果，还有`widgetSecondaryVibrancyEffect`选择。

### 4.开发过程中遇到的一些小问题
开发的时候遇到了大大小小的问题吧，其中有一些是和适配无关的。

####(1)Cell上View 颜色，在点击时改变
这个处理方法还是很多的，最简单的就是在`setSelected`和`setHighlighted`这两个方法中将期望出现的颜色再赋值一遍就可以了。

另一个方法是设置View 的`layer.background = XXX.CGColor`。

最后一种方法是在自定义View中重写`setBackgroundColor`就可以了。

####(2)展开、收缩出错
这个问题的解决，就是最好在伸缩、展开的那个代理方法中去处理所有的高度变化，在这个方法中去计算，在其他的方法中，尽量不要使用`self.preferredContentSize =`这养的方式去改变。

####(3)启动样式的设定
在`- (void)viewWillAppear:(BOOL)animated; `方法中设置一下就好：
{% highlight css %}
self.extensionContext.widgetLargestAvailableDisplayMode = NCWidgetDisplayModeExpanded;
{% endhighlight %}

### 5.总结
大概就是这些，比较短，都是我觉得比较重要的东西了，希望能给适配的同学们提供一些小小的帮助吧，这篇Blog可是作为自己练练手，毕竟好久不更了，有点僵硬好吧，做个小小的预告，下几篇应该都是围绕适配`watchOS3`的博客了，适配的工作基本上已经做得差不多了，是时候好好整理一下了。
