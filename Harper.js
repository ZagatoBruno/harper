class Harper {
  constructor(
    instructions,
    grammars,
    lang,
    onResultChange,
    onListening,
    onSpeaking
  ) {
    this.instructions = [...this.defaultInstructions, ...instructions];
    this.grammars = grammars;
    this.lang = lang || "it-IT";

    this.isListening = false;
    this.isSpeaking = false;
    this.noSpeechTimer;
    this.currentResult = "";

    this.onResultChange = onResultChange;
    this.onListening = onListening;
    this.onSpeaking = onSpeaking;
  }

  get IsSupported() {
    return (
      typeof window != "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  InitAssistant() {
    if (!this.IsSupported) return;

    this.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    this.SpeechRecognitionEvent =
      window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
    this.synth = window.speechSynthesis;

    this.InitGrammars();
    this.InitRecognition();
  }

  InitGrammars() {
    if (!this.grammars) return;

    this.speechRecognitionList = new this.SpeechGrammarList();
    this.grammars.forEach((grammar) => {
      const grString = `#JSGF V1.0; grammar ${grammar.name}; public <${
        grammar.var_name
      }> = ${grammar.options.join(" | ")} ;`;
      this.speechRecognitionList.addFromString(grString, 1);
    });
  }

  InitRecognition() {
    this.recognition = new this.SpeechRecognition();
    if (this.speechRecognitionList)
      this.recognition.grammars = this.speechRecognitionList;
    this.recognition.continuous = true;
    this.recognition.lang = this.lang;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onspeechstart = (event) => {
      clearTimeout(this.noSpeechTimer);
      this.noSpeechTimer = setTimeout(() => {
        this.NoMatch();
      }, 10000);
    };

    this.recognition.onresult = (event) => {
      clearTimeout(this.noSpeechTimer);

      Object.values(event.results).forEach((result) => {
        this.currentResult = result[0].transcript.toLowerCase();
      });

      if (typeof this.onResultChange == "function")
        this.onResultChange(this.currentResult);

      this.noSpeechTimer = setTimeout(() => {
        this.Answer(this.currentResult);
      }, 2000);
    };
  }

  get defaultInstructions() {
    return [
      {
        matches: ["stop", "basta", "fermati"],
        answers: ["Ok"],
        hint: "Per interrompere la conversazione basta dire: stop",
        action: () => {
          this.Abort();
        },
      },
      {
        matches: ["cosa puoi fare", "cosa posso chiederti", "aiuto", "help"],
        answers: ["puoi chiedermi una di queste cose:"],
        hint: "Per avere un elenco delle mie funzionalità puoi dire: aiuto",
        action: () => {
          this.ReadHints();
        },
      },
    ];
  }

  get isListening() {
    return this._isListening;
  }

  set isListening(value) {
    this._isListening = value;
    if (typeof this.onListening == "function") this.onListening(value);
  }

  get isSpeaking() {
    return this._isSpeaking;
  }

  set isSpeaking(value) {
    this._isSpeaking = value;
    if (typeof this.onSpeaking == "function") this.onSpeaking(value);
  }

  Start() {
    this.recognition.start();
    this.noSpeechTimer = setTimeout(() => {
      this.NoWords();
    }, 10000);
    this.isListening = true;
  }

  Stop() {
    this.isListening = false;
    clearTimeout(this.noSpeechTimer);
    this.recognition.stop();
  }

  Abort() {
    this.isListening = false;
    clearTimeout(this.noSpeechTimer);
    this.recognition.abort();
  }

  Read(message, preventRestart) {
    this.Stop();

    const This = this;

    const ReadPromise = new Promise((resolve, reject) => {
      if (this.synth.speaking) reject();
      else {
        var utterThis = new SpeechSynthesisUtterance(message);
        utterThis.onend = function (event) {
          This.isSpeaking = false;
          if (!preventRestart) This.Start();
          resolve();
        };
        utterThis.onerror = function (event) {
          This.isSpeaking = false;
          if (!preventRestart) This.Start();
          reject();
        };
        const voices = this.synth.getVoices();
        const voiceByLang = voices.filter(
          (voice) => voice.lang == this.lang && !voice.localService
        )[0];
        utterThis.voice = voiceByLang;
        console.log(voices, voiceByLang);
        this.synth.speak(utterThis);
        this.isSpeaking = true;
      }
    });

    return ReadPromise;
  }

  Answer(question) {
    // let instruction = null;
    // const vars = {};
    //let matched = false;

    const checkMatch = (match, question) => {
      const splittedQuestion = question.split(" ");
      const splittedMatch = match.split(" ");

      for (const i in splittedQuestion) {
        if (!splittedMatch[i]) {
          return null;
        } else if (
          splittedMatch[i].startsWith("$$") ||
          splittedQuestion[i].length < 2 ||
          splittedMatch[i] == splittedQuestion[i]
        )
          continue;
        else {
          return null;
        }
      }

      const vars = {};
      splittedMatch.forEach((word, i) => {
        if (word.startsWith("$$"))
          vars[word.replace("$$", "")] = splittedQuestion[i];
      });
      return vars;
    };

    const checkMatches = (question) => {
      for (const instruct of this.instructions) {
        for (const match of instruct.matches) {
          const vars = checkMatch(match, question);
          if (vars) return { instruction: instruct, vars };
        }
      }
      return { instruction: null, vars: null };
    };

    const { instruction, vars } = checkMatches(question);

    if (instruction) {
      if (instruction.answers && instruction.answers.length) {
        let answer =
          instruction.answers[
            parseInt(Math.random() * instruction.answers.length)
          ];
        if (answer.includes("$$")) {
          Object.keys(vars).forEach((key) => {
            answer = answer.replace(`$$` + key, vars[key]);
          });
        }
        this.Read(answer).then(() => {
          if (typeof instruction.action == "function")
            instruction.action(question, vars);
        });
      } else if (typeof instruction.action == "function")
        instruction.action(question, vars);
    } else this.Read("Mi spiace, non so come aiutarti, riprova");
  }

  NoWords() {
    this.Stop();
    this.Read("A più tardi!", true);
  }

  NoMatch() {
    this.Stop();
    this.Read("Non ho capito, riprova");
  }

  ReadHints() {
    const ReadInstruction = (i) => {
      this.Read(this.instructions[i].hint).then(() => {
        if (i < this.instructions.length - 1) ReadInstruction(i + 1);
      });
    };

    ReadInstruction(0);
  }
}

module.exports = Harper;
