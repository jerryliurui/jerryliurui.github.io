---
layout: post
title: "iOS12 SiriShortcut适配开发总结"
description: "iOS12 SiriShortcut"
category: iOS Programming
tags: [iOS12, Siri, Shortcut, Notification]
modified: 2018-11-11
imagefeature: bg/sirishortcutbg.png
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

#### **0.前言**
今年有幸和同事一起参加了WWDC2018大会，于是在回来之后，自然而然的需要进行小量的汇报工作和经历分享。我记得在我的分享主题中，着重的介绍了其中我认为比较有用的且最可能需要适配的两个功能`Siri Shortcut`和`Group Notification`。

在分享之后，iOS12的适配工作也开始了，于是很自然的这个活儿到了我的手里=。= 从现在来看，这真的是一段弥足珍贵且十分感人的过程。终于可以坐下来好好总结一下这段时间的适配工作了。

#### **1.Group Notification**
> 理想很美好，现实很残酷

分组通知讲道理是我个人非常喜欢的一个更新，终于不用再滑那一面一面的通知了，`But`很遗憾，我们还是能够通过某种手段来实现不分组一条一条展示的样子。。。在适配的时候，我也曾问过组织，这个分组，是否有限制？或者是否有一个模糊的限制？答案也是含糊的，“推荐”使用你的app中核心的通知分类来进行分组。也就是现在当`iOS12`正式出来之后，我们看到的某乎啊等一些的app，我们会惊喜的发现，我擦勒，竟然是：`‘One Notification,One Group’`.讲道理内心是拒绝的，但是换个角度思考，显然这也是产品层面的压力导致的钻篓子，打擦边球了。

> 实现Group Notification

说起实现，客户端本身一般是没有工作量的，更多的是app的push后台来进行相应的开发和适配。原因在于如何分组的机制，是通过增加三个新`key`来实现。分别是:
* thread-id 标识分组id，这个字段用来系统识别分组来使用，例如“体育”“娱乐”等
* summary-arg 标识相关者，系统识别来显示通知下方信息条，例如：还有来自“梅西”的通知
* summary-arg-count 标识相关者所关联的通知数量，例如：还有十个来自“梅西”通知

{% highlight css %}
Playload 格式：
{
"content-detail": "",
"attachment": "",
"aps": {
"badge": 1,
"alert": {
"title": "梅西",
"body": "伊利特约：截至本月24日，平昌冬奥售出55.5万张门票，销售率为52%扭转颓势，其中短道花滑部分门票基本售罄。",
"summary-arg": "梅西",
"summary-arg-count": 5
},
"sound": "alert.wav",
"boardid": "",
"msgId": "",
"category": "",
"mutable-content": "1",
"thread-id": "notifications-team"
}
}

所添加位置如上图所示，位置错误不会生效

PS 系统会优先按照thread-id来分组，然后合并所有分组内的summary-arg 和 summary-arg-count
例如：还有10个来自“科比和C罗”的通知
{% endhighlight %}

#### **2.Siri Shortcut**

> Siri更懂手机前的你,手机后是一脸懵逼的我

这个功能大概是`CarPlay`支持高德等第三方导航之外收获掌声最多的一个新功能了吧。早前苹果收购了`workflow`就或多或少的预感到`Siri+捷径`是一条很炫酷的路线。

对于我来说也是第一次接触`SiriKit`的相关开发，之前并没有接触过，不过其实并不影响适配任务，大部分反正也都是在摸索，坑是挺多的，但是结果还算满意。

##### (1)了解Siri Shortcut的整个行为
我们需要去创造一个捷径，那首先我们就要定义这个捷径的含义。

因为这个新功能是让用户能够通过`Siri`智能的猜测出下一步的行为并给与提示，或者一句话做完一件曾经需要好几个步骤的事情。而在我需要适配的app内，由于客户端目前的功能已经十分的繁多，因此为一些热门功能，入口又比较深的功能定义捷径就显得很有必要了，而且使用场景也非常的契合。想想一下用户可以通过唤醒`Siri`来直接打开某些栏目，或者直接收听音频，岂不是美滋滋。

下图其实是从宏观上描述了一个捷径的整个`Create`过程
<figure>
<a href="{{ site.url }}/images/SiriShortcut/1.png"><img src="{{ site.url }}/images/SiriShortcut/1.png"></a>
</figure>

Create Shortcut所需要的媒介：
* 1.NSUserActivity
* 2.Intents
<figure>
<a href="{{ site.url }}/images/SiriShortcut/2.png"><img src="{{ site.url }}/images/SiriShortcut/2.png"></a>
</figure>

之前如果有开发过`Handoff`功能的同学一定不陌生`NSUserActivity`,通过它来实现Shortcut相对来说比较简单，对于那种需要通过打开客户端来完成后续动作和任务的捷径来说很合适。而`Intents`苹果推荐的更多的是不需要打开客户端的`Action`。我在这次适配的过程中，为了方便统一和维护，在适配的三个捷径的实现方式中，都使用到的是`Intents`来实现，因此后文主要介绍这个方式的捷径设计和实现。

##### (2)定义Intent
创建Intent工程文件：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/4.png"><img src="{{ site.url }}/images/SiriShortcut/4.png"></a>
</figure>

在下图中可以看到，已经内置了一部分现成的Intent来供我们使用，这次在demo中准备使用`Play Media Intent`来实现`Siri`唤起客户端音频这个功能。
<figure>
<a href="{{ site.url }}/images/SiriShortcut/5.png"><img src="{{ site.url }}/images/SiriShortcut/5.png"></a>
</figure>

除了使用`Custom System Intent`之外，我们还可以自定义自己需要的纯正`Custom Intent`。如图我创建了一个打开弹窗的意图：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/6.png"><img src="{{ site.url }}/images/SiriShortcut/6.png"></a>
</figure>

到这里，定义Intent客户端文件的工作就完成了，准备好告诉`Siri`了。

在`demo`中我定义了一个基础模型，来和未来的业解耦`SiriShortcutIntentModel`,只包含两个必备的属性:

{% highlight css %}
@interface SiriShortcutIntentModel : NSObject

/**
Intent title
*/
@property (nonatomic, copy) NSString *intentTitle;

/**
Intent SuggestedInvocationPhrase 推荐短语
*/
@property (nonatomic, copy) NSString *intentSuggestedInvocationPhrase;

@end
{% endhighlight %}

播放音频的`SiriShortcutMediaItemModel`model:

{% highlight css %}
@interface SiriShortcutMediaItemModel : SiriShortcutIntentModel

/*
媒体标题
*/
@property (nonatomic, copy) NSString *mediaTitle;

/*
媒体的封面图URL
*/
@property (nonatomic, copy) NSString *mediaArtworkUrl;

/*
媒体Identifier
*/
@property (nonatomic, copy) NSString *mediaIdentifier;

@end
{% endhighlight %}

##### (3)Donate Intent
苹果这里用了一个很生动的词儿`Donate`,相当于用户在触发了上文我们定义的意图的时候，我们来告诉`Siri`用户触发了这个意图是什么样子的，也就是这个意图的参数是什么，`Siri`会根据你的`Donate`信息来正确的判断出用户意图，来充分的预测下一次想要进行这个意图的时间，`Donate`越充分，这个预测模型就越强壮，当然这里也不用担心用户隐私数据的问题，苹果可反复的在承诺这是一个本地用户模型的创建和模拟。

当然这个`Donate`的时机也很重要，用苹果的话叫做真正要告诉`Siri`的时候再告诉，不要滥用。虽然“滥用”看上去貌似没有什么致命的或者非法的影响=。=

`Demo`中简单的将`Donate`时机放在了程序启动的时候。

###### (3.1)贡献Intent的方法形如：

{% highlight css %}
+ (void)donateTrackNewsIntentWith:(NSArray<SiriShortcutMediaItemModel *> *)tracks {}
{% endhighlight %}

###### (3.2)创建`INPlayMediaIntent`：

{% highlight css %}
INPlayMediaIntent *playIntent = [[INPlayMediaIntent alloc] initWithMediaItems:mediaIntents mediaContainer:container playShuffled:[NSNumber numberWithBool:NO] playbackRepeatMode:INPlaybackRepeatModeAll resumePlayback:@(0)];
{% endhighlight %}

`initWithMediaItems`可以理解专辑内的歌曲们，`mediaContainer`理解为专辑名称。

###### (3.3)然后实现`Donate`系统方法：

{% highlight css %}
INInteraction *interaction = [[INInteraction alloc] initWithIntent:playIntent response:nil];
if (interaction) {
[interaction donateInteractionWithCompletion:^(NSError * _Nullable error) {
if (error) {
}
}];
};
{% endhighlight %}

到这里我们理论上就已经告诉系统用户这个意图了，`Siri`就会知道，哦，这个时间，用户播放了XXX歌单里边的XXX歌曲们了。


##### (4)Handle Intent
贡献上去的`Intent`看似是无形的，对于我们开发阶段来说需要大概率的看到自己贡献出去的意图，`Siri`会如何的展现给用户，因此这里可以通过下边的设置来达到目的 `手机设置`-`开发者`中打开如图几个选项：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/7.png"><img src="{{ site.url }}/images/SiriShortcut/7.png"></a>
</figure>

这么一顿操作之后，就可以在`锁屏`或者`spotlight`里边轻松的发现我们贡献过的`Intent`了，从而快速的联调和开发。
<figure>
<a href="{{ site.url }}/images/SiriShortcut/8.png"><img src="{{ site.url }}/images/SiriShortcut/8.png"></a>
</figure>

当然这个时候点击播放按钮或者整条的`Siri`推荐都是直接打开客户端的，并且是进入到首页什么事儿都不会做的，那是因为还没有去`Handle Intent`。这里就需要我们自定义的`CustomIntentUI`和`CustomIntent`了。

###### (4.1)新建两个Target：

<figure>
<a href="{{ site.url }}/images/SiriShortcut/9.png"><img src="{{ site.url }}/images/SiriShortcut/9.png"></a>
</figure>

* CustomIntentUI：负责自定义的Siri反馈UI显示的
* CustomIntent：负责自定义的Intent Handle

###### (4.2)Custom Intent：

在CustomIntent中，需要实现的是`INPlayMediaIntentHandling`协议
当然不同的内置`Intent`是需要实现不同的协议的，当我们新建一个`Custom Intent`模板自带的就是信息的内置`Intent`以及他的协议：

{% highlight css %}
- (void)handlePlayMedia:(INPlayMediaIntent *)intent
completion:(void (^)(INPlayMediaIntentResponse *response))completion NS_SWIFT_NAME(handle(intent:completion:));
{% endhighlight %}

回调返回：

{% highlight css %}
INPlayMediaIntentResponse *response = [[INPlayMediaIntentResponse alloc] initWithCode:INPlayMediaIntentResponseCodeHandleInApp userActivity:nil];
completion(response);
{% endhighlight %}

这里使用的是需要在主客户端处理，因为一定的客观原因，实际工作工程暂时还没有`sharegroup`的内容，因此请求网络、播放音频等操作，还是要交给主客户端，如果你的app这方面很成熟了，就可以不这么做了。

由于我们需要主客户端来处理`Intent`的相应，因此在主客户端的`App Delegate`中还需要额外的操作，实现下面的这个代理方法，否则是无法正确处理的：

{% highlight css %}
- (void)application:(UIApplication *)application handleIntent:(INIntent *)intent completionHandler:(void (^)(INIntentResponse *intentResponse))completionHandler;
{% endhighlight %}

在这个方法中，我们可以进行`INPlayMediaIntent`解析，并进行网络请求来播放最新一期的音频等，最后在回调中记得告诉Siri处理成功与否：

{% highlight css %}
INPlayMediaIntentResponse *successResponse = [[INPlayMediaIntentResponse alloc] initWithCode:INPlayMediaIntentResponseCodeSuccess userActivity:nil];
completionHandler(successResponse);
{% endhighlight %}

###### (4.3)Custom Intent UI：

> Prepare your view controller for the interaction to handle.

到这里，完整的`INPlayMediaIntent`创建和反馈基本上都做好了，剩下的就是自定义的UI了，默认如果我们不新建`Custom Intent UI`的话，系统会给一个默认的信息面板给用户一个应用icon+Title+subTitle，组合方式根据`Intent`参数来，很灵活。主要的自定义UI的代码写在这里：

{% highlight css %}
- (void)configureViewForParameters:(NSSet <INParameter *> *)parameters ofInteraction:(INInteraction *)interaction interactiveBehavior:(INUIInteractiveBehavior)interactiveBehavior context:(INUIHostedViewContext)context completion:(void (^)(BOOL success, NSSet <INParameter *> *configuredParameters, CGSize desiredSize))completion API_AVAILABLE(ios(11.0));
{% endhighlight %}

生命周期在整个`Intent`响应期间，因此会多次调用上面这个方法，我们可以根据给的当前状态来配置相应的UI。状态的获取:`interaction.intentHandlingStatus`。最后回调中配置每一次状态的UI高度：

{% highlight css %}
if (completion) {
completion(YES, parameters, CGSizeMake([self extensionContext].hostedViewMaximumAllowedSize.width, 80));
}
{% endhighlight %}

###### (4.4)Bug Reporter 1：
这里顺带提到了一个已知的问题，已经提交了Radar，编号：44375523，问题描述:

{% highlight css %}
Summary:
CutsomIntentUI can not receive intentHandlingStatusSuccess status when play mediaIntent via SiriUI.
But It is weired when I triggle playing media intent via spotlight, my CutsomIntentUI can receive intentHandlingStatusSuccess after I click play button.
{% endhighlight %}

概括来说就是当使用`Siri`来唤起UI的时候，会收不到`intentHandlingStatusSuccess`状态=。=
这样的问题就是会造成不同场景下`Custom UI`反应不一致，截止到目前来看，新的Beta SDK依然没有解决掉这个问题。

#### **3.新组件**

##### (1)：INUIAddVoiceShortcutButton

这是一个船新控件，绑定`Intent`可以直接在点击中出现添加`ShortCut`的组件，由于是苹果自己的控件，因此很推荐使用这个按钮。

###### (1.1)创建INUIAddVoiceShortcutButton

{% highlight css %}
- (INUIAddVoiceShortcutButton *)addToSiriBtn  API_AVAILABLE(ios(12.0)){
if (!_addToSiriBtn) {
_addToSiriBtn = [[INUIAddVoiceShortcutButton alloc] initWithStyle:INUIAddVoiceShortcutButtonStyleBlack];
INIntent *intentItem = XXX;
INShortcut *shortCut = [[INShortcut alloc] initWithIntent:intentItem];
_addToSiriBtn.delegate = self;
_addToSiriBtn.translatesAutoresizingMaskIntoConstraints = NO;
[_addToSiriBtn setShortcut:shortCut];
}

return _addToSiriBtn;
}
{% endhighlight %}

样式有四种：

{% highlight css %}
typedef NS_ENUM(NSUInteger, INUIAddVoiceShortcutButtonStyle) {
INUIAddVoiceShortcutButtonStyleWhite = 0,
INUIAddVoiceShortcutButtonStyleWhiteOutline,
INUIAddVoiceShortcutButtonStyleBlack,
INUIAddVoiceShortcutButtonStyleBlackOutline
} API_AVAILABLE(ios(12.0)) API_UNAVAILABLE(watchos, macosx, tvos);
{% endhighlight %}

demo中有罗列，只管看上去就是下图的样子，第一个没有边框，和背景色白色重叠，最后一个看不到边框是内部的黑色和边框视觉上很难分清：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/10.png"><img src="{{ site.url }}/images/SiriShortcut/10.png"></a>
</figure>

###### (1.2)实现INUIAddVoiceShortcutButtonDelegate

协议可以做的事情其实就两种：
* present Add Voice ShortcutVC
* present Edit Voice ShortcutVC

{% highlight css %}
- (void)presentAddVoiceShortcutViewController:(nonnull INUIAddVoiceShortcutViewController *)addVoiceShortcutViewController forAddVoiceShortcutButton:(nonnull INUIAddVoiceShortcutButton *)addVoiceShortcutButton  API_AVAILABLE(ios(12.0)){
if (addVoiceShortcutButton && addVoiceShortcutButton.shortcut && addVoiceShortcutViewController) {
addVoiceShortcutViewController.delegate = self;
[GetRootNavigation() presentViewController:addVoiceShortcutViewController animated:YES completion:nil];
}
}

- (void)presentEditVoiceShortcutViewController:(nonnull INUIEditVoiceShortcutViewController *)editVoiceShortcutViewController forAddVoiceShortcutButton:(nonnull INUIAddVoiceShortcutButton *)addVoiceShortcutButton  API_AVAILABLE(ios(12.0)){
if (addVoiceShortcutButton && addVoiceShortcutButton.shortcut && editVoiceShortcutViewController) {
editVoiceShortcutViewController.delegate = self;
[GetRootNavigation() presentViewController:editVoiceShortcutViewController animated:YES completion:nil];
}
}
{% endhighlight %}

###### (1.3)本地化

在自己工程内本地化文件中相应的添加对应字符串就可以了。苹果给的本地化推荐字符串如下：

{% highlight css %}
ar:
"Add to Siri" = "إضافة إلى Siri";
"Added to Siri" = "تمت الإضافة إلى Siri";

ca:
"Add to Siri" = "Afegir a Siri";
"Added to Siri" = "Afegit a Siri";

cs:
"Add to Siri" = "Přidat do Siri";
"Added to Siri" = "Přidáno do Siri";

da:
"Add to Siri" = "Føj til Siri";
"Added to Siri" = "Føjet til Siri";

de:
"Add to Siri" = "Zu Siri hinzufügen";
"Added to Siri" = "Zu Siri hinzugefügt";

el:
"Add to Siri" = "Προσθήκη στο Siri";
"Added to Siri" = "Προστέθηκε στο Siri";

en:
"Add to Siri" = "Add to Siri";
"Added to Siri" = "Added to Siri";

en_AU:
"Add to Siri" = "Add to Siri";
"Added to Siri" = "Added to Siri";

en_GB:
"Add to Siri" = "Add to Siri";
"Added to Siri" = "Added to Siri";

es:
"Add to Siri" = "Añadir a Siri";
"Added to Siri" = "Añadido a Siri";

es_419
"Add to Siri" = "Agregar a Siri";
"Added to Siri" = "Se agregó a Siri";

fi:
"Add to Siri" = "Lisää Siriin";
"Added to Siri" = "Lisätty Siriin";

fr:
"Add to Siri" = "Ajouter à Siri";
"Added to Siri" = "Ajouté à Siri";

fr_CA:
"Add to Siri" = "Ajouter à Siri";
"Added to Siri" = "Ajouté à Siri";

he:
"Add to Siri" = "הוסף ל-Siri";
"Added to Siri" = "נוסף ל-Siri";

hi:
"Add to Siri" = "Siri में जोड़ें";
"Added to Siri" = "Siri में जोड़ा गया";

hr:
"Add to Siri" = "Dodaj u Siri";
"Added to Siri" = "Dodano u Siri";

hu:
"Add to Siri" = "Hozzáadás a Sirihez";
"Added to Siri" = "Hozzáadva a Sirihez";

id:
"Add to Siri" = "Tambahkan ke Siri";
"Added to Siri" = "Ditambahkan ke Siri";

it:
"Add to Siri" = "Aggiungi su Siri";
"Added to Siri" = "Aggiunto su Siri";

ja:
"Add to Siri" = "Siriに追加";
"Added to Siri" = "Siriに追加済み";

ko:
"Add to Siri" = "Siri에 추가";
"Added to Siri" = "Siri에 추가됨";

ms:
"Add to Siri" = "Tambah ke Siri";
"Added to Siri" = "Ditambah ke Siri";

nl:
"Add to Siri" = "Voeg toe aan Siri";
"Added to Siri" = "Toegevoegd aan Siri";

no:
"Add to Siri" = "Legg til i Siri";
"Added to Siri" = "Lagt til i Siri";

pl:
"Add to Siri" = "Dodaj do Siri";
"Added to Siri" = "Dodano do Siri";

pt:
"Add to Siri" = "Adicionar à Siri";
"Added to Siri" = "Adicionado à Siri";

pt_PT:
"Add to Siri" = "Adicionar a Siri";
"Added to Siri" = "Adicionado a Siri";

ro:
"Add to Siri" = "Adăugați la Siri";
"Added to Siri" = "Adăugată la Siri";

ru:
"Add to Siri" = "Добавить для Siri";
"Added to Siri" = "Добавлено для Siri";

sk:
"Add to Siri" = "Pridať do Siri";
"Added to Siri" = "Pridané do Siri";

sv:
"Add to Siri" = "Lägg till i Siri";
"Added to Siri" = "Lades till i Siri";

th:
"Add to Siri" = "เพิ่มไปยัง Siri";
"Added to Siri" = "เพิ่มไปยัง Siri แล้ว";

tr:
"Add to Siri" = "Siri’ye Ekle";
"Added to Siri" = "Siri’ye Eklendi";

uk:
"Add to Siri" = "Додати до Siri";
"Added to Siri" = "Додано до Siri";

vi:
"Add to Siri" = "Thêm vào Siri";
"Added to Siri" = "Đã thêm vào Siri";

zh_CN:
"Add to Siri" = "添加到 Siri";
"Added to Siri" = "已添加到 Siri";

zh_HK:
"Add to Siri" = "加至 Siri";
"Added to Siri" = "已加至 Siri";

zh_TW:
"Add to Siri" = "加入 Siri";
"Added to Siri" = "已加入 Siri";
{% endhighlight %}

##### (2)：INUIAddVoiceShortcutViewController
这个新出的VC和在`iPhone-设置-Siri`中添加`Shortcut`的页面一致，辅助客户端可以在内部就可以唤起，并直接添加相关的语音捷径，不需要用户再跳去设置页面，这样用户就可以在感兴趣的客户端内容中方便的添加。

这里要注意的是一定要实现`Delegate`否则添加完语音，无论是`Done`还是`Cancel`都会崩溃：

{% highlight css %}
/*!
完成添加
*/
- (void)addVoiceShortcutViewController:(INUIAddVoiceShortcutViewController *)controller didFinishWithVoiceShortcut:(nullable INVoiceShortcut *)voiceShortcut error:(nullable NSError *)error;

/*!
取消添加
*/
- (void)addVoiceShortcutViewControllerDidCancel:(INUIAddVoiceShortcutViewController *)controller;
{% endhighlight %}

而且这个内置页是不会随着用户的交互自己消失的，需要自己在代理回调中`dismiss`掉。

##### (3)：INUIEditVoiceShortcutViewController
编辑VC和添加VC很像，不同的是实现的代理不同，需要注意一下。

我们以点击第二个`Add To Siri`按钮为例：
点击添加：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/11.png"><img src="{{ site.url }}/images/SiriShortcut/11.png"></a>
</figure>

添加完成之后按钮变化：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/12.png"><img src="{{ site.url }}/images/SiriShortcut/12.png"></a>
</figure>

点击添加过的按钮，出编辑VC:
<figure>
<a href="{{ site.url }}/images/SiriShortcut/13.png"><img src="{{ site.url }}/images/SiriShortcut/13.png"></a>
</figure>


#### **4.支持Siri Watch Face**
这就需要另一个`Shortcut`来实现了：`INRelevantShortcut`
我们在贡献这个`Shortcut`的时候可以给系统参考的东西比较丰富了，我们可以创建不同的`Provider`，例如地点的、时间的甚至是日常活动的，这个东西理解起来比较抽象，或者说比较机器。

* INDateRelevanceProvider 用户每周四都会买一本体坛周刊，这个周四，就可以作为一个维度来给siri来预测
* INLocationRelevanceProvider 用户每次到北京，都是来出差的，这种case就可以将北京传给系统
* INDailyRoutineRelevanceProvider 这个我觉得是应用场景最多的了一个了，我在工程适配的时候使用的是`INDailyRoutineSituationMorning`注意这里的早中晚啊并不是时区上的早中晚，而是针对这个手机前的人来讲，比如我可能每天十点半才起床，那十点半就是我的`INDailyRoutineSituationMorning`

我们还可以定制`Siri watch face`的样式，这个和`Custom Intent UI`很类似，如果我们不设置的话，系统会给我们一个模板来展示。

{% highlight css %}
//自定义表盘显示内容
INDefaultCardTemplate *cardTemplate = [[INDefaultCardTemplate alloc] initWithTitle:kSiriRelevantShortcutCardTemplateTitle];
cardTemplate.subtitle = kSiriRelevantShortcutCardTemplateSubTitle;
cardTemplate.image = [INImage imageNamed:@"sirishortcut_relax_artwork"];
[relevantShortcut setWatchTemplate:cardTemplate];
{% endhighlight %}

最后设置到`INRelevantShortcutStore` 万事大吉：

{% highlight css %}
[[INRelevantShortcutStore defaultStore] setRelevantShortcuts:@[relevantShortcut] completionHandler:^(NSError * _Nullable error) {}];
{% endhighlight %}

#### **5.其他比较有用的Tips**

##### (1)：获取当前App添加的所有Siri 捷径

`INVoiceShortcutCenter`提供了一个方法给我们来获取当前`App`一共添加了多少条`Siri`语音捷径:

{% highlight css %}
[[INVoiceShortcutCenter sharedCenter] getAllVoiceShortcutsWithCompletion:^(NSArray<INVoiceShortcut *> * _Nullable voiceShortcuts, NSError * _Nullable error) {
if(handler) {
handler(voiceShortcuts,error);
}
}];
{% endhighlight %}

`handler` :

{% highlight css %}
typedef void(^NTESNBGetAllVoiceShortCutCompletionHandler)(NSArray<INVoiceShortcut *> * _Nullable voiceShortcuts,NSError * _Nullable error);
{% endhighlight %}

我们通过这个方法可以间接的获取我们某一个`Intent`的语音捷径条数了,或者判断某一个`Intent`是否被用户添加过相关的语音捷径：

{% highlight css %}
for (INVoiceShortcut *voiceShortcut in voiceShortcuts) {
INIntent *intent = voiceShortcut.shortcut.intent;
if([intent isKindOfClass:[XXXXIntent class]]) {
completionHandler(YES);
return;
}
}
{% endhighlight %}

##### (2)：本地化

适配版本的前几个版本提交审核前的打包上传这一步做完之后，总是会收到一封邮件，大概意思就是我们所定义的`Custom Intent`没有进行本地化，虽然不会影响暂时的打包和提交审核，但是也是不推荐的，需要我们去做：

{% highlight css %}
Dear Developer,
We identified one or more issues with a recent delivery for your app, "XXXX". Your delivery was successful, but you may wish to correct the following issues in your next delivery:
Invalid Siri Support - Localized title for custom intent: "XXX" not found for locale: zh-hant
Invalid Siri Support - Localized title for custom intent: "XXX" not found for locale: zh-hans
...
After you’ve corrected the issues, you can use Xcode or Application Loader to upload a new binary to iTunes Connect.
Best regards,
The App Store Team
{% endhighlight %}

这玩意研究半天，实验了几次打包才没有了这种邮件警告=。=，具体的做法是在右边编辑面板这里选择本地化按钮：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/14.png"><img src="{{ site.url }}/images/SiriShortcut/14.png"></a>
</figure>

然后选择你的工程内的主语言：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/15.png"><img src="{{ site.url }}/images/SiriShortcut/15.png"></a>
</figure>

然后在右边面板内继续勾上工程所需要本地化的语言，比如粤语等，最后我们会看到原来的`intentdefinition`文件左边多了一个箭头，可以打开看到增加的本地化语言：

{% highlight css %}
"NWKE91" = "看记录看记录";
"ajUMDz" = "哈哈哈啊哈";
{% endhighlight %}

左边我的理解是一个唯一标示吧，右边是相应语言的本地化文字。

##### (3): Watch新icon的添加

最近的几次提交会收到一封邮件，大致上是说`Watch App`缺少`watch series4`的icon，我们缺少的是这两个
* 50 * 50
* 108 * 108

##### (4)小插曲:尝试修复Xcode10打包出来的在iOS9.0-9.2崩溃的问题：
核心方法：

> ln -s  Xcode9的ibtoold路径    Xcode10的ibtoold路径

0.需要同时安装Xcode9和Xcode10.

1.定位到Xcode10 ibtoold 路径下 把这个文件随便改个名字例如
ibtoold.bat

2.Xcode10 ibtoold 路径：/Users/JerryLiu/Downloads/Xcode.app/Contents/Developer/usr/bin/ibtoold

3.Xcode9 ibtoold 路径:/Users/JerryLiu/Downloads/Xcode\2.app/Contents/Developer/usr/bin/ibtoold

4.执行：`ln -s  Xcode9的ibtoold路径    Xcode10的ibtoold路径`
ln -s /Users/JerryLiu/Downloads/Xcode\2.app/Contents/Developer/usr/bin/ibtoold /Users/JerryLiu/Downloads/Xcode.app/Contents/Developer/usr/bin/ibtoold

5.如果代表正确设置了：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/16.png"><img src="{{ site.url }}/images/SiriShortcut/16.png"></a>
</figure>

6.注意的是，无法将Xcode10 关于iOS12、watchOS5等新SDK的UI(通过storyboard添加的UI:例如nowplayingView)打包成功，需要舍弃。
会报如下错误:
<figure>
<a href="{{ site.url }}/images/SiriShortcut/17.png"><img src="{{ site.url }}/images/SiriShortcut/17.png"></a>
</figure>

#### **6.小结**

其实参与过适配或者，新`Feature`调研开发的同学都应该知道这条路就是一条很寂寞的道路，前期资源太少，而恰恰这个时候苹果爸爸那里的工具又不是很稳定，从下面图可以看得出来，`iOS12`经历了多少磨难方才和大家见面：
<figure>
<a href="{{ site.url }}/images/SiriShortcut/18.png"><img src="{{ site.url }}/images/SiriShortcut/18.png"></a>
</figure>

别看Xcode10 才出到beta 6，但是讲道理尽管是到了`GM`版本，依然存在问题是不争的事实，甚至是包括致命的`iOS9`崩溃问题，要知道在国内，低版本不升级的`iOS`系统还是很多的，根本就不可能舍弃这一部分的用户。

另一方面，诸如`Siri Shortcut`的新功能的适配仿佛大家都比较滞后，或者说其实很多人遇到了和我一样的问题，只是没有听到过或者查到过，我印象中比较深的是，第二天`iOS12`就要释放了，这个时候我却发现了一个bug，并提交了Radar,那这么说，我遇到的已经算比较晚的了，竟然没有被修复或者优化。

这是以上种种，都不能去忽视`Siri`的越来越强大，我也相信随着真正的用户角度的`Intent`越来越多，使用`Siri`来方便自己生活的人会越来越多，App也会更加的强壮。💪 就这么多吧，应该还会有一些适配的细节忘记了没有说，如果想起来了，再回来补充，也祝大家适配顺利~早日上线！
