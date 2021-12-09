const liveView = document.getElementById('liveView');
const video = document.querySelector("#videoElement");
const myButton = document.querySelector("#myButton");

const widthmax = 2000;
const heightmax = 500;
const LVoffset = 0;
const LVratio = 1;

var myButtonState = 0;
var children = [];

cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;      
});


function LVadjust(x) {
res = parseInt((x+LVoffset)*LVratio);
if (res < 0) res = 0;
if (res > widthmax) res = widthmax;

return res;
}


function predictWebcam() {

model.detect(video).then(function (predictions) {
// Remove any highlighting we did previous frame.
for (let i = 0; i < children.length; i++) {
  liveView.removeChild(children[i]);
}
children.splice(0);

// Now lets loop through predictions and draw them to the live view if
// they have a high confidence score.
for (let n = 0; n < predictions.length; n++) {
  // If we are over 66% sure we are sure we classified it right, draw it!
  if (predictions[n].score > 0.66) {
    const p = document.createElement('p');
    p.innerText = predictions[n].class  + ' - with ' 
        + Math.round(parseFloat(predictions[n].score) * 100) 
        + '% confidence.';
    p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
        + LVadjust(predictions[n].bbox[1] - 10) + 'px; width: ' 
        + LVadjust(predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

    const highlighter = document.createElement('div');
    highlighter.setAttribute('class', 'highlighter');
    highlighter.style = 'left: ' + LVadjust(predictions[n].bbox[0]) + 'px; top: '
        + LVadjust(predictions[n].bbox[1]) + 'px; width: ' 
        + LVadjust(predictions[n].bbox[2]) + 'px; height: '
        + LVadjust(predictions[n].bbox[3]) + 'px;';

    liveView.appendChild(highlighter);
    liveView.appendChild(p);
    children.push(highlighter);
    children.push(p);
  }
}

// Call this function again to keep predicting when the browser is ready.
window.requestAnimationFrame(predictWebcam);
});
}

myButton.addEventListener('click', function (event) {
    
    if (myButtonState == 0) {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
            video.srcObject = stream;
            })
            .catch(function (err0r) {
            alert("Something went wrong!");
            });

            myButton.classList.remove("btn-success");
            myButton.classList.add("btn-danger");
            myButtonState = 1;
            
            video.
            addEventListener('loadeddata', predictWebcam);
        }
    } else {

        video.srcObject = null;

        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
          }
        children.splice(0);

        myButton.classList.remove("btn-danger");
        myButton.classList.add("btn-success");
        myButtonState = 0;
    }

});

//myButton.list