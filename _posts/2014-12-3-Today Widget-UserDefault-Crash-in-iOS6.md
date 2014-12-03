---
layout: post
title: "Today Widget 使用UserDefault导致主程序在iOS6下崩溃"
description: "Today Widget crash in iOS6"
category: iOS Programming
tags: [iOS8, TodayWidget,iOS6]
modified: 2014-12-03
imagefeature: blog_bg_3.jpg
comments: true
share: true
---

今天一大清早的来到公司就遇到了一个不是很让人开心的问题。。。产品刚刚经过审核，今儿上线了，但是我完成的today widget制造了一个线上`bug`，也算人生第一次了吧，比较郁闷，但是想想还是长了教训了，谁让我在当时写这个地方的时候考虑不周了呢。。。

### **BUG起因**:
`Today Widget` 中可以和主程序共享数据，方法也有几种，由于我的需求比较简单，我只需要从客户端拿到用户的用户名就可以了，所以我选择了相对比较简单的`NSUserDefaults`这种方法,我的基本思路就是在程序初始化用户的时候记录一个用户名，记录在主程序和扩展的共享数据中，当注销用户的时候再将这个用户名销毁，就是这么简单的一个思路。。。

### **BUG再现**:
因此我写了两个方法，`- (void)saveUserNameForTodayWidget`用来存取用户名给widget`- (void)clearUserNameForTodayWidget`用来销毁用户名。首先在存取的方法中，我一开始是这么书写的：
{% highlight css %}
- (void)saveUserNameForTodayWidget
{
    //登陆成功之后将用户信息保存给today widget
        NSUserDefaults *todayWidgetUserDefault = [[NSUserDefaults alloc] initWithSuiteName:APP_GROUP_IDENTIFIE];
        [todayWidgetUserDefault setObject:_username forKey:KEY_USERNAME_FOR_TODAYWIDGET];
        [todayWidgetUserDefault synchronize];
}
{% endhighlight %}

可能是太过基础。。。于是也就没有多想。。。但实际上我犯了一个很严重的错误，`NSUserDefaults`使用方法的时候没有注意到系统版本的兼容性，使用`Api`不注意这个实在是有些不应该，就当交学费了。。。话说我们有一个比较有意思的规定就是谁出现了线上bug就需要请别人喝饮料了。。。和谐，只能说是和谐。

具体的`Api`出错的是这个:
{% highlight css %}
- (instancetype)initWithSuiteName:(NSString *)suitename NS_AVAILABLE(10_9, 7_0) NS_DESIGNATED_INITIALIZER; 
{% endhighlight %}
这就是为啥导致我的widget 让所有使用iOS6 的人无法登陆无法打开客户端的原因。。。
修改之后的代码：
{% highlight css %}
- (void)saveUserNameForTodayWidget
{
    //登陆成功之后将用户信息保存给today widget
    if (isiOS8Later) {
        NSUserDefaults *todayWidgetUserDefault = [[NSUserDefaults alloc] initWithSuiteName:APP_GROUP_IDENTIFIE];
        [todayWidgetUserDefault setObject:_username forKey:KEY_USERNAME_FOR_TODAYWIDGET];
        [todayWidgetUserDefault synchronize];
    }
}
{% endhighlight %}

> 由于`Today Widget`在iOS8之后才有的，于是这个地方改成`isiOS8Later`最合适一些。

最后，默默地找个墙角。。。