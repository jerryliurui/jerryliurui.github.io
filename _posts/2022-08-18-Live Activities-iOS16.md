---
layout: post
title: "WWDC2022-iOS16 Live Activities 锁屏常驻小组件"
description: "An iOS16 Live Activities Demo"
category: WWDC
tags: [iOS]
modified: 2022-08-18
imagefeature: LiveActivities/LiveActivitiesBackground.png
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

`Live Activities`这个新Feature 可以说是我在看完整个WWDC新功能预览中，觉得最香的一个功能了，当然其他的功能工作当中涉及的不多 =。= ，总的来说，这个功能对于已经适配了Widget的开发者来说很熟悉，上手会非常的快，甚至在看完文档之后就差不多可以写出一个可以运行的Demo了。

[iOS16官方预览](https://www.apple.com/ios/ios-16-preview/)

7.28号官方终于是发布了相关的文档，开发者终于可以在iOS16 beta4+开发和适配这个功能，本文大部分内容来源于官方的文档

[Live Activities官方文档](https://developer.apple.com/documentation/activitykit)

在此基础上实现了一个单Live 实例的Demo 希望能够帮助到大家

>
> 1.什么是Live Activities？
>
> 2.结合Demo聊聊如何实现一个2022年世界杯比赛Live Activities
>
> 3.Live Activities的一些限制
>
> 4.目前Beta遇到的一些问题

### 1.Live Activities 介绍

`Live Activities`使得用户在锁屏状态下即可看到你的App当前正在进行的某一项工作的进展，不需要解锁屏幕，不需要进入App，再一次的拉进了用户和App的距离。

从官方给出的一些Demo截图尝试猜测这个功能非常适用于一些场景:

>
> 1.比赛直播类App，实时的更新用户关心的比赛
>
> 2.外卖、打车类App，实时的更新外卖骑手进度、食物制作进度、司机到达情况
>
> 3.上传、下载等任务的实时更新显示
>
> 4.重大事件的持续跟踪报道，专题性质的新闻更新，24小时热点新闻轮播

整体的运作如图，需要用到我们的老朋友WidgetKit:

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.39.12.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.39.12.png"></a>
</figure>

### 2.Live Activities的限制

本来想着这一部分放在最后，但是感觉这些限制还是放在前边方便查找一些，方便大家在设计自己的实时小组件前就在脑海中有一些条条框框~ 这部分限制基于`iOS16 Beta6`

>
> 1. 开放版本:`Live Activities`和`ActivityKit`不会在初始的iOS16版本中更新，目前文档说的是2022年晚些时候，一旦放出，开发者可以提交响应分支的App~
>
> 2. 仅支持iPhone
>
> 3. 理论上我们的Live Activities小组件出现在锁屏之后 会存在8小时，除非用户主动结束它，而系统其实会额外延长最多4小时~因此一个Live Activities小组件最长可以在用户的锁屏上出现`12`小时。
>
> 4. 每一个实时小组件都无法自主进行网络请求和位置更新
>
> 5. 每一次更新的数据不能超过`4KB`
> 6. 仅支持SwiftUI来构建Live Activities UI
> 7. 最大高度160 Point，超过这部分会被系统裁切
> 8. 动画会被系统过滤，例如`withAnimation(::)`等Api是无法生效的
> 9. 每一个App可以开启多个Live Activities，每个设备可以同时开启多个App的Live Activities，一个用户同一时间可能会达到一个上限而开启失败我们的Live Activities，因此在开启、更新、结束每一个Activities时，检查功能是否可用非常的重要

### 3.添加Live Activities

如上边的整体运作图可以看出，描述整个锁屏Live小组件的代码需要写在WidgetKit中，尽管如此，整个Live Activities并不能享受到Widget的机制，比如时间线更新等，而代替时间线更新数据的是使用崭新的ActivityKit框架和远程推送来更新我们的数据。

官方这里是建议Live Activities 你都加上了，顺手把Widget也给加上呗，尤其是同为新出的锁屏小组件~

#### 3.1 添加Widget Extension

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 11.48.37.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 11.48.37.png"></a>
</figure>

#### 3.2 Info Plist新增

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 11.49.37.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 11.49.37.png"></a>
</figure>

#### 3.3 自定义活动参数

对于我们的世界杯实时小组件，我们需要定义Activity活动属性集合，和每次更新的载体对象。

```swift
import SwiftUI
import WidgetKit
import ActivityKit

struct FIFAActivityAttributes: ActivityAttributes {
    public typealias FIFAGameStatus = ContentState
  
    public struct ContentState: Codable, Hashable {
        var estimatedEndTime: Date
        var homeScore: Int
        var guestScore: Int
        var halfInfo:String
    }
  
    var buildId: String
    var gameInfo: String
    var gameTitle: String
    var home: FIFATeam
    var guest: FIFATeam
}
```

比如用户选择一场比赛，这里基础数据是两只球队(FIFATeam)，比赛的一些基本信息，而每次更新小组件的数据模型，则定义在`ContentSatte`中，例如比赛结束时间、主队得分、客队得分、比赛实时信息(上半场还是下半场还是结束)。

```swift
public class FIFATeam : Codable, Hashable {
    public static func == (lhs: FIFATeam, rhs: FIFATeam) -> Bool {
        return lhs.teamId == rhs.teamId
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(teamId)
        hasher.combine(teamLogo)
        hasher.combine(teamName)
        hasher.combine(flag)
    }
    
    public var teamName: String = ""
    public var teamLogo: Data
    public var teamId: String = ""
    public var flag: String = ""
    
    init(teamName: String, teamLogo: Data, teamId: String, flag: String) {
        self.teamName = teamName
        self.teamLogo = teamLogo
        self.teamId = teamId
        self.flag = flag
    }
}
```

球队基本信息本次demo暂时显示的是球队名字、国旗、队伍ID等，方便我们来展示和现实比赛~

#### 3.4 WidgetBundle

如果本身我们的App已经实现了之前的Widget 桌面小组件或者锁屏小组件，我们使用`WidgetBundle`来绑定

```swift
@main
struct DemoWidgets: WidgetBundle {
   var body: some Widget {
       WidgetDemo()
       UploadLiveActivitiesWidget()//Live Activities 小组件
   }
}
```

#### 3.5 创建UI

下边就是在UploadLiveActivitiesWidget 当中绘制我们的UI了，和传统意义上的Widget很类似，只不过之前我们是通过`IntentConfiguration`来定义WidgetUI， 而现在我们使用`ActivityConfiguration`来定义Live Activities的Widge

```swift
struct UploadLiveActivitiesWidget: Widget {
  let kind: String = "UploadLiveActivitiesWidget"
  
  var body: some WidgetConfiguration {
    ActivityConfiguration(attributesType: FIFAActivityAttributes.self) { context in
        FIFAGameView(attribute: context.attributes, state: context.state)
    }
  }
}
```

`FIFAGameView`则是一场比赛的SwiftUI View，这里我们需要承接系统的Attributes和state，来获取所需要的数据。

```swift
struct FIFAGameView: View {
    @State var attribute: FIFAActivityAttributes
    @State var state: FIFAActivityAttributes.ContentState
    
    var body: some View {
        VStack {
            FIFAGameTopView(attribute: attribute, state: state)
    
            HStack(alignment: .bottom) {
                VStack(alignment: .leading) {
                    Text(attribute.gameTitle)
                    Text(attribute.gameInfo)
                }
                
                Spacer()
                
                Image("news")
                    .resizable()
                    .frame(width: 25, height: 25)
            }
        }
        .padding(.all)
    }
}
```

通过Xcode Preview来看一下显示效果:

```swift
struct FIFAGameView_Preview: PreviewProvider {
    static var previews: some View {
        let homeTeam = FIFATeam(teamName: "Spain", teamLogo: Data(), teamId: "spain", flag: "spain")
        let guestTeam = FIFATeam(teamName: "France", teamLogo: Data(), teamId: "france", flag: "france")
        let attribute = FIFAActivityAttributes(buildId: "0001", gameInfo: "小组赛第三轮，强强对话", gameTitle: "世界杯F组", home:homeTeam, guest: guestTeam)
        
        let startState = FIFAActivityAttributes.ContentState(estimatedEndTime: Date().addingTimeInterval(90 * 60), homeScore: 0, guestScore: 0, halfInfo: "上半场")
        FIFAGameView(attribute: attribute, state: startState)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
```

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 13.55.21.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 13.55.21.png"></a>
</figure>

这里提一句我遇到的一个问题，就是Widget Extension中的Xcode Preview总是会Crash，或者报错:

```
RemoteHumanReadableError: The operation couldn’t be completed. XPC error received on message reply handler

BSServiceConnectionErrorDomain (3):
==NSLocalizedFailureReason: XPC error received on message reply handler
==BSErrorCodeDescription: OperationFailed

==================================

|  MessageSendFailure: Message send failure for <ServiceMessage 2: relaunch>
```

可以尝试把Xcode的打开方式取消勾选使用Rosetta来试试，当然这个问题遇到人还挺多，但是解决方法都不太一样，这里暂时记录一下我这里遇到之后的方法(电脑是M1)

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.01.51.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.01.51.png"></a>
</figure>

说回来，系统会使用默认的白色字体和一个最适合当前用户的锁屏页面的背景颜色来展示我们的Live Activities小组件，如果想要自定义一个颜色，可以使用下面这个修饰符

```swift
activityBackgroundTint(_:)
```

### 4.实现Live Activities

#### 4.1 检查是否可用

在准备好UI之后，我们便可以尝试着通过我们的主App来开启实时小组件了。在开启之前，文档特别建议了开发者在开启之前首先需要检查一下该功能是否可用。因为当前实时小组件仅适用于iPhone，且用户是可以手动在你的App设置页面关闭该功能的

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.15.38.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.15.38.png"></a>
</figure>

```swift
guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("当前设备不可用Live Activities，用户关闭或者设备无法使用")
            return
        }
```

areActivitiesEnabled API 来同步获取当前功能是否可以使用，除此之外还可以通过:

```
activityEnablementUpdates 异步监听队列，监听功能是否可用
```

这也是上文Apple的那个Tips，这里在列举一下:

> 每一个App可以开启多个Live Activities，每个设备可以同时开启多个App的Live Activities，一个用户同一时间可能会达到一个上限而开启失败我们的Live Activities，因此在开启、更新、结束每一个Activities时，检查功能是否可用非常的重要

#### 4.2 Start the Live Activity

开启代码需要在主App内，且需要App在前台（说个题外话哦，这部分感觉Apple还是相对谨慎的开放他们的新特性的，本来看到这个新Feature的时候想着推送来开启就太棒了，但是文档确实没有提及推送来触发开启，这部分是否可以使用静默Push来实现还没有测试，如果有测试了的小伙伴可以提供一下思路~多谢~~~）

为了方便测试我们的功能，我这里是写了一个辅助类来管理ActivityKit来管理实时小组件的`LiveActivitiesTrigger`

```swift
//模拟用户选择了西班牙VS法国的小组赛(纯属demo哈)
        let homeTeam = FIFATeam(teamName: "Spain", teamLogo: Data(), teamId: "spain", flag: "spain")
        let guestTeam = FIFATeam(teamName: "France", teamLogo: Data(), teamId: "france", flag: "france")
        let attribute = FIFAActivityAttributes(buildId: "0001", gameInfo: "小组赛第三轮，强强对话", gameTitle: "世界杯F组",home: homeTeam, guest: guestTeam)
        
        let startState = FIFAActivityAttributes.ContentState(estimatedEndTime: Date().addingTimeInterval(90 * 60), homeScore: 0, guestScore: 0, halfInfo: "上半场")
        
        do {
            self.statusActivity = try Activity<FIFAActivityAttributes>.request(attributes: attribute, contentState: startState, pushType: nil)
        } catch let e {
            print("开启Live Activities 失败，原因:\(e.localizedDescription)")
        }
```

demo中创建了西班牙队和法国队，并使用我们之前定义好的自定义的`FIFAActivityAttributes`来标志正常比赛，而后我们通过创建`startState`来告诉系统具体我们动态的数据都有哪些，系统便可以知道后续更新所需要关注的内容字段了。

`request`Api 来开启实时小组件，这里注意的是PushType传递了一个nil，这告诉系统当前这个开启的Live Activity需要主App来获取数据来驱动更新，而不是远程推送，如果是远程推送的话，后边会说到哈，这里需要传入.token

#### 4.3 Update the Live Activity

不同于Start部分，Update Live Activity和后边要说的End Live Activity都不需要App在前台，可以使用[Background Tasks](https://developer.apple.com/documentation/backgroundtasks)来驱动更新

之前我们开启Activity之后，会拿到一个唯一ID的实体，我们通过调用它的Update 方法即可对他进行更新:

```swift
//模拟了主队1:0领先的情况
let updateState = FIFAActivityAttributes.ContentState(estimatedEndTime: Date().addingTimeInterval(80 * 60), homeScore: 1, guestScore: 0, halfInfo: "上半场")
            
await self.statusActivity?.update(using: updateState)
```

#### 4.4 End the Live Activity

当我们定义的整个活动结束的时候，我们理应对其进行End操作，出现在锁屏中的实时小组件消失会有三种模式

```swift
await self.statusActivity?.end(using: endState,dismissalPolicy: .default)//+4h
await self.statusActivity?.end(using: endState,dismissalPolicy: .immediate)//立刻结束
await self.statusActivity?.end(using: endState,dismissalPolicy: .after(Date().addingTimeInterval(60 * 60)))//一小时之后结束
```

系统默认的延长四小时模式，立即结束模式，自定义一段时间之后消失。

```swift
let endState = FIFAActivityAttributes.ContentState(estimatedEndTime: Date(), homeScore: 4, guestScore: 6, halfInfo: "全场结束")
            
await self.statusActivity?.end(using: endState,dismissalPolicy: .default)//+4h
```

Demo当中使用系统默认的方式来等待结束，或者用户主动关闭~

顺便一提，用户关闭我们的实时小组件，不是关闭了整个"任务"，比如送外卖实时小组件，用户关闭了它不代表用户取消了当前的外卖订单。

#### 4.5 Remote Push Notification

除了通过主App来更新、结束Live Activity，我们还可以使用第二种方式来：远程推送通知。相对于第一个方式，个人认为推送来更新和结束更加的灵活，也更加符合实时和直播的这个特性~

这个方式需要应用已获得用户Push推送权限，具体的一些准备工作请参考Apple的这几个文档

 [Registering Your App with APNs](https://developer.apple.com/documentation/usernotifications/registering_your_app_with_apns)

[registerForRemoteNotifications()](https://developer.apple.com/documentation/uikit/uiapplication/1623078-registerforremotenotifications)

[User Notifications](https://developer.apple.com/documentation/usernotifications)

开启方式和端内开启几乎一模一样，只是参数需要传入.token

```swift
self.statusActivity = try Activity<FIFAActivityAttributes>.request(attributes: attribute, contentState: startState, pushType: .token)
```

而开启成功之后，我们边可以拿到`self.statusActivity`中的`pushToken`

哦，对了，这个地方的PushToken并不是我们启动注册通知时拿到的那个Token，而是需要从开启后得到的Activity实例中获得的Token发给我们的Push 后台。

我们还需要监听Push Token的队列来看看Token 是否发生了变化，要将变化及时的告诉Push后台

```swift
func listenForPushTokenChanged(activities:Activity<FIFAActivityAttributes>?) -> Task<Void, Error>? {
        guard let activities = activities else { return nil }
        
        return Task.detached {
            for await tokenData in activities.pushTokenUpdates {
                let pushTokenString = String(deviceToken: tokenData)
                print("\(activities.id)新Token:\(String(describing: pushTokenString))")
                
                //发送这个ID和Token给后台服务器
            }
        }
    }
```

具体的Payload格式存在一定的约束，还记得上面我们定义的动态数据的字段State模型么，推送载体的数据字段必须严格一样，系统才会响应的更新我们的Live Activities。

```
{
    "aps": {
        "timestamp": 1660556374,
        "event": "end",
        "content-state": {
            "estimatedEndTime": 1660559974,
            "homeScore": 2,
            "guestScore": 2,
            "halfInfo": "下半场"
        }
    }
}
```

测试这里我是遇到了一些问题，我一直是使用PushHero来测试推送的。但是目前无法推送成功，会报出`Device Token not for Topic`的错误，问了一下推上的好友，他们也遇到了类似的错误，怀疑是Push Type是不是新增了一种？但是却没有更新出来？这部分后边如果有更新我会第一时间更新一下进展。目前暂时搁置了。

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.49.44.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-22 14.49.44.png"></a>
</figure>

### 5.一些其他有用的API

每一个我们创建出来的Activities，都有一个唯一的ID，系统提供了关于它的三个状态更新的API

- To observe the state of an ongoing Live Activity — for example, to determine whether it’s active or has ended — use [activityStateUpdates](https://developer.apple.com/documentation/activitykit/activity/activitystateupdates-swift.property).
- To observe changes to the dynamic content of a Live Activity, use [contentState](https://developer.apple.com/documentation/activitykit/activity/contentstate-swift.property).
- To observe changes to the push token of a Live Activity, use [pushTokenUpdates](https://developer.apple.com/documentation/activitykit/activity/pushtokenupdates-swift.property).

### 6.Demo+结束

[Github-iOS16 Live Activity Demo](https://github.com/jerryliurui/Live-Activities-Demo)

<figure>
<a href="{{ site.url }}/images/LiveActivities/截屏2022-08-18 21.27.22.png"><img src="{{ site.url }}/images/LiveActivities/截屏2022-08-18 21.27.22.png"></a>
</figure>

demo上传了Github上，后续会有更新，希望对大家的开发适配有所帮助。

总的来说这个功能我觉得应该会真香的，尤其是马上就要到来的卡塔尔世界杯，虽然现在已经是视频直播满天飞的年代了，但是在锁屏即可看到自己心爱的球队的实时比分还是很让人心动的。从iOS14的Widget开始，到今年的Lock screen Widget和Live Activities，可以看到Apple在尝试放出越来越多的系统空间来给开发者施展施展拳脚，但还是能够明显的感受到他们的“克制”。希望这样的功能越来越多吧~感谢大家。下次见~
