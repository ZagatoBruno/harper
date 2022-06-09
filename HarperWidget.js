const Harper = require("./Harper");

class HarperWidget extends Harper {
  constructor({ instructions, grammars, lang, size, color }) {
    super(
      instructions,
      grammars,
      lang,
      (result) => {
        this.RenderRecognitionText(result);
      },
      (status) => {
        if (this.speechBtn)
          this.speechBtn.innerHTML = status
            ? this.listeningIcon
            : this.defaultIcon;
      },
      (status) => {
        if (this.speechBtn)
          this.speechBtn.innerHTML = status
            ? this.speakingIcon
            : this.defaultIcon;
        this.RemoveTextRecognition();
      }
    );

    this.size = size || 20;
    this.color = color || "darkblue";
    this.defaultIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="microphone" class="svg-inline--fa fa-microphone fa-w-11" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"></path></svg>`;
    this.listeningIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="assistive-listening-systems" class="svg-inline--fa fa-assistive-listening-systems fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 260c0 15.464-12.536 28-28 28s-28-12.536-28-28c0-44.112 35.888-80 80-80s80 35.888 80 80c0 15.464-12.536 28-28 28s-28-12.536-28-28c0-13.234-10.767-24-24-24s-24 10.766-24 24zm24-176c-97.047 0-176 78.953-176 176 0 15.464 12.536 28 28 28s28-12.536 28-28c0-66.168 53.832-120 120-120s120 53.832 120 120c0 75.164-71.009 70.311-71.997 143.622L288 404c0 28.673-23.327 52-52 52-15.464 0-28 12.536-28 28s12.536 28 28 28c59.475 0 107.876-48.328 108-107.774.595-34.428 72-48.24 72-144.226 0-97.047-78.953-176-176-176zm-80 236c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zM32 448c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zm480-187.993c0-1.518-.012-3.025-.045-4.531C510.076 140.525 436.157 38.47 327.994 1.511c-14.633-4.998-30.549 2.809-35.55 17.442-5 14.633 2.81 30.549 17.442 35.55 85.906 29.354 144.61 110.513 146.077 201.953l.003.188c.026 1.118.033 2.236.033 3.363 0 15.464 12.536 28 28 28s28.001-12.536 28.001-28zM152.971 439.029l-80-80L39.03 392.97l80 80 33.941-33.941z"></path></svg>`;
    this.speakingIcon = `<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="comment-dots" class="svg-inline--fa fa-comment-dots fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M144 208c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm112 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zM256 32C114.6 32 0 125.1 0 240c0 47.6 19.9 91.2 52.9 126.3C38 405.7 7 439.1 6.5 439.5c-6.6 7-8.4 17.2-4.6 26S14.4 480 24 480c61.5 0 110-25.7 139.1-46.3C192 442.8 223.2 448 256 448c141.4 0 256-93.1 256-208S397.4 32 256 32zm0 368c-26.7 0-53.1-4.1-78.4-12.1l-22.7-7.2-19.5 13.8c-14.3 10.1-33.9 21.4-57.5 29 7.3-12.1 14.4-25.7 19.9-40.2l10.6-28.1-20.6-21.8C69.7 314.1 48 282.2 48 240c0-88.2 93.3-160 208-160s208 71.8 208 160-93.3 160-208 160z"></path></svg>`;
    this.speechText = null;
  }

  InitWidget() {
    if (this.IsBrowserSupported) {
      this.RenderWidget();
      super.InitAssistant();
    }
  }

  RenderWidget() {
    this.speechBtn = document.createElement("div");

    this.speechBtn.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      margin: ${this.size}px;
      width: ${this.size}px;
      height: ${this.size}px;
      padding: ${this.size}px;
      background-color: ${this.color};
      border-radius: 100%;
      display:flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      box-shadow: 0 0 ${this.size / 2}px 0 ${this.color}`;

    this.speechBtn.innerHTML = this.defaultIcon;

    this.speechBtn.onclick = () => {
      if (this.isListening) {
        this.Abort();
        this.RemoveTextRecognition();
      } else this.Start();
    };

    document.querySelector("body").appendChild(this.speechBtn);

    this.AppendTextRecognition();
  }

  RenderRecognitionText(text) {
    if (this.speechText == null) this.AppendTextRecognition();
    this.speechText.textContent = text;
  }

  AppendTextRecognition() {
    this.speechText = document.createElement("div");
    this.speechText.style.cssText = `
      position: fixed;
      bottom: 0;
      margin: ${this.size}px;
      padding: 0px ${this.size}px;
      height: ${parseInt(this.size) * 3}px;
      right: ${parseInt(this.size) * 3}px;
      display: flex;
      align-items: center;
      font-family: monospace;
      font-weight: bold;`;

    document.querySelector("body").appendChild(this.speechText);
  }

  RemoveTextRecognition() {
    if (this.speechText == null) return;
    document.querySelector("body").removeChild(this.speechText);
    this.speechText = null;
  }
}

module.exports = HarperWidget;
