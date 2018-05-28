---
layout: post
title: "类网易新闻平行视窗广告效果动画"
description: "Parallel Window Animation"
category: iOS Programming
tags: [KVO, Animation]
modified: 2018-05-28
imagefeature: bg/parallelwindowbgbg.jpg
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

### 年初的时候想着这一年一定要更新五篇以上的博客，看看之前的发现我的产出竟然变成了一年一篇的速度，不能忍不能忍。

### 1.大致需求
这次所要记录的一个功能点大概是这样：列表中的某一行cell 在上下滑动的时候，能够看到`底部`的一张大图，效果就像这个列表的背景是一张大图，cell不断的滑动，可以看到这张图不同的位置，这么做的效果很棒，基本注意力都会被这个cell吸引了。。。要么说好的创意都留给广告了=。=

因为这次需求产品给这东西起的名字叫平行视窗，所以这里也就这么叫吧，然后我很自然的命名为`ParallelWindow`了，搞得像自己加了一个虚拟机一样。不过确实不好定义这个东西的名字。。。就这样吧。

第一眼看到这个需求的时候第一个想法，是真的做一个透明的cell，投过去看到tableview的什么东西，background？巴拉巴拉的，然后滑动的时候根据`contentOffset`的变化就应该能实现了吧。

后来想着尽量和我们的列表不要有太多的关联，不要有太多的关联的意思大概就是，不想在`scollView`的代理中去动态的计算一个cell的内部布局，例如:

{% highlight css %}
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{% endhighlight %}

如果那样的话cell的复用处理上可能会有一些麻烦，不知道，没有尝试过，可能也会遇到一些坑，其实都一样，后来用的做法，坑一样有一些，但是讲道理，能用数字计算出来的动画效果都不是问题。

### 2.KVO
##### 好吧，用的是KVO。
这个我之前只在书本上和其他人的技术博客里边看到过，知道它好用，没想到的是，真TM的好用啊，当时用完之后的心情就是这东西真简单。But,坑是有的，不过稍微多注意注意就好了，测试阶段遇到的更多的是，是和现在列表功能所冲突的部分，尽量解耦，但是功能上的限制和设计导致了，也是只能做到尽量二字了。
##### 具体的思路大概是，通过

{% highlight css %}
- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath;

- (void)tableView:(UITableView *)tableView didEndDisplayingCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath*)indexPath
{% endhighlight %}

来检测是否是我们要展示平行视窗的cell，如果是的话，分别在我们的`tableView`中添加观察者，观察者是我们所要动的`ParallelWindowCell`，再通过

{% highlight css %}
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context
{% endhighlight %}

来实现新旧值的动态变化，相应的来调整我们的背景大图的`origin.y`值，恩，没错，其实就是一个假象，看着这张图完整的出现在了屏幕内铺满，实际上只存在在我们需要的cell上，并且这张图片只露出小窗口那么大的区域，我们要做的其实就是不断的改变图片的`origin.y`，来看上去，跟随着cell，背景的Image也在移动。这么做的好处是，每个cell只管好自己的就好，在一屏幕内出现两个这种cell的时候，就很方便了，也解决了看上去会存在的冲突问题。不好的点就是。。。计算上，有点复杂=。=

### 3.开始实现
##### (1)  `DemoVC`

demo目录结构如下，在viewcontroller里边简单了的写了一个所要使用的demoTableview。
这里我还是推荐使用一个临时的数组：
>NSMutableArray<NSIndexPath *> *currentAddObserverIndexPathes;

来保存我们加入过的观察者Cell，移除和增加观察者的时候，都会更新这个临时的数组，好处是我们可以时刻知道加入的是哪一个观察者对象，避免一些奇奇怪怪的现象。后边的坑点部分会提一下。
>移除的时候推荐使用这种抛异常写法，不然重复移除一个不是观察者的观察者会崩掉
>@try { [object removeObserver:target forKeyPath:keypath];}
    @catch (NSException * __unused exception) {}

上面已经提过了添加、移除观察者的时机，下面是具体的添加和移除的过程
添加观察者：

{% highlight css %}
if (![self.currentAddObserverIndexPathes containsObject:indexPath]) {
                    [self.demoTableView addObserver:coverCell
                                         forKeyPath:kParallelWindowObserverKeyPath
                                            options:NSKeyValueObservingOptionOld|NSKeyValueObservingOptionNew
                                            context:nil];
                    [self.currentAddObserverIndexPathes addObject:indexPath];
                }
{% endhighlight %}

移除观察者

{% highlight css %}
if ([self.currentAddObserverIndexPathes containsObject:indexPath]) {
                        [self safeToRemoveObserverWith:self.demoTableView observer:coverCell keyPath:kParallelWindowObserverKeyPath];
                        [self.currentAddObserverIndexPathes removeObject:indexPath];
                    }
{% endhighlight %}

##### (2) `ParallelWindowCell+aboutParallel`
在这个类别之中，具体来处理观察到`tableView`的变化
KVO提供的方法：
>- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context

在这个方法中，我们可以获取到`newY`以及`oldY`，也就是新旧值，通过这些值的差值，来相应的改变我们大图背景的`origin.y`，在视觉上，就有了随着列表滑动而透明的大图浏览效果。

{% highlight css %}
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
if ([keyPath isEqualToString:kParallelWindowObserverKeyPath] && [object isKindOfClass:[UITableView class]]) {
UITableView *observedTableView = (UITableView *)object;
CGFloat newY = [change[@"new"] CGPointValue].y;
CGFloat oldY = [change[@"old"] CGPointValue].y;
CGRect originRect = [observedTableView rectForRowAtIndexPath:self.currentCellIndex];
CGRect convertRect = [observedTableView convertRect:originRect toView:observedTableView.superview];
if (self.parallelAdBG.image) {
[self configCurrentImageustcYWithWindowHeight:COVERNEWSCELL_IMAGE_HEIGHT maxVisibleHeight:observedTableView.ustc_height adImageHeight:self.parallelAdBG.ustc_height currentRectForSuperView:convertRect newY:newY oldY:oldY];
}
}
}
{% endhighlight %}

而为了避免大量的重复计算，我们在cellforrow中填充数据这一步，计算好之后位移的一些相关的属性，大致需要这些

{% highlight css %}
//平行window相关参数
@property (nonatomic, assign) CGSize maxVisibleRectForWindowAD;//平行window所能展示的最大Size
@property (nonatomic, assign) CGFloat bottomLine;//图片在屏幕下方将要出现的临界位置
@property (nonatomic, assign) CGFloat topLine;//窗口完整消失的临界点
@property (nonatomic, assign) CGFloat adImageBottomLine;//窗口完整出现的临界点
@property (nonatomic, assign) CGFloat allDistanceForADImage;//整个滑动过程中，背景图片所要滑动的全程距离
@property (nonatomic, assign) CGFloat adWindowMaxDistance;//adWindow中间状态所能够滑动的最大距离
{% endhighlight %}

PS 可视范围在这个demo中就是整个屏幕，当然特殊的情况要处理的，如果你的客户端有导航栏、tabbar、巴拉巴拉，需要计算出正确的可视范围，也有一个比较方便的做法，就是直接找`superview`。

移动小窗的含义如图所示：

<figure>
<a href="{{ site.url }}/images/parallelWindow/whatiswindow.jpg"><img src="{{ site.url }}/images/parallelWindow/whatiswindow.jpg"></a>
</figure>

计算的过程如下：

这里需要注意的一点就是，当这个`cell`，被`filldata`之后，我们是需要计算出，这个大图，在初始化出来之后的位置，要确保是正确的，也就是在赋值的时候，就要`第一次`计算出这个大图的`Y`的数值了。

最重要的部分代码如下，也是整个过程的核心所在：
>`规则1`.图中移动小窗从屏幕最下开始露出，到刚刚完整露出：图片要保证最底和整个window最底对齐

>`规则2`.图中移动小窗从屏幕最上开始滑出，到刚刚完成滑出：图片要保证最顶部和整个window最上对齐

>`规则3`.中间区域，根据双方高度差，决定相对位移，来满足上面两点

下面是核心方法的注释：

{% highlight css %}
/**
 用来实时计算和调整当前平行window大图背景的相对位置，主要是调整Y
 
 @param windowHeight 可视窗口高度
 @param maxVisibleHeight 整个屏幕中，可以看到大图的最大高度
 @param adImageHeight 实际的大图高度
 @param currentRectForSuperView 当前cell相对于tableView的父视图的相对坐标Rect
 @param newY KVO观察到的新的tableview contentoffset
 @param oldY KVO观察到的旧的tableview contentoffset
 */
- (void)configCurrentImageustcYWithWindowHeight:(CGFloat)windowHeight
                                 maxVisibleHeight:(CGFloat)maxVisibleHeight
                                    adImageHeight:(CGFloat)adImageHeight
                          currentRectForSuperView:(CGRect)currentRectForSuperView
                                             newY:(CGFloat)newY
                                             oldY:(CGFloat)oldY
{% endhighlight %}

看不懂没关系。。。我七天不看我也不知道什么意思了，在demo中多看两次，试试数字，打印打印log，应该就差不多了解了 =。=

{% highlight css %}
计算两个必备的临时变量：
//cell相对于tableview的父view相对坐标的Y
CGFloat currentRectForSuperViewY = currentRectForSuperView.origin.y;
//当前窗口真实滑动的距离
CGFloat windowRealDistance = self.bottomLine - currentRectForSuperViewY;
{% endhighlight %}

##### (2.1)  实现和满足`规则1`

{% highlight css %}
if (currentRectForSuperViewY == self.bottomLine) {
        finalY = - adImageHeight;
} else if (currentRectForSuperViewY < self.bottomLine && currentRectForSuperViewY > self.adImageBottomLine) {
        finalY = - adImageHeight + windowRealDistance;
} else if (currentRectForSuperViewY == self.adImageBottomLine) {
        finalY = -(adImageHeight - windowHeight);
}
{% endhighlight %}

##### (2.2)  实现和满足`规则2`

{% highlight css %}
else if (currentRectForSuperViewY == -self.imageBoard.ustc_y) {
        finalY = 0;
} else if (currentRectForSuperViewY < -self.imageBoard.ustc_y && currentRectForSuperViewY > self.topLine) {
        finalY =  - currentRectForSuperViewY - self.imageBoard.ustc_y;
} else if (currentRectForSuperViewY == self.topLine) {
        finalY = -self.topLine;
}
{% endhighlight %}

##### (2.3)  实现和满足`规则3`（思考过程极其痛苦）

<figure>
<a href="{{ site.url }}/images/parallelWindow/superparallelwindow.png"><img src="{{ site.url }}/images/parallelWindow/superparallelwindow.png"></a>
</figure>

代码贴图，具体可以在demo中一点点研究，应该会有更简单更容易实现的算法，如果有的话 大神可以来一起交流一哈~因为我觉得我这个纯计算上，真的有点烧脑。。。

归根到底的思想就是
分三种情况，背景图高度大于、等于、小于可视窗口，其中最简单的是等于的情况，按照`diff = newY - oldY`的多少来实时的计算就好：

{% highlight css %}
if (adImageHeight == maxVisibleHeight) {
    self.parallelAdBG.ustc_y += diff;
    return;
}
{% endhighlight %}

demo中我手动写了一个小于的情况，所以在demo展示上，第一个出现的背景高于可视窗口，第二个则是小于的情况，方便调试。

{% highlight css %}
//test 短图
if (viewModel.cellType == CellTypeParallelShort) {
calculateHeight = [UIScreen mainScreen].bounds.size.height - 150;
}
{% endhighlight %}

这里我以背景高度小于可视窗口来距离，当可视窗口上移的时候，我们要按照比例，来计算出背景大图需要移动的距离：

{% highlight css %}
//背景大图需要移动的距离
parallelAdBGNeedChangeDistance = diff*remainderADImageDistance/remainderWindowDistance;
{% endhighlight %}

但是因为图片是加在整个cell上的，此时此刻，cell本身也是有位移的，因此根据`多退少补`的政策，我们需要计算出真正的`diff`:

{% highlight css %}
//计算总的diff
totalDiff += diff + factor * parallelAdBGNeedChangeDistance;
{% endhighlight %}

最后的这个`totalDiff`才是最终的变化量，因此得出最后的位置：

{% highlight css %}
//计算新的y值
self.parallelAdBG.ustc_y += totalDiff;
{% endhighlight %}

总结一下就是：cell上移，图片上移，按照速率移动，最终要满足规则1和2。当背景大图高度大于可视窗口的情况同理，不同的是，cell上移，图片要下移~反之cell下移，图片要上移。这是这个算法最初要实现的东西。如果觉得这个算法很难看懂，不妨多拆几步，因为这份现在的代码是已经高度合并之后的了，可以按照`diff`是正是负来走判断语句的同时，再走`adImageHeight和maxVisibleHeight`的大小的判断语句，最后正负加减符号一顿骚操作，发现最后的代码是现在的这个样子。

最后demo中的工程实现出来的样子：

<figure>
<a href="{{ site.url }}/images/parallelWindow/parallelamazingdemo.gif"><img src="{{ site.url }}/images/parallelWindow/parallelamazingdemo.gif"></a>
</figure>

demo的`github`地址：
[Parallel Demo Github](https://github.com/jerryliurui/AmazingParallelWindow)

### 4.坑点
理想总是很美好，效果看上去也不错，但是在测试的时候，还是发现了很多问题，当然在这个demo中是没有遇到的，那是因为这个demo只有一个简单的list，没有其他额外的业务逻辑。
举个例子，涉及下拉刷新=。=，像我们客户端中，在下拉刷新之后，会出现一个类似于`tips`一样的小横幅，被当做了整个tableView的headerview，在消失的时候，会改变`offset`来实现一个顺滑的动画，这个地方的问题就来了，图片会在用户滑动之后，抖动一下，这就需要在这个`headerview`出现和消失的时候做处理了，在消失的时候，消失动画在屏幕内，和不在屏幕内，也要区分处理了，这就体现出之前我们的那个临时观察者数组的必要性了。。。就是为了某些特殊的情况，要暂时的移除掉所有的已经加上去的观察者了，在触发或者满足了某些条件之后，再加回来。
第二个坑点，就是发现某些时候，背景大图速率不对，会快，最后也是因为这个观察者数组解决掉了。一开始以为是cell复用的问题，导致一些计算上的参数不对，但是后来还是发现是没有很好的移除掉导致的关联性问题。

### 5.End

<figure>
<a href="{{ site.url }}/images/parallelWindow/IMG_8505.jpg"><img src="{{ site.url }}/images/parallelWindow/IMG_8505.jpg"></a>
</figure>

过程很复杂，自己画图研究了好一会才捋清楚其中的计算过程，但是讲道理，能用数字解决的问题都不是问题=。=
后边打算写一个关于之前写的另一个控件`SegmentView`的博客，效果类似于微博中，滑来滑去的二级导航下边的橙色小条。
