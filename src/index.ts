// @ts-ignore
type PortType = chrome.runtime.Port;

// @ts-ignore
let browserEnv: typeof chrome;

// @ts-ignore
if (typeof chrome !== "undefined") {
  // @ts-ignore
  browserEnv = chrome;
  // @ts-ignore
} else if (typeof browser !== "undefined") {
  // @ts-ignore
  browserEnv = browser;
}

export const createPostMessage = <SendDataType, ResponseDataType>(
  id: string,
  isExternal: boolean = false
) => {
  const extensionId = browserEnv.runtime.id;
  const port = isExternal
    ? browserEnv.runtime.connect(extensionId, { name: id })
    : browserEnv.runtime.connect({ name: id });

  const sendData = (data: SendDataType) => {
    port.postMessage(data);
  };

  const receiveData = (callback: (data: ResponseDataType) => void) => {
    port.onMessage.addListener((message: ResponseDataType) => {
      callback && callback(message);
    });
  };

  const postData = (
    sendDataCallback: (sendData: (data: SendDataType) => void) => void,
    receiveDataCallback: (data: ResponseDataType) => void
  ) => {
    sendDataCallback && sendDataCallback(sendData);

    port.onMessage.addListener((message: ResponseDataType) => {
      receiveDataCallback && receiveDataCallback(message);
    });
  };

  type InfoType = {
    data: SendDataType;
    postMessage: (data: ResponseDataType) => void;
  };

  const backgroundReceiveData = (callback: (info: InfoType) => void) => {
    const postAddListener = (port: PortType) => {
      port.onMessage.addListener((message: SendDataType) => {
        const postMessage = (data: ResponseDataType) => {
          port.postMessage(data);
        };

        callback &&
          callback({
            data: message,
            postMessage: postMessage,
          });
      });
    };

    if (isExternal) {
      browserEnv.runtime.onConnectExternal.addListener(function (
        port: PortType
      ) {
        postAddListener(port);
      });
    } else {
      browserEnv.runtime.onConnect.addListener(function (port: PortType) {
        postAddListener(port);
      });
    }
  };

  const disconnectPostData = () => {
    port.disconnect();
  };

  return {
    sendData,
    receiveData,
    postData,
    backgroundReceiveData,
    disconnectPostData,
  };
};
