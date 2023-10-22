import React from 'react';

const ImageComponent = (tokenId) => {
    console.log(tokenId)
    const imagePath = tokenId.tokenId+'.jpg';
    return <img src={require(`./${imagePath}`)} alt="Image" />;
};

export default ImageComponent;