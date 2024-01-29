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

export const [sendData, receiveData, backgroundReceiveData] = createPostMessage<
  Data,
  ResponseData
>("test");

// content-script.js:
sendData({data:"hi, from content-script.js"})
receiveData((response)=>{
    console.log("receiveData response: ", response);
})

// backgrounds.js:
 backgroundReceiveData((response) => {
    console.log("backgroundReceiveData: ", response);

    response.postMessage({type:"test", data:"hello, from: backgrounds.js"})
 })
```
