---
layout: post
title: "Apple Watch 开发调研二：WatchKit Apps"
description: "Developing for Apple Watch"
category: iOS Programming
tags: [AppleWatch]
modified: 2014-12-12
imagefeature: blog_bg_applewatch.png
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

**接上一篇，Apple Watch 使用的时候会有三种主要的场景，在开发的时候Watch App 这一项是必不可少的，Glances以及Notifications的创建是根据需求的。默认情况之下，Xcode会为我们生成一些必需品，比如一个故事板。这篇主要是介绍Watch Apps这个场景。**[官方文档WatchKit Apps](https://developer.apple.com/library/prerelease/ios/documentation/General/Conceptual/WatchKitProgrammingGuide/CreatingtheUserInterface.html#//apple_ref/doc/uid/TP40014969-CH4-SW1)

## 一.Watch App 概要(App Essentials) ##
Xcode 会提供一个故事板供我们创建界面，实现UI部分，创建Watch App之后至少会提供一个Watch App 的这个场景，每一个场景的背后都是一个`WKInterfaceController`子类控制器去控制。而对于动态通知的那个，使用`WKUserNotificationInterfaceController`的子类来代替。之后创建的每一个新的场景，只需要修改`Identity inspector`中的名字。

> 所有的代码必须在WatchKit extension这个target中去实现，Watch App 中只需要UI。

### 1.Interface Controllers 是如何工作的
每一个控制器通过outlet去管理和定义故事板中的动作操作，在控制器中使用`initWithContext:` `willActivate`方法去配置界面，在这些方法之中，我们可以做的事情如下：

> 抓取想要显示的数据；

> 初始化UI中标签、图像、其他控件儿的值；

> 隐藏好不想显示的内容，只显示我们想显示的内容；

当然了控制器(controller)的数量是没有限制的，但是苹果也说了太多的控制器会使得程序复杂，越少越好`fewer is better`。`Navigation styles`决定了控制器和控制器之间是如何转换的，详情见下文。

### 2.填充故事板场景
Watch App 的布局模式和iOS apps 的布局模式是不一样的，不能像在iOS app 中那样绝对的去布局，相反，当我们增加一些元素的时候，Xcode会把它们垂直的布局在一条一条的横线上，在程序运行时Apple Watch才会将这些元素布局在有效的位置上。
WatchKit也提供精确的布局，大小、位置都可以通过设置属性去设置。`Group`对象可以使用另一个重要的工具去布局，可以布局元素就像垂直的那样水平的排列，`Groups`是看不见的，必要的时候可以用图片和背景纯色去配置一下。
下图是一个例子，前三个是标签，也相应的显示了三种对齐方式，下边是一个Group对象，水平的排列了两个图片，下边分别是一个Switch控件儿，然后是一个分割线，最后是一个按钮。

<figure>
<img src="{{ site.url }}/images/applewatch/layoutsubviews.png" alt="layoutsubviews">
<figcaption>LayoutSubviews</figcaption>
</figure>

这里需要注意的是尽可能的让界面元素的大小尺寸是可适应的，因为Apple Watch有两种尺寸，让系统去做适配可以让我们写更少的代码。

### 3.运行时更新界面
在程序运行的时候，控制器可以决定如下改变：

> 1.数据(DATA)的设置和更新 

> 2.可见界面元素的样子的变化

> 3.一个界面元素大小的改变

> 4.一个界面元素透明度的改变

> 5.隐藏和显示一个界面元素

需要注意的就是：不能够增加新的界面元素以及改变存在的对象的顺序。也不能删除某一个存在的对象，但是可以隐藏掉他们，将他们从布局中暂时的移除掉了，当一个元素隐藏掉之后，其他的元素就会替补它，填充掉空出来的部分。不需要担心这个地方会一片空白。

### 4.国际化我们的界面
故事板初始化之后就存在了基本的国际化选项，使得故事板中所有的字符串都会被加入到`Localizable.strings`这个文件中，我们要去做的就是去翻译到目标语言就可以了。
这里苹果给的建议是按钮环节，因为考虑到国际化之后字符串的长度会发生改变，因此为了让文本有地方可以伸缩，水平排列好几个按钮不如垂直的去布局，以免语言发生改变之后会显示不全。
技术方面使用之前iOS 程序和Mac OS X程序的方法就可以了。使用` NSLocalizedString`` NSNumberFormatter`` NSDateFormatter`去装载字符串，格式化数字，格式化日期格式等等。

## 二.Interface导航(Interface Navigation) ##
每一个watch app当要呈现更多的内容的时候必须采用导航模式，二选一，也就是支持如下两种，他俩是互相排斥的：

> `Hierarchical`  层级

> `Page-based` 分页

### 1.实现层级结构
层级结构是量身为了用户点击一个元素，推出更多信息打造的，层级结构往往由一个单一的根控制器开始，用户点击了一个按钮或者表格的一行的时候，调用`pushControllerWithName:context:`这个方法推出一个新的控制器来呈现相应的内容，逐级的显示。
而如何和推出的控制器沟通呢，这就需要在上面的那个方法传入的context参数中交代，使用这个对象去告诉新的控制器所要显示的内容。
退出一个层级的控制器，就需要调用` popController`这个方法，当然用户也可以通过从手表左侧边界处向内滑动来使得一个层级控制器消失。根控制器是不会消失的。

### 2.实现分页结构
分页结构是为了那些信息不是一环套一环的信息准备的，一个分页结构包含了固定的控制器个数，每一个都是独立于其他控制器的，程序运行的时候，用户可以通过左滑或者右滑来切换控制器，在屏幕的下方会有一个点状的指示器来告诉用户现在所处在的位置。
分页中得控制器之间的顺序通过故事板中传统的拖拽去完成，系统会在一开始的时候初始化所有的分页控制器，而当用户滑动的时候，当前显示的控制器会`didDeactivate`,新的控制器会`willActivate`。

### 3.模态视图
在以上两种显示的方式中，都可以随时的显示模态视图来呈现一个特定的内容，默认左上角会出现一个按钮，用来使模态视图消失，默认是cancel，也可以自定义。想要使用模态视图的话调用下边这两个方法：

> presentControllerWithName:context:呈现一个模态视图控制器

> presentControllerWithNames:contexts:呈现多个模态视图控制器

## 三.界面对象(Interface Objects) ##
开发的时候我们通过界面对象来管理在Apple Watch 中的UI，每一个界面对象都是一个`WKInterfaceObject`类或者是它的一个子类，WatchKit提供了绝大多数的对象（但不是全部）来对应我们故事板中的UI元素。

> 界面对象和真正的View之间的通信只有一个流向，那就是从WatchKit到Apple Watch，我们在界面对象中设置了一些值，但是我们不能够获取到它们属性“实时”的值。不过会有一些特殊的技巧。。。从Apple Watch 中拿回数据，获得改变。推荐的做法是在WatchKit中配置界面。

### 1.创建一个界面对象

{% highlight css %}
@interface MyHelloWorldController()
@property (weak, nonatomic) IBOutlet WKInterfaceLabel *neteaseTitleLabel;//标签
@property (weak, nonatomic) IBOutlet WKInterfaceImage *newsImage;//图片
@property (weak, nonatomic) IBOutlet WKInterfaceButton *commentButton;//按钮
@property (weak, nonatomic) IBOutlet WKInterfaceButton *saveButton;//按钮
@property (weak, nonatomic) IBOutlet WKInterfaceSeparator *separator;//分割线
@property (weak, nonatomic) IBOutlet WKInterfaceTable *tabel;//表格
@property (weak, nonatomic) IBOutlet WKInterfaceSlider *slider;//滑动条
@property (weak, nonatomic) IBOutlet WKInterfaceSwitch *oneSwitch;//转换按钮
@end
{% endhighlight %}

创建之后按照老套路在故事板中拖拽就可以了，当然最简单的就是在Assistant editor中直接关联每一个界面元素就可以了。

### 2.设计的时候配置界面元素
设计的时候使用Xcode 配置故事板中可见元素的表现属性，对于很多跟布局相关的属性，设计的时候是唯一的时机可以去配置的，例如，我们可以改变一个标签的文字、颜色、字体但是不能改变标签的行数以及每一行的高度。这些属性必须在Xcode中配置，如下如：

<figure>
<img src="{{ site.url }}/images/applewatch/configView.png" alt="configView">
<figcaption>ConfigView in Xcode</figcaption>
</figure>

### 3.运行时改变界面元素
在WatchKit中调用一些方法来改变界面元素的值，界面控制器只有在激活状态下才会更新他们包含的界面元素的，在我们的`init``awakeWithContext``willActivate`方法中，去给标签、图片、或者其他元素分配数据。或者也可以在我们的Action-Target动作中完成数据的分配和更新。
初始化的时候要记住调用`super`就对了，如下是一个初始化label的数据的代码：

{% highlight css %}
- (instancetype)initWithContext:(id)context {
    self = [super initWithContext:context];
    if (self){
        // Initialize variables here.
        // Configure interface objects here.
        NSLog(@"%@ initWithContext", self);
        [self.neteaseTitleLabel setText:@"女子丢20万元钻戒悬赏2万赏钱"];
        [self.commentButton setTitle:@"评论"];
        [self.saveButton setTitle:@"收藏"];
    }
    return self;
}
{% endhighlight %}

<figure>
<img src="{{ site.url }}/images/applewatch/maininterface.png" alt="maininterface">
<figcaption>MainInterface in Demo</figcaption>
</figure>

我们都知道AppleWatch是苹果的新产品，往往有坑。。。这次我觉得AppleWatch如果解决不好续航的问题，估计也会导致一大部分人持观望的态度了，文档中倒是提到了一个内部的机制来尽可能的节省电池：`Coalescing changes`，这个意思相当于，如果你给一个label做出了修改，如果反反复复的在一个循环中，就会取最后一个值传递给Watch，而不会把每一个都给Watch。

### 4.响应用户的交互
当用户点击了手表上的按钮、转换器按钮、滑动条、表格的cell等等，就会调用响应的Action动作去响应的做出反应。如果我们不需要用户交互就要做出一些反应，那么我们可以使用`NSTimer`对象去管理任务。
长时间的任务交给`Parent App`去做，然后可以通过共享数据的方式告诉Apple Watch。

### 5.隐藏界面对象
隐藏掉界面对象使我们针对不同情况显示不同界面风格的一个很好的方法，运行时所有的界面元素都要存在，只不过我们要决定某一个时刻，哪些需要显示哪些需要隐藏就好了。

## 四:文字、标签、图像、表格 ##
显示文字使用标签就可以了，可以使用系统的风格、也可以自定义文字字体。下图是系统默认的几种风格：

<figure>
<img src="{{ site.url }}/images/applewatch/defaulttext.png" alt="defaulttext">
<figcaption>DefaultText in Demo</figcaption>
</figure>

### 1.1 使用自定义的文字
除了使用默认的风格之外，可以使用自定义的文字风格，需要做到如下两点：

> 在`WatchKit App` 和`WatchKit extension`中都要包含自定义文字的文件 

> 在`WatchApp` 的 `info.plist` 文件中增加 `UIAppFonts` 这个Key，并且指定到我们增加的那个自定义的文字文件

以下代码是创建一个自定义字体的过程:
{% highlight css %}
// Configure an attributed string with custom font information.
 
let menloFont = UIFont(name: "Menlo", size: 12.0)!
var fontAttrs = [NSFontAttributeName : menloFont]
var attrString = NSAttributedString(string: "My Text", attributes: fontAttrs)
 
// Set the text on the label object
self.label.setAttributedText(attrString)
{% endhighlight %}

### 1.2 定制系统字体
使用`UIFontDescriptor`这个类去定义系统字体，如下是示例代码：
{% highlight css %}
let fontSize : CGFloat = 18.0
let aFont = UIFont.systemFontOfSize(fontSize)
let fontDescriptor = aFont.fontDescriptor().fontDescriptorByAddingAttributes(
     [UIFontDescriptorFeatureSettingsAttribute :
                [UIFontFeatureTypeIdentifierKey : kLowerCaseType,
             UIFontFeatureSelectorIdentifierKey : kLowerCaseSmallCapsSelector]])
 
let smallCapFont = UIFont(descriptor: fontDescriptor, size: fontSize)
{% endhighlight %}

### 1.3 记得国际化文字
具体的国际化技术和之前的iOS apps使用的是一样的。

### 2.1 指明图片素材
创建图片素材集的时候使用PNG格式，使用`setWidth:``setHeight:`使得图片能够显示在一个合适的地方。

### 2.2 使用Named Images 来提高性能

> 使用`setImageNamed:``setBackgroundImageNamed:`分配图片资源，如果资源已经存在在Watch App中或者存在在设备的缓存中。

> 使用`setImage:`` setImageData:`` setBackgroundImage:``setBackgroundImageData:`将图片数据从Watch extension传到Apple Watch中去。

使用imagenamed好处在于图片就在apple watch中，不需要传输，只需要将名字发送给watch app，这个要花费更少的时间和更少的电量。如果是在extension中创建，图片资源是在iPhone中的，需要发送给apple watch。。。

### 2.3 在设备上缓存图片
对于一些在WatchKit extension中创建的又使用的很频繁的图片资源，缓存这些图片在设备上然后通过名字关联上他们。我们必须在使用它们的之前一定要先缓存图片，通过使用`addCachedImage:name:`` addCachedImageWithData:name:`方法。

>  如果是一个`WKInterfaceImage`对象，使用`imagenamed`方法指定到缓存了的图片

>  如果是`group`或者是`button`之类的，使用`setbackgroundImagedNamed`方法去指明

### 3.1 表格概述
表格用来显示一些列的数据，WatchKit只支持单列的表格，在表格中显示数据需要预先设置好布局，以及动态的填充数据。一般来说，我们需要做的是如下几点：

> 1.在故事板中，拖进来一个table表格，然后连接一个Outlet在controller中

> 2.配置一种或者多种row类型

> 3.在代码中定义好每一种row的类型

> 4.初始的时候，在表格中插入row

> 5.处理用户的row 选择事件

我们需要定义几种row的类型和表现形式，然后依据具体情况列出来我们想要展示的row以及他们排列的顺序。

### 3.2 配置Row 的类型
Row的类型是指如何体现表格中的一行，不同类型我们需要定义不同的模板，每个表格必须包含至少一种Row类型，如果想要另外定义其他的，拖进来一个表格之后，Xcode会自动的选择一个默认的类型去呈现表格。

每一个Row类型都有一个默认的Group，把标签、图像、或者其他的元素加到这个Group元素上，在运行时，再将真实的数据填充上去。

为了管理Row中的内容，我们需要去创建`Row controller class`，大多数的这个类都含有很少的代码或者是不含有代码，主要是去管理界面中的一些outlet,除了我们需要在row上增加一些按钮什么的需要交互的东西，我们要相应的增加Action的代码。

定义一个`Row controller class`步骤大致是这样的：

> 1.在WatchKit Extension中新建一个类

> 2.继承自NSObject

> 3.为每一个在Row上的元素创建属性声明，和故事板中的元素建立关联

如下是一个简单的例子：

{% highlight css %}
#import <Foundation/Foundation.h>
#import <WatchKit/WatchKit.h>
@interface MainRowType : NSObject
@property (weak, nonatomic) IBOutlet WKInterfaceLabel *onelabel;
@property (weak, nonatomic) IBOutlet WKInterfaceImage *oneimage;
@end
{% endhighlight %}

这些做好之后还需要在故事板中配置Row 的类型，和内部的属性的连接。步骤如下：

> 1.在故事板中选择Row controller 这个对象

> 2.设置它的identifier 成一个唯一标识, 例如Main Row Type

> 3.把这个类设置成自定义的类(MainRowType)

> 4.然后拖进来一个image、一个label，最后关联上

如下图所示：

<figure>
<img src="{{ site.url }}/images/applewatch/configrowcontroller.png" alt="configrowcontroller">
<figcaption>ConfigRowController in Demo</figcaption>
</figure>

### 3.3 在运行时分配数据给表格
使用` setRowTypes:`` setNumberOfRows:withRowType: `决定需要展示多少个Row，使用`rowControllerAtIndex:`去复用Row，使用row controller去分配每一个Row的内容。
不多说了。。。直接上代码，这个和之前写iOS程序中的表格还是很相似的：

{% highlight css %}
- (void)configureTableWithData:(NSArray*)dataObjects {
    
    NSArray *titles = @[@"hi",@"hello",@"cool"];
    [self.newsTable setNumberOfRows:[titles count] withRowType:@"mainRowType"];
    for (NSInteger i = 0; i < self.newsTable.numberOfRows; i++) {
        MainRowType *theRow = [self.newsTable rowControllerAtIndex:i];
        NSString *title = [titles objectAtIndex:i];
        
        [theRow.onelabel setText:title];
        //[theRow.oneimage setImage:dataObj.image];
    }
}
{% endhighlight %}

显示出来的效果，额。。。图片先不做了，先把label给显示出来：

<figure>
<img src="{{ site.url }}/images/applewatch/showrowlabel.png" alt="showrowlabel">
<figcaption>ShowRowLabel in Demo</figcaption>
</figure>

### 3.4 处理表格单击事件
当用户点击了表格中的一个按钮之后，WatchKit就会调用相应的合适的代码，我们可以在两个地方响应对应的操作

> 1.table:didSelectRowAtIndex: controller中实现这个方法

> 2.自定义一个方法来实现响应的操作

{% highlight css %}
-(void)table:(WKInterfaceTable *)table didSelectRowAtIndex:(NSInteger)rowIndex
{
    NSLog(@"%li",(long)rowIndex);
}
{% endhighlight %}

### 4.1 Context Menus 手表菜单
手表增加了一个新的交互方式，按住屏幕，会呼出一个菜单选项，**最多四个按钮**，点击这几个按钮其他的地方会使得这个菜单消失，点击相应的按钮进行对应的操作。这个按照需求来，如果有这种需求可以给自己的App添加一个这样的菜单，增加交互性。

<figure>
<img src="{{ site.url }}/images/applewatch/menu.png" alt="menu">
<figcaption>Context Menu</figcaption>
</figure>

每一个菜单按钮都有一个可点击的区域和一个标题，可点击区域都有一个固定的颜色背景，上部可以自己提供一个图片，这个图片有一些特殊的要求，具体的布局如下：

<figure>
<img src="{{ site.url }}/images/applewatch/menubutton.png" alt="menubutton">
<figcaption>Context Menu Button</figcaption>
</figure>

### 4.2 增加一个菜单按钮
按钮可以在设计的时候配置也可以在程序运行的时候配置，运行时在故事板中增加的按钮是不可以被移除的，但是编写出来的按钮是可以程序控制移除的。

> 注意一点：按钮的个数是不能超多四个的"The total number of menu items in a menu cannot exceed four, regardless of whether they are defined in your storyboard file, added programmatically, or a combination of the two."

内置的默认菜单按钮有以下这些：
{% highlight css %}
typedef NS_ENUM(NSInteger, WKMenuItemIcon)  {
    WKMenuItemIconAccept,       // checkmark
    WKMenuItemIconAdd,          // '+'
    WKMenuItemIconBlock,        // circle w/ slash
    WKMenuItemIconDecline,      // 'x'
    WKMenuItemIconInfo,         // 'i'
    WKMenuItemIconMaybe,        // '?'
    WKMenuItemIconMore,         // '...'
    WKMenuItemIconMute,         // speaker w/ slash
    WKMenuItemIconPause,        // pause button
    WKMenuItemIconPlay,         // play button
    WKMenuItemIconRepeat,       // looping arrows
    WKMenuItemIconResume,       // circular arrow
    WKMenuItemIconShare,        // share icon
    WKMenuItemIconShuffle,      // swapped arrows
    WKMenuItemIconSpeaker,      // speaker icon
    WKMenuItemIconTrash,        // trash icon
} NS_ENUM_AVAILABLE_IOS(8_2);
{% endhighlight %}

故事板中我加入了三个按钮，分别设置了他们的类型和题目，显示效果如下：

<figure>
<img src="{{ site.url }}/images/applewatch/threemenubutton.png" alt="threemenubutton">
<figcaption>Three Context Menu Button</figcaption>
</figure>

当然我们也可以在程序运行的时候程序控制增加一个按钮：` addMenuItemWithImage:title:action:`或者采用这个方法：`addMenuItemWithImageNamed:title:action:` 加入的这个按钮是在故事板的基础上的，比如我在故事板加入了三个按钮了，那么再增加一个，就会变成四个,当然了，增加第五个的时候无效，不会显示出来。。。这个菜单也是为了简洁，设置多了感觉也不好。

{% highlight css %}
[self addMenuItemWithItemIcon:WKMenuItemIconDecline title:@"取消" action:@selector(cancel)];
//第四个菜单按钮
{% endhighlight %}

最终的显示效果如下：

<figure>
<img src="{{ site.url }}/images/applewatch/fourmenubutton.png" alt="fourmenubutton">
<figcaption>Four Context Menu Button</figcaption>
</figure>

## 总结 ##
这篇主要是领会了WatchKit App 的相关精神，包括了概述还有一些基础的控件的介绍等等，基本上在Xcode里边感受一下就差不多了，具体的还需要在实战中熟练，之前都是用代码去构建界面，现在用故事板还不是很熟悉。。。不过在定制UI需求不是那么强烈的情况下，使用故事板确实简化了很多操作。

> Stay Hungry

