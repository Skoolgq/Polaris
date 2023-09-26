const imageContainer = document.getElementById('imageContainer');
const currentImage = document.getElementById('currentImage');
const nextImage = document.getElementById('nextImage');
const imageArray = ['https://placehold.co/600x400?text=Hello+one', 'https://placehold.co/600x400?text=Hello+two', 'https://placehold.co/600x400?text=Hello+three']; // Add your image URLs here
let currentIndex = 0;

// Function to update the displayed images and trigger animation
function updateImages() {
    nextImage.src = imageArray[(currentIndex + 1) % imageArray.length];

    // Fade out and slide current image to the left
    currentImage.style.opacity = 0;
    currentImage.style.transform = 'translateX(-100%)';

    // Fade in and slide next image into place
    nextImage.style.opacity = 1;
    nextImage.style.transform = 'translateX(0)';

    // Swap current and next images after the animation
    setTimeout(() => {
        currentImage.src = nextImage.src;
        currentImage.style.opacity = 1;
        currentImage.style.transform = 'translateX(0)';
        nextImage.style.opacity = 0;
        nextImage.style.transform = 'translateX(100%)';
    }, 500); // Adjust the duration to match your transition time
}

// Function to automatically change images every 5 seconds
function autoChangeImage() {
    setInterval(() => {
        currentIndex = (currentIndex + 1) % imageArray.length;
        updateImages();
    }, 5000); // Change image every 5 seconds (5000 milliseconds)
}

// Initial image setup and start automatic image change
updateImages();
autoChangeImage();
