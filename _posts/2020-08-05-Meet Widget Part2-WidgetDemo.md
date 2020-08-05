---
layout: post
title: "WWDC2020-Meet Widget Part2-WidgetDemo"
description: "An iOS14 Widget Demo"
category: WWDC
tags: [iOS]
modified: 2020-08-05
imagefeature: WidgetPart1/WidgetPart1.png
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

接上一篇，时隔两周，期间在适配真实项目，也踩了不少的坑，是时候整理一波了。

上一部分主要是从设计层面上介绍了什么是`Widget`和如何设计一个优秀的`Widget`， 而这篇主要是从实现原理和真实适配例子来阐述如何从工程层面上去实现今年的新Feature-Widget。

> 1.如何实现Widget？WidgetKit的工作原理是什么？(ppt)
>
> 2.结合Demo聊聊如何使用SwiftUI来创建我们的Widget页面 (ppt+code)
>
> 3.如何使得我们的Widget 变得更加的`聪明` (ppt+code)

### 1.SwiftUI

`SwiftUI`是苹果2019年推出的一个全新的UI框架，显然苹果是希望越来越多的开发者去使用这个新框架来实现功能的，于是干脆就在今年的新特性中尝试去硬性规定只能使用`SwiftUI`来实现，`Widget`就是，由于平时工作项目工程也有些岁数了(国内大部分祖传老项目)，因此平日工作依旧使用的`OC`来实现，假如这次新特性没有要求只能用SwiftUI来实现的话，我们大概会本着效率优先的原则再次忽视掉新UI框架的，所以其实我觉得这是一个好事儿，学习新Feature的同时还能学习苹果较为前沿的新姿势。

于是开始恶补去年推出的一些列教学，和官方的教程，这里非常非常推荐官方的这个教程

[SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui/)

其中会跟着一步一步的来使用SwiftUI来构建页面和App，而对于我这样急于快速上手来适配的开发者来说，学习完第一大章

> SwiftUI Essentials

即可，其他的可以慢慢的后边继续学，总体来说SwiftUI需要在你拿到视觉稿之后，对于整体UI有一个空间拉扯的想象，把它立体化，然后拆解之后的小UI们，就可以两两组合甚至XX组合到各种组合中了，例如水平的`HStack`,竖向UI`VStack`，以及叠层UI`VStack`。适配了两种，满脑子都是这些Stack，一开始会觉得这几个哥们能干啥? 会觉得不够用，但至少对于大部分Widget需求来说是足够的了。

> Tips1：Widget 中不可以Use UIKit and SwiftUI Views Together，也就是Widget无法通过UIViewRepresentable协议来让地图控件这样的元素展示在Widget上

后边的Demo中会大量的使用各种Stack，所以这里就先不展开说了。总之SwiftUI使用下来，虽然跟进的深度还没有太深，但还是觉得和之前的IB比还是先进一大步了。尤其是在今年SwiftUI又有了很多新的更新，可以百分百创建一个独立App，终于兑现了那句

`The shortest path to create a greate app`

### 2.WidgetKit

恶补了一些SwiftUI的知识之后，我开始回头重新看了一下关于今年Widget的一些Session，这里我们一起来看看Widget的工作原理，这也有助于我们来设计一款优秀Widget的基础。

不知道大家在看完WidgetKit之后想起来另一个小伙伴`WatchKit`,记不清楚是WatchOS多少了，我记得桌面小表盘上的工具，和Widget真的好像，无论是相关的Api，还是`Timeline时间线`,`Entry实例`,一度让我怀疑这是一个团队的产物 =.=

#### 2.1 Widget Kinds

宏观上来说，Widget分为两种，一种是静态的，一种是动态可配置的，还是很好区分的，你只要长按一个桌面上的Widget，如果它能翻转过来编辑，就是`IntentConfiguration`,如果不能，则为`StaticConfiguration`。而让用户可以编辑这个特点，能让用户的桌面上同时存在多个类型的同一个尺寸的Widget。想一想现在你的产品在用户桌面上有三个Medium的样子，是不是增加了很多好好适配的动力？

> Tips2 Widget有很多限制，这一点虽然部分系统级别Widget看上去拥有一些特别的特权(例如动画等) 但我们还是要遵守我们的一些规则，例如没有滚动，不要有视频，只有点击交互。
>
> Tips3 Widget 作为Extension，具备了使用App Group的能力，类似用户登录信息等依赖主App的信息可以使用这个方式来传递。

#### 2.2 How Widgetkit work

在了解了Widget的种类之后，我们来看看WidgetKit是如何工作的。

我们以日历App为例，

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.44.46.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.44.46.png"></a>
</figure>

日历App会把关于个人的日历信息通过不断的输出，来让`Widgetkit`不断的创建View来展示在我们的屏幕上，图中九点，九点半这些时间点上，我们提供给系统的实际上都是一个一个的`Entry`,而这个线性的时间轴，名义上叫做`TimeLine`时间线，每一个`Widget`的背后其实都是有自己的时间线的，开发者负责管理时间线以及时间线上的一个一个的Entry

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.44.59.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.44.59.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.45.10.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-29 下午3.45.10.png"></a>
</figure>

这三个图简单的描述了`WidgetKit`的工作原理，后边会详细的跟踪每一步的具体实现，总得来说开发需要关心的东西其实非常的少，再加上`SwiftUI`的加持，适配`Widget`的工作显得轻松不少，可以让我们更加的关注在产品层面，可以更加关注把我们的App的什么信息来展示给用户，用户才会更好的买账把我们的Widget放在屏幕上。

### 3.实现Widget

了解了工作原理，正式进入到了实现环节，

#### 3.1 添加Widget

Xcode -> File -> New -> Target -> 选择Widget Extension

这个地方我们已经可以看到老的`Today Widget`已经不存在了，当然老项目中的老Extension还是可以并存的，具体并存的效果目前来看是互不影响，未来的共存效果未知。个人认为是老的Widget竞争力已经远远不如新的Widget了。

勾选 `Include Configuration Intent` 这个随意，后边可以补，不勾选则默认是静态无法配置的Widget。

添加之后，我们可以看到一个空的Widget工程，我们大致过一下这些Api是干啥的

```swift
struct Provider: IntentTimelineProvider {
    public func snapshot(for configuration: ConfigurationIntent, with context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    public func timeline(for configuration: ConfigurationIntent, with context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
  func placeholder(with: Context) -> FeedModelEntry {
        return SimpleEntry(date: Date(), configuration: configuration)
    }
}
```

`Provider`结构体是系统询问我们的主入口

1. `snapshot`方法是当用户在`Widget Library`中第一次预览时，我们快速提供Entry的地方，这个地方提供的实际上是一个真实的数据，所以需要我们一定要精简获取的数据，加快这个Entry的产生，对于不同的尺寸，我们可以区别对待，获取不同的数据。
2. `timeline`方法则是我们组织时间线的主战场，我们在这个方法来持续的告诉系统我们要出现的Widget.
3. `placeholder`这个方法实际上是`Xcode Beta3`才出现的，这个地方我们可以提供一个默认Entry，也就是空数据Entry，系统会自动的帮我们渲染一个占位图一样的WidgetView

```swift
struct SimpleEntry: TimelineEntry {
    public let date: Date
    public let configuration: ConfigurationIntent
}
```

`SimpleEntry`是我们定义Entry的地方，我们可以将Widget View需要展示的信息都定义在这里，包括需要展示的图片Data

```swift
struct DiabloNewsEntryView : View {
    var entry: Provider.Entry
    var body: some View {
        Text(entry.date, style: .time)
    }
}
```

`EntryView`则是我们展示View的主战场，这个地方我们可以根据不同的尺寸来告诉系统展示不同的Widget，毕竟苹果是推荐不同尺寸的Widget需要展示不一样的内容，而不是单单的等比例放大

```swift
@main
struct DiabloNews: Widget {
    private let kind: String = "DiabloNews"
    public var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: Provider(), placeholder: PlaceholderView()) { entry in
            DiabloNewsEntryView(entry: entry)
        }
        .configurationDisplayName("My Widget")
        .description("This is an example widget.")
    }
}
```

我们Widget的主体，这个地方可以定义我们展示的标题和描述以及支持的尺寸等配置信息，而我们这个widget的唯一标识也是在这里配置的，这里需要注意的是，Xcode Beta3开始这个Api有了变化，去掉了`placeholder`参数，不去掉的话打`testflight`会无法显示Widget(虽然Beta3打出来的包因为其Xcode本身的bug，无法在Widget Library内显示我们自己的Widget，但是官方的回复确实是无法使用老的Api，虽然能够编译过)

而通过`.supportedFamilies([.systemSmall, .systemMedium, .systemLarge])`则可以告诉系统我们支持的尺寸都是什么。

```swift
struct DiabloNews_Previews: PreviewProvider {
    static var previews: some View {
        DiabloNewsEntryView(entry: SimpleEntry(date: Date(), configuration: ConfigurationIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
```

`SwiftUI`自带属性，这一坨内容我们可以实时的预览我们的Widget组件，甚至是预览占位Widget(PlaceHolderView)

> 有趣的是，Session中提及的`isPlaceHolder(true)`Api在Beta3中刚出来就被废弃掉了，使用`.redacted(reason: .placeholder)`代替，而真实的渲染PlaceHolderView这个工作其实是交给了系统了，就像之前提到的TimeLineProvider中新增的placeholder方法，我们只需要提供一个 Default Entry即可。而新Api使得我们能够在预览区域看到我们的Widget被系统渲染成PlaceHolderView的样子

#### 3.2创建UI

这一部分主要会记录在开发过程当中所遇到的一些Tips，和一些Session中不曾提到的细节。

##### 3.2.1 DisplaySize

如果我们希望拿到被渲染的Widget的确切大小的话，其实我们是可以拿到的:

```swift
public func snapshot
public func timeline
```

上面两个方法中我们都可以拿到一个参数`context`,通过这个Context我们可以拿到展示尺寸的大小

`context.displaySize` Widget 大小，拿到这个可以帮助我们精确布局

`context.family` Widget 的类型，拿到这个我们可以在创建网络请求的时候根据尺寸来进行不同的网络请求，以及更加精准的准备Entry

`context.isPreview` 是否是预览模式

`context.environmentVariants` 所有关于Widget显示的环境变量都在这里，如果有需要的可以debug看一下酌情取一下

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午2.32.34.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午2.32.34.png"></a>
</figure>

##### 3.2.2 EntryView

入口处，我们可以通过环境变量`@Environment(\.widgetFamily)`来拿到需要展示的尺寸类型，相应了展示对应的UI页面

```swift
struct DiabloNewsEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    @ViewBuilder
    var body: some View {
        switch family {
        case .systemSmall:
            WidgetSmallView()
        case .systemMedium:
            MediumWidgetView()
        case .systemLarge:
            WidgetLargeView()
        default:
            WidgetSmallView()
        }
    }
}
```

##### 3.2.3 Preview for SwiftUI

在预览状态下，我们可以设置各种状态来预览我们的Widget

###### 3.2.3.1 查看尺寸

只需要在我们的View下使用`previewContext`修饰符即可，例如我们预览中尺寸的样子，则可以添加

```swift
.previewContext(WidgetPreviewContext(family: .systemMedium))
```

对应展示的样子

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午5.55.28.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午5.55.28.png"></a>
</figure>

###### 3.2.3.2 查看夜间模式

想要查看夜间模式，只需要添加下面这句修饰符

```swift
.environment(\.colorScheme,.dark)
```

###### 3.2.3.3 查看占位View

想要预览Widget在加载数据时的样子，只需要添加下面这句即可

```swift
.redacted(reason: .placeholder)
```

文本会被绘制成毛玻璃一般的色块，图片则不会显示，因为我是用的是本地图片，所以不会被隐藏掉（感觉像是bug...看看后边会不会被处理，讲道理本地图片素材也应该被隐藏才对）

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午5.58.37.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午5.58.37.png"></a>
</figure>

##### 3.2.4 ColorScheme

本地图片以及文字颜色等，可以通过在`Assets`中的设置来达到一键暗夜模式的效果，但是如果是网络图片，则需要在渲染子View的时候来决定如何展示，我们可以在子View中添加这个环境变量来识别

```swift
struct WidgetMediumView: View {
    @Environment(\.colorScheme) var colorScheme: ColorScheme
    var body: some View {
       if colorScheme == .dark {
       } else {
       }
    }
}
```

##### 3.2.5 WidgetFamily

这里说一个比较有意思的事情，其实在看Session的时候我就有一个小疑问，会不会有第四个尺寸 =。= 后来在开发的时候，意外的看到了这样一个警告

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午6.09.04.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午6.09.04.png"></a>
</figure>

Switch当我漏写了default的时候，警告说未来可能会有不同的值，虽然这也可能是这种枚举的一种正常警告⚠️，但还是期待一下未来会有超大啥的尺寸吧哈哈哈

##### 3.2.6 Spacer

非常好用的View，有些时候我们需要把Logo放在有上角的时候，我们大可以通过一个`HStack`加上一个Space()+Logo来实现

##### 3.2.7 Padding

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午6.13.19.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午6.13.19.png"></a>
</figure>

Command + 左键一个View，可以直接呼出各种快捷菜单，其中就有这个SwiftUI面板，我们可以在这里勾选padding,我们不需要关心控件距离Widget的边界，只需要选择default即可。

##### 3.2.8 ForEach

灵活使用ForEach可以快速实现类似于一个列表一样的UI样式

在demo中，大尺寸，竖向排列了三个新闻，则可以通过这个方式来布局

```swift
VStack(alignment: .leading, spacing:16) {
     ForEach(articleList, id: \.self) { article in
     Link(destination: URL(string: article.clientUrl ?? "")!) {
         NTESNBFeedWidgetLargeImageCell(article: article,currentSize: currentSize)
     }
   }
}
.padding(.all)
```

##### 3.2.9 ContainerRelativeShape

同心圆角Api，我们可以不去单独计算圆角，或者让视觉来给，在View下使用clipShape修饰符即可

```swift
.clipShape(ContainerRelativeShape())
```

#### 3.3 取色逻辑

这里感谢一个第三方的取色pod [ImageColors](https://github.com/jathu/UIImageColors)

可以取到四种主体颜色，demo中使用的是`backgroundColor`

#### 3.4 标题颜色深浅判断

由于demo中使用到了取色的逻辑，这就有一个问题，覆盖在底色上的标题文字颜色就不能和底色类似，会造成看不清的问题，所以我们需要简单的判断取出来的色是深色还是浅色，相应的给出一个文字的颜色

判断深浅颜色参考的公式是

> ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
>
> 来源：[深浅色判断公式](https://www.w3.org/WAI/ER/WD-AERT/#color-contrast)

#### 3.5 网络请求

##### 3.5.1 关于Remote Image

Widget如果想要显示图片的话，就需要提前下载好，曾经尝试给UIImage增加扩展来使Image控件来异步加载一个图片，但是失败了，后来看论坛，苹果工程师的推荐也是在创建Entry的时候就已经准备好了的

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.27.08.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.27.08.png"></a>
</figure>

另外，关于图片的大小其实在Widget中是有限制的，30MB

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午4.50.53.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-03 下午4.50.53.png"></a>
</figure>

所以相应的缩图策略也看上去必须的，创建Entry的时候也需要考虑更多，而在实际中，因为我们工程的图片需求比较大，所以我们每次其实只创建一个Entry，无论是数据还是图片，尽量不给太大的负担。

```swift
let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
let timeLine = Timeline(entries: entries, policy:.after(refreshDate))
```

每次请求之后schedule时间线15分钟之后再请求。

##### 3.5.2 关于数据

其实官方推荐了后台请求，backgroundtask，但是适配的时候(Beta2)，后台请求回调很不稳定，所以采用了正常的网络请求，看上去还是很work的。数据model解析推荐使用官方的方式

```swift
let resultFeedModel = try JSONDecoder().decode(NetworkResult.self, from: data)
return resultFeedModel
```

#### 3.6关于Score

每一个Entry都会有一个"得分"，每个App的Widget互不影响，这个Score是会直接的告诉系统当前你的Entry对于用户的相关性有多大，在`Smart stack`中，如果分数高的话，大概率会被自动翻滚出来显示在最上面。当然如果都写1.0的话貌似也没问题，但是也失去了这个参数的意义了。

这个Score策略不是固定的，每个Widget都需要根据自身的情况来决定如何定义Score

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-04 上午10.29.51.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-04 上午10.29.51.png"></a>
</figure>

#### 3.7 关于时间线

关于时间线策略的安排有三种Api:

>.atEnd 在最后一个Entry被消耗掉之后，开始请求新的时间线
>
>.never 会不在主动创建时间线，等待被动的唤起刷新。
>
>.after 则可以指定某一个特定的时间来更新我们的时间线

用一张图来展示三种的区别

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-04 上午10.29.34.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-04 上午10.29.34.png"></a>
</figure>

除了这三种刷新机制之外，我们同样可以使用通知和客户端内主动刷新来让widget刷新

其中第一种是push notification，静默推送来更新widget，另一种则是客户端内用户产生某个行为后，我们主动的reload

```swift
WidgetCenter.shared.reloadAllTimelines()
```

#### 3.8 关于统计

由于用户使用自己桌面的行为我认为是比较隐私的，所以关于曝光我们是拿不到的，但是点击是可以的，因为只要有点击行为，就会进入到端内，后边的统计就容易很多。

而如果想要统计用户添加了哪种尺寸的Widget，以及相关的动态配置是什么，其实我们也是可以做到的

方法有很多，比如在TimeLine 提供Entry的时候保存一下属性，因为走了Timeline获取数据，则一定是用户添加了相关的Widget了。第二种比较正统的做法，是在我们的主App内去获取，同样是使用`WidgetKit`相关的Api

```swift
WidgetCenter.shared.getCurrentConfigurations { result in }
```

`result`内我们可以拿到所有用户添加到桌面上的我们的widget信息(自己的Widget别人的是拿不到的)

```swift
widgetInfo.family //我们可以拿到family
widgetInfo.kind //Widget的唯一标识
widgetInfo.configuration //动态配置信息，比如用户选择的是北京的天气还是大连的天气
```

#### 3.9 关于唯一允许的交互-点击

苹果对于Widget上的交互其实是规定了只允许点击了，那如何实现Widget上面的点击呢

`SmallSize`对于小尺寸，我们不能切割视图，只有一个点击区域和事件，因此我们只需要在整个SmallView上使用`widgetURL`修饰即可

```swift
WidgetSmallView(article: entry.smallArticle!,currentSize: entry.size)
                .widgetURL(URL(string: entry.smallArticle?.clientUrl ?? ""))
```

而对于中尺寸和大尺寸，我们就需要根据交互和视觉切割的视图来相应的给出跳转链接，使用的是LinkApi

```swift
ForEach(articleList, id: \.self) { article in
    Link(destination: URL(string: article.clientUrl ?? "newsapp://")!) {
        MediumWidgetView(article: article, currentSize: CGSize(width: currentSize.width, height: currentSize.height/3))
     }
}
```

这里说一个题外话，因为Widget点击动画效果是系统行为，对于大部分情况下是非常友好和实用的，但是对于某些情况下，例如我们都遇到过的在列表中点击某个Cell，Cell中的某个纯色视图会在点击的时候变成透明或者无色，这就需要我们在Cell点击的时候主动着色，来规避。

对于Widget我们拿不到点击回调，但是可以通过另一个相对吹可的方式来解决，就是利用`ZStack`层叠视图，在显示的图片上方，加一个纯色的背景，link掉这个背景色即可

```swift
ZStack(alignment: .top) {
  Link(destination: URL(string: topArticle.clientUrl ?? "newsapp://")!) {
      Color("background")
  }
  LargeCoverCell(article: topArticle,currentSize: currentSize)
}
```

### 4.动态配置

之前介绍的时候我们知道Widget可以允许用户编辑的，只需要长按Widget，支持Intent的Widget就会翻转过来，用户可以选择查看选项，来定制这个Widget，这也使得用户实际上可以在桌面上添加多个同一种尺寸的Widget来展示不同的内容，可以同屏查看到北京或者大连的天气，可以同时查看湖人和皇马的比赛进程。

而如何实现动态配置，这就要请出一个老朋友了，其实也不算老吧，两年前登场的`Siri Shortcut`。内联智能是苹果这两年一直在推的事情，这次的动态配置同样借助了`Intent`来实现，达到了一定程度上的统一。

#### 4.1 Custom Intent

首先我们要像创建Shortcut那样创建一个Intent定义文件，来定义我们的Widget可以配置的内容。Demo中新建一个`HeroIntent`,定义一个type:`Hero`，模拟背后凯恩之角论坛对应的英雄论坛版块。

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.43.37.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.43.37.png"></a>
</figure>

这个时候一定要看一下右边面板是否系统已经自动生成了相应的Intent文件，下图蓝色箭头出现这个小箭头证明生成好了

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.43.43.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.43.43.png"></a>
</figure>

如果迟迟无法生成，则推荐使用重启Xcode大法，我的Mac有些岁数了，每次都要这么搞。还有一个坑就是，当你的项目是很古老的OC工程的话，建议自动生成Intent的语言切换成Swift，我在这几个beta版本的Xcode中几乎都遇到了迟迟无法自动生成Intent文件这种事，所以干脆直接改成Swift了，一劳永逸。具体修改地点在下图蓝色箭头处

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.50.47.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.50.47.png"></a>
</figure>

配置好了用户可以选择的内容，我们就要在配置的时候拉取可选项了，建议走网络，更加灵活，不用发版，只需要后台修改即可

#### 4.2 IntentHandling

我们需要新创建一个Intent Extension，来处理这个请求事件。实现刚才自动创建的IntentHandling协议`DiabloHeroIntentHandling`中系统自动为我们创建的方法

```swift
func provideYourHeroOptionsCollection(for intent: DiabloHeroIntent, with completion: @escaping (INObjectCollection<Hero>?, Error?) -> Void) {
        DataManager.fetchHeroList { (heros, error) in
            
            let defaultHero = Hero(identifier: "1", display: "天空寺院")
            
            let collection = INObjectCollection(items: heros ?? [defaultHero])
            completion(collection, nil)
        }
    }
```

`DataManager.fetchHeroList`方法则是异步加载可选项的地方，demo中直接用的本地数据，实际项目中可以使用正式URL来做请求。

实现这两步，编译一下，长按Widget，我们就可以看到用户的配置了

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.59.35.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午2.59.35.png"></a>
</figure>

当选择其中的一个版块之后，我们在提供新的时间线的时候则可以拿到用户选择的Hero信息，请求数据的时候就可以相应的请求对应的版块的帖子来进行展示，整个配置非常简单，这样用户可以在同一个屏幕内看到武僧和猎魔人两个英雄的帖子Widget了。

这一部分也可以自定义一些样式，如果你的App主色鲜明且柔和，可以自定义Widget的主题颜色，在WidgetExtension中的build settings中搜索Color，可以指定下面两个key中的颜色值，具体修改的是什么地方的颜色，可以看一下效果图，就一目了然了

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午3.05.00.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午3.05.00.png"></a>
</figure>


```
AccentColor -> red
BackGroundColor -> yellow
```

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午3.05.53.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午3.05.53.png"></a>
</figure>

在`public func snapshot`以及`public func snapshot`我们可以拿到`configuration.YourHero?.identifier`

### 5.其他

#### 5.1 开发者论坛

开发阶段尤其是新功能的开发阶段勤看开发者论坛是及其Very非常有用的，没有的话也可以自己问，不止一次我有一个非常疑惑的问题的时候，就可以在上面找到答案。

[苹果开发者论坛-Widget](https://developer.apple.com/forums/tags/widgetkit)

比如

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.27.44.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.27.44.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.40.55.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.40.55.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.31.51.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-07-08 上午11.31.51.png"></a>
</figure>

很多回复带有 icon的信息一般都比较有用

#### 5.2 Build System

<figure>
<a href="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午4.26.40.png"><img src="{{ site.url }}/images/WidgetPart2/截屏2020-08-05 下午4.26.40.png"></a>
</figure>

传统的`legace build system`在Xcode release note中被点名要被废弃了，所以趁着适配就干脆直接使用新的:

> New Build System

前提是切换到这个之后可以顺利打包，如果遇到很棘手的问题，还是要切换回去

切成新的还有一个原因就是如果不是`New Build System`的话Widget 无法真机编译，这个不知道后边会不会修复

#### 5.3 Demo

demo工程可以在我的github上找到，希望对你的适配工作有所帮助
[Demo Github Project](https://github.com/jerryliurui/iOS14-Widget-Demo)

### End

适配工作暂时告一段落，每一年的这个时候都是在充满激情的学习中艰难前行，有坑其实并不可怕，当效果如愿的那一刻出现的时候，那份开心还是相当溢出的。当然Widget仅仅是适配iOS14中的一小步，像`Clips`、`Siri shortcut`、`隐私`等还有很多东西值得看一遍Session然后落地到项目中去。

最后祝大家适配顺利~


