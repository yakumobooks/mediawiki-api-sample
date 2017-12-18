$(function() {
    function mediawiki_apicall(name, $tds) {
        $.ajax({
            type: "GET",
            dataType: "jsonp",
            url: "http://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=" + encodeURIComponent(name),
            success: function(data) {
                var key = Object.keys(data.query.pages)[0];
                if(key != '-1'){
                    var title = data.query.pages[key].title;
                    var text  = data.query.pages[key].revisions[0]['*'];
                    var redirect_patterns = [
                        '#REDIRECT.*?\\[\\[(.+?)\\]\\]'
                        ,'#転送.*?\\[\\[(.+?)\\]\\]'
                    ]
                    var infobox_patterns = [
                        '.*?death_date.*?=.*?\\{\\{(.+?)\\}\\}'
                        ,'.*?没年月日.*?=.*?\\{\\{(.+?)\\}\\}'
                        ,'.*?Born.*?=.*?\\{\\{(.+?)\\}\\}'
                        ,'.*?没年.*?=.*?\\{\\{(.+?)\\}\\}'
                        ,'.*?deathdate.*?=.*?\\{\\{(.+?)\\}\\}'
                    ];
                    var content_patterns = [
                        '\\[\\[(\\d{4})年\\]\\].*?\\[\\[(\\d{1,2})月(\\d{1,2})日\\]\\].*?[-－].*?\\[\\[(\\d{4})年\\]\\].*?\\[\\[(\\d{1,2})月(\\d{1,2})日\\]\\]'
                        ,'\\[\\[(\\d{4})年\\]\\].*?\\[\\[(\\d{1,2})月(\\d{1,2})日\\]\\].*?-'
                    ]
                    var set_func = function(arr){
                        arr.shift();
                        if(isNaN(arr.join(''))){
                            return false;
                        }
                        $tds.eq(1).text(arr[0] + '年');
                        $tds.eq(2).text(arr[1] + '月' + arr[2] + '日');
                        if(arr.length > 3
                           && arr[3] !== '' && arr[3] !== 'undefined'
                           && arr[4] !== '' && arr[4] !== 'undefined'
                           && arr[5] !== '' && arr[5] !== 'undefined'){
                            $tds.eq(3).text(arr[3] + '年');
                            $tds.eq(4).text(arr[4] + '月' + arr[5] + '日');
                        }
                        return true;
                    }
                    var isRedirectPattern = false;
                    $.each(redirect_patterns, function(i, elm) {
                        var re = new RegExp(elm);
                        var m = text.match(re);
                        if(m != null && !isRedirectPattern){
                            mediawiki_apicall(m[1], $tds);
                            isRedirectPattern = true;
                        }
                    });
                    if(!isRedirectPattern){
                        var isInfoboxPattern = false;
                        $.each(infobox_patterns, function(i, elm) {
                            var re = new RegExp(elm);
                            var m = text.match(re);
                            if(m != null && !isInfoboxPattern){
                                isInfoboxPattern = set_func(m[1].split('|'));
                            }
                        });
                        var isContentPattern = false;
                        if(!isInfoboxPattern){
                            $.each(content_patterns, function(i, elm) {
                                var re = new RegExp(elm);
                                var m = text.match(re);
                                if(m != null && !isContentPattern){
                                    isContentPattern = set_func(m);
                                }
                            });
                        }
                        if(!isInfoboxPattern && !isContentPattern){
                            $tds.eq(5).text('pattern unmatch');
                        }
                    }
                }else{
                    $tds.eq(5).text('Not Found');
                }
            }
        });
    }
    var timers = new Array();
    $('#start').on('click',function() {
        $('table > tbody').children().each(function(i){
            if(i > 1){
                var $tds = $(this).children();
                var $td_name = $tds.eq(0);
                var name = $td_name.text().replace(' ', '');
                timers.push(setTimeout(function() {
                    mediawiki_apicall(name, $tds);
                }, 5000 * (i - 2)));
            }
        });
    });
    $('#stop').on('click',function() {
        for(var i = 0; i < timers.length; i++){
            clearTimeout(timers[i]);
        }
        alert('停止しました。');
    });
});
