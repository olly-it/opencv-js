let streaming = false;
let width = 700;
let height = 0;
let stream;

const select = document.getElementById('select');
const startButton = document.getElementById('start_button');
const stopButton = document.getElementById('stop_button');
// stopButton.setAttribute("disabled", true);
stopButton.disabled = true;
let canvas = document.getElementById('canvasOutput');
let video = document.getElementById("video");

video.addEventListener("canplay", initVideo, false);

navigator.mediaDevices.enumerateDevices()
.then(mediaDevices => {
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = mediaDevice.deviceId;
            const label = mediaDevice.label || `Camera ${count++}`;
            const textNode = document.createTextNode(label);
            option.appendChild(textNode);
            select.appendChild(option);
        }
    });
})
startButton.addEventListener("click", function () {
    startButton.disabled = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then(function (s) {
        stopButton.disabled = false;
        stream = s;
        video.srcObject = stream;
        video.play();
    })
    .catch(function (err) {
        console.log("An error occured! " + err);
    });
}, false)
stopButton.addEventListener("click", function() {
    startButton.disabled = false;
    stopButton.disabled = true;
    video.src = "";
    video.pause();
    stream.getTracks()[0].stop();
}, false)

function initVideo() {
    if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);
        video.setAttribute("width", width);
        video.setAttribute("height", height);
        streaming = true;
    }
    if (typeof cv !== 'undefined') {
        playVideo();
    } else {
        document.getElementById("opencvjs").onload = playVideo;
    }
}

function playVideo() {
    if (!streaming) {
        console.warn("Please startup your webcam");
        return;
    }
    try {
        // inputImage are declared and deleted elsewhere
        inputImage = new cv.Mat(height, width, cv.CV_8UC4);
        markerImage = new cv.Mat();
        let dictionary = new cv.aruco_Dictionary(cv.DICT_4X4_50);
        let parameter = new cv.aruco_DetectorParameters();
        // parameter.adaptiveThreshWinSizeMin = 23;
        // parameter.adaptiveThreshWinSizeMax = 23;
        // parameter.adaptiveThreshWinSizeStep = 10;
        // parameter.adaptiveThreshConstant = 7;
        // parameter.minMarkerPerimeterRate = 0.1;
        // parameter.maxMarkerPerimeterRate = 4;
        // parameter.polygonalApproxAccuracyRate = 0.03;
        // parameter.minCornerDistanceRate = 0.05;
        // parameter.minDistanceToBorder = 3;
        // parameter.minMarkerDistanceRate = 0.05;
        // parameter.cornerRefinementMethod = cv.CORNER_REFINE_NONE;
        // parameter.cornerRefinementWinSize = 5;
        // parameter.cornerRefinementMaxIterations = 30;
        // parameter.cornerRefinementMinAccuracy = 0.1;
        // parameter.markerBorderBits = 1;
        // parameter.perspectiveRemovePixelPerCell = 2;
        // parameter.perspectiveRemoveIgnoredMarginPerCell = 0.13;
        // parameter.maxErroneousBitsInBorderRate = 0.35;
        // parameter.minOtsuStdDev = 5.0;
        // parameter.errorCorrectionRate = 0.6;

        markerIds = new cv.Mat();
        markerCorners = new cv.MatVector();
        rvecs = new cv.Mat();
        tvecs = new cv.Mat();
        RgbImage = new cv.Mat();
        cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [9.6635571716090658e+02, 0., 2.0679307818305685e+02, 0.,
            9.6635571716090658e+02, 2.9370020600555273e+02, 0., 0., 1.]);
        let distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [-1.5007354215536557e-03, 9.8722389825801837e-01,
            1.7188452542408809e-02, -2.6805958820424611e-02, -2.3313928379240205e+00]);
        // "video" is the id of the video tag
        let cap = new cv.VideoCapture("video");

        loopIndex = setInterval(
            function () {
                cap.read(inputImage);
                // if (checkbox.checked) {
                cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
                cv.detectMarkers(RgbImage, dictionary, markerCorners, markerIds, parameter);

                if (markerIds.rows > 0) {
                    let preprocessedWebcamImage = RgbImage.clone();
                    cv.drawDetectedMarkers(RgbImage, markerCorners, markerIds);
                    cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
                    for (let i = 0; i < markerIds.rows; ++i) {
                        let rvec = cv.matFromArray(3, 1, cv.CV_64F, [rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);
                        let tvec = cv.matFromArray(3, 1, cv.CV_64F, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);
                        cv.drawAxis(RgbImage, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
                        rvec.delete();
                        tvec.delete();
                    }
                }
                cv.imshow("canvasOutput", RgbImage);
            }, 33);
    } catch (err) {
        console.log(err);
    }
}