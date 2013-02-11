//必要な変数の定義
var url = "http://b.hatena.ne.jp/entrylist?sort=hot&threshold=&mode=rss"; ;
var timer = null;
var DEFAULT_TIME = 60 * 60;
var timervalue = DEFAULT_TIME;

//初期処理
google.load("feeds", "1");
google.setOnLoadCallback(initialize);



window.onload = function () {
    document.getElementById("urltext").value = url;

    //取得ボタン
    catchEvent(document.getElementById("getbutton"), "click", function () {
        url = document.getElementById("urltext").value;
        initialize();
    });

    //自動更新
    catchEvent(document.getElementById("enabletimer"), "click", function (event) {
        event = event ? event : window.event;
        var target = event.target ? event.target : event.srcElement;
        var time = document.getElementById("time");

        if (!target.checked) {
            clearInterval(timer);
            timer = null;
            time.innerHTML = "自動更新停止";
        }
        else {
            time.innerHTML = "自動更新開始";
            initialize();
        }
    });

    //クリアボタン
    catchEvent(document.getElementById("clearbutton"), "click", function () {
        document.getElementById("feed").innerHTML = "";
    });

    //更新間隔
    catchEvent(document.getElementById("updateinterval"), "change", function (event) {
        event = event ? event : window.event;
        var target = event.target ? event.target : event.srcElement;

        var index = target.selectedIndex;
        var value = parseInt(target[index].value);
        //console.log(target[index].value);
        DEFAULT_TIME = 60 * value;
        timervalue = DEFAULT_TIME;
    });
    catchEvent(document.getElementById("enabledetail"), "click", function () {
        initialize();
    });
    
    //キー入力イベント
    catchEvent(document.getElementById("urltext"), "keypress", function(event) {
        event = event ? event : window.event;
        if (event.keyCode == 13 || event.charCode == 13) {
            url = document.getElementById("urltext").value;
            initialize();
            if (event.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            }
            else {
                event.returnValue = false;
                event.cancelBubble = true;
            }
        }
    });
}

//読み込みのコールバック関数
function initialize() {
    var feed = new google.feeds.Feed(url);
    feed.setNumEntries(100);
    feed.load(function (result) {
        if (!result.error) {
            var isEnable = Boolean(document.getElementById("enabletimer").checked);
            feedParse(result.feed.entries);
            changeFeedTitle(result.feed);
            if (timer == null && isEnable) {
                timer = setInterval(updateInterval, 1000);
            }
            timervalue = DEFAULT_TIME;
            lastupdate = document.getElementById("lastupdate").innerHTML = "最終更新日時：" + getDateString(new Date());
        }
        else {
            clearInterval(timer);
            timer = null;

            var str = "";
            for (var item in result.error) {
                str += result.error[item] + "\n";
            }
            alert("feedの取得に失敗しました\n" + str);
        }
    });
}

//フィードタイトル変更用の関数
function changeFeedTitle(feed) {
    var title = document.getElementById("title");
    var h3 = document.createElement("h3");
    var a = document.createElement("a");
    a.innerHTML = feed.title;
    a.href = feed.link;
    a.target = "_blank";

    h3.appendChild(a);
    title.innerHTML = h3.innerHTML;

}

//フィードからDOM作成を行う関数
function feedParse(entries) {
    var container = document.getElementById("feed");
    container.innerHTML = "";

    var list = document.createElement("ul");

    for (var i = 0, len = entries.length; i < len; i++) {
        var entry = entries[i];
        var li = document.createElement("li");
        var div = document.createElement("div");
        var p = document.createElement("p");

        var isDetail = Boolean(document.getElementById("enabledetail").checked);

        if (isDetail) {
            p.innerHTML = entry.content;
            var as = p.getElementsByTagName("a");
            (function (atags) {
                for (var i = 0, len = atags.length; i < len; i++) {
                    atags[i].target = "_blank";
                }
            })(as);
            div.appendChild(p);
        }
        else {
            var a = document.createElement("a");
            a.innerHTML = entry.title;
            a.href = entry.link;
            a.target = "_blank";
            div.appendChild(a);
            p.innerHTML = entry.contentSnippet;
        }
        p = document.createElement("p");
        var entryDate = new Date(entry.publishedDate);
        p.innerHTML = entry.categories + " <span class='date'>" + getDateString(entryDate) + "</span>";
        div.appendChild(p);

        li.appendChild(div);
        list.appendChild(li);
    }
    container.appendChild(list);
}

function getDateString(date) {
    var str = "";
    str += date.getFullYear() + "年";
    str += (date.getMonth() + 1) + "月";
    str += date.getDate() + "日 ";
    str += date.getHours() + "時";
    str += date.getMinutes() + "分";
    str += date.getSeconds() + "秒";
    return str;
}

function updateInterval() {
    var time = document.getElementById("time");

    timervalue--;

    if (timervalue >= 0) {
        time.innerHTML = "次の自動更新まで：" + (timervalue + 1) + "秒";
    }
    else {
        time.innerHTML = "更新なう！";
        initialize();
    }

}

//イベント登録用
function catchEvent(eventObj, event, eventHandler) {
    if (eventObj.addEventListener) {
        eventObj.addEventListener(event, eventHandler, false);
    }
    else if (eventObj.attachEvent) {
        event = "on" + event;
        eventObj.attachEvent(event, eventHandler);
    }
}
