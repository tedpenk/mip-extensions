/**
* @file CNZZ统计插件
* @exports modulename
* @author chenrui09@baidu.com
* @version 1.0
* @copyright 2016 Baidu.com, Inc. All Rights Reserved
*/

define(function (require) {
    var $ = require('zepto');

    var customElement = require('customElement').create();
    customElement.prototype.build = function () {
        var element = this.element;
        var $element = $(element);
        var token = element.getAttribute('token');
        var setConfig = element.getAttribute('setconfig');

        if (token) {
            window._czc = window._czc || [];
            _czc.push([
                '_setAccount',
                token
            ]);


            // 检测setconfig是否存在
            if (setConfig) {
                var setCustom = buildArry(decodeURIComponent(setConfig));
                _czc.push(setCustom);
            }

            var html = [
                '<script type="text/javascript">',
                'var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");document.write(unescape("%3Cspan id=\'cnzz_stat_icon_' + token + '\'%3E%3C/span%3E%3Cscript src=\'" + cnzz_protocol + "s11.cnzz.com/z_stat.php%3Fid%3D' + token + '\' type=\'text/javascript\'%3E%3C/script%3E"));',
                '</script>'
            ];
            $element.append(html.join(''));
            bindEle();
        }

    };


    // 绑定事件
    function bindEle() {
        var tagBox = document.querySelectorAll('*[data-stats-cnzz-obj]');

        for (var index = 0; index < tagBox.length; index++) {
            var statusData = tagBox[index].getAttribute('data-stats-cnzz-obj');

            // 检测statusData是否存在
            if (!statusData) {
                return;
            }

            try {
                statusData = JSON.parse(decodeURIComponent(statusData));
            } catch (e) {
                console.warn("事件追踪data-stats-cnzz-obj数据不正确");
                return;
            }
            
            var eventtype = statusData.type;
            if (!statusData.data) {
                return;
            }

            var data = buildArry(statusData.data);

            if (eventtype !== 'click' && eventtype !== 'mouseup' && eventtype !== 'load') {
                // 事件限制到click,mouseup,load(直接触发)
                return;
            }

            if ($(tagBox[index]).hasClass('mip-stats-eventload')) {
                return;
            }

            $(tagBox[index]).addClass('mip-stats-eventload');

            if (eventtype === 'load') {
                _czc.push(data);
            }
            else {
                tagBox[index].addEventListener(eventtype, function (event) {
                    var tempData = this.getAttribute('data-stats-cnzz-obj');
                    if (!tempData) {
                        return;
                    }
                    var statusJson;
                    try {
                        statusJson = JSON.parse(decodeURIComponent(tempData));
                    } catch (e) {
                        console.warn("事件追踪data-stats-cnzz-obj数据不正确");
                        return;
                    }
                    if (!statusJson.data) {
                        return;
                    }
                    var attrData = buildArry(statusJson.data);
                    _czc.push(attrData);
                }, false);
            }
        }
    }

    // 数据换转
    function buildArry(arrayStr) {
        if (!arrayStr) {
            return;
        }

        var strArr = arrayStr.slice(1, arrayStr.length - 1).split(',');
        var newArray = [];

        for (var index = 0; index < strArr.length; index++) {
            var item = strArr[index].replace(/(^\s*)|(\s*$)/g, '').replace(/\'/g, '');
            if (item === 'false' || item === 'true') {
                item = Boolean(item);
            }

            newArray.push(item);
        }
        return newArray;
    }

    return customElement;
});
