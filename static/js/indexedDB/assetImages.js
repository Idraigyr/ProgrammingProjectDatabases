import {db} from './IndexedDB.js'

/**
 * Function to store Images
 * @param imageName
 * @param blob
 * @returns {Promise<void>}
 */
async function storeImage(imageName, blob) {
  try {
    await db.images.add({
      name: imageName,
      content: blob
    });
    console.log(`Image ${imageName} stored successfully.`);
    return blob; // Return the blob if successfully stored
  } catch (error) {
    console.error(`Error storing image ${imageName}:`, error);
    return null; // Return null if there was an error
  }
}
/**
 * Retrieve an Image
 * @param imageName
 * @returns {Promise<null|string>}
 */

async function getImageUrl(imageName) {
  const image = await db.images.get({name: imageName});
  if (image) {
    return URL.createObjectURL(image.content);
  } else {
    console.error('Image not found:', imageName);
    return null;
  }
}
const imagesIDs = [
  'Button_Blue',
   'Regular_02',
  'Spell1',
  'Spell2',
   'Spell3',
  'Spell4',
  'Spell5',
  'Plant',
  'Fire',
  'Bolt',
  'Shield',
  'Health',
  'Left',
  'Health2',
   'Mana',
  'Right',
   'Mana2',
  'crystals',
  'CrystalIcon'
];


const reversedImageElements = {
  'Button_Blue': 'Button_Blue.png',
  'Regular_02': 'Regular_02.png',
  'Spell5': 'Button_Blue_9Slides.png',
  'Spell4': 'Button_Blue_9Slides.png',
  'Spell3': 'Button_Blue_9Slides.png',
  'Spell2': 'Button_Blue_9Slides.png',
  'Spell1': 'Button_Blue_9Slides.png',
  'Plant': 'spell-cast-plant.png',
  'Fire': 'spell-cast-fire.png',
  'Bolt': 'spell-cast-bolt.png',
  'Shield': 'double-ringed-orb_4.png',
  'Health': 'Potion-red.png',
  'Health2': 'Potion-red.png',
  'Mana': 'Potion-blue.png',
  'Mana2': 'Potion-blue.png',
  'Right': 'Potion-grey.png',
  'Left': 'Potion-grey.png',
  'crystals': 'Ribbon_Blue_3Slides.png',
  'CrystalIcon': 'crystal_01a.png'
};

/**
 * This function adds images to indexedDB if it is not already there.
 * @param baseURL
 * @param imagesIDs
 * @returns {Promise<void>}
 */
async function fetchAndStoreImages(baseURL, imagesIDs) {
  for (let imageId of imagesIDs) {
    const imageURL = `${baseURL}/static/assets/images/${reversedImageElements[imageId]}`;
    const imageElement = document.getElementById(imageId); // Get the DOM element

    if (!imageElement) {
      console.error(`DOM element not found for image ${reversedImageElements[imageId]}`);
      continue; // Skip this iteration if the element doesn't exist
    }

    try {
      let blobUrl = await getImageUrl(reversedImageElements[imageId]); // Try to get the blob URL
      if (!blobUrl) {
        // Only fetch if the blob wasn't found in IndexedDB
        const response = await fetch(imageURL);
        const blob = await response.blob();
        if (blob.size > 0) {
          await storeImage(reversedImageElements[imageId], blob); // Store the image and get the blob back
          blobUrl = URL.createObjectURL(blob); // Create a blob URL
        } else {
          console.error(`Received empty blob for image: ${reversedImageElements[imageId]}`);
        }
      }

      // Set the image source to the blob URL
      if (blobUrl) {
        imageElement.src = blobUrl;
        if (!await getImageUrl(reversedImageElements[imageId])) {
          imageElement.onload = function () {
            URL.revokeObjectURL(blobUrl);
          };
        }
      }
    } catch (error) {
      console.error('Error handling image:', reversedImageElements[imageId], error);
    }
  }
}

const baseURL = 'http://127.0.0.1:5000';
fetchAndStoreImages(baseURL, imagesIDs);


