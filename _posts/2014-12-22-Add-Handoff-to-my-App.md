---
layout: post
title: "给App赋予iOS8新特性:Handoff"
description: "Add Handoff to my App"
category: iOS Programming
tags: [Handoff,iOS8]
modified: 2014-12-22
imagefeature: blog_bg_addhandoff.png
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

**说实话看完今年的发布会之后觉得`handoff`这个功能有些鸡肋，只能说自己目光实在是短浅。。。`handoff`极大的促进了苹果大生态圈的完成过程，在这之后，除了icloud或者itunes会让你觉得手中的iphone需要一个ipad、apple watch作伴，又会多了一个让你再次剁手购买另一个设备的理由：handoff。 **

**接触handoff是因为之前调研apple watch 的时候发现前台打开iphone上的app不是很可行，按照苹果工程师的推荐，handoff实在是再好不过了，试想一下，用户在手表上想要查看一篇新闻的详细报道，又或者在手表上看新闻图片不是很爽的时候，发现iphone、ipad的左下角有一个icon，滑动解锁之后就会继续阅读，获得更加良好的体验，进可攻，退可守，实在是将用户包围在这么一坨苹果设备之中的上上策。 **

话不多说，总结一下最近调研、应用handoff在自己应用中的一些体会以及大致领悟一下官方文档的精神报告。传送门：[Handoff官方文档](https://developer.apple.com/library/prerelease/ios/documentation/UserExperience/Conceptual/Handoff/HandoffFundamentals/HandoffFundamentals.html#//apple_ref/doc/uid/TP40014338-CH3-SW1)

## 一.什么是HandOff？ ##

<figure>
<img src="{{ site.url }}/images/addhandoff/NSUserActivity.png" alt="NSUserActivity">
<figcaption>NSUserActivity</figcaption>
</figure>

**整个handoff** 的工作过程围绕着一个叫useractivity的东西展开，顾名思义就是一个用户的活动，我们要控制的是如何定义这个活动，标示这个活动，激活它，废弃它，传输它，更新它，灵活的使用这个对象，就会让iphone、ipad、mac无缝的连接起来。用户可以选择在书写一封回信的时候，去到mac上的邮件应用继续编写并发送；用户可以在iPhone上查看一个喜欢的网页，觉得不够bigger的话，在mac上的dock上打开多出来的icon，就可以在safari中继续自己bigger的阅读。快速，无痛，只需要打开蓝牙，设备都使用同一个apple ID 登陆icloud，设备之间不要离的特别的远就可以了。

> 这里说一点自己遇到的问题，一开始的时候我的iPhone5S 是iOS8.1.2，但是我的iPhone Plus还是iOS8.1的时候，5S死活发现不了Plus，但是Plus能发现5S，更加醉人的是，我把plus也升级到8.1.2之后互相都找不到对方了！！！！搜了挺多的地方，最后试了一个：把设备的icloud都注销了，重启，然后重新登录，然后蓝牙也是，重新打开，一套标准的煎饼果子动作之后两台设备终于认识对方了。。。不知道如果升级8.2 的时候是不是还需要这么煎饼果子来一套，如果是，我会告诉自己还是安（Si）静（Bi）好了。

**苹果官方** 的很多应用天生支持handoff功能，比如邮件、safari、联系人、地图等等，第三方应用的开发者已经可以使用这些Api了，注意的是必须要一个team id去管理想要可以无缝传输活动的应用们。

创建handoff要经历以下的三个步骤：

> 1.为自己App中每一个活动定义一个useractivity，例如阅读新闻正文、看图集等。
> 2.根据用户此时此刻正在做的事情来更新这个活动的具体信息。
> 3.在不同的设备上延续这个活动的进行，当用户进行了handoff的操作之后。

## 二.开始加入HandOff ##

### 1.创建UserActivity

{% highlight objective-c %}
- (void)creatHandOffUserActivity
{
    if ([[[UIDevice currentDevice] systemVersion] intValue] >= 8) {
        if (self.userActivity !=nil) {
            self.userActivity = nil;
        }
        self.userActivity = [[NSUserActivity alloc] initWithActivityType:@"com.sse.ustc.handoffdemo.dosomething"];
        self.userActivity.title = @"oneVC";
        self.userActivity.delegate = self;
        self.userActivity.userInfo = @{@"jumpId":@"1",@"info":@"由VC1跳转到第二个VC2"};
        self.userActivity.needsSave = YES;
        self.userActivity.webpageURL = [NSURL URLWithString:@"http://www.baidu.com"];
        [self.userActivity becomeCurrent];
    }
}
{% endhighlight %}

如下是第二个Controller中创建UserActivity的过程：


{% highlight objective-c %}
- (void)creatHandOffUserActivity
{
    if ([[[UIDevice currentDevice] systemVersion] intValue] >= 8) {
        if (self.userActivity !=nil) {
            self.userActivity = nil;
        }
        self.userActivity = [[NSUserActivity alloc] initWithActivityType:@"com.sse.ustc.handoffdemo.dosomething"];
        self.userActivity.title = @"twoVC";
        self.userActivity.delegate = self;
        self.userActivity.userInfo = @{@"jumpId":@"0",@"info":@"跳转到第1个VC"};
        self.userActivity.needsSave = YES;
        self.userActivity.webpageURL = [NSURL URLWithString:@"http://www.baidu.com"];
        [self.userActivity becomeCurrent];
    }
}
{% endhighlight %}

这里生成的时候要制定好活动的类型的，`- (instancetype)initWithActivityType:(NSString *)activityType;` 这个类型的指定要和之前在Plist文件中定义的是一致的，如图：

<figure>
<img src="{{ site.url }}/images/addhandoff/plistkey.png" alt="plistkey">
<figcaption>PLIST KEY</figcaption>
</figure>

这里我定义的是`com.sse.ustc.handoffdemo.dosomething`，后边的那个`NSUserActivityTypeBrowsingWeb`是为了和mac上的safari配合使用的，如果我的mac打开了蓝牙，而且也是我的icloud，那么就会直接打开到Safari，进入到我上边创建useractivity的地方，定义的那个`webpageURL`中的`www.baidu.com`这个网址中。这个方便之后扩展，如果我们的项目有web端的网站的话，我们可以让handoff发挥的更好。

<figure>
<img src="{{ site.url }}/images/addhandoff/dock.png" alt="dock">
<figcaption>HandOff on Mac</figcaption>
</figure>

如果说userActivity是整个handoff的核心，那么`userInfo`也许就是useractivity的核心了吧，我们所有有用的信息都要通过这个字典去传递，另一台设备想要继续之前的那个活动就是需要这里的有用信息，否则就没有什么意义了。这里我定义了一个`jumpId`,我的demo中有四个主要的页面，这个id主要标识另一台通过handoff打开的时候跳转到第几个页面，0代表第一个页面，1代表第二个页面，以此类推。第二个key定义了是哪一个活动被触发，记录一下信息，这里的信息是`由VC1跳转到第二个VC2`。

`needsSave`这个属性如果设置成YES，那么这个活动的代理(这里是当前的VC)就触发一个方法`userActivityWillSave:`，触发时机是这个活动被发送之前,用这个来做最后的改动。

`becomeCurrent`使得当前这个活动被“发射”出去，被其他的设备接收到，那么就会在锁屏的左下角就会出现一个app 的icon，这个becomeCurrent的时机还是很重要的，如果这个useractivity需要很重要的信息保存在字典里，如果就在viewdidload中调用的话不是很保险，通常我在viewwillappear里边去调用。如图，可以感受一下：

<figure>
<img src="{{ site.url }}/images/addhandoff/becomecurrent.png" alt="becomecurrent">
<figcaption>UserActivity Becomecurrent</figcaption>
</figure>

### 2.废弃一个UserActivity
有生就有灭，当我们认为一个活动不再具有被“发射”的价值，我们就要调用这个方法来使得这个活动被废弃掉。`- (void)invalidate;`

{% highlight objective-c %}
-(void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
    [self.userActivity invalidate];
}
{% endhighlight %}

<figure>
<img src="{{ site.url }}/images/addhandoff/invalidate.png" alt="invalidate">
<figcaption>UserActivity Invalidate</figcaption>
</figure>

### 3.活动被延续之后。。。
当用户在另一台设备打开之后，继续了这个活动，那么之前的设备应该做什么？那么就要在下边这个方法中去具体的实现一些东西了。`- (void)userActivityWasContinued:(NSUserActivity *)userActivity;`

{% highlight objective-c %}
-(void)userActivityWasContinued:(NSUserActivity *)userActivity
{
    [self.testLabelforContinued performSelectorOnMainThread:@selector(setText:) withObject:@"这个软件已经在另一台设备上打开" waitUntilDone:NO];
}
{% endhighlight %}

当另一个设备继续了这个活动之后，原来的vc中的一个label就会更新自己的文本，用来显示这个活动被另一台设备继承了。

### 4.如何延续一个活动
`app delegate`中新加入了若干和handoff有关的方法，我们使用这些新的方法来实现handoff。如下，是在我的demo中所用到的几个delegate方法.

{% highlight objective-c %}
//handoff
-(BOOL)application:(UIApplication *)application willContinueUserActivityWithType:(NSString *)userActivityType
{
    if ([userActivityType isEqualToString:@"com.sse.ustc.handoffdemo.dosomething"]) {
        return YES;
    }else
    {
        return NO;
    }
}
{% endhighlight %}

这个方法主要是区分不同的活动的，如果匹配不上我们返回一个NO就可以了。

{% highlight objective-c %}
-(BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *))restorationHandler
{
    BOOL handled = NO;
    NSDictionary *userInfo = [[NSDictionary alloc] init];
    if (userInfo != nil) {
        userInfo = [userActivity userInfo];
    } //取到活动的字典
    
    NSString *jumpto = [userInfo objectForKey:@"jumpId"];
    //取到要跳转到的VC
    MainTabBarViewController *mainTabbar = [[MainTabBarViewController alloc] init];
    //创建demo中主要的tabbar
    mainTabbar.selectedIndex = [jumpto integerValue];
    //将所要跳转的VC呈现出来
    self.window.rootViewController = mainTabbar;
    //根控制器
    BaseNavagationViewController *baseNV = mainTabbar.viewControllers[[jumpto integerValue]];
    //我的每一个tab都嵌套了一个navigation，这里取到之后，再取到对应的VC
    restorationHandler(@[baseNV.topViewController]);
    //交给了这个VC去处理这个活动
    //当然了这个地方可以不用这个去处理事件
    //例如[self showController];
    handled = YES;
    return handled;
    //返回YES
}
{% endhighlight %}

具体的思路上边的代码注释有写到，需要注意的是`restorationHandler(@[baseNV.topViewController]);`这个方法是可选的，可以用可以不用，这里放进去一个数组，程序就会分别想这个数组中的对象去调用`- (void)restoreUserActivityState:(NSUserActivity *)activity NS_AVAILABLE_IOS(8_0);`  这个方法，demo中我将这活动交给了对应的VC中去处理了，那么这四个基础的VC就要实现这个方法，来做相应的处理。

如下是我在`第一个controller`中实现的方法，更新了其中的一个标签的文本信息为送过来的活动的字典中的“info”.

{% highlight objective-c %}
-(void)restoreUserActivityState:(NSUserActivity *)activity
{
    NSString *jumpto = [[activity userInfo] objectForKey:@"jumpId"];
    if ([jumpto isEqualToString:@"0"]) {
        NSString *info = [[activity userInfo] objectForKey:@"info"];
        [self.testLabelforUserInfo setText:info];
    }
}
{% endhighlight %}

如下是我在`第二个controller`中实现的方法，同理，合理区分一下就可以了.

{% highlight objective-c %}
-(void)restoreUserActivityState:(NSUserActivity *)activity
{
    NSString *jumpto = [[activity userInfo] objectForKey:@"jumpId"];
    if ([jumpto isEqualToString:@"1"]) {
        NSString *info = [[activity userInfo] objectForKey:@"info"];
        [self.testLabelforUserInfo setText:info];
    }
}
{% endhighlight %}

### 5.测试效果
测试对象：iPhone5S、iPhone Plus、Macbook Pro

> PS：记得蓝牙打开，记得iCloud登录好。

首先在一个设备上打开软件`handoffdemo`，出现第一个红色的界面（不要说丑，我自己测试完就删除了，我会说么！）。可以看到第一第二个标签还是初始化的文字，第三个因为下边这个方法搞变化了。

{% highlight objective-c %}
-(void)userActivityWillSave:(NSUserActivity *)userActivity
{
    [self.testLabelforWillsaved performSelectorOnMainThread:@selector(setText:) withObject:@"通过handoff打开之后保存或者更新这个活动" waitUntilDone:NO];
}
{% endhighlight %}

<figure>
<img src="{{ site.url }}/images/addhandoff/openfirstiphone.PNG" alt="openfirstiphone">
<figcaption>打开第一台iOS设备：iPhone Plus</figcaption>
</figure>

然后我们就可以在另一台设备的左下角发现我们的icon，这是因为第一个VC发射的活动，第二个设备已经收到了，然后我们滑动解锁，此时！注意之前设备的第二个标签的文本。
当第二个设备打开的一瞬间，红色界面的第二个标签文字已经变成了`这个软件已经在另一台设备上打开`,说明成功调用了代理。

<figure>
<img src="{{ site.url }}/images/addhandoff/handoffleftlogo.JPG" alt="handoffleftlogo">
<figcaption>第二台设备上已经可以显示icon</figcaption>
</figure>

<figure>
<img src="{{ site.url }}/images/addhandoff/openseciphone.PNG" alt="openseciphone">
<figcaption>第一台设备显示在另一台设备上打开</figcaption>
</figure>

再开第二个设备已经跳转到第二个蓝色的VC了，而且第一个标签的文字已经改成了`由VC1跳转到第二个VC2`，说明活动传输成功。

<figure>
<img src="{{ site.url }}/images/addhandoff/secondiPhone.jpg" alt="secondiPhone">
<figcaption>第二台设备已经被打开，继续活动</figcaption>
</figure>

同理，把第一台设备锁屏，还是可以看到我们的icon，然后打开，蓝色界面的第二个标签也会发生改变，变成了`程序在另一台设备上打开`。而第一台设备上的第一个标签已经改成了跳转到VC1.

<figure>
<img src="{{ site.url }}/images/addhandoff/openfirstiphonebyhandoff.PNG" alt="openfirstiphonebyhandoff">
<figcaption>通过handoff打开VC1</figcaption>
</figure>

## 总结 ##
由于这是新系统的特性，手中同时有两台以上苹果设备的同学也还不是很多，因此这个新技能可能会默默无闻一段儿时间，但是当明年appppppppppl watch出来之后，handoff会更多的应用起来，毕竟手表要和一台iPhone搭配来使用的。

> Stay Hungry