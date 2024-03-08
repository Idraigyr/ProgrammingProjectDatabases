export const min = function(x1, x2){
    return x1 < x2 ? x1 : x2;
}

export const max = function(x1, x2){
    return x1 > x2 ? x1 : x2;
}

export const getFileExtension = function(path){
    return path.slice((path.lastIndexOf(".") - 1 >>> 0) + 2);
}

/*
const timeout = function (s) {
    return new Promise(function(_,reject){
        setTimeout(function(){
            reject(new Error(`Request took too long! timeout after ${s} seconds`));
        }, s*1000);
    });
}

export const AJAX = async function(url,uploadData = undefined){
    try{
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        }) : fetch(url);
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();
        if (!res.ok) throw new Error(`${data.message} (${res.status})`);
        return data;
    } catch (err){
        throw err;
    }
}
*/