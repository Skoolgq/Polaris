const imageContainer = document.getElementById('imageContainer');
const currentImage = document.getElementById('currentImage');
const nextImage = document.getElementById('nextImage');
const nextButton = document.getElementById('nextButton');
const imageArray = ['image1.jpg', 'image2.jpg', 'image3.jpg']; // Add your image URLs here
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

// Event listener for the "Next" button
nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imageArray.length;
    updateImages();
});

// Initial image setup
updateImages();

