import {db} from './IndexedDB.js'
import {assetPaths} from "../configs/ViewConfigs.js";
import {API_URL} from "../configs/EndpointConfigs.js";

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
        console.log(`Model ${modelName} stored successfully.`);
        return blob; // Return the blob if successfully stored
  } catch (error) {
        console.error(`Error storing model ${modelName}:`, error);
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
        if(m === "Tower"){

        } else if (m === "SkeletonArrow"){}
        else if (m === "SkeletonCrossbow"){}
        else if (m === "SkeletonBlade"){}
        else if (m === "SkeletonAxe"){}
        else if (m === "SkeletonStaff"){}
        else if (m === "SkeletonShield"){}
        else{
            let path = assetPaths[m][0].slice(1);
            const modelURL = `${baseURL}` + path;
            try {
                let blobUrl = await getModelUrl(path);
                if (!blobUrl) {
                    const response = await fetch(modelURL);
                    const blob = await response.blob();
                    if (blob.size > 0) {
                        await storeModel(path, blob); // Store the image and get the blob back
                        blobUrl = URL.createObjectURL(blob); // Create a blob URL
                    } else {
                        console.error(`Received empty blob for model: ${path}`);
                    }
                }
                if (blobUrl) {
                    assetPaths[m][0] = blobUrl;
                }
            } catch (error) {
                console.error('Error handling model:', path, error);
            }
        }


    }
}

fetchAndStoreModels(API_URL);
