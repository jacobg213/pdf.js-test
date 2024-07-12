import './style.css'

import samplePdfPath from '../assets/sample.pdf';
import { GlobalWorkerOptions, TextLayer, getDocument } from 'pdfjs-dist';
import PdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

GlobalWorkerOptions.workerSrc = PdfWorkerUrl;

document.querySelector('#app')!.innerHTML = `
<div id='pdf-view'></div>
`

async function loadPdf() {
  const loadingTask = getDocument(samplePdfPath);
  const pdfDocument = await loadingTask.promise;

  const pageCount = pdfDocument.numPages;
  for (let i = 1; i <= pageCount; i++) {
    const pdfPage = await pdfDocument.getPage(i);
    const pageText = await pdfPage.getTextContent();

    const scaleFactror = 1.0;
    const viewport = pdfPage.getViewport({ scale: scaleFactror });

    const pageWrapper = document.createElement('div');
    const canvas = document.createElement('canvas');
    const textContainer = document.createElement('div');

    pageWrapper.style.width = `${viewport.width}px`;
    pageWrapper.style.height = `${viewport.height}px`;
    pageWrapper.style.position = 'relative';

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    textContainer.classList.add('textLayer');
    textContainer.style.setProperty('--scale-factor', `${scaleFactror}`);
    textContainer.style.width = `${viewport.width}px`;
    textContainer.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d')!;
    const renderTask = pdfPage.render({
      canvasContext: ctx,
      viewport,
    });

    const textLayer = new TextLayer({
      textContentSource: pageText,
      viewport: viewport,
      container: textContainer,
    });

    await Promise.all([
      renderTask.promise,
      textLayer.render(),
    ]);

    pageWrapper.appendChild(canvas);
    pageWrapper.appendChild(textContainer);
    document.querySelector<HTMLDivElement>('#pdf-view')!.appendChild(pageWrapper);
  }
}

loadPdf();
