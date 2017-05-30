---
layout: post
title: "类网易新闻跟贴Label动画"
description: "Label Animation"
category: iOS Programming
tags: [Label, Animation]
modified: 2017-05-30
imagefeature: bg/459_570b401a8a6f2.jpg
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
貌似又好久好久没有写博客了，后来发现不看不学不练这个DOTA梗不能用在工作上呀，于是今年开始要定了一些小目标了，比如完成几篇博客这样的~
先说点题外话吧。正式入职到现在已经十个多月了，好快好快，真正的接触业务代码让自己成长的很快，也在不断的改善自己的代码习惯。前不久公司就组织了几次代码规范方面的讨论会，代码习惯每个人都不一样，大家遵循一套就好了，看着也舒服，包括Review 的时候，一开始还是不是很习惯的，比如方法后面的括号我之前习惯是这么写的：

{% highlight css %}
- (void)configRandomArrayWithArrayCount:(NSInteger)count 
{
}
{% endhighlight %}

`然后改成了这样`：

{% highlight css %}
- (void)configRandomArrayWithArrayCount:(NSInteger)count {
}
{% endhighlight %}

类似这样的小习惯吧，虽然看上去都不是什么大事儿，不过积少成多吧，标准多了利己利人~

言归正传吧，今儿是复盘之前做的一个跟贴动画，类似网易新闻客户端正文最下边的跟贴动画样式，根据差值来算出几组不同的数字~

<figure>
<a href="{{ site.url }}/images/AnimationLabel/neteaseAnimation.gif"><img src="{{ site.url }}/images/AnimationLabel/neteaseAnimation.gif"></a>
</figure>

### 1.大致需求
其实看上去只是一个简单的标签，但是简直是细思极恐，里边的细节真的好多，还真是用户用的时候是不会真正感知背后开发人员是咋过来的=。=

大致需求上是这样，一开始加入哈，`Label`上的`String`是666，变化到999，分成十组增长值，每加一组增长值，数字要变化，这个变化的过程是需要动画的，从个位开始，每个“数字”都要向上进行跳动，一直跳动到最后一个变化的"数字"，并不是每一位都要跳动的。这就要求，每次都要算出变化到了第几位，每次应该还都不一样，因为是一个随机的过程。

当然这里的demo是随机的分出若干组的，实际需求可能也会出现例如根据实时的数字，其实效果是一样的，都是根据增长值来进行动画~

需要费时间的点大概有下边几个，攻克了就应该可以解决需求：
> 1.如何计算出X组随机数

> 2.如何合理的进位、减位（减位这种情况理论上是不会出现的）

> 3.动画顺序、位数的计算

其中第二条应该是最耗时间的，也是最麻烦的，因为说是`标签Label`动画，但是相当于，每一个“数字”都是一个标签~，因此就又涉及到了布局、重新布局、计算宽度等问题。

大致分析好需求和思路，下面开始实现它。

### 2.实现
#### （1）辅助类LabelAnimationHelper
这一部分属于纯数学方面的东西了。。。讲道理当时想的时候听费劲，算的我怀疑人生。。首先要设计一个辅助类，来帮助我们计算动画的所需要的材料，给需要的地方直接使用。这里暂且叫做`LabelAnimationHelper`。在这个`单例`中设计主要的属性，和需要的计算方法。下图是大致的方法：

<figure>
<a href="{{ site.url }}/images/AnimationLabel/animationHelperFuncs.png"><img src="{{ site.url }}/images/AnimationLabel/animationHelperFuncs.png"></a>
</figure>

1.计算母数

{% highlight css %}
- (void)calculateRandomCountWithOri: (NSInteger)oriCount withPercentage: (CGFloat)percent {
    NSInteger randomCount = 0;
    if (percent > 1 || percent <= 0) {
        randomCount = 0;
    }else if (percent == 1) {
        randomCount = oriCount;
    }else {
        float remainder = oriCount % (int)(percent * 100);
        randomCount = oriCount * percent + remainder;
    }
    _randomReplyCount = randomCount;
}
{% endhighlight %}

这个方法也是强业务相关的，并不是要求所有的数都作为母数来制作动画，而是计算百分之X，来决定母数。注意传入参数的容错和判断。最后要考虑非整除的情况，不要把母数的母数弄小了 =。=

2.计算增值数组
由`666`到`999`，将`333`这个数随机分成十组。

从设计函数的角度来讲，又要和业务有关系，就需要考虑很多情况，简单的说随机十个数，但是在具体实现的时候就要考虑例如排序、排重、参数验证等。

函数：
{% highlight css %}
/**
 *  将randomReplyCount分成count个随机数
 */
- (void)configRandomArrayWithArrayCount:(NSInteger)count;
{% endhighlight %}

最终我们要获得一个十个增长值，例如10，15，8，20这样的数组。

`排重`的原因就是我们要十组，但是不幸的是获得的随机数如果是一样的，那么差值是0，在最后的表现上，就会少一组动画，这也是比较极端的情况了，但是讲道理好吧，要严谨。

`排重`：
{% highlight css %}
    NSMutableArray *randomArray = [NSMutableArray new];
    while (randomArray.count < count) {
        int value = arc4random() % _randomReplyCount + 1;
        NSNumber *valueNumber = [NSNumber numberWithInt:value];
        
        if (![randomArray containsObject:valueNumber]) {
            [randomArray addObject:valueNumber];
        }
    }
{% endhighlight %}

`_randomReplyCount`是1中方法计算出的母数。

`排序`:
{% highlight css %}
    NSArray *sortedArray = [NSArray new];
    sortedArray = [randomArray sortedArrayUsingComparator:^NSComparisonResult(NSNumber *obj1, NSNumber *obj2) {
        NSInteger loc1 = [obj1 integerValue];
        NSInteger loc2 = [obj2 integerValue];
        if (loc1 < loc2) { return NSOrderedAscending; }
        else if (loc1 > loc2){ return NSOrderedDescending; }
        else { return NSOrderedSame; }
    }];
{% endhighlight %}

`算出增长值`:
{% highlight css %}
NSMutableArray *diffArray = [NSMutableArray new];
    for (int i = 0; i < count; i ++) {
        if (i == 0) {
            diffArray[0] = [NSNumber numberWithInteger:[sortedArray[0] integerValue]];
        }else {
            diffArray[i] = [NSNumber numberWithInteger:[sortedArray[i] integerValue] - [sortedArray[i - 1] integerValue]];
        }
    }

{% endhighlight %}

最后一定要记得最后一个数，从上面可以看出来还少一个：
{% highlight css %}
 diffArray[count] = [NSNumber numberWithInteger:_randomReplyCount - [sortedArray[count - 1] integerValue]];
{% endhighlight %}

#### （2）UI类AnimationLabelView
上面已经提到了这个View，将会包含若干个Label，每一个Label都有自己的使命，用来显示一个数字，有的还要负责跳动，额。。。上面好像没有提到。。。那现在提一下。。。

这个View要记录上一次的字符串数组，原因是要和新的字符串数组进行对比从而来决定跳动的位数等。下面展开几个比较重要的方法，其实当时写的时候很混乱的，后来抽出来几个方法：

`拆666为[6,6,6]`:
{% highlight css %}
- (NSArray *)configCommentTextCharArrayWith:(NSString *)commentText {
    if(verifiedString(commentText)){
        NSMutableArray *temArray = [NSMutableArray new];
        
        while (commentText.length != 0) {
            NSString *oneCharString = [commentText substringToIndex:1];
            [temArray addObject:oneCharString];
            commentText = [commentText substringFromIndex:1];
        }
        
        return validArrayValue(temArray);
    }else {
        return nil;
    }
}
{% endhighlight %}

`计算需要跳动的次数`:
{% highlight css %}
- (NSInteger )calculateAnimationTimesWithNewCommentText:(NSString *)increasedCommentText{
    //非法的新commentText 返回0
    if (!verifiedString(increasedCommentText)) {
        return 0;
    }
    
    NSArray *increaseArray = [self configCommentTextCharArrayWith:increasedCommentText];
    if (verifiedNSArray(_commentTextCharArray) && verifiedNSArray(increaseArray)) {
        
        if (increaseArray.count != _commentTextCharArray.count) {//进位或者减位的情况，新view的每一位都要跳动
            return increaseArray.count;
        }else{//没有进位，具体判断
            NSInteger highestLocation = 0;
            for (int i = 0 ; i < increaseArray.count; i ++) {
                if (![increaseArray[i] isEqualToString:_commentTextCharArray[i]]) {
                    highestLocation = increaseArray.count - i;
                    break;
                }
            }
            return highestLocation;
        }
    }else {
        return 0;
    }
}
{% endhighlight %}

`进位、减位`：
这一步也是最麻烦的，需要相应的增加Label和减少Label，也是最容易出错的地方，代码比较多，可以在demo中找到，主要的思路就是增减label，调整其他label。

`动画`：
`Core Animation`就可以满足我们的需求了，实现的方法：
{% highlight css %}
 CGPoint originalP = label.layer.position;
    CAKeyframeAnimation *posAnim = [CAKeyframeAnimation animationWithKeyPath:@"position"];
    NSArray *values = @[[NSValue valueWithCGPoint:originalP],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y - 1.0)],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y - 3.0)],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y - 6.0)],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y - 3.0)],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y - 1.0)],
                        [NSValue valueWithCGPoint:CGPointMake(originalP.x, originalP.y + 0.5)],
                        [NSValue valueWithCGPoint:originalP]];
    posAnim.values = values;
    posAnim.keyTimes = @[@(0.0), @(0.05), @(0.4) , @(0.5) , @(0.75) , @(0.9) , @(0.95) , @(1.0)];
    posAnim.duration = 0.2;
    [label.layer addAnimation:posAnim forKey:@"labelAnimation"];
{% endhighlight %}

找到下一个动画的label:
{% highlight css %}
UILabel *nextLabel = (UILabel *)_labelsArray[newIndex];
    NSString *nextString = _commentTextCharArray[newIndex];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        double delayInSeconds = 0.16;
        dispatch_time_t jumpTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
        dispatch_after(jumpTime, dispatch_get_main_queue(), ^{
            [self startLabelAnimation:nextLabel withLabelText:nextString withIndex:newIndex];
        });
    });
{% endhighlight %}

#### （3）定时器来完成动画
这里写了一个枚举，动画分成三种，多次、单次和无动画，满足不同的需求吧。
{% highlight css %}
typedef NS_ENUM(NSInteger, LabelAnimationHelperChangeValueType) {
    LabelAnimationHelperChangeValueTypeGroupAnimation,
    LabelAnimationHelperChangeValueTypeOnceAnimation,
    LabelAnimationHelperChangeValueTypeNoneAnimation
};
{% endhighlight %}

具体实现来说需要一个定时器来完成多组的动画的:
{% highlight css %}
_animationIntervalTimer = [NSTimer scheduledTimerWithTimeInterval:ANIMATION_TIME_INTERVAL target:self selector:@selector(playCommentViewAnimation) userInfo:nil repeats:YES];
        [[NSRunLoop currentRunLoop] addTimer:_animationIntervalTimer forMode:NSRunLoopCommonModes];
{% endhighlight %}

`进行动画`：
<figure>
<a href="{{ site.url }}/images/AnimationLabel/playAnimation.png"><img src="{{ site.url }}/images/AnimationLabel/playAnimation.png"></a>
</figure>

具体的代码在demo中都可以找到，DEMO的效果GIF是这样的：（GIF看上去会有卡顿。。动画不流畅和完整）
<figure>
<a href="{{ site.url }}/images/AnimationLabel/demoAnimation.gif"><img src="{{ site.url }}/images/AnimationLabel/demoAnimation.gif"></a>
</figure>

具体的可以在代码中修改，例如初始值是66666，我给的参数是`十组增长值`，一共增幅`3333`~

DEMO中代码大部分是从工程中摘出来的，作为一个例子应该是够了，欢迎大家完善给出好的建议~

### 3.End
可以看出来一个简单的label动画实际内部的东西还是挺多的，容易出错的地方也很多，当时写的时候真是要验证各种情况，然后反复调试，都心里没底啊，实际还和业务需求有很大的关系，所以这里还是主要记录一些我在解决这个问题的时候的思路和方法，很多可能都不是最优解，还有可以简化的地方。但从最后的显示结果看已经可以满足需求了。好了，我去完善demo然后放在`GitHub`上，希望能够帮助到需要的人~~

马上就要WWDC2017了，也会集中学习一些新的东西，分享在博客中~

PS：端午快乐~
