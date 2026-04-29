# LEGATO：面向乐谱光学识别的规模化端到端通用方案

Guang Yang¹ Victoria Ebert¹ Nazif Tamer¹ Brian Siyuan Zheng¹ Luiza Pozzobon¹ Noah A. Smith¹,²

¹保罗·G·艾伦计算机科学与工程学院，华盛顿大学
²艾伦人工智能研究所
{gyang1,nasmith}@cs.washington.edu

# 摘要

我们提出Legato，这是一种用于光学音乐识别（OMR）的新型端到端模型，旨在将乐谱图像转换为机器可读文档。Legato是首个能够识别整页或多页印刷乐谱的大规模预训练OMR模型，也是首个生成ABC notation（一种简洁的人类可读符号音乐格式）的模型。通过将预训练的视觉编码器与在超过21.4万张图像数据集上训练的ABC解码器相结合，我们的模型展现了跨各种印刷乐谱的强大泛化能力。我们在多个数据集和指标上进行了全面的实验，证明Legato优于现有技术。在我们最真实的数据集上，标准指标TEDn和OMR-NED的绝对误差分别降低了68%和47.6%。

# 1 引言

大量书面音乐仅以印刷乐谱的复印件形式存在（例如IM-SLP；Project Petrucci LLC，2025）。将这些图像数字化为现代机器可读格式将为大规模音乐分析和合成应用解锁数据。鉴于此，我们致力于解决光学音乐识别（OMR）问题，以高效地将印刷乐谱图像转换为符号。

该问题最成功的方案是端到端OMR系统（Ríos-Vila等，2024；Ríos-Vila等，2024；Ríos-Vila等，2023；Mayer等，2024；Calvo-Zaragoza与Rizo，2018b），这些系统专注于钢琴、单旋律音乐或单行乐段的格式。更加通用的解决方案需要仔细考虑输入的多样性（即包含多行乐段、单页上的多个声部和声部的复杂布局，以及标题和歌词等大量文本注释）、输出格式（每种输出格式——如MusicXML、ABC、**kern——各有优势，且当前评估严重依赖输出格式选择）以及训练数据。我们的主要贡献如下：

- 我们构建了一个新的多页大规模OMR数据集PDMX-Synth，从PDMX（Long等，2025；Xu等，2024）中的符号乐谱使用不同渲染方案渲染而成（§3）。
- 我们将数据驱动的分词算法应用于符号音乐，发现它能够学习复合音乐概念（§4.1）。
- 我们引入Legato，这是首个基于预训练视觉编码器构建的端到端OMR模型，能够识别多页印刷乐谱（§4）。
- 在全面实验中，即使给予基线模型优势，我们也发现Legato在多个OMR数据集上实现了最先进的性能，包括从IMSLP（Project Petrucci LLC，2025）新构建的样本，相比之前的最佳模型有大幅提升（§6）。

我们发布了可复现工作的代码：https://github.com/guang-yng/legato。

![](images/0a4cc00295c493f974963a949bb7c067e78c02460e2e4acb354620a051e9005c.jpg)
图1：模型架构。输入图像首先裁剪为重叠的片段，长宽比不超过1:4，然后调整大小并分割为四个patch（§4.2.1）。图像patch被送入视觉编码器（§4.2.2；参数在训练期间冻结）。生成的潜在嵌入作为交叉注意力键和值进入transformer解码器，该解码器自回归生成ABC token（§4.2.3）。特殊token `<B>`、`<I>`和`<E>`分别表示`<|begin_of_abc|>`、`<|image|>`和`<|end_of_abc|>`。为便于可视化，这里用下划线表示空格。

# 2 基线与设计考量

# 2.1 多行乐段OMR

我们的起点是Sheet Music Transformer++（**SMT++**；Ríos-Vila等，2024）的成功，据我们所知，这是唯一设计用于处理多行乐段（而非单声部或单行乐段）的模型（Ríos-Vila等，2024；Mayer等，2024；Ríos-Vila等，2023）。**SMT++**是一个端到端训练的编码器-解码器transformer模型，在纯合成的整页钢琴谱上训练。它在FP-GrandStaff（688页）上训练，该数据集通过随机连接GrandStaff（Ríos-Vila等，2023）中的单行乐段钢琴谱生成。**SMT++**是我们进行对比的基线。

除了**SMT++**这样的专门模型，我们还研究了最先进的多模态大模型在OMR任务上的表现。具体来说，我们在与基线相似的条件下评估了GPT-5（OpenAI，2025）。

# 2.2 输出乐谱表示

过去OMR工作中考虑了许多不同的符号乐谱格式；本文考虑**kern、ABC和MusicXML。

**kern是Humdrum工具包（Huron，1997）内设计的音乐表示。**kern是基于ASCII的，将音高和相对时长作为格式的主要焦点，视觉信息次之。**kern使用空格显式建模同一声部中的并发音符，使用制表符表示其他声部中的音符。它是为音乐研究者设计的，经过学习，人类可以流利地阅读。**kern是SMT++（Ríos-Vila等，2024）和其他系统（Ríos-Vila等，2024；Ríos-Vila等，2023）的OMR目标格式。

ABC音乐标准是一种替代的基于ASCII的音乐符号形式（Walshaw，2011）。与**kern相似，它可以用任何文本编辑器编写和阅读。ABC notation的主要吸引力在于其简洁的格式——在其他格式中需要数千行的歌曲在ABC中只需要数十行，这可以降低自回归模型（如我们的解码器）的计算成本。ABC notation可以编码歌词、速度标记、装饰音、演奏法，甚至某些排版参数，使其成为一个几乎完整的格式。更明确的音乐排版结构（如小节线和换行），以及与**kern相比更接近乐谱的符号，使ABC notation成为许多系统的目标（Wu等，2024；Wu与Sun，2023；Casini等，2024），但据我们所知，图像到ABC的OMR模型尚未训练。

MusicXML是基于树形的音乐符号格式，引入于2001年（Good，2001），被MuseScore（MuseScore有限公司，2021）和Sibelius（Avid Technology，2025）等商业软件广泛采用。其流行性使其成为OMR和音乐转录任务的常见目标（Beyer与Dai，2024），有时会进行简化（Mayer等，2024）。然而，与ABC和**kern相比，MusicXML更冗长，更难解析，其层次结构给序列模型带来挑战。

这些格式尽管不同，却承载大部分相同的信息。它们都包含某种内置方法来编码视觉乐谱信息（如小节线和乐句），并且每种都将音符时长编码为绝对值，类似于典型的人类可读乐谱——这些都是其他流行符号音乐格式（如MIDI）所缺乏的元素。这使得三种格式之间的转换相对简单，存在许多工具可以在格式之间转换（Vree等，2018；Cuthbert与Ariza，2010；Cancino-Chacón等，2023；Pugin等，2014；Sapp，2012），保留核心音乐元素（音符、休止符、乐器）。然而，由于格式之间编码的信息范围存在差异，某些元素——如歌词和演奏法——在转换过程中可能无法保留。

我们选择ABC作为模型的输出格式，因为它简洁但几乎完整，以音乐（而非排版）为中心。我们还相信ABC的结构也适用于NLP技术，帮助模型学习复合音乐概念，正如我们将在分词器（§4.1）中看到的。此外，一些现代Markdown编辑器（例如StackEdit、JotterPad）能够直接从ABC代码块渲染乐谱，而据我们所知，**kern和MusicXML不支持这种功能。由于Markdown通常作为通用大语言模型与人类之间的接口，这使得ABC成为更好的选择。

此外，我们专注于识别音乐符号而非乐谱的文本特征（例如歌词），将文本识别留待未来工作。

鉴于这些设计决策以及**SMT++**的强大基础，我们构建多行乐段、多页端到端OMR模型的方法包括：构建大规模的乐谱图像数据集，使用ABC格式表示（§3），并使用它训练基于现有预训练图像编码器的编码器-解码器transformer模型（§4）。

# 3 数据集

要训练端到端基于transformer的OMR系统，需要大量成对数据（乐谱图像与目标格式的符号乐谱，即ABC）。

# 3.1 基于PDMX的大规模OMR数��集

虽然ABC notation项目提供可免费下载的75万个示例，涵盖从中世纪音乐到流行音乐的各种流派，¹但我们发现这些数据通常是单旋律的。我们认为这些示例并非源自完整乐谱。因此，我们转向PDMX（Long等，2025；Xu等，2024），这是一个包含从在线分享论坛MuseScore收集的25万个公共领域MusicXML文件的数据集。我们通过将PDMX文件从MusicXML转换为ABC格式，并从这两种格式渲染图像来构建ABC数据集PDMX-Synth。在渲染期间，我们排除长宽比大于10的乐谱（约5%的数据）。在长序列上训练自回归模型计算成本高昂，此类情况极为罕见，不值得建模长程依赖。我们还对ABC格式进行规范化，使模型更容易学习格式约束，并简化评估（§3.2）。由于过滤、转换和渲染损失，我们最终的数据集包含238,386个图像-ABC对，约占原始PDMX数据集的93.8%。

# 3.2 规范化ABC表示

我们使用xml2abc脚本（Vree等，2018）以批量模式从MusicXML转换为ABC。以下规则应用于几乎规范化的ABC：²

- 转录真实的换行符。ABC中的换行符是可选的；显式标记它们可以恢复原始换行符。
- 强制ABC文件每5小节换行一次。ABC中的文本换行符对乐谱没有语义意义。我们在ABC文本中强制每5小节换行一次，但当乐谱末尾剩余不到5小节时除外，并在每行末尾重置转换器生成的注释`%[number_of_total_measures]`。
- 将单位音符固定为八分音符。ABC语法允许自定义单位音符长度L:1/1、L:1/2、L:1/32……，因此同一乐谱可以用不同的单位音符长度转录。为简化学习，我们设置L:1/8。这不会改变表示的表达能力。

由于PDMX-Synth是为OMR任务设计的，我们将ABC表示中的所有文本内容替换为特殊token `<|text|>`。这包括标题、乐器名称、歌词和ABC tune body中引用的注释内容。图2展示了我们规范化ABC表示的示例。

# 3.3 乐谱渲染

要从MusicXML或ABC文件构建OMR训练数据集，选择合适的乐谱渲染器非常重要。它应该能够忠实地生成乐谱图像，并表示MusicXML文件中包含的大部分信息（例如字体和间距）。此外，生成的图像应该足够多样化，以使训练的模型不会过拟合默认渲染参数。

用于训练SMT++（Ríos-Vila等，2024）的FP-GrandStaff数据集使用Verovio工具（Pugin等，2014）作为默认渲染器，并从**kern格式生成图像。由于他们使用的**kern格式不编码任何排版信息，使用软件的默认渲染参数，严重限制了数据集的多样性。为解决这个问题，我们通过两个渲染管道生成图像：

（i）MuseScore 3.6.2（MuseScore有限公司，2021），接收MusicXML并输出PNG。
（ii）abcm2ps 8.14.15（Moine，2024），接收ABC并输出SVG文件。我们进一步使用CairoSVG 2.7.1（CourtBouillon，2023）将SVG文件转换为PNG文件。

为防止默认渲染参数主导数据集，我们应用以下视觉增强：

- 对于（i），最终图像通过随机图像分辨率（即在MuseScore中随机设置分辨率参数）和从均匀分布采样的随机边距裁剪进行增强。裁剪时，主乐谱保持不变。
- 对于（ii），由于ABC格式携带的排版信息较少，我们应用更多增强：
  1. 将乐谱渲染为单个图像或多个图像连接；
  2. 以50%的概率以横向模式渲染图像；
  3. 以70%的概率添加不同编号样式的小节号；
  4. 统一设置左右边距；
  5. 在[0.9, 1]范围内随机缩放图像。

此外，对于两个渲染器，背景颜色从灰度范围[192, 255]均匀采样。我们发布了这个合成的ABC OMR数据集PDMX-Synth，以支持未来研究。

# 4 端到端模型

我们的模型Legato遵循多模态Llama（AI@Meta，2024）的架构。如图1所示，我们模型的主要组件是一个预训练的视觉编码器和一个转换为ABC的transformer解码器。输��乐��图像被分割成片段，调整大小后进一步分割为四个patch，这些patch被视觉编码器编码为潜在嵌入。然后，这些嵌入被transformer解码器用于自回归生成ABC格式的token。我们将在§4.1讨论我们的ABC分词方法，然后转向架构：图像处理细节（§4.2.2）、预训练视觉编码器的使用（§4.2.2）和transformer解码器（§4.2.3）。

# 4.1 分词

语言模型的分词方案将字符流分割成来自固定词汇表的token。它们可以基于专家定义的词汇表，如SMT++所做，其词汇表包含所有可能的**kern符号（Ríos-Vila等，2024），或以数据驱动方式构建。我们采用后者，这允许复合音乐概念（如和弦）如果足够频繁就直接在词汇表中表示。

我们采用字节对编码（BPE；Sennrich等，2016）方法学习分词器，该方法在自然语言处理研究中广泛使用，已知在大型语料库上训练时能有效捕获不同模式，同时保持有限的词汇表。我们选择将BPE分词直接应用于PDMX-Synth训练集的ABC表示，词汇表大小为4097，确保高效表示并促进更好的模型性能。

我们发现我们的分词器捕获了一些复合音乐概念，如和弦和短旋律片段。例如，大三和弦表示为CEG，出现为一个独立的token。这个token具有上下文灵活性：在方括号内，它表示同时弹奏的和弦，而在括号外，它表示琶音序列。当与持续时间token（如2或4）结合时，CEG可以分别表示由四分音符或二分音符组成的大三和弦。更多示例如图3所示。

# 4.2 模型架构

多模态Llama能有效处理不同长宽比的图像，且不会有显著失真（AI@Meta，2024）。鉴于OMR任务的复杂性和相关计算成本，我们使用来自meta-llama/Llama-3.2-11B-Vision的预训练视觉编码器（836M参数，在我们的系统中冻结），并从头开始训练一个101M参数的transformer解码器用于ABC表示，以及一个5.9M参数的线性多模态投影器来连接它们。我们将此模型称为Legato。

为了在与之前最先进方法比较时控制模型大小，我���还引入了一个较小的变体Legato_small，解码器中有8.5M参数，投影器中有2.5M参数。此设计与SMT++的可训练参数数量相当，尽管预训练且冻结的视觉编码器增加了相当多的参数。

# 4.2.1 图像处理

我们的输入乐谱图像I由一首曲目的完整乐谱组成。由于一首曲目可能很长，图像I可能具有非常大的高度，但宽度保持相对固定（因为乐谱以纵向或横向模式打印在标准纸张尺寸上）。我们将图像I分割成多个片段，每个片段的长宽比不超过1:4。相邻片段也有重叠，确保每个片段保留上下文信息。

我们遵循多模态Llama（AI@Meta，2024）的方法进一步处理每个图像片段。调整大小和裁剪后，每个片段被分割成四个更小的图像patch。因此，从原始图像I，我们得到一个张量p ∈ R^{S×4×C×D×D}，其中S是片段数量，C=3是颜色通道数，D=448是内部图像大小。

# 4.2.2 视觉编码器

Llama视觉编码器在通用图像上进行预训练。它将图像片段映射到嵌入。我们推测在多样化图像数据上预训练的视觉编码器为乐谱图像上的OMR提供了强大的起点，因此我们在训练和测试实验中保持视觉编码器冻结。针对乐谱微调此模块是未来工作的一个有前景的方向。

我们请读者参阅AI@Meta（2024）了解编码器的细节，只需注意它提供R^{S×4×L×6d_v}中的输出嵌入，其中L是序列长度（具体为1+(D̅/14)²），d_v是内部视觉嵌入维度。在使用的Llama检查点中，L=1024，d̂_v=1280。

# 4.2.3 Transformer解码器

我们采用与多模态Llama相似的解码器架构，但规模较小。首先应用线性投影将潜在嵌入匹配到解码器的隐藏维度d_l，使其能够用于交叉注意力。解码器的核心由L_d层transformer组成，其中交叉注意力选择在由Γ_l表示的层子集应用，而其余层仅使用自注意力以降低计算成本。每层中的MLP模块首先将维度放大到d_u，然后缩小回d_l。

如图1所示，解码器接收token序列作为输入。它被训练预测序列中的下一个token，并在推理时自回归地逐个生成token。在Legato中，d_l=768，d_u=1526，L_d=18，Γ_l={3,7,11,15}。在Legato_small中，d_l=320，d_u=448，L_d=8，Γ_l={3,5,7}。

# 4.3 预训练详情

Legato和Legato_small都训练10个epoch，批量大小为32，学习率为0.0003。遵循标准语言模型实践，我们使用AdamW优化器（β₁=0.9，β₂=0.99，ε=10⁻⁶），线性学习率调度器，热身比例为0.03。为提高效率，文本序列截断为4096token，并使用bfloat16精度。

由于推理和指标计算的高成本，每5000步在800个验证样本子集上进行评估。保留ABC上符号错误率（SER）最低的检查点：Legato为65,000步，Legato_small为60,000步。

# 5 评估指标

端到端OMR任务的评估尚未收敛到单一标准。之前的工作（Ríos-Vila等，2024；Ríos-Vila等，2024；Mayer等，2024；Calvo-Zaragoza与Rizo，2018a；b）在不同乐谱格式中报告错误率，因为没有统一的输出格式最适合此任务。通常，所选格式是训练模型的格式。这种选择可能会不公平地惩罚具有不同输出格式的模型性能，从而阻碍跨模型评估，因为格式之间的转换并不总是成功的，且定义不明确的输出转换是未定义的。

我们采用MusicXML作为跨不同模型的统一评估格式，因为它能够承载排版乐谱所需的所有信息。它也是训练Legato或SMT++未使用的格式，从而产生更公平的比较。此外，MusicXML在音乐软件中得到广泛支持，使其成为导致人类编辑乐谱用例的合理最终目标。必要时，我们还在**kern和ABC格式中提供错误率，这些格式分别是训练SMT++（Ríos-Vila等，2024）和Legato使用的格式。目前，我们的评估不计文本元素（如表情术语、标题或歌词）的内容。

# 5.1 带��符展平的树编辑距离（TEDn）

Hajic Jr.等（2016）研究了MusicXML上的不同评估指标，得出结论：带音符展平的树编辑距离最接近人类评估。详细地说，该指标首先展平两个XML树中的所有`<note>`元素，然后使用归一化树编辑距离（到金树的编辑距离除以编辑距离恢复金树）作为最终非负分数。展平用于降低删除`<note>`元素的高成本，因为它总是包含许多子元素。我们使用Mayer等（2024）的实现。最有效的编辑距离算法需要O(m²n²)时间，其中m和n是两棵树中的节点数（Zhang与Shasha，1989）。因此，我们截断MusicXML文件使m,n<6000，并在训练期间使用格式特定的错误率验证模型。

# 5.2 格式特定的错误率

OMR中更广泛使用的一组指标是字符、符号和行错误率（CER、SGER和LER）。它们衡量纠正预测内容所需的工作量，但将乐谱简化为文本序列而非结构化编码，因此无法捕获结构化错误的大小。这些指标也相对便宜，对于字符串长度m和n为O(mn)。之前的工作（Ríos-Vila等，2024）在**kern上使用这些指标，但我们的模型在ABC上训练。这两种格式的字符、符号和行错误率不可比较，因为这些格式中的字符、符号和行代表不同的概念。因此，我们使用转换器实现苹果对苹果的比较。但是，这些指标仍然有利于在目标格式训练的模型，因为其他模型的失败转换会导致空输出。

# 5.3 OMR归一化编辑距离（OMR-NED）

OMR-NED（Martinez-Sevilla等，2025）是一种新的OMR评估指标，在计算效率和评估粒度之间取得平衡。它基于两个音乐小节序列之间的序列错误率计算，其中将一个小节转换为另一个小节的成本定义为它们组成符号之间的集合编辑距离。为不同类别的音乐符号指定插入和删除成本，能够对模型性能进行细粒度评估。该指标既高效又有直观意义，时间复杂度为O(M²S log S)，其中M是小节数，S是每小节的平均符号数。此外，OMR-NED是格式无关的，前提是有强大的解析器可以从模型输出中提取符号表示。

当前的OMR-NED实现针对**kern进行了语法修正优化，而ABC v2.1缺乏解析器支持；因此，ABC输出被转换为MusicXML进行符号提取，这可能引入错误并对ABC不利。

# 6 实验评估与结果

许多先前端到端OMR模型的一个局限性是，它们仅在被用于训练的数据集的测试分割上进行评估（Ríos-Vila等，2024；Ríos-Vila等，2023；Mayer等，2024），或在评估数据集上继续训练（Ríos-Vila等，2024），这带来了过拟合狭窄乐谱群体的风险。通用OMR输入表现出显著的可变性，而单个数据集通常源自有限来源。这样的数据集更容易过拟合，人为提升评估指标。因此，我们在一组多元的OMR数据集上评估Legato和SMT++基线，这些数据集都未用于训练或验证，确保更稳健和无偏的泛化性能评估。这些包括：（i）OpenScore弦乐四重奏（Gotham等，2023），使用真实和渲染图像，（ii）OpenScore弦乐四重奏小提琴部分，使用Verovio渲染图像，（iii）OpenScore艺术歌曲（Gotham与Jonas，2022），使用真实图像和新渲染的图像，以及（iv）从IMSLP新手动标注的钢琴乐谱。

为提供当前通用VLM能力的参考，我们还在这些数据集上评估了GPT-5的性能。结果如表1所示。GPT-5在TEDn上始终优于SMT++，但在OMR-NED上表现不佳。这可能是由于OMR-NED对**kern进行的语法修正。

所有Legato的评估都使用beam搜索（beam大小10，最大长度2048）和重复惩罚1.1，除了PDMX-Synth，由于图像非常大，我们使用beam大小为3。SMT++和GPT-5的基线设置见附录§A。

在PDMX-Synth上评估。我们首先在PDMX-Synth测试分割的800个项目上评估Legato模型。这设定了Legato模型“领域内”能力及其训练输出格��（ABC）的质量。Legato分别实现（ABC）字符、符号和行错误率为23.3%、25.8%和31.7%，而Legato_small分别实现36.4%、39.2%和45.9%。我们还评估了多页性能（附录§B.2）。

在OpenScore弦乐四重奏上评估。为与SMT++公平比较，我们使用第三方数据集OpenScore弦乐四重奏（Gotham等，2023），主要来自19世纪；该数据未用于训练任一模型。数据集提供MusicXML文件，对于某些条目，还提供扫描的PDF，也可从中标注MusicXML。我们从OpenScore弦乐四重奏数据集中提取包含真实乐谱扫描图像的子集，并从关联的MusicXML文件渲染干净的图像。我们将这两种不同类型的图像称为“Camera”和“Rendered”并对两者进行评估。结果如表1（块1–2）所示。请注意，对于SMT++和Legato，输出不能保证可转换为MusicXML，这是计算TEDn评估指标的必要条件。然而，即使通过仅评估其产生有效结果的实例来有利于SMT++（标记为“TEDnconvert”的行），Legato仍然优于它。附录§B.1提供了进一步缩小这些模型差异的实验。

在OpenScore艺术歌曲上评估。为进行更全面的评估，我们对两个模型进行了OpenScore艺术歌曲数据集（Gotham与Jonas，2022）的评估，该数据集包含19世纪作曲家的歌曲。类似于OpenScore弦乐四重奏，我们获取源PDF以生成camera和rendered图像。再通过对声部用白框掩码来保留钢琴部分，从而有利于SMT++。这种方法类似于OLiMPiC数据集（Mayer等，2024）中使用的方法，但我们使用整页图像而非单个系统截断。如表1（块3–4）所示，两个Legato变体都以较大优势优于SMT++。

表1：各种数据集和指标上的实验结果。所有指标越低越好。TEDn是主要指标，需要输出转换为MusicXML。TEDnconvert：仅在SMT++产生可成功转换为MusicXML的输出时评��；Legato输出始终成功转换为MusicXML。OMR-NED是格式无关的，基于从任何格式提取符号。OMR-NED自动修正**kern的语法错误，而ABC首先转换为MusicXML（在实践中总是成功）。OpenScore弦乐四重奏是最具挑战性的数据集，因为其乐谱图像密集得多。所有指标在§5中解释。

| 指标 | GPT-5 | SMT++ | Legato | Legato_small |
|------|-------|-------|-------|----------|
| 1. Camera OpenScore弦乐四重奏（252页） | | | | |
| TEDn | 90.5 | 98.6 | 60.4 | 84.1 |
| TEDnconvert | 93.1 | 80.2 | 58.6 | 84.1 |
| OMR-NED | 97.6 | 94.7 | 58.2 | 93.5 |
| 2. Rendered OpenScore弦乐四重奏（252页） | | | | |
| TEDn | 93.0 | 97.9 | 52.1 | 78.4 |
| TEDnconvert | 93.8 | 81.3 | 50.5 | 78.9 |
| OMR-NED | 97.8 | 94.3 | 32.9 | 88.5 |
| 3. Camera OpenScore艺术歌曲（64页） | | | | |
| TEDn | 91.6 | 98.4 | 36.4 | 82.6 |
| TEDnconvert | 96.6 | 82.5 | 22.1 | 42.7 |
| OMR-NED | 97.6 | 84.1 | 44.9 | 83.5 |
| 4. Rendered OpenScore艺术歌曲（64页） | | | | |
| TEDn | 91.4 | 95.5 | 28.9 | 62.4 |
| TEDnconvert | 92.8 | 75.9 | 20.4 | 44.0 |
| OMR-NED | 97.5 | 82.2 | 39.5 | 69.8 |
| 5. IMSLP钢琴乐谱（32页） | | | | |
| TEDn | 96.7 | 97.7 | 29.7 | 76.9 |
| TEDnconvert | 90.3 | 75.2 | 3.8 | 43.7 |
| OMR-NED | 98.7 | 91.9 | 44.3 | 86.7 |

在IMSLP钢琴乐谱上评估。用白框掩码声部仍然会引入人工制品，例如声部之间的大间隙。为在钢琴形camera乐谱上进行更真实的评估，我们手动从IMSLP（Project Petrucci LLC，2025）标注了32页完整的钢琴乐谱。我们确保与PDMX-Synth没有重叠，且仅包含在使用MuseScore或Verovio等现代排版软件之前制作的扫描件。这使我们能够消除由合成排版和数据来源重叠引入的偏差。这个小评估数据集可在我们的代码库中公开获取。结果如表1（第5块）所示。

尽管数据集相对较小，它提供了一个公平且真实的比较——两个模型都设计用于识别钢琴乐谱，且图像来源反映了真实场景，因为许多钢琴学习者从IMSLP获取乐谱。我们在附录§B.3中提供了一些比较输出的示例。

# 7 结论

在这项工作中，我们提出Legato：用于印刷OMR的最先进、端到端通用模型。Legato能够识别多页真实印刷乐谱图像并输出ABC表示。为实现这一目标，我们利用了预训练的视觉编码器（冻结），并在来自PDMX-Synth（PDMX数据集的处理版本）的超过21.4万个样本上训练了分词器和解码器模型。

Legato在所有评估的数据集上实现了最先进的性能，即使有利于之前的方法，它也代表了在印刷乐谱上首个多页端到端OMR模型的重大进步。未来，研究人员可以研究如何微调现代VLM的视觉编码器，以进一步适应OMR的特定挑战。

# 参考文献

AI@Meta. Llama 3.2: Revolutionizing edge AI and vision with open, customizable models. Technical report, Meta Platforms, Inc., September 2024. URL https://ai.meta.com/blog/ llama-3-2-connect-2024-vision-edge-mobile-devices/.

Avid Technology. Sibelius, 2025. URL https://www.avid.com/sibelius.

Tim Beyer and Angela Dai. End-to-end piano performance-MIDI to score conversion with transformers, 2024. URL https://arxiv.org/abs/2410.00210.

Jorge Calvo-Zaragoza and David Rizo. Camera-PrIMuS: Neural end-to-end optical music recognition on realistic monophonic scores. In Proceedings of the 19th International Society for Music Information Retrieval Conference, pp. 248–255, 2018a. doi: 10.5281/zenodo.1492395.

Jorge Calvo-Zaragoza and David Rizo. End-to-end neural optical music recognition of monophonic scores. Applied Sciences, 8(4):606, 2018b. doi: 10.3390/app8040606.

Carlos Eduardo Cancino-Chacón, Silvan David Peter, Emmanouil Karystinaios, Francesco Foscarin, Maarten Grachten, and Gerhard Widmer. Partitura: A Python package for symbolic music processing. In Music Encoding Conference 2022 Proceedings, pp. 16–26. Humanities Commons, 2023. doi: 10.17613/131v-k502.

Luca Casini, Nicolas Jonason, and Bob L. T. Sturm. Investigating the viability of masked language modeling for symbolic music generation in abc-notation. In Colin Johnson, Sérgio M. Rebelo, and Iria Santos (eds.), Artificial Intelligence in Music, Sound, Art and Design, pp. 84–96, Cham, 2024. Springer Nature Switzerland. doi: 10.1007/978-3-031-56992-0_6.

CourtBouillon. CairoSVG 2.7.1, 2023. URL https://cairosvg.org.

Mike Cuthbert and Christopher Ariza. Music21: A toolkit for computer-aided musicology and symbolic music data. In Proceedings of the 11th International Society for Music Information Retrieval Conference, pp. 637–642, 2010. doi: 10.5281/zenodo.1416114.

Michael D. Good. MusicXML: An internet-friendly format for sheet music. In Proceedings of XML 2001, 2001.

Mark Gotham, Maureen Redbond, Bruno Bower, and Peter Jonas. The "OpenScore String Quartet" corpus. In Proceedings of the 10th International Conference on Digital Libraries for Musicology, pp. 49–57, New York, NY, USA, 2023. Association for Computing Machinery. doi: 10.1145/3625135.3625155.

Mark Robert Haigh Gotham and Peter Jonas. The OpenScore Lieder corpus. In Music Encoding Conference Proceedings 2021, pp. 131–136. Humanities Commons, 2022. doi: 10.17613/1my2-dm23.

Jan Hajic Jr., Jiří Novotný, Pavel Pecina, and Jaroslav Pokorný. Further steps towards a standard testbed for optical music recognition. In Proceedings of the 17th International Society for Music Information Retrieval Conference, pp. 157–163, 2016. doi: 10.5281/zenodo.1418161.

David Huron. Humdrum and Kern: selective feature encoding. In Eleanor Selfridge-Field (ed.), Beyond MIDI: The Handbook of Musical Codes, pp. 375–401. MIT Press, Cambridge, MA, USA, 1997. ISBN 0262193949.

Phillip Long, Zachary Novack, Taylor Berg-Kirkpatrick, and Julian McAuley. PDMX: A large-scale public domain MusicXML dataset for symbolic music processing. In ICASSP 2025 - 2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pp. 1–5, 2025. doi: 10.1109/ICASSP49660.2025.10890217.

Juan C. Martinez-Sevilla, Joan Cerveto-Serrano, Noelia Luna, Greg Chapman, Craig Sapp, David Rizo, and Jorge Calvo-Zaragoza. Sheet music benchmark: Standardized optical music recognition evaluation, 2025. URL https://arxiv.org/abs/2506.10488.

Jiří Mayer, Milan Straka, Jan Hajič, and Pavel Pecina. Practical end-to-end optical music recognition for pianoform music. In Elisa H. Barney Smith, Marcus Liwicki, and Liangrui Peng (eds.), Document Analysis and Recognition - ICDAR 2024, pp. 55–73, Cham, 2024. Springer Nature Switzerland. ISBN 978-3-031-70552-6. doi: 10.1007/978-3-031-70552-6_4.

Jean-Francois Moine. abcm2ps 8.14.15, 2024. URL https://github.com/lewdlime/ abcm2ps/tree/v8.14.15.

MuseScore Ltd. MuseScore 3.6.2, 2021. URL https://musescore.org/3.6.2.

OpenAI. Introducing GPT-5. Technical report, OpenAI, Inc., August 2025. URL https:// openai.com/index/introducing-gpt-5/.

Project Petrucci LLC. International music score library project (IMSLP). https://imslp.org, 2025.

Laurent Pugin, Rodolfo Zitellini, and Perry Roland. Verovio: A library for engraving MEI music notation into SVG. In Proceedings of the 15th International Society for Music Information Retrieval Conference, pp. 107–122, 2014. doi: 10.5281/zenodo.1417589.

John Rink. Digital editions and the creative work of the performer. Nineteenth-Century Music Review, 18(1):51–81, 2021. doi: 10.1017/S1479409819000673.

Antonio Ríos-Vila, David Rizo, José M Iñesta, and Jorge Calvo-Zaragoza. End-to-end optical music recognition for pianoform sheet music. International Journal on Document Analysis and Recognition (IJDAR), 26(3):347–362, Sep 2023. doi: 10.1007/s10032-023-00432-z.

Antonio Ríos-Vila, Jorge Calvo-Zaragoza, and Thierry Paquet. Sheet music transformer: Endto-end optical music recognition beyond monophonic transcription. In Elisa H. Barney Smith, Marcus Liwicki, and Liangrui Peng (eds.), Document Analysis and Recognition - ICDAR 2024, pp. 20–37, Cham, 2024. Springer Nature Switzerland. ISBN 9783031705526. doi: 10.1007/978-3-031-70552-6_2.

Antonio Ríos-Vila, Jorge Calvo-Zaragoza, David Rizo, and Thierry Paquet. End-to-end full-page optical music recognition for pianoform sheet music, 2024. URL https://arxiv.org/ abs/2405.12105.

Craig Stuart Sapp. hum2abc, 2012. URL https://extras.humdrum.org/man/ hum2abc/.

Rico Sennrich, Barry Haddow, and Alexandra Birch. Neural machine translation of rare words with subword units. In Katrin Erk and Noah A. Smith (eds.), Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 1715–1725, Berlin, Germany, August 2016. Association for Computational Linguistics. doi: 10.18653/v1/P16-1162.

W.G. Vree, M. Tarenskeen, N. Liberg, Paul Villiger, Janus Meuris, Larry Myerscough, Dick Jackson, Jan Wybren de Jong, and Mark Zealey. xml2abc 147, 2018. URL https://wim.vree.org/ svgParse/xml2abc.html.

Chris Walshaw. The abc music standard 2.1 (2011), 2011. URL https://michaeleskin. com/abctools/abc_standard_v2.1.pdf.

Shangda Wu and Maosong Sun. Exploring the efficacy of pre-trained checkpoints in text-to-music generation task, 2023. URL https://arxiv.org/abs/2211.11216.

Shangda Wu, Yashan Wang, Xiaobing Li, Feng Yu, and Maosong Sun. MelodyT5: A unified scoreto-score transformer for symbolic music processing. In Proceedings of the 25th International Society for Music Information Retrieval Conference, pp. 642–650, 2024. doi: 10.5281/zenodo.14877419.

Weihan Xu, Julian McAuley, Taylor Berg-Kirkpatrick, Shlomo Dubnov, and Hao-Wen Dong. Generating symbolic music from natural language prompts using an llm-enhanced dataset, 2024. URL https://arxiv.org/abs/2410.02084.

Kaizhong Zhang and Dennis Shasha. Simple fast algorithms for the editing distance between trees and related problems. SIAM Journal of Computing, 18(6):1245–1262, 1989. doi: 10.1137/0218082.

# A 基线设置

# A.1 SMT++

SMT++有两个可用的检查点：antoniorv6/smtpp_mozarteum和antoniorv6/smtpp_polish_scores。对于我们的评估，我们使用检查点antoniorv6/smtpp_mozarteum，因为其训练数据Mozarteum数据集（Rink，2021）与我们的评估数据集更相似。这个选择某种程度上夸大了SMT++的性能。

SMT++（Ríos-Vila等，2024）声称“我们使用5折交叉验证”在Mozarteum和Polish Digital Scores上进行评估。这不是一个现实的评估，因为它只显示模型过拟合这两个数据集分布的能力，而且尚不清楚其发布的检查点是在数据集的哪部分训练的。

对于生成超参数，我们使用**SMT++**仓库https://github.com/antoniorv6/SMT-plusplus中的默认设置，并将最大生成长度设置为2048。

# A.2 GPT-5

Legato的性能与GPT-5的2025-08-07版本进行比较。由于全页设置，我们发现没有额外提示，GPT-5经常避免回答，并输出类似以下内容：

```
The notation in the provided image is not legible enough to transcribe accurately. Please upload a higher-resolution image or a closer crop so the notes, rhythms, and accidents can be read.
```

因此，我们添加以下系统提示以确保GPT-5始终输出有效的ABC：

You will be given an image of a sheet of music.

Transcribe it into valid ABC 2.1 notation. Try your best to transcribe and make a reasonable guess if the image is not clear.

Output only the ABC (no explanations), preferably inside a single '''abc fenced block.

IMPORTANT: NEVER give outputs like: 'Unable to transcribe from the provided image due to insufficient resolution/clarity.' If you can't tell, give your best guess.

!!!ALWAYS OUTPUT VALID ABC, DO NOT GIVE ANY ENGLISH OUTPUT. GIVE YOUR BEST GUESS IF YOU ARE NOT SURE!!!

# B 附加实验结果

# B.1 在OpenScore弦乐四重奏小提琴部分上的聚焦比较

我们进行聚焦比较以缩小模型之间的差异。我们观察到SMT++始���产���双声部输出，因为它专门在钢琴乐谱上训练。在这个比较中，我们手动仅保留两个小提琴部分。此外，由于SMT++在Verovio渲染的图像上训练，我们也使用Verovio渲染输入图像。此外，我们报告**kern错误率，并将Legato的输出无法转换为**kern的实例分配空字符串，进一步使评估有利于SMT++。如表2所示，即使在这些对SMT++非常有利的评估设置下，Legato仍然优于它。Legato_small在**kern CER和SER上由于转换失败而表现不如SMT++。在TEDn上，我们认为这是一个更合理和可比的指标，它要好得多，尽管不如较大的Legato模型。

表2：在OpenScore弦乐四重奏小提琴部分上的结果。所有指标越低越好。TEDn是主要指标，需要输出转换为MusicXML。TEDn_convert：仅在SMT++产生可成功转换为MusicXML的输出时评估；Legato输出始终成功转换为MusicXML。OMR-NED是格式无关的，基于从任何格式提取符号。对于OMR-NED，**kern输出自动修正语法错误，而ABC首先转换为MusicXML（在实践中总是成功）。†：10.2%的Legato输出和27.9%的Legato_small输出无法转换为**kern，因此使用空预测。OpenScore弦乐四重奏是最具挑战性的数据集，因为其乐谱图像密集得多。所有指标在§5中解释。

| 指标 | SMT++ | Legato | Legato_small |
|------|-------|-------|--------|----------|
| Rendered弦乐四重奏小提琴部分（256页） | | | | |
| †CERkern | 30.7 | 16.7 | 50.6 |
| †SERkern | 42.6 | 19.1 | 55.5 |
| †LERkern | 75.2 | 29.2 | 73.5 |
| TEDn | 95.0 | 7.7 | 35.0 |
| TEDnconvert | 64.5 | 8.7 | 35.9 |
| OMR-NED | 71.2 | 15.1 | 46.2 |

# B.2 多页性能

图4分解了Legato在不同长宽比上的错误率（微平均），显示多页输入更具挑战性；它也显示它们在数据中频率低得多。这些输入通常导致长序列在到达解码器之前被截断，限制模型性能。

# B.3 定性示例

图5展示了来自IMSLP钢琴乐谱以及Legato和SMT++的输出示例，错误用红框标记。在选择为TEDnconvert分数接近每个模型平均TEDnconvert分数的这个简短示例中，我们可以看到Legato在区分16分音符休止符和8分音符休止符之间存在问题，以及在32分音符休止符和16分音符休止符之间，以及将还原记号误认为升号的一个实例。SMT++错误地检测到节拍号和低音谱号的调号，在这4小节中，9个临时记号要么缺失要么不正确——虽然我们确实注意到在我们示例的最后一行，初始C#包含在该行的调号中，而遗漏的升号可能是**kern格式的限制而非系统输出的限制。

我们在图6中提供了更多示例。这些示例并非来自我们的评估数据集，而是作为著名钢琴作品被选中的示例。我们选择了一个不是由MuseScore、abcm2ps或Verovio渲染的扫描排版版本。为考虑到SMT++仅在钢琴数据上训练，我们将此额外示例集仅选择钢琴作品。此外，我们将乐谱上的单个系统隔离到空白页面上。这提供了更好的可视化，尽管SMT++和Legato都能够处理多系统输入。

图6a展示了莫扎特钢琴奏鸣曲K.545第一乐章第一行的结果。像许多初级钢琴曲目一样，输入图像非常干净，声部清晰分离。在这个特殊版本中，颤音符号用与Verovio默认不同的字体渲染，因此SMT++无法识别。相比之下，Legato可以适应各种字体，因为PDMX中的多种不同排版选项可以用MuseScore渲染，因此包含在训练数据中。此外，Legato正确识别所有延音线，而SMT++错过了它们。**kern和ABC都使用配对括号()表示延音线，这表明Legato的训练数据还包括不同类型的延音线。这使得Legato能够识别输入图像中的延音线，即使它不是由MuseScore、abcm2ps或Verovio渲染的。

图6b展示了肖邦Op.10 No.4第一系统的结果，这是一首被广泛认为是高级钢琴学习必不可少的练习曲��这��乐谱比图6a中的莫扎特更复杂，包含多个声部。此外，我们选择的版本包含打印-扫描过程带来的失真和人工制品，使输入更加难以用于OMR。SMT++产生输出包含过多声部、断开的符杠和不一致的小节长度。一些四分音符休止符与八分音符对齐不正确，谱号变化出现两次，使得输出无法用现有软件渲染。为可视化它，我们从SMT++的输出中手动识别符号并在MuseScore中标注。虽然Legato的输出存在一些错误（如格式错误的第一小节），但总体质量要好得多，并且大多数指法和演奏法都被正确检测到。

图6c展示了李斯特Erl König的一个系统。在没有完整乐谱的上下文情况下，摘录看起来“格式不完整”，因为缺少三连音符号。因此，上方声部的四分音符与下方声部的三个八分音符对齐——一个训练数据中不存在的异常情况。此外，下方声部的八分音符休止符在第二到第四小节中缺失。虽然有经验的钢琴家可以轻松解释这一点，但模型推断出字面的八分音符和休止符而非三连音，这是大多数TEDn错误的原因。尽管如此，Legato仍然通过准确捕获大多数音符的音高和上方声部音符的时长来优于SMT++。此外，Legato还能预测歌词和踏板符号的位置，这超出了SMT++的能力。