// List of images and words
const images = [
    // Add your image URLs here
    'images/COCO_val2014_000000000208.jpg', 
    'images/COCO_val2014_000000000241.jpg', // ...
];

const poolOfRandomWords = [
    'random1', 'random2', 'random3', 'random4', 'random5', 
    'random6', 'random7', 'random8', 'random9', 'random10'
];

const imageSpecificWords = {
    'images/COCO_val2014_000000000208.jpg': ['specific1-1', 'specific1-2', 'specific1-3', 'specific1-4', 'specific1-5'],
    'images/COCO_val2014_000000000241.jpg': ['specific2-1', 'specific2-2', 'specific2-3', 'specific2-4', 'specific2-5'],
    // Add specific words for each image
};
function createWordElement(word, imageItem, isSpecific) {
    const wordElement = document.createElement('span');
    wordElement.className = 'word';
    wordElement.textContent = word;
    wordElement.dataset.specific = isSpecific; // Track if the word is specific to the image
    wordElement.onclick = () => {
        const selectedWords = imageItem.querySelectorAll('.word.selected');
        if (wordElement.classList.contains('selected')) {
            wordElement.classList.remove('selected');
        } else if (selectedWords.length < 5) {
            wordElement.classList.add('selected');
        } else {
            alert('You can only select up to 5 words.');
        }
    };
    return wordElement;
}

function createImageItem(imageSrc, specificWords) {
    const item = document.createElement('div');
    item.className = 'image-item';

    const img = document.createElement('img');
    img.src = imageSrc;
    item.appendChild(img);

    const wordsContainer = document.createElement('div');
    wordsContainer.className = 'words';

    const randomWords = poolOfRandomWords.sort(() => 0.5 - Math.random()).slice(0, 5);
    const words = specificWords.concat(randomWords).sort(() => 0.5 - Math.random());

    words.forEach(word => {
        const isSpecific = specificWords.includes(word);
        const wordElement = createWordElement(word, item, isSpecific);
        wordsContainer.appendChild(wordElement);
    });

    item.appendChild(wordsContainer);
    return item;
}

function populateImages() {
    const container = document.getElementById('images-container');
    images.forEach(image => {
        const specificWords = imageSpecificWords[image] || [];
        const imageItem = createImageItem(image, specificWords);
        container.appendChild(imageItem);
    });
}

function submitEvaluation() {
    const selectedWordsStats = images.map(image => ({
        image: image,
        specificCount: 0,
        randomCount: 0
    }));

    document.querySelectorAll('.image-item').forEach((imageItem, index) => {
        const selectedWords = imageItem.querySelectorAll('.word.selected');
        selectedWords.forEach(wordElement => {
            if (wordElement.dataset.specific === "true") {
                selectedWordsStats[index].specificCount++;
            } else {
                selectedWordsStats[index].randomCount++;
            }
        });
    });

    console.log('Selected Words Stats:', selectedWordsStats);

    fetch('/.netlify/functions/submitData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedWordsStats)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Submission successful:', data);
        alert('Evaluation Submitted!');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

window.onload = populateImages;
