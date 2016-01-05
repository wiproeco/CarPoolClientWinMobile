

var CORSMsg = (function () {
    var _msgCallBackParent;
    var _msgCallBackIframe;

    function SendMsg(strMsg, objIframe) {
        var domain;
        if (window.name == 'Parent') {
            domain = "ms-appx-web://" + document.location.host;
            objIframe.postMessage(strMsg, domain);
        }
        else {
            domain = "ms-appx://" + document.location.host;
            window.parent.postMessage(strMsg, domain);
        }
    };


    function ReceiveMsg(msgCallBack, isParent) {
        if (isParent) {
            window.name = 'Parent';
            CORSMsg._msgCallBackParent = msgCallBack;
        }
        else {
            window.name = 'Iframe';
            CORSMsg._msgCallBackIframe = msgCallBack;
        }
    }

    function ProcessMsg(e) {
        if (window.name == 'Parent')
            CORSMsg._msgCallBackParent(e);
        else
            CORSMsg._msgCallBackIframe(e);
    };

    return {
        SendMsg: SendMsg,
        ReceiveMsg: ReceiveMsg,
        ProcessMsg: ProcessMsg
    }

    

       
})();

window.addEventListener('message', CORSMsg.ProcessMsg, false);