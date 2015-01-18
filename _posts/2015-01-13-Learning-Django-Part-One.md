---
layout: post
title: "学习Django笔记一：前期折腾"
description: "Learning Django Part One"
category: Python Programming
tags: [Python,Django]
modified: 2015-01-17
imagefeature: blog_bg_django_part_one.png
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

**开始崭新的学习之旅。。。由于毕设目前的设想，需要一个自己的后台，以及一个爬虫，前期调研到现在种种迹象表明我可以借助python的力量，只是大概，具体实现细节还需要深入调研吧，先整理一下最近接触的一个成熟的框架Django。**

### 0.pip的安装 
可以去github这里获取pip [pip Github 地址](https://github.com/pypa/pip)
可以命令行直接
{% highlight css %}
sudo easy-install pip
{% endhighlight %}


### 1.如何测试安装好了django

#### Django简介
`Django`是一个开源、免费、成熟的`Python Web`框架，省去了很多不必要的重复开发，因此非常适合快速的部署、设计和开发自己的应用，官网在介绍的时候用到了`Ridiculously fast`来形容使用这个框架是多么的快捷。

#### Django的一些参考资料：
1.[Django1.7 官方文档参考](https://docs.djangoproject.com/en/1.7/)
2.[一个关于Django1.7非常好的教学Demo](http://tutorial.djangogirls.org/)

官方文档中已经包含了一个非常不错的动手Demo了，可以非常快速的上手和学习。

#### Django安装
- **先安装： pip install django **
- **命令行：python3 进入python **

{% highlight css %}
>>>  import django
>>>  print(django.get_version())
显示 版本信息：1.7.2 就证明安装上了
{% endhighlight %}

### 2.新建一个Django项目感受一下
- **进入到一个目录下，执行django-admin.py startproject mysite这个目录下就是要存储代码的目录**

{% highlight css %}
自动创建显示的目录如下
mysite/
    manage.py
    mysite/
        __init__.py
        settings.py
        urls.py
        wsgi.py
{% endhighlight %}

- 外层 mysite/ 目录只是你项目的一个容器。对于 Django 来说该目录名并不重要; 你可以重命名为你喜欢的。
- manage.py: 一个实用的命令行工具，可让你以各种方式与该 Django 项目进行交互。 你可以在 django-admin.py and manage.py 中查看关于 manage.py 所有的细节。
- 内层 mysite/ 目录是你项目中的实际 Python 包。该目录名就是 Python 包名，通过它你可以导入它里面的任何东西。 (e.g. import mysite.settings).
- mysite/__init__.py: 一个空文件，告诉 Python 该目录是一个 Python 包。(如果你是 Python 新手，请查看官方文档了解 关于包的更多内容 。)
- mysite/settings.py: 该 Django 项目的设置/配置。请查看 Django settings 将会告诉你如何设置。
- mysite/urls.py: 该 Django 项目的 URL 声明; 一份由 Django 驱动的网站“目录”。请查看 URL dispatcher 可以获取更多有关 URL 的信息。
- mysite/wsgi.py: 一个 WSGI 兼容的 Web 服务器的入口，以便运行你的项目。请查看 How to deploy with WSGI 获取更多细节。

{% highlight css %}
JerryLiudeMacBook-Pro:mysite JerryLiu$ python3 manage.py runserver
{% endhighlight %}

开启服务器，会看到如下信息：

{% highlight css %}
Performing system checks...

System check identified no issues (0 silenced).

You have unapplied migrations; your app may not work properly until they are applied.
Run 'python manage.py migrate' to apply them.

January 08, 2015 - 06:19:21
Django version 1.7.2, using settings 'mysite.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.

{% endhighlight %}

进入 http://127.0.0.1:8000/ 之后会发现出现了django的初始界面

> **更改端口号**:
> 默认情况下，:djadmin:runserver 命令启动的开发服务器只监听本地 IP 的 8000 端口。如果你想改变服务器的端口，把它作为一个命令行参数传递即可。例如以下命令启动的服务器将监听 8080 端口：

{% highlight css %}
python manage.py runserver 8080
{% endhighlight %}

如果你想改变服务器 IP ，把它和端口号一起传递即可。因此，要监听所有公共 IP 地址（如果你想在其他电脑上炫耀你的工作），请使用：

{% highlight css %}
python manage.py runserver 0.0.0.0:8000
{% endhighlight %}

### 3.连接MySQL

{% highlight css %}
//找到我的mysql数据库
alias mysql=/usr/local/mysql/bin/mysql
//然后进入到文件夹
cd /usr/local/mysql
//登陆
mysql -u root -p
//出现如下界面，证明mysql安装没问题

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 54
Server version: 5.6.22 MySQL Community Server (GPL)

Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
{% endhighlight %}

`遇到了一些小问题，解决了，但是比较迷糊，这里大致记录一下。。。`
#### `1.`首先是mac 上pathon 版本的问题。
之前更换掉了mac里边自带的python2.7，额，我小白都白到了输入python无效果都不知道该怎么办的地步了。。。最后才发现要输入python3才好用。。。

找到了一个小工具，叫做 `Virtualenv`,这个是建立python虚拟环境用的，互不干扰，还是很方便的，对于一会儿想去用`python2.7`一会儿想切换到`python3.4`的我来说实在是太解渴了。

{% highlight css %}
//首先用pip安装一下
JerryLiudeMacBook-Pro:~ JerryLiu$ pip install virtualenv
//安装成功
Successfully installed virtualenv-12.0.5
//检查一下版本
JerryLiudeMacBook-Pro:~ JerryLiu$ virtualenv --version
12.0.5
//下面这句话是创建一个虚拟环境，默认这样是创建了3.4 的Python的虚拟环境
virtualenv ENV
//如下：
Using base prefix '/Library/Frameworks/Python.framework/Versions/3.4'
New python executable in ENV/bin/python3
Also creating executable in ENV/bin/python
Installing setuptools, pip...done.

//进入之后可以看一下
JerryLiudeMacBook-Pro:~ JerryLiu$ cd ENV
JerryLiudeMacBook-Pro:ENV JerryLiu$ ls
bin	include	lib

//输入命令： source ./bin/activate 执行当前的虚拟环境 这样就会在前边多了一个（ENV）就证明成功的进入到了这个python3.4 的虚拟环境中
JerryLiudeMacBook-Pro:ENV JerryLiu$ source ./bin/activate

//deactivate 退出掉这个虚拟环境
(ENV)JerryLiudeMacBook-Pro:ENV JerryLiu$ deactivate

//如果想要切换一个python版本的话，不适用默认的python版本
//例如我找到了我的2.7的目录，这样就切换过去了
JerryLiudeMacBook-Pro:ENV JerryLiu$ virtualenv -p /usr/bin/python2.7 ENV2.7

Running virtualenv with interpreter /usr/bin/python2.7
New python executable in ENV2.7/bin/python
Installing setuptools, pip...done.

//如下，和上一个进入虚拟环境一样
JerryLiudeMacBook-Pro:ENV JerryLiu$ source ./ENV2.7/bin/activate
(ENV2.7)JerryLiudeMacBook-Pro:ENV JerryLiu$ ls
{% endhighlight %}

> MySQLdb是Python连接MySQL的模块:MySQL-python-1.2.5   ----->    Python interface to MySQL

{% highlight css %}
//这样就可以执行这个了（3.4）运行会出现错误：
(ENV2.7)JerryLiudeMacBook-Pro:MySQL-python-1.2.5 JerryLiu$ python setup.py install
（3.4）执行之后显示的错误是：
  File "setup.py", line 13, in <module>
    from setup_windows import get_config
  File "C:\Program Files\MySQL\MySQL-python-1.2.3\setup_windows.py", line 46
    print """You shouldn't be running this directly; it is used by setip.py."""

Syntax Error: invalid syntax
{% endhighlight %}

#### `2`.找不到`mysql_config`命令。
安装

这个问题解决之后又出现了新的问题。。说是找不到`mysql_config`命令

{% highlight css %}
sh: mysql_config: command not found
{% endhighlight %}

然后又是腥风血雨的找答案。。。菜逼就是这样~
最后找到了一个比较靠谱的：

{% highlight css %}
(ENV2.7)JerryLiudeMacBook-Pro:MySQL-python-1.2.5 JerryLiu$ ln -s /usr/local/mysql/bin/mysql_config /usr/local/bin/mysql_config

// 将mysql_confi从你的安装目录链接到/usr/local/bin目录下，这样就可以在任意目录下访问了（也可以放到/usr/bin）
//竟然成功了。。。再次执行：
(ENV2.7)JerryLiudeMacBook-Pro:MySQL-python-1.2.5 JerryLiu$ python setup.py install
{% endhighlight %}

最后成功：

{% highlight css %}
Installed /Users/JerryLiu/ENV/ENV2.7/lib/python2.7/site-packages/MySQL_python-1.2.5-py2.7-macosx-10.10-intel.egg
Processing dependencies for MySQL-python==1.2.5
Finished processing dependencies for MySQL-python==1.2.5
{% endhighlight %}


然后安装`MySQL-for-Python-3-MySQLdb`

{% highlight css %}
JerryLiudeMacBook-Pro:MySQL-for-Python-3-MySQLdb JerryLiu$ python3 setup.py install
{% endhighlight %}

#### `3.libmysqlclient.18.dylib` 链接不上。
安装完后 进入到django 刚才创建的工程目录下边，执行

{% highlight css %}
python3 manage.py shell 
{% endhighlight %}

但是出现了这个错误

{% highlight css %}
  File "/Library/Frameworks/Python.framework/Versions/3.4/lib/python3.4/site-packages/django/db/backends/mysql/base.py", line 18, in <module>
    raise ImproperlyConfigured("Error loading MySQLdb module: %s" % e)
django.core.exceptions.ImproperlyConfigured: Error loading MySQLdb module: dlopen(/Library/Frameworks/Python.framework/Versions/3.4/lib/python3.4/site-packages/MySQL_python-1.2.4-py3.4-macosx-10.6-intel.egg/_mysql.so, 2): Library not loaded: libmysqlclient.18.dylib
  Referenced from: /Library/Frameworks/Python.framework/Versions/3.4/lib/python3.4/site-packages/MySQL_python-1.2.4-py3.4-macosx-10.6-intel.egg/_mysql.so
  Reason: image not found
{% endhighlight %}

大致看了一下应该是这个lib链接不到，还是需要一个软链接来解决。

{% highlight css %}
JerryLiudeMacBook-Pro:~ JerryLiu$ vim ~/.bash_profile

//输入这句话 新建一个环境变量
export DYLD_LIBRARY_PATH=/usr/local/mysql/lib/

//生效环境变量
source ~/.bash_profile

//建立两个软连接
sudo ln -s /usr/local/mysql/lib/libmysqlclient.18.dylib /usr/lib/libmysqlclient.18.dylib

sudo ln -s /usr/local/mysql/lib /usr/local/mysql/lib/mysql
{% endhighlight %}

之后再执行就可以成功了

{% highlight css %}
JerryLiudeMacBook-Pro:mysite JerryLiu$ python3 manage.py shell
Python 3.4.2 (v3.4.2:ab2c023a9432, Oct  5 2014, 20:42:22) 
[GCC 4.2.1 (Apple Inc. build 5666) (dot 3)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
(InteractiveConsole)
{% endhighlight %}

测试一下连接数据库是否能够成功

{% highlight css %}
>>> from django.db import connection
>>> cursor = connection.cursor()
{% endhighlight %}

恩。。很好。。。不成功，呵呵呵呵呵呵呵
原因应该是不能用3.4，用2.7 试试，将python版本转换到2.7
恩，成功了，然后设置一下用户名和密码神马神马的~(超级用户)

{% highlight css %}
(ENV2.7)JerryLiudeMacBook-Pro:mysite JerryLiu$ python manage.py syncdb
Operations to perform:
  Apply all migrations: admin, contenttypes, auth, sessions
Running migrations:
  Applying contenttypes.0001_initial... FAKED
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying sessions.0001_initial... OK

You have installed Django's auth system, and don't have any superusers defined.
Would you like to create one now? (yes/no): YES
Please enter either "yes" or "no": yes
Username (leave blank to use 'jerryliu'): jerryliu
Email address: lr90719@163.com
Password: 

{% endhighlight %}

最后显示

{% highlight css %}
Superuser created successfully.
{% endhighlight %}

#### 其他tips： 查看pip安装过哪些东西

{% highlight css %}
JerryLiudeMacBook-Pro:~ JerryLiu$ pip freeze
{% endhighlight %}

然后会显示这些东西，便于我们查看例如Django 的版本，这里是1.7

{% highlight css %}
beautifulsoup4==4.3.2
cffi==0.8.6
cryptography==0.7.1
cssselect==0.9.1
Django==1.7.2
enum34==1.0.4
lxml==3.4.1
MySQL-python==1.2.4
pyasn1==0.1.7
pycparser==2.10
pymongo==2.7.2
pyOpenSSL==0.14
queuelib==1.2.2
requests==2.5.1
Scrapy==0.24.4
six==1.8.0
Twisted==14.0.2
virtualenv==12.0.5
w3lib==1.10.0
zope.interface==4.1.2
{% endhighlight %}
这个地方是因为我在试着去完成 `Django`官网上的demo的时候运行下边这句话

{% highlight css %}
//创建我们刚才代码写的模型，生成他们
//demo是一个投票类的应用
(ENV2.7)JerryLiudeMacBook-Pro:mysite JerryLiu$ python manage.py sql polls
{% endhighlight %}
会出现下边这个错误：

{% highlight css %}
CommandError: App 'polls' has migrations. Only the sqlmigrate and sqlflush commands can be used when an app has migrations.
{% endhighlight %}
经过查看`Django1.7`的文档可以看到
> **Now Django knows to include the polls app. Let’s run another command:**

{% highlight css %}
$ python manage.py makemigrations polls
{% endhighlight %}

> By running makemigrations, you’re telling Django that you’ve made some changes to your models (in this case, you’ve made new ones) and that you’d like the changes to be stored as a migration.

通过pip freeze查看现在用的pip过来的版本，看相应的文档，万一文档变了呢。
最后显示创建成功：

{% highlight css %}
(ENV2.7)JerryLiudeMacBook-Pro:mysite JerryLiu$ python manage.py makemigrations polls
Migrations for 'polls':
  0001_initial.py:
    - Create model Choice
    - Create model Poll
    - Add field poll to choice
{% endhighlight %}

创建完成之后要记得运行这句话，创建数据库表

{% highlight css %}
(ENV2.7)JerryLiudeMacBook-Pro:mysite JerryLiu$ python manage.py sqlmigrate polls 0001
{% endhighlight %}

{% highlight css %}
BEGIN;
CREATE TABLE `polls_choice` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `choice_text` varchar(200) NOT NULL, `votes` integer NOT NULL);
CREATE TABLE `polls_poll` (`id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY, `question` varchar(200) NOT NULL, `pub_date` datetime NOT NULL);
ALTER TABLE `polls_choice` ADD COLUMN `poll_id` integer NOT NULL;
ALTER TABLE `polls_choice` ALTER COLUMN `poll_id` DROP DEFAULT;
CREATE INDEX `polls_choice_582e9e5a` ON `polls_choice` (`poll_id`);
ALTER TABLE `polls_choice` ADD CONSTRAINT `polls_choice_poll_id_672f8d8e836026ff_fk_polls_poll_id` FOREIGN KEY (`poll_id`) REFERENCES `polls_poll` (`id`);

COMMIT;
{% endhighlight %}

The third step:

{% highlight css %}
python manage.py migrate
{% endhighlight %}

如下显示：

{% highlight css %}
Operations to perform:
  Apply all migrations: admin, contenttypes, polls, auth, sessions
Running migrations:
  Applying polls.0001_initial... OK
{% endhighlight %}

总之现在要三步走了
> 1.Change your models (in models.py).
> 2.Run `python manage.py makemigrations` to create migrations for those changes
> 3.Run `python manage.py migrate` to apply those changes to the database.

#### PS :  python shell

{% highlight css %}
输入下边命令进入：
JerryLiudeMacBook-Pro:mysite JerryLiu$ python3 manage.py shell
{% endhighlight %}
进入之后就可以进行一些列的操作，例如创建一个数据库保存的对象，保存、修改查看等等。
例如，我们新建了一个app 叫做`pollsdemo`,shell里边导入模型

{% highlight css %}
from pollsdemo.models import Question, Choice
{% endhighlight %}

查询`Question`模型现在所保存的所有的对象：

{% highlight css %}
Question.objects.all()
{% endhighlight %}

显示如下

{% highlight css %}
[<Question: What's new?>, <Question: HelloWorld>, <Question: add a question>, <Question: newquestion>]
{% endhighlight %}

可以看到现在保存了三个问题对象，一般默认的不会显示的这么容易区分，会显示成：`[<Question: Question object>]`不方便管理，我们可以让其显示我们想要显示的，区分度比较高的，比如上边我采用的是问题的内容，来区分每一个问题。这就要去修改`polls/models.py`这个文件，加入：

{% highlight css %}
def __str__(self): # __unicode__ on Python 2ß
        return self.question_text
{% endhighlight %}

就可以解决。

到这里djando的前期折腾就到这里了，脑袋还是很迷糊，还需要多用用才能有一个比较深刻的理解，不过走到这里了都，还是继续学习，下边就是web管理后台的学习，以及其他的更加深入的学习。

理想的时间里程碑是年后我的后台就成型了，毕竟`iOS客户端`才是我毕设的大头，希望一起顺利。

> Stay Hungry