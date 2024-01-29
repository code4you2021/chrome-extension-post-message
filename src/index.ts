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
  id: string
) => {
  const port = browserEnv.runtime.connect({ name: id });

  if (browserEnv.runtime.lastError) {
    console.log(browserEnv.runtime.lastError);
  }

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
    browserEnv.runtime.onConnect.addListener(function (port: PortType) {
      port.onMessage.addListener(async (message: SendDataType) => {
        const postMessage = (data: ResponseDataType) => {
          port.postMessage(data);
        };

        callback &&
          callback({
            data: message,
            postMessage: postMessage,
          });
      });
    });
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
