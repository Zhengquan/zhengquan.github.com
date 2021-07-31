---
layout: post
title: 技术债治理的三条原则
---

”技术债“是Ward Cunningham在1992年提出的，它主要用来描述理想中的解决方案和当前解决方案中间的差距所隐含的潜在成本。这种隐喻和金融债务非常类似，这也是这个隐喻的高明之处：为了解决短期的资金压力，获得短期收益，个人或企业向银行或他人借款，从而产生债务，这种债务需要付出的额外的代价是利息。如果短期商业的投资所带来的收益大于利息，这也许是一种明智的做法，但如果入不敷出，收益不及债务产生的利息就会导致资产受损。虽然长期来看这种投资仍然有可能扭亏转盈，但是整个过程风险很大，可能随时会导致个人或企业破产。

如果把技术债的产生也看做一种投资过程，那么获得的短期收益可能是快速上线带来的商业利益，比如新的功能吸引了更多的付费用户，解决了短期之内的资金缺口问题；赶在竞争对手之前上线了杀手级应用，并快速地抢占了市场。所以技术债的存在有很多积极意义，但是我们会经常过度关注这些积极的因素，而忽略了技术债长期存在所导致的“利息”。

## 技术债全景图

卡内基-梅龙大学软件工程研究所（SEI）的Robert Nord在[《The Future of Managing Technical Debt》](https://insights.sei.cmu.edu/sei_blog/2016/08/the-future-of-managing-technical-debt.html)提出了“技术债务全景图”（Tech Debt Landscape）的概念，我们可以借助于这个模型定性或者定量分析技术债务所产生的“利息”：

![技术全景图](/assets/images/tech-debt-landscape.png)

这张全景图主要从两个方向来分析技术债对于软件的影响：可维护性（Maintainability）、可演进性（Evolvability），同时结合问题的可见性（Visibility）分析技术债对于软件开发过程的影响。针对可见性的分析主要还是依赖于外部视角来判断：对于最终用户或者业务人员来说，如果产生了功能缺陷或者交付延期等问题，那么这个问题就是可见的。

这里的可维护性（Maintainability）主要指的是狭义上的代码问题，即代码本身是否容易理解、问题是否容易修复、在现有的基础上是否容易增强扩展。

其中可演进性（Evolvability）指的是系统适应变化的能力。 在生物学中它指的是种群产生适应性的遗传多样性，从而通过自然选择进化的能力。对软件系统来说，可演进性（Evolvability）本质上一种架构的元特征（Meta-Characteristic），描述的是软件架构趋于目标演进的能力，演进目标并不仅局限于支撑功能快速迭代的灵活性（Flexibility），也可以是其他的架构属性（Quality Attribute），比如高可用性、可扩展性。

## 技术债治理的困境

技术全景图的分类方法可以帮助我们更全面地了解技术债导致的问题，在可演进性和可维护性这两个维度，我们都可以提取出一些指标来量化“利息”，但是这些指标和业务功能相比终究显得太过苍白无力，并不足以说服主要的业务端干系人并获得对于技术改进的支持。

很多技术管理者或多或少地都会遇到这样的困境：面对技术债心有余而力不足，自己的意见总是被忽视，积压的技术问题迟迟得不到解决。我想信很多团队在治理技术债时都遇到过和同样的阻力。Mike Cohn（《Scrum敏捷软件开发》作者）曾经使用下面这张图描述大多数项目遇到的类似情况：在第一个迭代需要花费大量的时间和精力来进行架构的设计，在后续的迭代中对于架构方面的投资不断降低，期望可以一直延续之前的架构设计并从中持续受益。

![Tech Effort Percentage](/assets/images/tech-effort-percentage.png)

我们也曾经在团队中多次大刀阔斧地尝试了技术债治理的变革，团队进行头脑风暴（Brainstorm）收集技术债，添加到敏捷项目管理工具中统一管理，然后对于这些技术问题进行全局的优先级排序。在业务端也积极地进行了技术债相关理论知识的导入，陈述技术债的产生原因和危害。业务端负责人非常认同技术债治理的意义甚至主动提出要把技术债放到每个迭代（Iteration）中治理、追踪，虽然在接下来的几个迭代中（Iteration）情况得到了一些好转，但是当1~2个月之后排到迭代计划中技术改进比例又恢复了原状。

究其原因，团队在反思之后觉得造成这个困境的原因主要有这几点：

1. 对于业务的关注度不够  
	技术改进的方向和业务不一致，在技术债的选择上缺少对于业务战略的思考。在今年的1月份，客户所处的的行业竞争不断加剧，新进入者对于客户的威胁越来越大，客户的投资重心也对应地发生了转变，转而把资源更多地分配给了另一个产品。虽然当时团队意识到技术债可能会成为产品演进的阻力，但是并没有及时调整技术改进的优先级。
2. 代码可维护性问题很难说服客户买单  
	技术债的影响和收益是难以衡量的，对于这种代码级别的问题更是这样，对于没有技术背景的客户来说，很难用数字量化代码重构的直接收益。况且我们一直给客户承诺的是交付高质量、可工作的软件，除了性能、安全等非功能需求之外，代码质量本身也应该是内建的交付物之一，那代码达到什么水准才能体现出我们在这方面的专业性？
3. 效果不明显，客户信心不足  
	  一个典型的例子是应用程序的性能优化，面对一些技术债导致的性能问题时只是隔靴搔痒。虽然加几个索引、调整一下SQL、增加过滤条件或者配置一下延迟加载（Lazy Load）可以使问题得到一些缓解，但是并没有触及本质的问题。随着数据量或者并发用户的增加，之前的问题又再次暴露了出来。也许我们在下次游刃余地解决常见问题时可以先质疑一下：模型设计是否合理？为什么一定要把这个一对多的关系放到某个实体上？为什么上千万的数据要放到一张表里？区别不同设计质量好坏的标准是什么？
	
基于这几方面原因并结合团队在技术债治理的实践经验，我们总结出了技术债治理的三条原则，也许可以为缓解这个困境提供一些不同的视角和思路。

## 技术债治理的三条原则

### 1. 核心领域优于其他子域

识别领域、子域是DDD战略设计的重要步骤，在识别子域之后我们还需要进一步分析哪些是核心域（Core Domain），哪些是支撑子域（Supporting SubDomain）和通用子域（Generic Subdomain）。核心域在业务上至关重要，它提供了区别于行业竞争对手的差异化优势，承载的业务背后的最核心的基础理念。《领域驱动设计》的作者、DDD概念的提出者 Eric Evans 是这样描述核心域的：

> The Core Domain should deliver about 20% of the total value of the entire system, be about 5% of the code base, and take about 80% of the effort.

我们可以借助于这种战略建模方式，根据解决技术债之后所产生的收益，将其放置于领域图中的不同位置，可以得到类似这样的可视化结果。在建立关联之后，需要遵循”核心域优先、其他子域次之“的原则来选择技术债。也许我们可以把这种评估技术债优先级的方式叫做“Tech Debt Mapping”。

![Tech Debt Mapping](/assets/images/tech-debt-mapping-1.png)

### 2. 可演进性优于可维护性

技术债导致的可演进性问题大多和架构相关，比如服务和服务之间的循环依赖、模块和模块之间的过度耦合、缺少模块化和服务边界的“大泥球”组件等，在添加新的功能时，这些架构的坏味道会给产品功能的迭代造成不少的麻烦。比如服务之间如果存在循环依赖的问题，当你对系统进行少量更改时，它可能会对其他模块产生连锁反应，这些模块可能会产生意想不到的错误或者异常。此外，如果两个模块过度耦合、相互依赖，则单个模块的重用也变得极其困难。

可演进性问题可能会直接导致开发速度滞后，功能无法按期交付，使项目出现重大的交付风险。而且问题发生的时候往往已经“积重难返”，引入的技术债务没有在合适的时间得到解决，其产生的影响会像“滚雪球”一样越滚越大。在我所经历过的项目中有一个不太合理的模型设计，由于错过了最佳的纠正时间，随着业务变化最终不得不做服务拆分时，发现需要修改的调用点竟有近1000多处，而且这些修改点很难借助于IDE或者重构工具来一次性解决，不但增加了团队的负担还直接导致了功能的延期交付。

和可演进性问题相比，高复杂度、霰弹式修改等问题影响范围相对来说要小一些。所以我们在治理技术债的坚持的第二个原则是 “可演进性优于可维护性”。如果把上文提到的可维护性和可演进性使用不同的颜色来标识的话，我们可以得到这样的结果：

![Tech Debt Mapping](/assets/images/tech-debt-mapping-2.png)

### 3. 不可见问题优于可见问题

这个原则本质上是缩短反馈周期，提前发现潜在问题，除了必要的代码审查流程（Code Review）、提升团队能力之外还可以借助于自动化工具来提前发现问题。

对于代码可维护性方面，很多比较成熟的静态代码扫描工具都可以自动识别这类问题，比如[SonarQube](https://www.sonarqube.org/)、[checkstyle](https://github.com/checkstyle/checkstyle) 等，但是仅仅在持续集成上（Continuous Integration）运行还不够，需要和团队一起自定义扫描规则，并把检查代码扫描报告作为代码审查的一部分，逐步形成一种正向的反馈机制。

那我们应该如何提前发现不可见的可演进性问题哪 ？ 在Neal Ford、 Rebecca Parsons 等合著的 [《Building Evolutionary Architecture》](https://www.amazon.com/Building-Evolutionary-Architectures-Support-Constant/dp/1491986360) 中提出了“架构适应度函数”（Architecture Fitness Function）的概念，可以给我们发现潜在的架构问题提供一些思路。

“适应度函数”这个概念来源于遗传算法（Genetic Algorithm），用计算机模拟仿自然界生物进化机制，适应度函数用于评价个体的优劣程度，适应度越大个体越好，反之适应度越小则个体越差。在软件系统的不断增量迭代过程中，我们可以基于架构的演进目标，定义出软件架构的适应度函数，来衡量增量的代码是否会导致架构偏离这个目标。在工具方面使用方面，我们可以借助于[ArchUnit](https://github.com/TNG/ArchUnit) 和 [ndepend](https://www.ndepend.com/) 帮助我们定义自己项目中的”适应度“规则，这是一个借助于ndepend自动识别组件循环依赖的例子：

![Cyclic Dependency](/assets/images/NDependBig03.png)

--

在技术债治理的过程中，实践可以剪裁，甚至原则也可以妥协，因为比这三条原则更重要的是获得关键干系人的支持。作为技术人员或者技术领导者，不仅要有前瞻性的技术洞察力、锐意变革的魄力，还需要以“旁观者”视角，置身事外地观察自己所处的环境，思考技术改进究竟对于自己、他人、团队、公司和客户究竟产生了什么价值？


## 引用

1. [The Future of Managing Technical Debt](https://insights.sei.cmu.edu/sei_blog/2016/08/the-future-of-managing-technical-debt.html)
2. [Managing Technical Debt](https://www.infoq.com/articles/managing-technical-debt)
3. [DDD: Strategic Design: Core, Supporting, and Generic Subdomains](http://blog.jonathanoliver.com/ddd-strategic-design-core-supporting-and-generic-subdomains/)
4. [Managing Software Debt: Building for Inevitable Change](https://www.amazon.com/Managing-Software-Debt-Inevitable-Development/dp/0321948610) 
5. [We’re Drowning in Tech Debt. Why Isn’t Anyone Listening?](https://hackernoon.com/were-drowning-in-tech-debt-why-isn-t-anyone-listening-f4269cb5cc40)