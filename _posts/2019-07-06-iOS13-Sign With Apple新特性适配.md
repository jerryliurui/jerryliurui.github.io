---
layout: post
title: "iOS13 SignInWithApple适配"
description: "iOS13 Sign in with Apple"
category: iOS Programming
tags: [iOS13, Sign in, AppleID]
modified: 2019-07-06
imagefeature: bg/屏幕快照 2019-07-04 下午10.51.28.png
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

#### 0.前言

`WWDC2019`推出了`Sign With Apple`，即用户通过端上的Apple ID就可以登录第三方应用，其实大部分的应用已经在使用诸如`Twitter`、`Ins`等第三方登录来进行快捷登录，省去了很多的麻烦。考虑到咱们的具体情况，近几年越来越多的国内应用实际上优先推的是手机号登录，其次是`微信`,`微博`,`QQ`等第三方应用直接登录，最后才是各自的帐号体系。总之，这次苹果爹提供了一个快捷登录的选择，也是通过这个跨平台的功能使得在这个生态环境中的应用操作更加的顺滑。有几点比较重要的点写在前言里边，这也是适配这个新特性优先要考虑的事情:

* [Updates to the App Store Review Guidelines](https://developer.apple.com/news/?id=06032019j) 更新的审核信息中，提到了凡是包含了第三方登录的应用，那同样的需要适配`Sign With Apple`，否则有不过的危险。

<figure>
<a href="{{ site.url }}/images/SignInWithApple/AppleReview.png"><img src="{{ site.url }}/images/SignInWithApple/AppleReview.png"></a>
</figure>

* 帐号体系：由于这个新特性需要后台的配合(后边会具体描述)，因此这种登录方式已经不单单是像目前的第三方登录那么简单的适配，如何和自己的应用目前的帐号体系完美衔接是一个非常值得思考的问题。

结合上面的两个问题，下面将会详细的从2个方面来介绍这个新特性，分别是

* 1.什么是`Sign With Apple`
* 2.如何接入`Sign With Apple`

#### 1.什么是`Sign With Apple`

它是苹果在WWDC2019中推出的一个跨平台的新特性，用户可以通过使用自己设备登录的Apple ID来进行第三方应用的登录，相关的Session如下，并给出了一个相关的demo

[WWDC Session](https://developer.apple.com/videos/play/wwdc2019/706/)

通过课程的学习，苹果真的是反复的阐述安全性，包括本身Apple ID具备的双重认证、用户可以隐藏自己的Apple ID等，这些都使得用户隐私得到了最大的保护，虽然我们依然可以通过`API`来获取到诸如用户姓名这样的信息，但是最为关键的`userIdentifier`则是毫无规律可言的(至少在我们开发者看来)，而这个`userIdentifier`则为同一个开发者账号下的所有app中保持有且仅有一个，这个特点看上去能够和已有的帐号体系打通，后边会继续分析这个特点。

而看完整个session最大的感觉是，如果是一个新的APP，接入`Sign With Apple`真的不算是一件难事儿，甚至是一个很轻松的体验，包括实际demo写下来，除了零星一些使用上的不太对劲以外，在Xcode Beta级别，这个功能还算完整和炫酷。

#### 2.如何接入`Sign With Apple`

在接入之前，有些工程设置是需要先进行的：

在工程的`Siging & Capabilities`tab 下添加`capability`

<figure>
<a href="{{ site.url }}/images/SignInWithApple/applesign1.png"><img src="{{ site.url }}/images/SignInWithApple/applesign1.png"></a>
</figure>

<figure>
<a href="{{ site.url }}/images/SignInWithApple/AddAppleIDSign.png"><img src="{{ site.url }}/images/SignInWithApple/AddAppleIDSign.png"></a>
</figure>

设置完这个，便可以通过下边的四个步骤来快速的接入`Sign With Apple`

<figure>
<a href="{{ site.url }}/images/SignInWithApple/HowToAddAppleID.png"><img src="{{ site.url }}/images/SignInWithApple/HowToAddAppleID.png"></a>
</figure>

##### (1) 系统内置的登录按钮

这个和去年的`Add To Siri`是一模一样的推荐方式，类似这种`Present`系统内置页面的按钮，苹果都是给一个推荐的按钮，我是觉得如果使用苹果推荐的按钮，苹果肯定是非常开心的，但是毕竟是别人提供的，使用上有很多的限制，个性化上会做出很大的让步，但是按钮样式是和苹果控件及其符合的。下图给出了大致上的一些样式(貌似只能改变大小和圆角)

<figure>
<a href="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-28 下午2.41.36.png"><img src="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-28 下午2.41.36.png"></a>
</figure>

在自己的登录页面内添加btn，然后绑定Action即可

##### (2) Authorization

当用户点击登录按钮的时候，会给我们时机去发起一个Apple ID登录请求

{% highlight css %}
ASAuthorizationAppleIDProvider *appleIDProvider = [ASAuthorizationAppleIDProvider new];
    ASAuthorizationAppleIDRequest *request = appleIDProvider.createRequest;
    [request setRequestedScopes:@[ASAuthorizationScopeFullName,ASAuthorizationScopeEmail]];
    
    //需要考虑已经登录过的用户，可以直接使用keychain密码来进行登录-这个很牛皮。。。
    ASAuthorizationPasswordProvider *appleIDPasswordProvider = [ASAuthorizationPasswordProvider new];
    ASAuthorizationPasswordRequest *passwordRequest = appleIDPasswordProvider.createRequest;
    
    ASAuthorizationController *appleSignController = [[ASAuthorizationController alloc] initWithAuthorizationRequests:@[request]];
    appleSignController.delegate = self;
    appleSignController.presentationContextProvider = self;
    [appleSignController performRequests];
{% endhighlight %}

主要通过使用`#import <AuthenticationServices/AuthenticationServices.h>`框架来实现整个的苹果ID登录流程

而核心的类是`ASAuthorizationAppleIDProvider`,他是来创建和发起苹果ID登录请求的提供者。

上面的代码同样提到了另一个`Provider`，`ASAuthorizationPasswordProvider`，这个则是说当我们的App之前用户已经登录过，并且在Keychain中已经存储了用户名密码的话，弹出的登录页面会有所不同，下图左边是没有发送passwordrequest的认证页面，右边是发送了passwordrequest的认证页面

<figure>
<a href="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-27 下午6.19.25.png"><img src="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-27 下午6.19.25.png"></a>
</figure>

左图同样可以看出，这里我是可以选择隐藏邮件地址的，那么在之后的回调中，我们收到的email就是一个混乱的邮箱地址，因此这里不建议拿着苹果给我们的这个邮箱地址搞事情。ps姓名处可以进行修改，而且是任意修改。

> 这里点击继续或者使用密码继续，如果无网络会无法继续，停留在在这个页面。

##### (3) 登录页增加相关代理

> ASAuthorizationControllerPresentationContextProviding

主要用来提供给系统在哪个页面出现认证登录系统页面，这个比较好理解，也只有一个方法需要去实现:

{% highlight css %}
- (ASPresentationAnchor)presentationAnchorForAuthorizationController:(ASAuthorizationController *)controller {
    return self.view.window;
}
{% endhighlight %}

> ASAuthorizationControllerDelegate

这个需要实现两个方法，用来响应系统认证登录页面的结果，来处理之后的事项：

{% highlight css %}
- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithError:(NSError *)error {
    //Sign with Apple 失败
    
}
{% endhighlight %}

```objective-c
- (void)authorizationController:(ASAuthorizationController *)controller didCompleteWithAuthorization:(ASAuthorization *)authorization {
		//Sign with Apple 成功
}
```

在完成回调中我们可以拿到`authorization`,进而可以拿到`authorization.provider`,通过对`provider`的解析，我们同样可以知道是哪一种类型的request来进行下一步的操作(上文提到了两个provider:appleID或者password)：

```objective-c
if ([authorization.provider isKindOfClass:[ASAuthorizationPasswordProvider class]]) {
        //取的keychain中的用户名密码，这里可以直接登录了，然后返回正常的登录结果即可
        //此时并不是使用Sign with Apple
        ASPasswordCredential *passwordCredential = authorization.credential;
        if ([passwordCredential isKindOfClass:[ASPasswordCredential class]]) {
            NSString *userName = passwordCredential.user;
            NSString *password = passwordCredential.password;
            
            //直接使用邮箱登录
            
        }

    } else if ([authorization.provider isKindOfClass:[ASAuthorizationAppleIDProvider class]]) {
    				//此时为使用Sign With Apple 方式登录
  					//继续进行客户端后台登录验证
    }
```

核心的返回参数解析：

```objective-c
/**
 苹果用户唯一标识符，该值在同一个开发者账号下的所有 App 下是一样的，开发者可以用该唯一标识符与自己后台系统的账号体系绑定起来
 */
@property (nonatomic, copy) NSString *userIdentifier;

/**
 苹果返回的该用户的状态
 */
@property (nonatomic, assign) ASUserDetectionStatus realUserStatus;

/**
 用户邮箱，注意这里用户可以选择隐藏自己的邮箱地址的，因此这个值不一定是真正的邮箱地址
 */
@property (nonatomic, copy) NSString *email;

/**
 token 给后台向苹果服务器验证使用
 */
@property (nonatomic, copy) NSString *token;

/**
 authorizationCodeString 给后台向苹果服务器验证使用 这个有时效性 五分钟之内有效
 */
@property (nonatomic, copy) NSString *authorizationCode;
```

`ASUserDetectionStatus`状态分为以下几种:

```objective-c
typedef NS_ENUM(NSInteger, ASUserDetectionStatus) {
    ASUserDetectionStatusUnsupported,
    ASUserDetectionStatusUnknown,
    ASUserDetectionStatusLikelyReal,
};
```

一份真实返回的数据(NSData->NSString)

<figure>
<a href="{{ site.url }}/images/SignInWithApple/AppleIDUserModel.png"><img src="{{ site.url }}/images/SignInWithApple/AppleIDUserModel.png"></a>
</figure>

##### (4) 处理AppleID登录状态变化

因为用户使用的是`Apple ID`来进行登录的，所以自然而然的就要考虑到用户切换`Apple ID`的情况，这种情况下，之前的登录状态理应不再存在。

这里还需要额外的说一种情况，用户其实在使用`Apple ID`来进行登录之后，是可以在设置中选择删除掉曾经登录过的应用的，那如果是这个情况，应用也需要做相应的处理并取消登录态。

<figure>
<a href="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-28 下午2.41.44.png"><img src="{{ site.url }}/images/SignInWithApple/屏幕快照 2019-06-28 下午2.41.44.png"></a>
</figure>


主要的应对方法有两种:

* 1.在客户端每次启动/回到前台 的时候进行状态查询，当用户使用过`AppleID`进行登录咱们的应用之后，我们会拿到一个唯一的`UserIdentifier`,我们便可以拿着这个去验证，当状态异常的时候，及时登出+弹窗，做相应的处理：

```objective-c
ASAuthorizationAppleIDProvider *provider = [ASAuthorizationAppleIDProvider new];
        [provider getCredentialStateForUserID:_appleUser.userIdentifier completion:^(ASAuthorizationAppleIDProviderCredentialState credentialState, NSError * _Nullable error) {
            switch (credentialState) {
                case ASAuthorizationAppleIDProviderCredentialRevoked:
                    //用户重新登录了其他的apple id
                		//登出+提示
                    break;
                case ASAuthorizationAppleIDProviderCredentialAuthorized:
                    //该userid apple id 登录状态良好
                		//继续用户行为即可
                    break;
                case ASAuthorizationAppleIDProviderCredentialNotFound:
                    //该userid apple id 登录找不到
                    //用户在设置-appleid header-密码与安全性-使用您 Apple ID的App 中将网易新闻的禁止掉了
                    break;
                default:
                    
                    break;
            }
        }];
```

* 2.监听用户AppleID状态变化的通知

> ASAuthorizationAppleIDProviderCredentialRevokedNotification

```objective-c
[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleAppleIdHasChanged) name:ASAuthorizationAppleIDProviderCredentialRevokedNotification object:nil];
```

最后总结一些整个`Apple ID`登录的时序图，方便大家理解，从图上确实可以看出和第三方登录非常的相似，只是可以将`iOS`系统替换成第三方应用即可。

<figure>
<a href="{{ site.url }}/images/SignInWithApple/AppleID登录时序图.png"><img src="{{ site.url }}/images/SignInWithApple/AppleID登录时序图.png"></a>
</figure>

