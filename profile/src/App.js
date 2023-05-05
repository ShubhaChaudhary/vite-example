import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScreenLoading from './Components/ScreenLoading';
import Home from '../src/pages/Home/Home'
import AboutMe from '../src/pages/AboutMe/AboutMe'


function App() {

  return (
    <Router>
      <Routes> 
        <Route path='/' element={(
          <Suspense fallback={<ScreenLoading />}>
            <Home />
          </Suspense>
        )} />
        <Route path='/about' element={(
          <Suspense fallback={<ScreenLoading />}>
            <AboutMe />
          </Suspense>
        )} />
      </Routes>
    </Router>
  );
}

export default App;
