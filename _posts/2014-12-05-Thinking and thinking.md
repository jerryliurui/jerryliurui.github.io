---
layout: post
title: 安静的制造了线上Bug之后的思考
description: “Creativity is allowing yourself to make mistakes.Art is knowing which ones to keep”
category: Programming Life
tags: [反思]
modified: 2014-12-05
imagefeature: blog_bg_1.jpg
comments: true
share: true
---
>&quot;Creativity is allowing yourself to make mistakes.Art is knowing which ones to keep.&quot;
><small><cite title="Scott Adams">Scott Adams</cite></small>

**这次版本**上线之后，发生了之前我所说过的那个大bug，由于之前没有经历过，当第一次发生之后还是觉得原来一行代码可以带来这么“毁灭性”的打击，周三晚上没忍住去了`APP Store`上看了一下评论，产品可能自从有了就没有到过现在这种三星的情况吧，给一星差评的特别多，几乎每翻一页都会有人抱怨客户端闪退的问题。熟人报喜不报忧，陌生人好事当做理所应当，坏事可以传千里。

**这也是我**第一次开发比较核心重要的功能，但也是这一次真正的让我反思了一下我个人开发的习惯问题，本科的时候几乎没有怎么写过代码，本科的毕设也是一页一页学着一本指导书敲出来的，自然贯彻不了书中那些极其规范的代码风格。真正开始自己写代码还是研一的时候，那个时候纯属自己摸索，于是养成了很多坏的毛病，急于求成的想要看到代码运行之后的结果，心想书中运行出来的就是那个结果，什么`容错`啊，什么查看`Api`啊，都没有太在意的去养成好的习惯。

**其实从八月份**开始实习以来，师兄的指导，每次的`review`都会给我很多建议，我也慢慢的改了一些自己的坏习惯，貌似是不吃一次大亏是不长记性的原因吧，这次还是导致了这么严重的后果，牵连到了负责我的同事，测试的同事，毕竟`iOS6`模拟器都不存在了，模拟`iOS6`下的情况实在是很少。只能说还要这次出现问题的只是`iOS6`的用户，毕竟是少数，如果是目前占大部分比例的`iOS8`后果不堪想象。。。实在是想象不出来大面积使用客户端的人无法登陆这么一回事儿发生在这么大的公司的客户端上。

**今儿下午**我们组内的`联邦最高法院`裁决了我和另外两位同事请组内成员喝饮料，我也安静的执行了这个特色活动，也算是缓解了一下我的内疚吧。。。

**借着**这个“难得”的机会，总结一下这次事故自己应该总结的一些东西吧，只为同一个坑不卡进去第二次，只为不让别人为了自己的错误买单。

### 1.使用不熟悉的Api务必查看文档
这是这次事件带来的最大的一个警示。。。
{% highlight css %}
- (instancetype)initWithSuiteName:(NSString *)suitename NS_AVAILABLE(10_9, 7_0)
{% endhighlight %}
`7_0`,需要照顾到`iOS6`之前的版本兼容性，当然了，如果这个功能是`iOS7``iOS8`之后才有的可以果断绕开了。

### 2.网络数据的容错处理
{% highlight css %}
_dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data,NSURLResponse *response,NSError *error){}
{% endhighlight %}
数据请求下来，按照惯性看着文档给我的`JSON`就直接数组当数组、字典当字典的存起来，`View`开始啪啪啪的显示，这个是我之前很恶劣的习惯，因为接口没啥问题，网络也没啥问题，请求下来的也能在界面上正常的显示，这也就导致了我没有容错的习惯。。。例如

{% highlight css %}
if ([jsonDic isKindOfClass:[NSDictionary class]])
{% endhighlight %}
{% highlight css %}
if ([topicArray isKindOfClass:[NSArray class]])
{% endhighlight %}
这样的还是要勤劳一点儿吧。。。

### 3.Magic Number
这个更是自己随意的一个体现了，界面`frame`的值，`tag`值，统统喜欢直接写一个数字，想着自己明白就可以了，一点儿体现不出团队性有木有。。。还是定义一些比较有意义的宏比较靠谱：
{% highlight css %}
#define KEY_DATA_FOR_TODAYWIDGET @"TodayWidgetNewsData" //用于存放本地data的userdefault的key
{% endhighlight %}
### 4.想着点儿内存泄露
之前写过一个控件儿，自定义的`loadingView`菊花，打算有时间单独写一篇阐述一下，控件小，不容易发现问题，于是我也没有测试，直到有一天，有一个用户反馈看客户端的图集的时候总觉得手机发热严重，后来测试是因为每一张图片都有一个我的这个`loadingView`,十有八九是内存泄露了，果然使用`Instruments`调试之后发现压根就没有释放掉，越来越多，不发热才怪，后来百思不得其解，最后的最后发现是定时器捣的鬼，不手动在`-(void)removeFromSuperview`方法中调一下，总之使得定时器停掉就好了。
{% highlight css %}
-(void)removeFromSuperview
{
    [self stopAnimating];
    [super removeFromSuperview];
}
{% endhighlight %}
也就是说，如果一直没有用户发现，这个内存泄露就会一直存在，我以后再使用`NSTimer` 的时候还是会犯同样的错误。

先总结这么多，趁着年轻，能避免错误的发生就尽量避免，不能的话，记住了，再一别再二就好~

> Stay Hungry
