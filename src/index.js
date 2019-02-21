const {errorResponse} = require("./response");
const url = require('url');
const {original, resize} = require("./image");

exports.handler = (event) => new Promise((resolve, reject) => {
    const imageBucket = process.env.IMAGE_BUCKET;

    if (!imageBucket) {
        return reject(`Error: Set environment variable IMAGE_BUCKET`);
    }

    // let path = event.path;
    // path = path.replace("resize/","media/")
    // const objectKey = url.parse(path).pathname.replace(/^\/+/g, '');
    // console.log('INFO: key: ' + objectKey);

    const queryParameters = event.queryStringParameters || {};
     
    let fullpath = event.path;
    fullpath = fullpath.replace("resize/","media/")
    let path = fullpath
    let extract = fullpath.match(/^(.+)\.thumbnail(\d+)(x(\d+))?$/)
    let width = 0
    let height = 0
    if(extract){
      path = extract[1]
      if(extract[2]*1>0){
        width = extract[2]*1
      }
      if(extract[4]*1>0){
        height = extract[4]*1
      }

    }else{
        width = parseInt(queryParameters.width);
        height = parseInt(queryParameters.height);
  
    }
    
    const objectKey = url.parse(path).pathname.replace(/^\/+/g, '');

    if (width==0 && height==0) {
        return original(imageBucket, objectKey)
            .then(resolve)
            .catch(reject);
    }


    if ((queryParameters.width && isNaN(width)) || (queryParameters.height && isNaN(height))) {
        return reject(errorResponse(`width and height parameters must be integer`, 400));
    }

    return resize(imageBucket, objectKey, width, height)
        .then(resolve)
        .catch(reject);
});
