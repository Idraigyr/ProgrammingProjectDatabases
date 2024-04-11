import {db} from './IndexedDB.js'
import {assetPaths} from "../configs/ViewConfigs.js";

/**
 * Function to store Models
 * @param imageName
 * @param blob
 * @returns {Promise<void>}
 */
async function storeModel(modelName, blob){
    try {
        await db.models.add({
          name: modelName,
          content: blob
        });
        console.log(`Image ${modelName} stored successfully.`);
        return blob; // Return the blob if successfully stored
  } catch (error) {
        console.error(`Error storing image ${modelName}:`, error);
        return null; // Return null if there was an error
  }
}

/**
 * Retrieve a Model
 * @param modelName
 * @returns {Promise<null|string>}
 */

async function getModelUrl(modelName) {
  const model = await db.models.get({name: modelName});
  if (model) {
    return URL.createObjectURL(model.content);
  } else {
    console.error('Model not found:', modelName);
    return null;
  }
}

/**
 * This function adds models to indexedDB if it is not already there.
 * @param baseURL
 * @param models
 * @returns {Promise<void>}
 */

export async function fetchAndStoreModels(baseURL){
    for(const m in assetPaths){
        if(m !== "cloud" && m !== "fire") {
            const modelURL = `${baseURL}/static/assets/3d-models/${assetPaths[m]}`;
            try {
                let blobUrl = await getModelUrl(assetPaths[m]);
                if (!blobUrl) {
                    const response = await fetch(modelURL);
                    const blob = await response.blob();
                    if (blob.size > 0) {
                        await storeModel(assetPaths[m], blob); // Store the image and get the blob back
                        blobUrl = URL.createObjectURL(blob); // Create a blob URL
                    } else {
                        console.error(`Received empty blob for model: ${assetPaths[m]}`);
                    }
                }
                if (blobUrl) {
                    assetPaths[m] = blobUrl;
                }
            } catch (error) {
                console.error('Error handling model:', assetPaths[m], error);
            }
        }
    }
}

