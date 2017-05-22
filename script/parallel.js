/**
 * Created by wxs on 16-3-15.
 */
$(document).ready(function() {
    //全局变量
    /*
     * 全局变量
     * svg、width、height、dataset、svgWidth、svgHeight
     * renderPara、xScale、isClassic、padding、property
     *
     *
     * */
    init();
});

function init() {
    window.width = $(window).innerWidth();
    window.height = $(window).innerHeight();
    window.offset = $("#offset")[0].value / 100;
    window.colorPara = {
        opacity: $("#opacity")[0].value,
        S: $("#colorS")[0].value,
        L: $("#colorL")[0].value,
        cancelColor: $("#useColor")[0].checked
    };
    window.guodu = 5;
    window.renderPara = {}; //绘制参数，包括是否显示，聚类个数，分支强度
    window.isClassic = true; //传统平行坐标与本方法切换标识符
    window.padding = {
        left: 60,
        right: 40,
        top: 100,
        bottom: 100
    }; //平行坐标与svg边界的距离

    $("#wrap").css({
        width: width,
        height: height
    });
    $("#left").css({
        width: width - 420,
        height: height
    });
    $("#right").css({
        width: 400,
        height: height
    });
    window.svgWidth = $("#left").innerWidth();
    window.svgHeight = $("#left").innerHeight();
    $("#pic").css({
            width: svgWidth - padding.left - padding.right + 150,
            height: svgHeight - padding.top - padding.bottom + 80,
            left: padding.left - 75,
            top: padding.top - 40
        })
        //启用文件上传控件
    $("input").removeAttr("disabled");
    $("#choseType").attr("disabled", "disabled");
}

function readFile() {
    var file = $("#input_file")[0].files[0];
    var reader = new FileReader();
    if (!file) {
        alert("未选择文件!");
        return;
    }
    var abNormalNums = 0; //如果数据种存在非数值类型数据，则记录下
    var fileSize = file.size;

    var tt;

    reader.readAsText(file);
    reader.onloadstart = function(e) {
        $("#file_status")[0].innerHTML = "开始加载...";
        tt = (new Date()).getTime();
    };
    reader.onprogress = function(e) {
        $("#file_status")[0].innerHTML = "加载中...";
    };
    reader.onloadend = function(e) {
        $("#file_status")[0].innerHTML = "加载完成";
        console.log("加载用时:"+((new Date()).getTime()-tt)+"ms");
    };
    reader.onload = function(e) {

        //加载完成后应该判断文件格式是否正确

        window.dataset = [];
        window.property = [];
        var fileArray = this.result.split("\n");
        for (var m = 0; m < fileArray.length; ++m) {
            fileArray[m] = fileArray[m].replace("\r", "").replace("\n", "");
        }
        property = fileArray[0].split(",");
        for (var i = 1; i < fileArray.length; ++i) {
            if (fileArray[i].replace(" ", "").length == 0) {
                //最后一行不记录
                continue;
            }
            var tempObj = {};
            var hasAbNormal = false;
            for (var j = 0; j < property.length; ++j) {
                if (isNaN(fileArray[i].split(",")[j])) {
                    hasAbNormal = true;
                    abNormalNums++;
                    break;
                }
                tempObj[property[j]] = {};
                tempObj[property[j]].value = parseFloat(fileArray[i].split(",")[j]);
            }
            if (!hasAbNormal) {
                dataset.push(tempObj);
            }
        }
        //console.log(property);
        //console.log(dataset);
        $("#pro_nums")[0].innerHTML = property.length;
        $("#data_nums")[0].innerHTML = dataset.length + abNormalNums;
        $("#normal_nums")[0].innerHTML = dataset.length;
        $("#abnormal_nums")[0].innerHTML = abNormalNums + "(包含缺失值)";
        $("#choseType").removeAttr("disabled");
        console.log(property);
        console.log(dataset);
        for (var i = 0; i < property.length; ++i) {
            renderPara[property[i]] = {};
            renderPara[property[i]]["display"] = true;
            renderPara[property[i]]["clusterNums"] = 3;
            renderPara[property[i]]["branchStrength"] = 0.5;
            renderPara[property[i]]["scale"] = (d3.scale.linear()
                .domain([
                    d3.min(dataset, function(d) {
                        return d[property[i]].value;
                    }),
                    d3.max(dataset, function(d) {
                        return d[property[i]].value;
                    })
                ])
                .range([
                    svgHeight - padding.bottom,
                    padding.top
                ]));
            //console.log(renderPara[property[i]]["scale"].domain());
        }
        //console.log(renderPara);
        initTableControl();
    };
}

function renderAxes(svg, ylist) {
    var xAxes = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    svg.append("g")
        .attr("class", "x-axes")
        .attr("transform", "translate(" + 0 + "," + (svgHeight - padding.bottom) + ")")
        .call(xAxes);
    for (var i = 0; i < ylist.length; ++i) {
        var yAxes = d3.svg.axis()
            .scale(renderPara[ylist[i]].scale)
            .ticks(15)
            .orient((i == ylist.length - 1) ? "left" : "left")
        svg.append("g")
            .attr("class", "y-axes")
            .attr("transform", "translate(" + xScale(ylist[i]) + "," + 0 + ")")
            .call(yAxes)
            .selectAll("text")
            .text(function(d) {
                return d > 10000 ? d3.format("e")(d) : d;
            })
    }
}

function initTableControl() {
    $("#table_control")[0].innerHTML = "";
    var paraControl = [];
    for (var i = 0; i < property.length; ++i) {
        paraControl.push({
            proName: property[i],
            values: []
        })
    }
    for (var i = 0; i < dataset.length; ++i) {
        for (var j = 0; j < paraControl.length; ++j) {
            var hasFind = false;
            var k = 0;
            for (k; k < paraControl[j].values.length; ++k) {
                if (dataset[i][paraControl[j].proName].value == paraControl[j].values[k]) {
                    hasFind = true;
                    break;
                }
            }
            if (k >= paraControl[j].values.length) {
                paraControl[j].values.push(dataset[i][paraControl[j].proName].value);
            }
        }
    }
    //console.log(paraControl);
    var tableControlHead = d3.select("#table_control").append("tr");
    tableControlHead.append("th").text("属性名");
    tableControlHead.append("th").text("聚类个数");
    tableControlHead.append("th").text("分支强度");
    tableControlHead.append("th").text("隐藏");

    var trs_control = d3.select("#table_control").selectAll("tr.pro")
        .data(paraControl).enter()
        .append("tr").attr("class", "pro");
    //属性名称
    var td_name = trs_control.append("td")
        .style("width", "120px")
        .text(function(d) {
            return d.proName;
        });
    //range
    trs_control.append("td").append("input").attr("type", "number")
        .style("width", "65px")
        .attr("min", 1)
        .attr("class", "clusterNums")
        .attr("max", function(d) {
            return d.values.length / 2;
        })
        .attr("value", function(d) {
            return d.values.length > 3 ? 3 : Math.floor(d.values.length);
        })
        //.attr("disabled","disabled")
        .attr("onclick", "updateControl(event)")
        .attr("id", function(d) {
            return "cluster_" + d.proName;
        });
    //分支强度
    var td_branch = trs_control.append("td").append("input")
        .attr("type", "number")
        .style("width", "65px")
        .attr("id", function(d) {
            return "branch_" + d.proName;
        })
        .attr("disabled", "disabled")
        .attr("class", "branch")
        .attr("min", 0.1).attr("max", 1)
        .attr("step", "0.01")
        .attr("onclick", "updateControl(event)")
        .attr("value", 0.5);
    trs_control.append("td").append("input")
        .attr("type", "checkbox")
        .style("width", "65px")
        .attr("class", "checkbox_display")
        .attr("onclick", "updateControl(event)")
        .attr("id", function(d) {
            return "display_" + d.proName;
        });
    updateClusterDataset(property);
}

function updateControl(event) {
    if (event.target.type == "checkbox") {
        var pro = event.target.id.split("_")[1];
        renderPara[pro]["display"] = !event.target.checked;

        var selectorCluster = "#cluster_" + event.target.id.split("_")[1];
        var selectorBranch = "#branch_" + event.target.id.split("_")[1];
        if (event.target.checked) {

            //$(selectorCluster).attr("disabled","disabled");
            //$(selectorBranch).attr("disabled","disabled");
        } else if (!isClassic) {
            $(selectorCluster).removeAttr("disabled");
            $(selectorBranch).removeAttr("disabled");
        }
        if (isClassic) {
            renderClassic();
        } else {
            renderEdgeBundling();
        }
    } else {
        if (event.target.id.split("_")[0] == "cluster") {
            //更新聚类个数
            var pro = event.target.id.split("_")[1];
            renderPara[pro]["clusterNums"] = parseInt(event.target.value);
            updateClusterDataset(pro);
        } else if (event.target.id.split("_")[0] == "branch") {
            //更新分支强度
            var pro = event.target.id.split("_")[1];
            renderPara[pro]["branchStrength"] = parseFloat(event.target.value);
            renderEdgeBundling();
        }
    }
    /*
     * 更新renderPara参数
     * */
}

function updateColor(event) {
    //颜色控件
    window.colorPara.opacity = $("#opacity")[0].value;
    window.colorPara.S = $("#colorS")[0].value;
    window.colorPara.L = $("#colorL")[0].value;
    window.colorPara.cancelColor = $("#useColor")[0].checked;


    console.log("updateColor");

    var firstPro;
    for (var i = 0; i < property.length; ++i) {
        if (renderPara[property[i]].display) {
            firstPro = renderPara[property[i]].clusterNums;
            break;
        }
    }
    if (isClassic) {
        if ($("#useColor")[0].checked) {
            svg.select("g.g_lines").selectAll("path").attr("stroke", "black");
        } else {
            svg.select("g.g_lines").selectAll("path").attr("stroke", function(d) {
                //console.log(this);
                return color(firstPro, d3.select(this).attr("id").split("_")[1]);
            });
        }
    } else {
        console.log(svg.select("defs"));
        var rela = svg.select("g.g_rela");
        var branch = svg.select("g.g_branch");
        if ($("#useColor")[0].checked) {
            rela.selectAll("path").attr("fill", "black");
            rela.selectAll("path").attr("opacity", $("#opacity")[0].value);
            branch.selectAll("path").attr("fill", "black");
            branch.selectAll("path").attr("opacity", $("#opacity")[0].value);
        } else {
            rela.selectAll("path").attr("fill", function(d) {
                return color(firstPro, d3.select(this).attr("id").split("_")[1]);
            }).attr("opacity", window.colorPara.opacity);
            branch.selectAll("path").attr("fill", function(d) {
                return color(firstPro, d3.select(this).attr("id").split("_")[1]);
            }).attr("opacity", window.colorPara.opacity);
        }

    }
}

function updateOffset(event) {
    window.offset = $("#offset")[0].value / 100;
    renderEdgeBundling();
}

function changeParallelType(event) {
    isClassic = !isClassic;
    if (!isClassic) {
        $("input#offset").removeAttr("disabled");
        event.target.value = "边捆绑平行坐标";
        var checkboxs = $("input.checkbox_display");
        for (var i = 0; i < checkboxs.length; ++i) {
            if (!checkboxs[i].checked) {
                var selectorCluster = "#cluster_" + checkboxs[i].id.split("_")[1];
                var selectorBranch = "#branch_" + checkboxs[i].id.split("_")[1];
                $(selectorCluster).removeAttr("disabled");
                $(selectorBranch).removeAttr("disabled");
            }
        }
        //console.log(checkboxs);
        renderEdgeBundling();
    } else {
        $("input#offset").attr("disabled", "disable");
        event.target.value = "传统平行坐标";
        $("input.branch").attr("disabled", "disabled");
        $("input.checkbox_display").removeAttr("disabled");
        renderClassic();
    }
}

function updateClusterDataset(flag) {
    //flag表示需要重新计算的属性名，只有在聚类个数发生改变时才调用
    /*
     * 应当对dataset聚类后保持属性状态，除非参数变化，
     * 1、为了在交互时候其他的属性聚类结果保持稳定
     * 2、减轻计算压力
     * dataset=[
     *   {
     *       proname:{
     *           value:  //原始数据值
     *           clusterIndex:   //所在的聚类分组
     *       },
     *       ...
     *   },
     *   {},
     *   ...
     * ]
     *判断参数来区分是所有属性都需要聚类还是只需要对其中一个属性聚类
     *
     * */
    //console.log(flag);
    if (typeof flag == "object") {
        //
        for (var n = 0; n < flag.length; ++n) {
            var clusterTemp1 = dataset.map(function(d) {
                return [1, renderPara[flag[n]].scale(d[flag[n]].value)];
            });
            var clusterTempResult1 = cluster(clusterTemp1, renderPara[flag[n]].clusterNums);
            //console.log(clusterTempResult1);
            if (clusterTempResult1.clusterAssment.length != dataset.length) {
                alert("在对 " + flag + " 聚类时出错..");
                return;
            }


            for (var m = 0; m < dataset.length; ++m) {
                dataset[m][flag[n]]["clusterIndex"] = clusterTempResult1.clusterAssment[m][0];
                dataset[m][flag[n]]["clusterCenter"] = Math.floor(clusterTempResult1.centroids[dataset[m][flag[n]]["clusterIndex"]][1]);
            }
        }
    } else {
        var clusterTemp = dataset.map(function(d) {
            return [1, renderPara[flag].scale(d[flag].value)];
        });
        var clusterTempResult = cluster(clusterTemp, renderPara[flag].clusterNums);
        if (clusterTempResult.clusterAssment.length != dataset.length) {
            alert("在对 " + flag + " 聚类时出错..");
            return;
        }


        for (var i = 0; i < dataset.length; ++i) {
            dataset[i][flag]["clusterIndex"] = clusterTempResult.clusterAssment[i][0];
            dataset[i][flag]["clusterCenter"] = Math.floor(clusterTempResult.centroids[dataset[i][flag]["clusterIndex"]][1]);
        }
    }
    if (isClassic) {
        renderClassic();
    } else {
        renderEdgeBundling();
    }
}

function renderClassic() {
    console.log("--------------------经典平行坐标--------------------");
    /*
     * 清空左侧区域
     * 获取需要绘制的属性
     * */
    $("#left")[0].innerHTML = "";
    window.svg = d3.select("#left").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)


    var needRenderPro = [];
    for (var i = 0; i < property.length; ++i) {
        if (renderPara[property[i]]["display"]) {
            needRenderPro.push(property[i]);
        }
    }
    if (needRenderPro.length < 2) {
        alert("维度少于2个还做啥子平行坐标");
        return;
    }
    //x方向的比例尺，全局
    window.xScale = d3.scale.ordinal()
        .domain(needRenderPro)
        .rangePoints([
            padding.left,
            svgWidth - padding.right
        ]);
    renderAxes(svg, needRenderPro); //绘制平行坐标轴

    var line = d3.svg.line()
        .interpolate("linear");
    var path = function(d) {
        return line(needRenderPro.map(function(p) {
            return [xScale(p), renderPara[p]["scale"](d[p].value)];
        }))
    };
    var g_lines = svg.append("g")
        .attr("class", "g_lines");
    var colorNums = renderPara[needRenderPro[0]].clusterNums;
    var scale_color = function(i) {
        if (window.colorPara.cancelColor) {
            return "black";
        } else {
            var hsl = "hsl(" + (360 / colorNums) * i + "," + window.colorPara.S + "%," + window.colorPara.L + "%)";
            return hsl;
        }
    };
    /*for(var i=0;i<dataset.length;++i){
        for(var j=0;j<needRenderPro.length;++j){
            g_lines.append("circle")
                .attr("cx",function(d){
                    return xScale(needRenderPro[j]);
                })
                .attr("cy",function(d){
                    console.log(dataset[needRenderPro[j]]);
                    return renderPara[needRenderPro[j]].scale(dataset[i][needRenderPro[j]].value);
                })
                .attr("r",3)
                .attr("fill",function(){
                    //return "black";
                    return scale_color(dataset[i][needRenderPro[j]].clusterIndex)
                })
                .attr("opacity","0.8")
        }
    }*/
    g_lines.selectAll("path.line")
        .data(dataset).enter()
        .append("path")
        .attr("class", "line")
        .attr("stroke", function(d) {
            return scale_color(d[needRenderPro[0]].clusterIndex);
        })
        .attr("id", function(d) {
            return "line_" + d[needRenderPro[0]].clusterIndex;
        })
        .attr("d", path)
}

function color(clusterNums, i) {
    if ($("#useColor")[0].checked) {
        return "black";
    } else {
        var hsl = "hsl(" + (360 / clusterNums) * i + "," + window.colorPara.S + "%," + window.colorPara.L + "%)";
        return hsl;
    }
}

function renderEdgeBundling() {
    //console.log("-------------------------边捆绑平行坐标---------------------");
    /*
     * 清空左侧区域
     * 获取需要绘制的属性
     * 获取当前捆绑参数
     *
     * */
    window.renderT = (new Date()).getTime();
    $("#left")[0].innerHTML = "";
    window.svg = d3.select("#left").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .on("click", function() {
            clickInSvg(svg);
        });


    var needRenderPro = [];
    for (var i = 0; i < property.length; ++i) {
        if (renderPara[property[i]]["display"]) {
            needRenderPro.push(property[i]);
        }
    }
    //console.log("需要绘制的属性列表:"+needRenderPro);
    //console.log(renderPara);

    //x方向的比例尺，全局
    window.xScale = d3.scale.ordinal()
        .domain(needRenderPro)
        .rangePoints([
            padding.left,
            svgWidth - padding.right
        ]);
    renderAxes(svg, needRenderPro); //绘制平行坐标轴
    if (needRenderPro.length < 2) {
        alert("维度少于2个还做啥子平行坐标");
        return;
    }

    //console.log(dataset);
    render(svg, needRenderPro);
}

function render(svg, proList) {
    //根据聚类结果绘制，参数为需要绘制的属性数组，以第一个属性聚类结果为基础，
    /*
     * 第一个属性聚类为n组，则将dataset分解为n组，之后分别绘制n组
     * */
    var relaTemp = [];
    for (var i = 0; i < proList.length; ++i) {
        relaTemp.push({
            clustered: [],
            pro_name: proList[i]
        });
    }
    for (var i = 0; i < relaTemp.length; ++i) {
        //console.log(relaTemp[i]);
        for (var j = 0; j < renderPara[relaTemp[i].pro_name].clusterNums; ++j) {
            for (var k = 0; k < dataset.length; ++k) {
                if (j == dataset[k][relaTemp[i].pro_name].clusterIndex) {
                    relaTemp[i].clustered.push({
                        centroid: [1, dataset[k][relaTemp[i].pro_name].clusterCenter]
                    })
                    break;
                }
            }
        }
    }
    for (var i = 0; i < relaTemp.length; ++i) {
        for (var j = 0; j < relaTemp[i].clustered.length; ++j) {
            var tempExtent = [];
            for (var k = 0; k < dataset.length; ++k) {
                if (dataset[k][relaTemp[i].pro_name].clusterIndex == j) {
                    tempExtent.push(dataset[k][relaTemp[i].pro_name].value);
                }
            }
            relaTemp[i].clustered[j]["extent"] = d3.extent(tempExtent, function(d) {
                return renderPara[relaTemp[i].pro_name].scale(d);
            });
        }
    }
    //console.log(relaTemp);
    getGroup(svg, relaTemp, proList);
}

function getGroup(svg, data, pro_name_array) {

    window.width_scale = d3.scale.linear()
        .range([0, get_min_width(data)]);
    window.width_info = [];
    window.group_data = [];
    for (var i = 0; i < data[0].clustered.length; ++i) {
        var width_info_temp = [];
        for (var j = 0; j < data.length; ++j) {
            var width_info_temp_temp = [];
            for (var k = 0; k < data[j].clustered.length; ++k) {
                width_info_temp_temp.push({
                    "clustered_index": k,
                    "center": data[j].clustered[k].centroid[1],
                    "width": 0,
                    "top": 0,
                    "bottom": 0,
                    "nums": 0,
                    "slider": 0,
                    "extent": data[j].clustered[k].extent,
                    "position": []
                })
            }
            width_info_temp.push(width_info_temp_temp);
        }
        width_info.push({
            "group_index": i,
            "data": width_info_temp,
            "data_detail": []
        })
    }
    //console.log("width_info",width_info);


    //console.log(pro_name_array);
    for (var i = 0; i < data[0].clustered.length; ++i) {
        var temp = [];
        for (var j = 0; j < pro_name_array.length - 1; ++j) {
            temp.push({
                "space_left": j,
                "space_right": j + 1,
                "detail": []
            })
        }
        group_data.push({
                "group_index": i,
                "data": temp
            })
            //console.log(temp);
    }
    for (var i = 0; i < data[0].clustered.length; ++i) {
        var relation = [];
        var really_relation = [];
        for (var j = 0; j < dataset.length; ++j) {
            var position = renderPara[pro_name_array[0]].scale(dataset[j][pro_name_array[0]].value);
            if ((position <= data[0].clustered[i].extent[1]) && (position >= data[0].clustered[i].extent[0])) {
                //console.log("relation----------------------");
                var relation_temp = [i];
                width_info[i].data_detail.push(dataset[j]);
                for (var m = 1; m < pro_name_array.length; ++m) {
                    var temp_position = renderPara[pro_name_array[m]].scale(dataset[j][pro_name_array[m]].value);
                    for (var n = 0; n < data[m].clustered.length; ++n) {
                        if ((temp_position <= data[m].clustered[n].extent[1]) && (temp_position >= data[m].clustered[n].extent[0])) {
                            relation_temp.push(n);
                            break;
                        }
                    }
                }
                //console.log(relation_temp);
                relation.push(relation_temp);
            } else {
                continue;
            }
        }
        //console.log(relation.length);
        //console.log("group_Data");
        //console.log(group_data);
        for (var m = 0; m < relation.length; ++m) {
            for (var n = 0; n < group_data[i].data.length; ++n) {
                var k = 0;
                for (k; k < group_data[i].data[n].detail.length; ++k) {
                    if ((relation[m][n] == group_data[i].data[n].detail[k].left_index) && (relation[m][n + 1] == group_data[i].data[n].detail[k].right_index)) {
                        group_data[i].data[n].detail[k].nums++;
                        break;
                    }
                }
                if (k >= group_data[i].data[n].detail.length) {
                    //console.log(relation[m])
                    //console.log(data)
                    //console.log(data[n+1].clustered[relation[m][n+1]]);
                    var left_center = data[n].clustered[relation[m][n]].centroid[1];
                    var right_center = data[n + 1].clustered[relation[m][n + 1]].centroid[1];
                    group_data[i].data[n].detail.push({
                        "left_index": relation[m][n],
                        "left_center": left_center,
                        "right_index": relation[m][n + 1],
                        "right_center": right_center,
                        "nums": 1
                    })
                }
            }
        }
    }

    for (var i = 0; i < group_data.length; ++i) {
        for (var j = 0; j < group_data[i].data.length; ++j) {
            (group_data[i].data[j].detail).sort(function(a, b) {
                if ((a.left_center <= b.left_center) && (a.right_center <= b.right_center)) {
                    return -1;
                } else {
                    return 1;
                }
            })
        }
    }
    var max_nums = 0;
    var min_nums = 400;
    for (var i = 0; i < width_info.length; ++i) {
        for (var j = 0; j < width_info[i].data.length; ++j) {
            for (var k = 0; k < width_info[i].data[j].length; ++k) {
                var sum_temp = 0;
                if (j < pro_name_array.length - 1) {
                    for (var m = 0; m < group_data[i].data[j].detail.length; ++m) {
                        if (group_data[i].data[j].detail[m].left_index == k) {
                            sum_temp += group_data[i].data[j].detail[m].nums;
                        }
                    }
                } else {
                    for (var m = 0; m < group_data[i].data[j - 1].detail.length; ++m) {
                        if (group_data[i].data[j - 1].detail[m].right_index == k) {
                            sum_temp += group_data[i].data[j - 1].detail[m].nums;
                        }
                    }
                }
                min_nums = min_nums > sum_temp ? sum_temp : min_nums;
                max_nums = max_nums < sum_temp ? sum_temp : max_nums;
                width_info[i].data[j][k].nums = sum_temp;
            }
        }
    }
    //console.log(max_nums);
    width_scale.domain([0, max_nums]);
    for (var i = 0; i < width_info.length; ++i) {
        for (var j = 0; j < width_info[i].data.length; ++j) {
            for (var k = 0; k < width_info[i].data[j].length; ++k) {
                if (width_info[i].data[j][k].nums == 0) {
                    continue;
                }
                width_info[i].data[j][k].width = width_scale(width_info[i].data[j][k].nums);

                //console.log(width_info[i].data[j][k].nums);
                //console.log(width_scale(width_scale(width_info[i].data[j][k].nums)));

                if ((width_info[i].data[j][k].width / 2 + width_info[i].data[j][k].center) > (svgHeight - padding.bottom)) {
                    width_info[i].data[j][k].top = svgHeight - padding.bottom - width_info[i].data[j][k].width;
                    width_info[i].data[j][k].bottom = svgHeight - padding.bottom;
                } else if ((width_info[i].data[j][k].center - width_info[i].data[j][k].width / 2) < padding.top) {
                    width_info[i].data[j][k].top = padding.top;
                    width_info[i].data[j][k].bottom = padding.top + width_info[i].data[j][k].width;
                } else {
                    width_info[i].data[j][k].top = width_info[i].data[j][k].center - width_info[i].data[j][k].width / 2;
                    width_info[i].data[j][k].bottom = width_info[i].data[j][k].center + width_info[i].data[j][k].width / 2;
                }
                /*svg.append("line")
                 .attr("x1",xScale(pro[j])+xScale.rangeBand()/2)
                 .attr("y1",width_info[i].data[j][k].top)
                 .attr("x2",xScale(pro[j])+xScale.rangeBand()/2)
                 .attr("y2",width_info[i].data[j][k].bottom)
                 .attr("stroke","red")
                 .attr("stroke-width",10)
                 .attr("id",width_info[i].data[j][k].nums)*/
            }
        }
    }
    //console.log(group_data);
    //console.log(min_nums,max_nums);

    //console.log(width_scale.domain(),width_scale.range());
    for (var i = 0; i < group_data.length; ++i) {
        for (var j = 0; j < group_data[i].data.length; ++j) {
            for (var m = 0; m < width_info[i].data.length; ++m) {
                for (var n = 0; n < width_info[i].data[m].length; ++n) {
                    width_info[i].data[m][n].slider = 0;
                }
            }



            for (var k = 0; k < group_data[i].data[j].detail.length; ++k) {
                //console.log(group_data[i].data[j].detail[k]);
                var rela_width = width_scale(group_data[i].data[j].detail[k].nums);
                var left_top, left_bottom, right_top, right_bottom;

                left_top = width_info[i].data[j][group_data[i].data[j].detail[k].left_index].top + width_info[i].data[j][group_data[i].data[j].detail[k].left_index].slider;
                left_bottom = width_info[i].data[j][group_data[i].data[j].detail[k].left_index].top + width_info[i].data[j][group_data[i].data[j].detail[k].left_index].slider + rela_width;
                right_top = width_info[i].data[j + 1][group_data[i].data[j].detail[k].right_index].top + width_info[i].data[j + 1][group_data[i].data[j].detail[k].right_index].slider;
                right_bottom = width_info[i].data[j + 1][group_data[i].data[j].detail[k].right_index].top + width_info[i].data[j + 1][group_data[i].data[j].detail[k].right_index].slider + rela_width;

                width_info[i].data[j][group_data[i].data[j].detail[k].left_index].slider += rela_width;
                width_info[i].data[j + 1][group_data[i].data[j].detail[k].right_index].slider += rela_width;

                group_data[i].data[j].detail[k].left_top = left_top;
                group_data[i].data[j].detail[k].left_bottom = left_bottom;
                group_data[i].data[j].detail[k].right_bottom = right_bottom;
                group_data[i].data[j].detail[k].right_top = right_top;
                //console.log(width_info[i].data[j][group_data[i].data[j].detail[k].left_index].top);
                /*console.log(left_bottom);
                console.log(right_top);
                console.log(right_bottom);*/
            }
        }
    }
    //var scale_color=d3.scale.category10();
    var colorNums = renderPara[pro_name_array[0]].clusterNums;
    window.scale_color = function(i) {
        if (window.colorPara.cancelColor) {
            return "black";
        } else {
            var hsl = "hsl(" + (360 / colorNums) * i + "," + window.colorPara.S + "%," + window.colorPara.L + "%)";
            return hsl;
        }
    };
    console.log(pro_name_array);
    console.log(renderPara[pro_name_array[0]].clusterNums);
    renderRela(svg, scale_color, pro_name_array)
}

function renderRela(svg, color, pro_name_array) {
    d3.select("g.g_rela").remove();
    var g_rela = svg.append("g").attr("class", "g_rela")
    var distance = (xScale(pro_name_array[1]) - xScale(pro_name_array[0])) * offset;
    for (var i = 0; i < group_data.length; ++i) {
        for (var j = 0; j < group_data[i].data.length; ++j) {
            for (var k = 0; k < group_data[i].data[j].detail.length; ++k) {
                g_rela.append("path")
                    .attr("class", "rela")
                    .attr("id", "group_" + i)
                    .attr("d", function(d) {
                        var x = ((xScale(pro_name_array[j]) + xScale.rangeBand() / 2 + distance + guodu) + (xScale(pro_name_array[j + 1]) + xScale.rangeBand() / 2 - distance - guodu)) / 2;
                        var y1 = group_data[i].data[j].detail[k].left_top;
                        var y2 = group_data[i].data[j].detail[k].right_top;
                        var y3 = group_data[i].data[j].detail[k].left_bottom;
                        var y4 = group_data[i].data[j].detail[k].right_bottom;

                        /*return 'M'+(xScale(pro_name_array[j])+distance+guodu)+","+(y1+y3)/2+"L"
                            +(xScale(pro_name_array[j])+distance+guodu)+","+(y1+y3)/2+"C"
                            +((xScale(pro_name_array[j]))+(xScale(pro_name_array[j+1])))/2+","+(y1+y3)/2
                            +" "+(xScale(pro_name_array[j])+xScale(pro_name_array[j+1]))/2+","+(y2+y4)/2
                            +" "+(xScale(pro_name_array[j+1])-distance-guodu)+","+(y2+y4)/2+"L"
                            +(xScale(pro_name_array[j+1])-distance)+","+(y2+y4)/2;*/
                        return "M" + Math.floor(xScale(pro_name_array[j]) + distance) + "," + group_data[i].data[j].detail[k].left_top + "L" + Math.floor(xScale(pro_name_array[j]) + distance + guodu) + "," + group_data[i].data[j].detail[k].left_top + "C" + x + "," + y1 + " " + x + "," + y2 + " " + Math.floor(xScale(pro_name_array[j + 1]) - distance - guodu) + "," + group_data[i].data[j].detail[k].right_top + "L" + Math.floor(xScale(pro_name_array[j + 1]) - distance) + "," + group_data[i].data[j].detail[k].right_top + "L" + Math.floor(xScale(pro_name_array[j + 1]) - distance) + "," + group_data[i].data[j].detail[k].right_bottom + "L" + Math.floor(xScale(pro_name_array[j + 1]) - distance - guodu) + "," + group_data[i].data[j].detail[k].right_bottom + "C" + x + "," + y4 + " " + x + "," + y3 + " " + Math.floor(xScale(pro_name_array[j]) + distance + guodu) + "," + group_data[i].data[j].detail[k].left_bottom + "L" +
                            +Math.floor(xScale(pro_name_array[j]) + distance) + "," + group_data[i].data[j].detail[k].left_bottom + "Z";
                    })
                    /*.attr("stroke",function(d){
                        return color(i);
                    })*/
                    /*.attr("stroke-width",function(d){
                        return 2
                        return Math.abs(group_data[i].data[j].detail[k].left_top-group_data[i].data[j].detail[k].left_bottom);;
                    })*/
                    .attr("fill", function(d) {
                        //return "none";
                        return color(i);
                        if (i == 0) {
                            return "red";
                        } else if (i == 1) {
                            return "green";
                        } else {
                            return "blue";
                        }
                    })
                    .attr("opacity", 0.5)
                    .on("click", function(d) {
                        clickIn(svg, d3.select(this).attr("id").split("_")[1]);
                    })
            }
        }
    }
    renderBranch(svg, color, pro_name_array);

}

function renderBranch(svg, color, pro_name_array) {
    //console.log(width_info);
    var distance = (xScale(pro_name_array[1]) - xScale(pro_name_array[0])) * offset;
    d3.select("g.g_branch").remove();
    var g_branch = svg.append("g")
        .attr("class", "g_branch");
    var defs = svg.append("defs");
    //


    //
    for (var i = 0; i < width_info.length; ++i) {
        //循环n个分组
        for (var j = 0; j < width_info[i].data.length; ++j) {
            //console.log(width_info[i].data[j]);
            //循环第i组的所有属性
            for (var k = 0; k < width_info[i].data[j].length; ++k) {
                width_info[i].data[j][k].slider = 0;
                if (width_info[i].data[j][k].nums == 0) {
                    //如果没有数据，跳过
                    continue;
                } else {
                    //console.log(width_info[i].data_detail);
                    //第i分组在第j个属性上的第k个群集上有数据
                    for (var m = 0; m < width_info[i].data_detail.length; ++m) {
                        //循环所有的数据 找出属于这个群集的所有数据  并计算位置
                        var temp_position = renderPara[pro_name_array[j]].scale(width_info[i].data_detail[m][pro_name_array[j]].value);
                        //
                        if ((temp_position <= width_info[i].data[j][k].extent[1]) && (temp_position >= width_info[i].data[j][k].extent[0])) {

                            width_info[i].data[j][k].position.push(temp_position);
                        }
                    }
                    //------------------------------------------
                    width_info[i].data[j][k].position.sort(function(a, b) {
                        return a > b ? 1 : (b > a ? -1 : 0);
                    });

                    // console.log(width_info[i].data[j][k].position);
                    width_info[i].data[j][k].branch_data = [];
                    var distance_temp = (width_info[i].data[j][k].extent[1] - width_info[i].data[j][k].extent[0]) * (1 - renderPara[pro_name_array[j]].branchStrength);
                    for (var n = 0; n < width_info[i].data[j][k].position.length; ++n) {
                        if (width_info[i].data[j][k].branch_data.length == 0) {
                            width_info[i].data[j][k].branch_data.push({
                                "extent": [width_info[i].data[j][k].position[0], width_info[i].data[j][k].position[0]],
                                "nums": 1
                            })
                        } else {
                            var space_distance = width_info[i].data[j][k].position[n] - width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length - 1].extent[1];
                            if ((space_distance - distance_temp) <= 0.1) {
                                width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length - 1].extent[1] = width_info[i].data[j][k].position[n];
                                width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length - 1].nums++;
                            } else {
                                width_info[i].data[j][k].branch_data.push({
                                    "extent": [width_info[i].data[j][k].position[n], width_info[i].data[j][k].position[n]],
                                    "nums": 1
                                })
                            }
                        }
                    }

                    /* console.log(width_info[i].data[j][k].position);

                     var distance_temp=(width_info[i].data[j][k].extent[1]-width_info[i].data[j][k].extent[0])*renderPara[pro_name_array[j]].branchStrength;
                     console.log(renderPara[pro_name_array[j]].branchStrength);
                     for(var n=0;n<width_info[i].data[j][k].position.length;++n){

                         if(width_info[i].data[j][k].branch_data.length==0){

                             width_info[i].data[j][k].branch_data.push({
                                 "extent":[width_info[i].data[j][k].position[0],width_info[i].data[j][k].position[0]],
                                 "nums":1
                             })
                             console.log(width_info[i].data[j][k].branch_data);
                         }else{

                             var space_distance=width_info[i].data[j][k].position[n]-width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length-1].extent[1];

                             if((space_distance-distance_temp)<=0.1){
                                 width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length-1].extent[1]=width_info[i].data[j][k].position[n];
                                 width_info[i].data[j][k].branch_data[width_info[i].data[j][k].branch_data.length-1].nums++;
                             }else{
                                 width_info[i].data[j][k].branch_data.push({
                                     "extent":[width_info[i].data[j][k].position[n],width_info[i].data[j][k].position[n]],
                                     "nums":1
                                 })
                             }
                         }
                     }*/
                    //------------------------------------------

                }
            }
        }
    }
    //console.log(width_info);
    var grad_Array = [];
    for (var i = 0; i < width_info.length; ++i) {
        grad_Array.push([]);
    }
    for (var i = 0; i < width_info.length; ++i) {
        //console.log(i);

        grad_Array[i][0] = defs.append("linearGradient").attr("id", "grad_" + i + "_L");
        grad_Array[i][0].append("stop").attr("offset", "0%").style("stop-color", color(i)).style("stop-opacity", 0.5);
        grad_Array[i][0].append("stop").attr("offset", "100%").style("stop-color", color(i)).style("stop-opacity", 1);

        grad_Array[i][0] = defs.append("linearGradient").attr("id", "grad_" + i + "_C");
        grad_Array[i][0].append("stop").attr("offset", "0%").style("stop-color", color(i)).style("stop-opacity", 1);
        grad_Array[i][0].append("stop").attr("offset", "50%").style("stop-color", color(i)).style("stop-opacity", 0.5);
        grad_Array[i][0].append("stop").attr("offset", "100%").style("stop-color", color(i)).style("stop-opacity", 1);

        grad_Array[i][0] = defs.append("linearGradient").attr("id", "grad_" + i + "_R");
        grad_Array[i][0].append("stop").attr("offset", "0%").style("stop-color", color(i)).style("stop-opacity", 1);
        grad_Array[i][0].append("stop").attr("offset", "100%").style("stop-color", color(i)).style("stop-opacity", 0.5);



        for (var j = 0; j < width_info[i].data.length; ++j) {
            for (var k = 0; k < width_info[i].data[j].length; ++k) {

                if (width_info[i].data[j][k].nums == 0) {
                    continue;
                }
                for (var m = 0; m < width_info[i].data[j][k].branch_data.length; ++m) {
                    //console.log(width_info[i].data[j][k].branch_data[m]);
                    var s = (width_info[i].data[j][k].bottom - width_info[i].data[j][k].top) * (width_info[i].data[j][k].branch_data[m].nums / (width_info[i].data[j][k].nums));
                    if (j == 0) {
                        g_branch.append("path")
                            .attr("fill", function(d) {
                                return "url(#grad_" + i + "_L)";
                                return color(i);
                                if (i == 0) {
                                    return "red";
                                } else if (i == 1) {
                                    return "green";
                                } else {
                                    return "blue";
                                }
                            })
                            .attr("opacity", 0.5)
                            .attr("id", "group_" + i)
                            .attr("d", function(d) {
                                return "M" + (xScale([pro_name_array[j]])) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + "C" + (xScale([pro_name_array[j]]) + distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + " " + (xScale([pro_name_array[j]]) + distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + " " + Math.floor(xScale([pro_name_array[j]]) + distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + "L" + Math.floor(xScale([pro_name_array[j]]) + distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + "C" + (xScale([pro_name_array[j]]) + distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + " " + (xScale([pro_name_array[j]]) + distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + " " + xScale([pro_name_array[j]]) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + "Z";
                            })
                            .on("click", function(d) {
                                clickIn(svg, d3.select(this).attr("id").split("_")[1]);
                            })
                    } else if (j == pro_name_array.length - 1) {
                        g_branch.append("path")
                            .attr("fill", function(d) {
                                return "url(#grad_" + i + "_R)";
                                return color(i);
                                if (i == 0) {
                                    return "red";
                                } else if (i == 1) {
                                    return "green";
                                } else {
                                    return "blue";
                                }
                            })
                            .attr("opacity", 0.5)
                            .attr("id", "group_" + i)
                            .attr("d", function(d) {
                                return "M" + (xScale([pro_name_array[j]])) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + "C" + (xScale([pro_name_array[j]]) - distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + " " + (xScale([pro_name_array[j]]) - distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + " " + Math.floor(xScale([pro_name_array[j]]) - distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + "L" + Math.floor(xScale([pro_name_array[j]]) - distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + "C" + (xScale([pro_name_array[j]]) - distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + " " + (xScale([pro_name_array[j]]) - distance / 2) + " " + width_info[i].data[j][k].branch_data[m].extent[0] + " " + (xScale([pro_name_array[j]])) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + "Z";

                            })
                            .on("click", function(d) {
                                clickIn(svg, d3.select(this).attr("id").split("_")[1]);
                            })
                    } else {
                        g_branch.append("path")
                            .attr("fill", function(d) {
                                return "url(#grad_" + i + "_C)";
                                return color(i);
                                if (i == 0) {
                                    return "red";
                                } else if (i == 1) {
                                    return "green";
                                } else {
                                    return "blue";
                                }
                            })
                            .attr("opacity", 0.5)
                            .attr("id", "group_" + i)
                            .attr("d", function(d) {
                                return "M" + xScale([pro_name_array[j]]) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + "C" + Math.floor(xScale([pro_name_array[j]]) + distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + " " + (xScale([pro_name_array[j]]) + distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + " " + Math.floor(xScale([pro_name_array[j]]) + distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + "L" + Math.floor(xScale([pro_name_array[j]]) + distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + "C" + (xScale([pro_name_array[j]]) + distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + " " + (xScale([pro_name_array[j]]) + distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + " " + xScale([pro_name_array[j]]) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + "C" + (xScale([pro_name_array[j]]) - distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[1] + " " + (xScale([pro_name_array[j]]) - distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + " " + Math.floor(xScale([pro_name_array[j]]) - distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider + s) + "L" + Math.floor(xScale([pro_name_array[j]]) - distance) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + "C" + (xScale([pro_name_array[j]]) - distance / 2) + "," + (width_info[i].data[j][k].top + width_info[i].data[j][k].slider) + " " + (xScale([pro_name_array[j]]) - distance / 2) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + " " + xScale([pro_name_array[j]]) + "," + width_info[i].data[j][k].branch_data[m].extent[0] + "Z";

                            })
                            .on("click", function(d) {
                                clickIn(svg, d3.select(this).attr("id").split("_")[1]);
                            })
                    }
                    //width_info[i].data[j][k].slider+=width_scale(width_scale(width_info[i].data[j][k].branch_data[m].nums));
                    //console.log(width_info[i].data[j][k].branch_data[m].nums);
                    //width_info[i].data[j][k].top+=width_scale(width_scale(width_info[i].data[j][k].branch_data[m].nums));
                    //console.log(width_info[i].data[j][k].top,width_scale(width_scale(width_info[i].data[j][k].branch_data[m].nums)),width_info[i].data[j][k].bottom);
                    //console.log(width_info[i].data[j][k].bottom-width_info[i].data[j][k].top);
                    width_info[i].data[j][k].slider += s;
                }
            }
        }
    }
    console.log("渲染耗时:"+((new Date()).getTime()-window.renderT)+"ms")
}

function get_min_width(data) {
    //console.log(data);
    var min = (svgHeight - padding.top - padding.bottom) / 2;
    for (var i = 0; i < data.length; ++i) {
        for (var j = 0; j < data[i].clustered.length - 1; ++j) {
            min = Math.abs(data[i].clustered[j].centroid[1] - data[i].clustered[j + 1].centroid[1]) < min ? Math.abs(data[i].clustered[j].centroid[1] - data[i].clustered[j + 1].centroid[1]) : min;
        }
    }
    return min;
}

function clickInSvg(svg) {
    var rela = svg.select("g.g_rela");
    var branch = svg.select("g.g_branch");
    var branh = svg.select("g.g_bra");
    if (rela) {
        rela.selectAll("path").attr("opacity", window.colorPara.opacity);
    }
    if (branch) {
        branch.selectAll("path").attr("opacity", window.colorPara.opacity);
    }
}

function clickIn(svg, index) {
    d3.event.stopPropagation();
    var rela = svg.select("g.g_rela");
    var branch = svg.select("g.g_branch");
    rela.selectAll("path").attr("opacity", 0.1);
    var relaSelector = "path#group_" + index;
    rela.selectAll(relaSelector).attr("opacity", window.colorPara.opacity);
    var branchSelector = "path#group_" + index;
    branch.selectAll("path").attr("opacity", 0.1);
    branch.selectAll(branchSelector).attr("opacity", window.colorPara.opacity);
}