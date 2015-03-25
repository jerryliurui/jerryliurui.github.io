---
layout: post
title: "Apple Watch三个月开发的一些收获总结"
description: "Developing for Apple Watch"
category: iOS Programming
tags: [AppleWatch]
modified: 2015-03-20
imagefeature: blog-bg-applewatch-development-summary.png
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

### 0.前言
    到今儿，接触`Apple watch`相关的开发工作已经差不多快三个月时间了，每天都去逛逛`WatchKit` 苹果的开发者论坛，看看最近都有哪些其他开发者po出来的问题，实在是找不到答案了也会自己去提个问题什么的，有意思的是有两次自己刚po出一个问题，当天摸索出答案之后就跑上去给自己回复。。。而后被标成了标准答案，感觉这不失为一个刷论坛正确答案数量的好方法 o(╯□╰)o


Xcode6.2 正式版本随着10号凌晨的发布会也出来了，之前的beta版本每天不崩溃个四五回都不好意思说今儿我写代码了。昨儿的发布会，依旧是最近几次发布会的节奏，发布前该剧透的剧透，用一些剧透来降低预期，最后发布的时候赢得满堂喝彩，不过，那个土豪金`MacBook`还是亮瞎了，哪怕心里已有预期。`Apple Watch`终于出来了，不知道为啥，以前都是盼星星的盼着什么时候能用上，现在变成了盼星星的盼啥时候这个东西能买到当测试机。。。言归正传，说说可能会真正引领穿戴设备的`Apple Watch`。

目前来说苹果给的关于`Apple Watch`的信息还是很多的，因为，好吧，其实就是也没啥太多东西，毕竟新事物，毕竟手表局限性现在太大，整个的`WatchKit`的所有东西就那些，曾经看到过国外的一个开发者说给`Apple Watch`做开发，一天就完事儿。想想其实也是，别的不说，至少`WKInterfaceController`这个类有啥方法，能做啥，基本可以倒背如流，甚至现在一个Beta出来，哪个方法变了我也大致有数了，界面上，在IB上拖拽拖拽，除了要注意别关联错误之外，好像还真没什么工作量，想加`Glance`，就加，想加`Notification`也可以随时加，一切感觉都是在抹黑前行，因为直到手表上市开卖的那一天之前，没法真机测一测看看自己的这个APP到底是个什么鬼，包括`Handoff`,也包括语音输入，以及发布会上的那个类似Emoji 的表情都是些什么。

自己来现在这个公司实习已经快一年了（别问我为啥实习这么久，特么的学校要求研二实习一年），主要做的工作几乎都和`iOS8`新特性有关，毕竟现在公司这个项目实在是太成熟了，摸熟悉也需要一个过程。包括之前的`Today Widget`，到后来的`Handoff`，包括因为要适配iPhone6做的适配方面的调研等等，都是从去年WWDC之后的新事物，转眼就到2015年的WWDC了，其实我很想去一次WWDC的，甭管我现在是个什么水平，额，还有那英语，估计也是大连海蛎子味儿的英语了吧。终究还是想去的，万一开发技术升华了呢0.0

其实，这次是有一个机会摆在我的眼前的，因为我没有护照。。。这个机会就这么流失了，想想那句什么机会是给有准备的人的，瞬间觉得自己有点完蛋。能为苹果新设备开发的机会能有几次？哎，这次趁着过年回家，麻溜给护照办了吧。

闲话扯到这里吧，是时候总结一下这两个月的收获和掉坑了。

目前开发者网站上的这几部分我觉得是开发Watch 必须过几遍的东西，也会有不少的启发，还有论坛也是一个不错的地方。

[1.WatchKit Framework Reference](https://developer.apple.com/library/prerelease/ios/documentation/WatchKit/Reference/WatchKit_framework/index.html#//apple_ref/doc/uid/TP40014968)

[2.WatchKit Development Tips : Optimize your WatchKit apps with these tips and best practices.](https://developer.apple.com/watchkit/tips/)

[3.Apple Watch Programming Guide](https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/WatchKitProgrammingGuide/index.html)

[4.Developer Forum](https://devforums.apple.com/community/ios/watchkit)

### 1.Watch Main App
说实话，在iPhone上，主程序当然是大哥，其他的小扩展啊什么的必须让路了，但是在Watch上，是不是大哥还要看这个APP主要的功能了，如果是一个阅读性质的APP，主程序在手表上作用还真不大，例如阅读新闻等等。如果是这类的应用，想在Watch上出彩，或者让用户使用的次数多一些，就要靠良好的`Notification`体验，以及极其方便用户生活的`Glance`了。

#### （1）以Page-Based方式启动Watch App

<figure>
<img src="{{ site.url }}/images/Apple Watch Development summary/Bezel Snapshot Apple Watch Page Based.png" alt="Page-based-App">
<figcaption>Page-Based Watch App</figcaption>
</figure>

如上图，现在手上要做的一个交互是，App启动的时候是六个页面，用户可以左右滑动来切换，这里就需要在`MainInterfaceController`中使用下边这个方法了。
{% highlight css %}
 [WKInterfaceController reloadRootControllersWithNames:_controllersArrays contexts:_contextsArray];
{% endhighlight %}
在Watch上页面之间转换传值，很重要的一个纽带就是这个`context`，传递有用的信息和标识，这个方法中，我传递进入六个controller的`interface builder identifier`,以及事前拼好的六个context。

因为Watch App 的打开可以是几种不同方式的，可以写一个统一的方法`[self showController]`，在这个方法中去选择启动哪一个具体的Controller。我在.h文件中定义了一个枚举来定义不同的启动方式：
{% highlight css %}
typedef enum  {
    WKOpenForNormal,      //普通打开
    WKOpenForComment,     //打开评论页
    WKOpenForFavorite,    //打开收藏页
    WKOpenForGlance   //打开来自glance的内容
} WKOpenType;
{% endhighlight %}
**因为用户如果**选择了点击`Glance` 来查看具体的内容的话，`Glance`和`MainApp`是通过Handoff来实现通信的，我们可以在入口的控制器中的:
{% highlight css %}
- (void)handleUserActivity:(NSDictionary *)userInfo;
{% endhighlight %}
这个方法中去将`WKOpenType`赋值成`WKOpenForGlance`。

**当然了，如果是从Notification来的**，我们完全可以通过:
{% highlight css %}
- (void)handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)remoteNotification; 
{% endhighlight %}
这个方法来根据具体的用户点击的动作来区分不同的打开方式。

这里比较难处理的是，如果用户是从`Glance`进来的，退出这个控制器，还是要显示那六个页面的，这里我的解决方法是注册通知。在出来的控制器中的`- (void)didDeactivate; `方法中post出来通知，来让主控制器重新打开六个Page页面。Notification同Glance。

#### （2）Watch App 与Host App 联合调试
因为程序中多处用到了下边这个方法，因此主程序和Watch App 联合调试就显得非常必要了，在Xcode的一个新beta 的`release note`中苹果介绍了一种方法。
{% highlight css %}
+ (BOOL)openParentApplication:(NSDictionary *)userInfo reply:(void(^)(NSDictionary *replyInfo, NSError *error)) reply;
{% endhighlight %}

1.首先run 起来`Apple Watch App`在模拟器中。
2.在iphone 模拟器中启动 demo App。
3.Xcode - Debug - Attach to Process 里找到host app 线程，Attach上。

完成以上三个步骤，主程序和手表程序上的端点都可以进行调试。

#### （3）申请数据方面
在开发初期，我是在`extension`中进行数据的申请，这样尝试了一段时间之后发现性能上优化的空间不大，而且写出了很多重复的代码。复用项目中已有的代码是我最好的选择，尤其是一些第三方用`pod`管理的库，但是考虑到公司的项目已经是非常成熟的了，以至于现在还没有完成全部64位的转化，一些管理的第三方库无法正常的使用，进而又去考虑写一个共用的框架，由于时间问题，项目有点大，抽筋抽骨的不是很合适，所以决定充分发挥`openParent`这个方法，将申请数据这块放在主程序中，顺便将所有需要“问”主程序的东西全部整理到一个类中，这样就可以充分发挥老代码的作用。

数据策略大致如下：首先为了优化watch app 的启动速度，采用后台申请数据存起来，watch每次去使用就可以了，最后处理一下冷启动的问题，这种情况是当安装了我们的软件，没有在iphone上打开过，直接打开watch 上的程序的时候已然有数据，这么做的话除了第一次会启动的稍微慢一点点之外，剩下的启动速度就会快很多。
具体用到的方法是:
{% highlight css %}
- (void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler NS_AVAILABLE_IOS(7_0);
{% endhighlight %}
我和同事做到这里的时候，就感觉是一个iphone当做了服务器，而watch则是一个终端，有什么需要的数据，我们两个人设计好协议，通过`openparent`这个方法沟通。比如说，软件运行当中如果想要知道一个用户是否登录了，因为没有登录是没有某些功能的，那么这个时候通过`openparent`咨询一下`isLogin`就好，判断一下是否登录。

`Demo`中 `watch 端`代码实现如下：

{% highlight css %}
 [WKInterfaceController openParentApplication:@{@"type":@"isLogin"} reply:^(NSDictionary *replyInfo, NSError *error) {}
{% endhighlight %}

`Demo`中 `iphone 服务端`代码实现如下：
{% highlight css %}
#pragma mark - WatchKit Data
-(void)application:(UIApplication *)application handleWatchKitExtensionRequest:(NSDictionary *)userInfo reply:(void (^)(NSDictionary *))reply
{
    NSString *type = userInfo[@"type"];
    NSDictionary *para = userInfo[@"para"];
    ...
    ...
    NSDictionary *replyInfo;
    if ([type isEqualToString:@"isLogin"]) {
        int random = arc4random()%10 + 1;
        NSString *whetherLogin = @"";
        if (random == 1) {
            whetherLogin = @"YES";
        }else
        {
            whetherLogin =@"NO";
        }
        replyInfo = @{@"whetherLogin":whetherLogin};
    }
    else if ([type isEqualToString:@"isFavorite"])
    {
        ...
	    ...
		...
    reply(replyInfo);
}
{% endhighlight %}

`demo`中有三种协议，分别是是否登录，回复信息，是否收藏，当然都是假的，根据项目需求来进行改变，务必注意的是`每一种情况都要回调reply(replyInfo);，否则这个方法实际上会响应失败。`

而实际上，项目当中需要在`watch`上显示很多图片的，这个就需要异步的申请一下，首要想到的还是`SDWebImage`这个经典框架，这里就可以在`openparent`里使用将data请求到，然后返回给watch。

PS：`最后的最后，我们发现使用App Group来通信数据更加的有效率，因此一部分数据的请求采用了App Group来实现`。

#### （4）TableView 在Watch 上的使用
在SDK发布的初期，我天真的以为新控件之一`WKInterfaceGroup`可以点击，因为目前来看watch上是没有图层的概念的，复杂的UI布局是相当困难的，布局方式和之前有很大的区别，包括在故事板中的布局方法。当初为了实现产品给过来的UI布局也是脑洞大开啊，比如各种嵌套`Group`,为了要实现demo中主页的这种感觉，我很自然的想到了，放一个group，背景放图片，其他控件放在group上就好了，解决了无法实现控件在控件之上的问题。但是这就需要group可以点击，盼星星盼月亮之后，Xcode6.2正式版出来之后彻底断了我这个念头，没办法，于是我通过另一个控件`WKInterfaceTable`来实现了，每一页只有一行不就可以了么~

`WKInterfaceTable`和`UITableView`使用上还是有一些不同的，也比`UITableView`的使用方便了很多。

首先你需要去定义一个Row类，这个Row类相当于一个cell，在这个Row上去布局，如果你的表格中呈现数据的方式不一样，那就要定义不同的Row类。

定义好之后，调用的时候需要使用如下方法：

{% highlight css %}
#pragma mark - UI
- (void)setUpUI
{
    [self.newsRowTabel setNumberOfRows:1 withRowType:@"RowForOneNews"];
    for (int i = 0; i < self.newsRowTabel.numberOfRows; i++) {
        JRWKNewsRow *newsRow = [self.newsRowTabel rowControllerAtIndex:i];
        [newsRow.newsCategory setText:[NSString stringWithFormat:@"第%ld张",_index+1]];
	...
	...
    }
}
{% endhighlight %}

RowType唯一标识了一个Row类，这里我设置了只有一行，期间设置Row类中每一个属性的UI数据。

响应点击事件需要去实现:

{% highlight css %}
#pragma mark - Table Row Select
-(void)table:(WKInterfaceTable *)table didSelectRowAtIndex:(NSInteger)rowIndex
{
    NSDictionary *contextDic = @{@"PicName":_picName,@"index":[NSNumber numberWithInteger:_index]};
    [self presentControllerWithName:WKNEWSDETAILCONTROLLERIDENTIFIER context:contextDic];
}
{% endhighlight %}

这里去指定具体要呈现出来的是哪一个Controller。

如果表格中的一行不能点击的话，在故事板中设定的时候把`selectable`勾选掉就可以了。

<figure>
<img src="{{ site.url }}/images/Apple Watch Development summary/row-in-tableView.png" alt="Selectable row">
<figcaption>Selectable row in table</figcaption>
</figure>


#### （5）数据在Controller 间的传递
APi中的几个关于Controller切换的方法当中几乎都有`context`参数，也就是说传递数据由我们决定了。在十二月份刚开始写程序的时候，我传递的是一个很大的字典，发现在程序启动的时候非常的慢，后来决定写一个模型管理类，controller之间只需要传递一个`index`就可以了。在demo中保留了完整的类。

#### （6）关于HandOff
HandOff在`iOS8`之后出现，着实是为了Apple Watch量身打造的好么，实在是太应景了，因此在watch 上合理的运用handoff 是一个顺理成章的事情，而`WKInterfaceController`也带上了相关的一些方法，实际上是要比iphone上的简单易用一些的。
另一方面，在Glance界面，进入到主App上的时候，handoff也起了决定性的作用，通过handoff将具体的信息交给主App去处理，这里有一点是我的猜想，iphone和配对的watch的所有信息流都是通过handoff来实现的吧。
主要有两个Api，这个是`update`了全局的`Activity`，将我们需要传递的信息打包成一个`userinfo`即可。

{% highlight css %}
- (void)updateUserActivity:(NSString *)type userInfo:(NSDictionary *)userInfo webpageURL:(NSURL *)webpageURL;
{% endhighlight %}

下面这个是beta几新出的我有点忘记了，我还记得是开发者watchkit论坛里有一位开发者问过这个问题，在watchkit里怎么没有干掉`Activity`这一个方法。后来苹果的工程师估计是采纳了。但实际的效果来看，这个方法作用不大，例如在公司的项目中，几乎每一个页面都是需要handoff的，给它`invalidate`之后，iphone左下角出现logo就会出现异常甚至是不出现的情况。因此如果不是已经很明确的话，轻易的不要用这个方法。

{% highlight css %}
- (void)invalidateUserActivity;
{% endhighlight %}

总之，Handoff是watch和iphone沟通的绝佳方式之一，苹果也一直很鼓励使用SDK新出的一些东西来补充自己的App的。不要再幻想（至少是现在）通过watch上的一个按钮能够使得iphone 上的host app 能够打开并且显示在前台了。


#### （7）其他一些Tips
(1)dynamic notification 中苹果是希望 用户在通知中就把所有的信息都看完的，而不希望用户点击内容本身（`实际上也是不能点击的`）再进入到watch app 内查看这个通知的内容的，`恰恰相反的是`，glance 的交互理念是相反的，也就是苹果估计用户点击glance页面本身（`实际上是可以点击的`）进入到watch app中进行继续深度阅读的。

(2)关于这货WKTextInputMode，一开始选择的是WKTextInputModeAllowAnimatedEmoji，后来发现这个是动态的大表情，返回的是这个大表情的data，不太适合我们一一对应到iphone上的emoji表情，于是后来切换到了WKTextInputModeAllowEmoji。而WKTextInputModePlain只是显示了我们所“推荐的”那些回复文本选项。

{% highlight css %}
typedef NS_ENUM(NSInteger, WKTextInputMode)  {
    WKTextInputModePlain,		// text (no emoji) from dictation + suggestions
    WKTextInputModeAllowEmoji, 		// text plus non-animated emoji from dictation + suggestions
    WKTextInputModeAllowAnimatedEmoji,	// all text, animated emoji (GIF data)
};
{% endhighlight %}

(3)- (void)becomeCurrentPage; 这个方法主要是在page based页面当中，如果第三页在启动的时候你想让他先出来，就要标识好，在awake里边获取到之后，调用这个方法，注意的是，这个第三页不是立马就出现在手表的表盘之上的，而是从第一页蹦到第二页，然后再第三页这样转的。

(4)推荐一个很好用的工具，叫做`Bezel`,它能够将模拟器中运行的watch app 映射到真实的手表里，表带的样式也分38mm以及42mm，有很多种，可以更好的查看自己的App在真实手表上的样子。更换表带也很方便，直接拖着下边的某一个样式到Bezel上就自动换了。举个例子，在开发的时候曾想左右留边，但是放在`Bezel`上就会发现手表自带黑边，于是留下的左右边就是很多余了。

[Bezel 下载地址，页面内包含N多种表带](http://infinitapps.com/bezel/)

<figure>
<img src="{{ site.url }}/images/Apple Watch Development summary/bezel watch 38 and 42.png" alt="Selectable row">
<figcaption>内置38mm以及42mm 的N多表带样式。</figcaption>
</figure>


### 2.Notification
从目前来看，手表上出现push用该是随着手机一起来的，也就是同时去显示在这两个设备上，除非一些外力因素，比如手表关闭了抬手查看通知等。在之前的blog中提到过定义`category`来区分推送通知，如果没有定义category的故事板的话，就会在手表上显示一个系统默认的简短的通知。上边说道，苹果还是鼓励在notification中将该阅读的内容都阅读完，即使增加按钮也要是一些比较简单的操作，比如说一个日程安排的软件，来了一个push，一个done，一个delete，加上系统的cancel，就可以了。

我尝试了在`Dynamic notification`中申请了一个图片资源，发现系统就选择去显示`Static notification`,因此在notification controller内进行的任务的能力有限，这个在开发的时候要慎重。

开发的时候，Xcode自动生成的Payload很重要，可以定义多个payload来进行相应的模拟，搭配不同的category，不同的category故事板。

### 3.Glance
我依然认为glance 的地位在watch上是最重要的，至少在第三方独立app登上watch前，glance应该是用户使用最频繁的一个功能。因此glance上要呈现的东西不能太少，也不能太多，一定要简明扼要，要呈现出最重要的一些东西。例如说如果自己的App不是以天气为主的，放一个天气温度什么的就不是很合适，系统的天气和地图软件还是非常出色的，因此还是在Glance 只体现自己App里边独特的东西最好。

另外，Glance的UI布局是很讲究的，如果可以尽量要按照Xcode 给的Upper和Lower的模板进行UI布局。不能使用任何可以操作的空间，例如按钮这样的，因为glance就一页（可以滚动也是禁止的），有点像是渲染出来的一张图片似的，因此加个按钮是没有意义的。

<figure>
<img src="{{ site.url }}/images/Apple Watch Development summary/glance-upper.png" alt="Selectable row">
<figcaption>Glance UI(Upper)</figcaption>
</figure>


同notification，glance controller 中进行任务的能力也比较有限，因为众多的glance会一同呈现出来，用户翻腾着每一个app 的glance，这就要求用户一扫之后就要呈现出来，一个比较好的解决方法就是glance要呈现的数据提前的申请好，用的时候拿出来，具体实现的方法也有很多。比如上边提到的`App Group`。

Glance 以及主App的通信是依靠`Handoff`来实现的，也就是说用户点击了glance这个页面之后，进入到主App，要做的事情需要根据传过来的`userinfo`来决定的，主要就是下边这个方法。

{% highlight css %}
[self updateUserActivity:XXXXX userInfo:userInfo webpageURL:nil];
{% endhighlight %}

在入口controller中实现方法，决定启动什么页面，呈现什么内容，可以放在willActivate里边。记住的是请求数据这块一定要放在awake里边，不要放在willActivate里边。

{% highlight css %}
-(void)handleUserActivity:(NSDictionary *)userInfo
{
    wkOpenType = JRWKOpenForGlancedemo;
    if (userInfo) {
        NSString *sourceString = [userInfo objectForKey:@"Source"];
        NSString *picName = [userInfo objectForKey:@"PicName"];
        
        if ([sourceString isEqualToString:@"Glance"]) {
            _glancePicName = picName;
        }
    }
}
{% endhighlight %}

根据`wkopentype`决定启动页面。

{% highlight css %}
    switch (wkOpenType) {
        case JRWKOpenForGlancedemo:
            //glance page
            break;
        case JRWKOpenForNotificationdemo:
            //notification page
            break;
            
        default:
            [self showPageBaseddemoController];
            //默认启动
            break;
{% endhighlight %}

Glance 在demo中的表现形式，demo还在整理中，整理好会放在自己的github上。

<figure>
<img src="{{ site.url }}/images/Apple Watch Development summary/demo-glance.png" alt="Selectable row">
<figcaption>Demo Glance</figcaption>
</figure>

### 4.总结
其实WatchKit的东西真不多，更多的是在一个新的平台遇到的各种问题和bug是最让人头疼的。春季发布会之后会有更多的公司投入到Watch 的开发当中，也随着真机的即将到来，开发工作也不再是抹黑前行，这些都是利好的消息。不知道什么时候可以有独立的第三方应用的支持，也不知道WatchKit 会丰满到什么程度，总之我个人还是很看好Watch的未来的，毕竟苹果引领的穿戴设备的头。

之后的工作要慢慢的向毕设转移了，四月份就要开题了，目前进展好像有那么点儿慢。。。各位一起加油~


