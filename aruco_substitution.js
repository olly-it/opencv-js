let streaming = false;
let width = 700;
let height = 0;
let stream;

const select = document.getElementById('select');
const startButton = document.getElementById('start_button');
// startButton.disabled = true;
const stopButton = document.getElementById('stop_button');
stopButton.disabled = true;
const canvasInput = document.getElementById('canvasInput');
const canvas = document.getElementById('canvasOutput');
const video = document.getElementById("video");

const brandChoice = document.getElementById("brandChoice");
const streamingDiv = document.getElementById("streaming");
const brandsImages = {
    cocaLogo: "https://static.vecteezy.com/ti/vettori-gratis/t1/64050-logo-in-bianco-e-nero-di-coca-cola-gratuito-vettoriale.jpg",
    pepsiLogo: "https://static.vecteezy.com/system/resources/previews/000/064/192/non_2x/vector-pepsi.jpg"
}
const cocaRadio = document.getElementById("cocaRadio");
const pepsiRadio = document.getElementById("pepsiRadio");

const FPS = 60;

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
function start() {
    if (cocaRadio.checked) {
        loadImageToCanvas("https://static.vecteezy.com/ti/vettori-gratis/t1/64050-logo-in-bianco-e-nero-di-coca-cola-gratuito-vettoriale.jpg", "canvasInput");
    } else {
        loadImageToCanvas("https://static.vecteezy.com/system/resources/previews/000/064/192/non_2x/vector-pepsi.jpg", "canvasInput");
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then(function (s) {
        stopButton.disabled = false;
        brandChoice.hidden = true;
        streamingDiv.hidden = false;
        stream = s;
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occured! " + err);
        });
}
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
stopButton.addEventListener("click", function () {
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
        // rvecs = new cv.Mat();
        // tvecs = new cv.Mat();
        RgbImage = new cv.Mat();
        // cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [9.6635571716090658e+02, 0., 2.0679307818305685e+02, 0.,
        //     9.6635571716090658e+02, 2.9370020600555273e+02, 0., 0., 1.]);
        // let distCoeffs = cv.matFromArray(5, 1, cv.CV_64F, [-1.5007354215536557e-03, 9.8722389825801837e-01,
        //     1.7188452542408809e-02, -2.6805958820424611e-02, -2.3313928379240205e+00]);
        // "video" is the id of the video tag
        let cap = new cv.VideoCapture("video");
        let logoImage = cv.imread(canvasInput);
        cv.resize(logoImage, logoImage, inputImage.size());

        loopIndex = setInterval(
            function () {
                cap.read(inputImage);

                // if (checkbox.checked) {
                cv.cvtColor(inputImage, RgbImage, cv.COLOR_RGBA2RGB, 0);
                cv.detectMarkers(RgbImage, dictionary, markerCorners, markerIds, parameter);
                // let preprocessedWebcamImage = RgbImage.clone();

                if (markerIds.rows > 0) {
                    // cv.drawDetectedMarkers(RgbImage, markerCorners, markerIds);
                    // cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
                    for (let i = 0; i < markerIds.rows; ++i) {
                        // let rvec = cv.matFromArray(3, 1, cv.CV_64F, [rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);
                        // let tvec = cv.matFromArray(3, 1, cv.CV_64F, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);
                        // cv.drawAxis(RgbImage, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
                        // rvec.delete();
                        // tvec.delete();
                        // let points1 = [];
                        // for (let j = 0; j < markerCorners.get(i).data32F.length; j++) {
                        //     points1.push(markerCorners.get(i).data32F[j]);
                        // }
                        let points1 = markerCorners.get(i).data32F;
                        let npts = 4;
                        let marker_points_data = new Float64Array(points1);
                        let marker_points = cv.matFromArray(npts, 1, cv.CV_32SC2, marker_points_data);
                        let h = RgbImage.rows;
                        let w = RgbImage.cols;
                        let cam_points_data = new Float64Array([0, 0, w, 0, w, h, 0, h]);
                        let cam_points = cv.matFromArray(npts, 1, cv.CV_32SC2, cam_points_data);
                        let findHomographyMask = new cv.Mat();//test
                        let homographyMatrix = cv.findHomography(cam_points, marker_points, cv.RANSAC, 3, findHomographyMask);
                        let image_B_final_result = new cv.Mat();
                        cv.warpPerspective(logoImage, image_B_final_result, homographyMatrix, RgbImage.size());
                        cv.cvtColor(image_B_final_result, image_B_final_result, cv.COLOR_BGRA2RGB);
                        cv.fillConvexPoly(RgbImage, marker_points, new cv.Scalar(0));
                        cv.add(RgbImage, image_B_final_result, RgbImage);
                        marker_points.delete();
                        cam_points.delete();
                        findHomographyMask.delete();
                        homographyMatrix.delete();
                        image_B_final_result.delete();

                    }
                }
                cv.imshow("canvasOutput", RgbImage);
            }, 1000 / FPS);
    } catch (err) {
        console.log(err);
    }
}

function printMatProperties(name, mat) {
    console.log(
        name + ' width: ' + mat.cols + '\n' +
        name + ' height: ' + mat.rows + '\n' +
        name + ' size: ' + mat.size().width + '*' + mat.size().height + '\n' +
        name + ' depth: ' + mat.depth() + '\n' +
        name + ' channels ' + mat.channels() + '\n' +
        name + ' type: ' + mat.type() + '\n');
}

function loadImageToCanvas(url, cavansId) {
    let canvas = document.getElementById(cavansId);
    let ctx = canvas.getContext('2d');
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
    };
};