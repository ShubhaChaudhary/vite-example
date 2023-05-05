import React, { Suspense, useState } from 'react'
import './style.css'
import { Loader } from '@react-three/drei'
import Overlay from './layout/Overlay'
import ScreenLoading from '../../Components/ScreenLoading'
import { FadeIn, LeftMiddle } from './layout/styles'
import BackgoundAnimation from './BackgroundAnimation'

function Home() {
  const [speed, set] = useState(1)

  return (
    <>
      <Suspense fallback={<ScreenLoading />}>
        <BackgoundAnimation speed={speed} />
        <FadeIn />
      </Suspense>
      <Overlay />
      <LeftMiddle>
        <input type="range" min="0" max="10" value={speed} step="1" onChange={(e) => set(e.target.value)} />
      </LeftMiddle>
    </>
  );
}

export default Home;
