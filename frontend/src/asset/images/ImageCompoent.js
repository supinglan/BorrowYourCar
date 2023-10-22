import React from 'react';

const ImageComponent = (tokenId) => {
    // console.log(tokenId)
    const imagePath = tokenId.tokenId%10000 + '.jpg';
    console.log(imagePath);
    return <img src={require(`./${imagePath}`)} alt="Image" />;
};

export default ImageComponent;