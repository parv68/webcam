const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const takePhotoBtn = document.querySelector('.take-photo-btn');

let localMediaStream;

function getVideo(){
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        localMediaStream = stream;
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.log("Oh no!", err);
    })
}

function paintToCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    let intervalId = setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height);

        // Get RGB range values
        const rmin = document.querySelector('input[name="rmin"]').value;
        const rmax = document.querySelector('input[name="rmax"]').value;
        const gmin = document.querySelector('input[name="gmin"]').value;
        const gmax = document.querySelector('input[name="gmax"]').value;
        const bmin = document.querySelector('input[name="bmin"]').value;
        const bmax = document.querySelector('input[name="bmax"]').value;

        // Apply the RGB filters
        pixels = applyRGBFilter(pixels, rmin, rmax, gmin, gmax, bmin, bmax);

        ctx.putImageData(pixels, 0, 0);
    }, 16);
    return intervalId;
}

function applyRGBFilter(pixels, rmin, rmax, gmin, gmax, bmin, bmax) {
    for (let i = 0; i < pixels.data.length; i += 4) {
        let red = pixels.data[i + 0];
        let green = pixels.data[i + 1];
        let blue = pixels.data[i + 2];

        if (red < rmin || red > rmax || green < gmin || green > gmax || blue < bmin || blue > bmax) {
            pixels.data[i + 3] = 0; // Set alpha to 0 (transparent) if out of range
        }
    }
    return pixels;
}


function redPixels(pixels){
    for (let i = 0; i < pixels.data.length; i+=4){
        pixels.data[i + 0]  = pixels.data[i + 0] + 100;
        pixels.data[i + 1]  = pixels.data[i + 1] - 50;
        pixels.data[i + 2]  = pixels.data[i + 2] * 0.5;
    }
    return pixels;
}

function rgbSplit(pixels){
    for (let i = 0; i < pixels.data.length; i+=4){
        let red = pixels.data[i + 0];
        let green = pixels.data[i + 1];
        let blue = pixels.data[i + 2];
        
        pixels.data[i + 0] = red;
        pixels.data[i + 1] = green;
        pixels.data[i + 2] = blue;
    }
    return pixels;
}

function takePhoto(){
    try {
        snap.currentTime = 0;
        snap.play();
        const data = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = data;
        link.setAttribute('download', 'photo.jpg');
        link.innerHTML = `<img src = "${data}" alt = "Photo" />`;
        strip.insertBefore(link, strip.firstChild);
    } catch (error) {
        console.error('Error taking photo:', error);
    }
}

getVideo();

video.addEventListener('canplay', () => {
    let intervalId = paintToCanvas();
    // Store the interval ID to clear it later if needed
    // clearInterval(intervalId);
});

// Add event listener to the take photo button
takePhotoBtn.addEventListener('click', takePhoto);