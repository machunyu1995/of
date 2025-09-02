"use strict";
/**
 * @param {Window} window
 * @param {undefined} undefined
 */
(function (window) {
  /**
   * @constructor
   */
  function CCustomUtil() {}

  /**
   * @constructor
   */
  function CContentControlProperties() {
    this.Tag = null;
  }
  CContentControlProperties.prototype.GetTag = function () {
    return this.Tag;
  };
  CContentControlProperties.prototype.SetTag = function (tag) {
    this.Tag = tag;
  };

  CContentControlProperties.prototype["SetTag"] =
    CContentControlProperties.prototype.SetTag;

  window._customUtil = null;

  console.log("ConnectorServer.js loaded");
  window.addEventListener("message", (event) => {
    let eventData = event.data;
    console.log("ConnectorServer.js eventData:", eventData);
    if (eventData && eventData.type === "callMethod") {
      let logicDocument = editor.WordControl.m_oLogicDocument;
      var oApi = logicDocument.GetApi();
      console.log("ConnectorServer.js oApi:", oApi);
      var methodName = event.data.methodName;
      try {
        if (methodName == "asc_AddContentControl") {
          let properties = new CContentControlProperties();
          var params = eventData["params"];
          properties.SetTag(String(params[1]["Tag"]));
          oApi.asc_AddContentControl(params[0], properties);
          postResult(null, eventData["requestId"]);
        } else if (methodName == "custom_SetControlValueByTag") {
          let customUil = window._customUtil;
          customUil[methodName].apply(customUil, eventData["params"]);
          postResult(null, eventData["requestId"]);
        } else if (methodName == "asc_AddSignaturePageContent") {
          var params = eventData["params"];
          var result = null;
          // 首次调用，添加新页面并标记
          // move cursor to end
          logicDocument.MoveCursorToEndPos(false);
          // add blank page
          result = oApi.asc_AddBlankPage();
          let properties = new CContentControlProperties();
          var params = eventData["params"];
          properties.SetTag(String(params[1]["Tag"]));
          oApi.asc_AddContentControl(params[0], properties);
          postResult(result, eventData["requestId"]);
        } else if (methodName == "asc_ContentToHTML") {
          var params = eventData["params"];
          var result = null;
          editor["pluginMethod_PasteHtml"](params);
          postResult(null, eventData["requestId"]);
        } else if (methodName == "setContentControl") {
          var oContentControl = logicDocument.GetContentControl(params[0]);
          oContentControl.SetContentControlPr({
            Tag: params[1],
          });
          postResult(result, eventData["requestId"]);
        } else if (methodName == "moveCursorOutsideElement") {
          logicDocument.MoveCursorRight();
          postResult(null, eventData["requestId"]);
        } else if (methodName == "MoveCursorDown") {
          logicDocument.MoveCursorRight();
          logicDocument.MoveCursorDown();
          logicDocument.MoveCursorToStartOfLine();
          postResult(null, eventData["requestId"]);
        }else if (methodName == "MoveCursorToEndPos") {
          logicDocument.MoveCursorToEndOfLine();
          logicDocument.AddNewParagraph();
          postResult(true, eventData["requestId"]);
        } else if (methodName == "saveDocument") {
          var result = oApi.asc_Save();
          postResult(result, eventData["requestId"]);
        } else if (methodName == "setControlsHighlight") {
          var apiDocumnet = oApi.GetDocument();
          var params = eventData["params"];
          apiDocumnet["SetControlsHighlight"](params[0], params[1], params[2]);
          oApi.asc_Recalculate(false);
        } else if (methodName == "custom_NextContentControl") {
          var apiDocumnet = oApi.GetDocument();
          let customUil = window._customUtil;
          var params = eventData["params"];
          customUil["custom_NextContentControl"].apply(customUil, params);
        } else if (methodName == "GetContentControlsByTag") {
          var apiDocumnet = oApi.GetDocument();
          var result = apiDocumnet["GetContentControlsByTag"](
            eventData["params"]
          );
          const isExist = result.length > 0;
          postResult(isExist, eventData["requestId"]);
        } else if (methodName == "asc_setViewMode") {
          var result = oApi.asc_setViewMode(true);
          console.log("asc_setViewMode result:", result);
          postResult(result, eventData["requestId"]);
        } else if (methodName == "asc_RemoveContentControl") {
          var contentControls = logicDocument.GetAllContentControls();
          var params = eventData["params"];
          for (var i = 0; i < contentControls.length; i++) {
            var contentControl = contentControls[i];
            if (contentControl.GetTag() === String(params)) {
              var id = contentControls[i].GetId();
              var result = oApi.asc_RemoveContentControl(id);
              postResult(result, eventData["requestId"]);
            }
          }
        }
      } catch (e) {
        console.error(
          "Error calling method:",
          methodName,
          "with args:",
          event.data.params,
          e
        );
      }
    } else if (eventData && eventData.type === "GetCommentsList") {
      let logicDocument = editor.WordControl.m_oLogicDocument;
      var oApi = logicDocument.GetApi();
      // 通过editor对象访问Comments
      if (logicDocument && logicDocument.Comments) {
        console.log(
          "logicDocument.Comments.GetCommentsListById:" +
            logicDocument.Comments.GetCommentsListById
        );
        logicDocument.Comments.GetCommentsListById(eventData["data"]);
      }
    } else if (eventData && eventData.type === "JumpCommentDto") {
      let logicDocument = editor.WordControl.m_oLogicDocument;
      var oApi = logicDocument.GetApi();
      var currentDocId = editor?.DocInfo?.get_Id();
      if (currentDocId === eventData.key) {
        if (oApi) {
          oApi.asc_setSysCommentVisible(true);
          oApi.asc_selectComment(eventData["data"], true);
          // oApi.asc_showComment(eventData["data"]);
          oApi.asc_setSysCommentVisible(false);
        }
      }
      console.log("JumpCommentDto4");
    } else if (eventData && eventData.type === "zoomFitToWidth") {
      let logicDocument = editor.WordControl.m_oLogicDocument;
      var oApi = logicDocument.GetApi();
      oApi.zoomFitToWidth();
    } else if (eventData && eventData.type === "ViewScrollToY") {
      let logicDocument = editor.WordControl.m_oLogicDocument;
      var oApi = logicDocument.GetApi();
      var params = eventData["params"];
      
      // 使用现有的防抖滚动方法，基于DrawingDocument的UpdateTargetTimer机制
      // 解决频繁调用导致的抖动问题
      if (oApi.ViewScrollToYWithDebounce) {
        oApi.ViewScrollToYWithDebounce(params, 100); // 100ms防抖延迟
      } else {
        // 回退到原方法
        oApi.ViewScrollToY(params);
      }
      console.log('ViewScrollToY with debounce (using existing timer mechanism)');
    }
  });

  function selectContentControl(logicDocument, currentPos, tag, forward) {
    var curPage = currentPos.PageNum;
    var contentControls = logicDocument.GetAllContentControls();
    var selected = false;
    for (var i = 0; i < contentControls.length; i++) {
      if (tag && contentControls[i].GetTag() !== String(tag)) {
        continue;
      }
      var contentControl = contentControls[i];
      var controlBound = contentControl.GetBoundingRect();
      var controlBoundPage = controlBound.Page;
      if (!forward || forward > 0) {
        if (controlBoundPage >= curPage) {
          if (
            controlBound.Y > currentPos.Y ||
            (controlBound.Y == currentPos.Y && controlBound.X > currentPos.X)
          ) {
            contentControl.SelectContentControl();
            selected = true;
            break;
          }
        }
      } else {
        if (controlBoundPage <= curPage) {
          if (
            controlBound.Y < currentPos.Y ||
            (controlBound.Y == currentPos.Y && controlBound.X < currentPos.X)
          ) {
            contentControl.SelectContentControl();
            selected = true;
            break;
          }
        }
      }
    }
    return selected;
  }

  CCustomUtil.prototype["custom_NextContentControl"] = function (tag, forward) {
    let logicDocument = editor.WordControl.m_oLogicDocument;
    var currentPos = logicDocument.GetCurPosXY();
    var selected = selectContentControl(
      logicDocument,
      currentPos,
      tag,
      forward
    );
    if (!selected) {
      selectContentControl(
        logicDocument,
        { X: 0, Y: 0, PageNum: 0 },
        tag,
        forward
      );
    }
    logicDocument.Recalculate();
  };

  CCustomUtil.prototype["custom_SetControlValueByTag"] = function (
    tag,
    value,
    type
  ) {
    let logicDocument = editor.WordControl.m_oLogicDocument;
    var contentControls = logicDocument.GetAllContentControls();
    logicDocument.StartAction(
      AscDFH.historydescription_Document_FillFormsByTags
    );
    if (type === 1) {
      for (var i = 0; i < contentControls.length; i++) {
        var contentControl = contentControls[i];
        // 检查是否为指定标签的RichText类型控件
        if (contentControl.GetTag() === String(tag)) {
          // 清空内容控件
          contentControl.ClearContentControl();
          // 选择内容控件
          contentControl.SelectContentControl();
          // 粘贴HTML内容
          editor["pluginMethod_PasteHtml"](value);
        }
      }
    } else {
      for (var i = 0; i < contentControls.length; i++) {
        var contentControl = contentControls[i];
        if (contentControl.GetTag() === String(tag)) {
          contentControl.SetInnerText(value);
        }
      }
    }

    logicDocument.Recalculate();
    logicDocument.FinalizeAction();
  };

  function postResult(data, requestId) {
    try {
      window.parent.postMessage(
        {
          result: data,
          requestId: requestId,
        },
        "*"
      );
      console.log("postMessage:", data, requestId);
    } catch (e) {
      console.error("Error postResult:", e);
    }
  }

  window._customUtil = new CCustomUtil();
})(window);
