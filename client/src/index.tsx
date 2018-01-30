import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';
import * as react_tap_event_plugin from 'react-tap-event-plugin';
react_tap_event_plugin();

import { App } from './components';
import registerServiceWorker from './registerServiceWorker';

import AppState from './lib/state';

const appState = new AppState();

ReactDOM.render(
  <App state={appState} />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
