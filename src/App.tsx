import React, { Fragment } from 'react';
import './App.css';
import { CanvasLayout } from './components/layouts/CanvasLayout';
import { CanvasComponent } from './components/CanvasComponent';
import { CanvasComponentCircle } from './components/CanvasComponentCircle';

const App: React.FC = () =>  {
  return (
    <Fragment>
    <CanvasLayout>
    <CanvasComponent width={600} height={400} />
    </CanvasLayout>
    <CanvasLayout>
    <CanvasComponentCircle width={600} height={400} />
    </CanvasLayout>
    </Fragment>
  );
}

export default App;
