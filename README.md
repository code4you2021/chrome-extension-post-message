## chrome-extension-post-message

TypeSafe browser extension messaging.

Support: Chrome extension Long-lived connections.

## Install

```bash
npm i chrome-extension-post-message
```

## Message passing

https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

```javascript
// content-script.js:
var port = chrome.runtime.connect({ name: "knockknock" });
port.postMessage({ joke: "Knock knock" });
port.onMessage.addListener(function (msg) {
  if (msg.question === "Who's there?") port.postMessage({ answer: "Madame" });
  else if (msg.question === "Madame who?")
    port.postMessage({ answer: "Madame... Bovary" });
});

// background.js
chrome.runtime.onConnect.addListener(function (port) {
  console.assert(port.name === "knockknock");
  port.onMessage.addListener(function (msg) {
    if (msg.joke === "Knock knock")
      port.postMessage({ question: "Who's there?" });
    else if (msg.answer === "Madame")
      port.postMessage({ question: "Madame who?" });
    else if (msg.answer === "Madame... Bovary")
      port.postMessage({ question: "I don't get it." });
  });
});
```

## Example

```javascript
// message.ts:
type Data = {data:string}
type ResponseData = {type:string,data:string}

export const {
    sendData,
    receiveData,
    postData,
    backgroundReceiveData,
    disconnectPostData
} = createPostMessage<Data,ResponseData>("test");

/**
 * cross-extension messaging:
 * https://developer.chrome.com/docs/extensions/reference/runtime#method-connect
 *
 * sending messages from web pages:
 * https://developer.chrome.com/docs/extensions/reference/runtime#method-sendMessage
 *
 export const {
    sendData,
    receiveData,
    postData,
    backgroundReceiveData,
    disconnectPostData
  } = createExternalPostMessage<Data,ResponseData>("test","chrome_extension_id");
 */

// content-script.js:
sendData({data:"hi, from content-script.js"})
receiveData((response)=>{
    console.log("receiveData response: ", response);
})

// combine `sendData` and `receiveData`
postData(
  // sendData
  (sendData)=>{
    const data = {data:"hi, from content-script.js"}
    sendData(data);
  },
  // receiveData
  (responseData)=>{
    console.log("responseData: ", responseData);
  }
)

// backgrounds.js:
backgroundReceiveData((response) => {
  console.log("backgroundReceiveData: ", response);
  response.postMessage({type:"test", data:"hello, from: backgrounds.js"})
})

//  call results in multiple ports at the receiver's end:
//  const port = chrome.runtime.connect({name: "test"});
//  port.disconnect();
disconnectPostData();
```
