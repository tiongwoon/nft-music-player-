# NFT Music Player 

Allows you to connect your wallet and play your music.
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## What it does
A website that allows you to listen to your music NFTs, with auto playback and loop functions. 

The user flow:
1. Connect your Metamask wallet
2. The website auto-loads your music NFTs (currently only supports sound.xyz)
3. Click to play any of the tracks
4. The playlist will keep looping, you can also skip or keep a track on repeat. 

## Built with
Using React for front-end, wagmi.sh for hooks, Alchemy API to query NFTs and a library for music player.

## Available Scripts

In the project directory, you can run:

### to clone the project & install dependencies
```
git clone https://github.com/tiongwoon/nft-music-player-.git
npm install
```

### to run the app in development mode
``` 
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.


### to build for production
```
npm run build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.