import logo from './logo.svg';
import './App.css';
import { createClient, configureChains, mainnet, goerli, WagmiConfig, useAccount, useConnect, useDisconnect } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useState } from 'react';
import { Alchemy, Network } from 'alchemy-sdk';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import Button from '@mui/material/Button';
import { Alert, Box, Container, Grid, List, ListItem, Paper } from '@mui/material';



//Config chains 
const { chains, provider } = configureChains(
  [goerli, mainnet],
  [alchemyProvider({ apiKey: 'yourAlchemyApiKey' })],
)

//using values from config chains, set up client 
const client = createClient({
  autoConnect: false,
  connectors: [new InjectedConnector({ chains })],
  provider,
})

//Set up Alchemy 
const config = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET
};

const alchemy = new Alchemy(config);

//Component for profile
function Profile() {
  const [nftData, setNftData] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  //(we need this if we want playlist) const [queue, setQueue] = useState([]);

  //This should automatically set first track to the first NFT in the API response 
  //Commenting this out because the player autoplays as soon as the songs are loaded from API
  // useEffect(() => {
  //   if(nftData.length > 0 && currentTrackIndex === null) {
  //     setCurrentTrackIndex(0);
  //   }
  // }, [nftData]); 

  const { address, isConnected } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected })
    },
  })

  function processNft(items) {
    const filteredByMusicObject = items.filter((nft) => nft.rawMetadata.hasOwnProperty('losslessAudio'));
    console.log('filtered object before change', filteredByMusicObject);
    for (let i = 0; i < filteredByMusicObject.length; i++) {
      if (filteredByMusicObject[i].rawMetadata.hasOwnProperty('losslessAudio')) {
        filteredByMusicObject[i].storageType = 'arweave';
        filteredByMusicObject[i].processedLink = 'https://arweave.net/' + filteredByMusicObject[i].rawMetadata.losslessAudio.slice(5);
      }
    }
    console.log('filtered object after change', filteredByMusicObject);
    return filteredByMusicObject;
  }

  function onClickNextHandler() {
    if (currentTrackIndex < nftData.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  }

  function onClickPreviousHandler() {
    if (currentTrackIndex === 0) {
      setCurrentTrackIndex(nftData.length - 1);
    } else {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  }

  function onPlayErrorHandler() {
    <Alert severity='error'>Something went wrong with the player, please try again</Alert>
  }

  const getData = async (data) => {
    const nftFromAlchemy = await (await alchemy.nft.getNftsForOwner(data.account)).ownedNfts;
    console.log(nftFromAlchemy);
    const postProcessedNft = processNft(nftFromAlchemy);
    console.log("post processed", postProcessedNft);
    setNftData(postProcessedNft);
    console.log('nft data', nftData);
  }

  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess(data) {
      return console.log('Success', data),
        getData(data)
    }
  })

  const { disconnect } = useDisconnect()

  if (isConnected)
    return (
      <div>
        <Container maxWidth="lg" paddingBottom='8px'>
          <h3>Connected to {address}</h3>
          <Box textAlign='center'>
            <Button size="small" style={{ borderColor: 'red', color: 'red' }} variant="outlined" disableElevation onClick={() => disconnect()}>Disconnect</Button>
          </Box>
          <div>
            {nftData.map(nft => (
              <div style={{ paddingBottom: '12px', paddingTop: '12px' }}>
                <Paper sx={{ padding: '20px' }} elevation={2} key={nft.tokenId}>
                  <Grid container spacing={1}>
                    <Grid md={10}>
                      <p className='nftTitle'>{nft.title}</p>
                      <p className='nftArtist'>By: {nft.rawMetadata.artist}</p>
                      <p className='nftDescription'>{nft.description}</p>
                    </Grid>
                    <Grid md={2}>
                      <img src={'https://arweave.net/' + nft.rawMetadata.image.slice(5)} style={{ float: 'right', paddingTop: '1em', width: '100px', height: '100px' }} />
                    </Grid>
                  </Grid>
                  <Box display="flex"
                    justifyContent="flex-end"
                    alignItems="flex-end"
                    marginTop='0.5em'>
                    <Button style={{ backgroundColor: 'black' }} disableElevation variant="contained" color="secondary" onClick={() => setCurrentTrackIndex(nftData.indexOf(nft))}> ▶️ Click to Play</Button>
                  </Box>
                </Paper>
              </div>
            ))}
          </div>
        </Container>
        <Box sx={{ maxWidth: '100vw' }} style={{ position: 'sticky', bottom: '0' }}>
          <AudioPlayer
            autoPlay
            src={currentTrackIndex !== null ? nftData[currentTrackIndex].processedLink : ''}
            onPlay={e => console.log("on play")}
            showSkipControls='true'
            onEnded={() => onClickNextHandler()}
            onError={() => onPlayErrorHandler()}
            onPlayError={() => onPlayErrorHandler()}
            onClickNext={() => onClickNextHandler()}
            onClickPrevious={() => onClickPreviousHandler()}
            header={currentTrackIndex !== null ? <div><div className='nftTitle'>{nftData[currentTrackIndex].title}</div><div className='nftArtist'>{nftData[currentTrackIndex].rawMetadata.artist}</div></div> : ''}
          />
        </Box>
      </div>

    )
  return (
    <Container maxWidth='lg'>
      <Box textAlign='center'>
        <Button sx={{ textAlign: 'center' }} color="success" variant="contained" disableElevation onClick={() => connect()}>Connect Wallet to load your music NFTs</Button>
      </Box>
    </Container>
  )
}



//Component for music player, re-renders to play the current selected song 
// function Player({currentSourceLink, setCurrentPlayingSongIndex, currentPlayingSongIndex}) {
//   console.log('current song is', currentSourceLink);
//   console.log("here");
//   function onEndedHandler() {
//     setCurrentPlayingSongIndex(currentPlayingSongIndex + 1);
//     songAutoPlayNextInSequence();.0 
//   }

//   return (
//   <AudioPlayer
//     autoPlay
//     src={currentSourceLink}
//     onPlay={e => console.log("on play")}
//     showSkipControls = 'true'
//     onEnded={}
//   />
//   )
// }

function App() {
  return (
    
      <WagmiConfig client={client}>
        <h1>NFT Music Player</h1>
        <h2>Currently supports: Sound.xyz, more to come!</h2>
        <Profile />

        {/* <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          What's up world
        </a>
      </header>
    </div> */}

        <footer>Built with 🎛 by TW</footer>
      </WagmiConfig>

  );
}

export default App;
