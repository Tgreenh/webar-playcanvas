
import { PlayCanvasApp } from './webar-app.js';
import './style.css';

const canvas = document.querySelector('canvas.viewer');

const app = new PlayCanvasApp({ canvasDomElement: canvas });
