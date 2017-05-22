# 平行坐标边捆绑算法

####

多维数据可视化方法有很多，平行坐标是其中一种。它可以将多维数据映射到二维空间，数据中的每个数据项都被映射为一条边。然而当数据集比较大时，平行坐标中的边会相互堆叠交错，造成视觉混淆。边捆绑算法是解决平行坐标视觉混淆的一种重要思路。

#### 

首先，将每一个轴上的聚类根据连接关系进一步划分为几个组，然后对组进行重新规划和排序并建立组的连接。最后，将所有组
用不同的颜色属性进行独立渲染。为了增强视觉有效性表达，设计了交互以高亮显示不同的组。


Original Result:

![image](https://github.com/xswei/PC_Edge_Bundling/blob/master/pic/original.png)

Edge-Bundling Result:

![image](https://github.com/xswei/PC_Edge_Bundling/blob/master/pic/result.png)

Interaction Result:

![image](https://github.com/xswei/PC_Edge_Bundling/blob/master/pic/result2.png)