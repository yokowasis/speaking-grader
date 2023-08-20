//////////// Languages
var langs = [
  [
    "English",
    ["en-US", "United States"],
    ["en-AU", "Australia"],
    ["en-CA", "Canada"],
    ["en-IN", "India"],
    ["en-NZ", "New Zealand"],
    ["en-ZA", "South Africa"],
    ["en-GB", "United Kingdom"],
  ],
  ["Bahasa Indonesia", ["id-ID"]],
];

const sentences = [
  "I am studying now",
  "He is helping his mother",
  "You are calling my father",
  "She is writing a letter",
  "They are doing the homework",
  "I was sleeping last night",
  "He hasn't been home since yesterday",
];

var s = "";
for (let i = 0; i < sentences.length; i++) {
  const element = sentences[i];
  s += `
          <div class="col-lg-4">
            <div class="card mb-3">
              <div class="card-header">Kalimat ${i + 1}</div>
              <div class="card-body">
                <input
                  class="form-control"
                  type="text"
                  id="kalimat${i + 1}"
                  value="${element}"
                />
                <p id="result${i + 1}" class="text-center text-success"></p>
                <h3 id="skor${i + 1}" class="text-center"></h3>
              </div>
              <div class="card-footer">
                <button class="btn btn-block btn-primary" id="mulaiBtn${
                  i + 1
                }" onclick="mulai(${i + 1})">
                  Start
                </button>
                <button class="btn btn-block btn-danger" style="display:none" id="stopBtn${
                  i + 1
                }" onclick="stopButton()">Stop</button>
              </div>
            </div>
          </div>
  `;
}

document.getElementById("card-wrapper").innerHTML = s;

for (var i = 0; i < langs.length; i++) {
  select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 0;
showInfo("info_start");

var sentence = "";

function compareArrays(arr1, arr2) {
  var count = 0;
  for (var i = 0; i < arr1.length; i++) {
    if (!arr2.includes(arr1[i])) {
      count++;
    }
  }
  var score = ((arr1.length - count) / arr1.length) * 100;
  return score;
}

/**
 *
 * @param {string} a
 * @param {string} b
 * @param {number} base
 */
function hitungSkor(a, b, base) {
  const arrA = a.toLowerCase().split(" ");
  const arrB = b.toLowerCase().split(" ");

  for (let i = 0; i < arrB.length; i++) {
    if (arrB[i].endsWith(".")) {
      arrB[i] = arrB[i].slice(0, -1);
    }
  }

  console.log(arrA);
  console.log(arrB);
  console.log(compareArrays(arrA, arrB));

  // find the word difference between A and B
  const diff = arrA.filter((x) => !arrB.includes(x));
  console.log(diff);
  return Math.floor(((base * 10000) / 100 + compareArrays(arrA, arrB)) / 2);
}

function updateCountry() {
  for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    select_dialect.remove(i);
  }
  var list = langs[select_language.selectedIndex];
  for (var i = 1; i < list.length; i++) {
    select_dialect.options.add(new Option(list[i][1], list[i][0]));
  }
  select_dialect.style.visibility = list[1].length == 1 ? "hidden" : "visible";
}

var create_email = false;
var final_transcript = "";
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!("webkitSpeechRecognition" in window)) {
  upgrade();
} else {
  start_button.style.display = "inline-block";
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function () {
    recognizing = true;
    showInfo("info_speak_now");
    start_img.src =
      "//google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif";
  };

  recognition.onerror = function (event) {
    if (event.error == "no-speech") {
      start_img.src =
        "//google.com/intl/en/chrome/assets/common/images/content/mic.gif";
      showInfo("info_no_speech");
      ignore_onend = true;
    }
    if (event.error == "audio-capture") {
      start_img.src =
        "//google.com/intl/en/chrome/assets/common/images/content/mic.gif";
      showInfo("info_no_microphone");
      ignore_onend = true;
    }
    if (event.error == "not-allowed") {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo("info_blocked");
      } else {
        showInfo("info_denied");
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function () {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src =
      "//google.com/intl/en/chrome/assets/common/images/content/mic.gif";
    if (!final_transcript) {
      showInfo("info_start");
      return;
    }
    showInfo("");
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById("final_span"));
      window.getSelection().addRange(range);
    }
    if (create_email) {
      create_email = false;
      createEmail();
    }
  };

  recognition.onresult = function (event) {
    var interim_transcript = "";
    if (typeof event.results == "undefined") {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      console.log(event.results[i]);
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        document.getElementById(`skor${activeKalimat}`).innerHTML = hitungSkor(
          sentence,
          final_transcript,
          event.results[i][0].confidence
        );
      } else {
        interim_transcript += event.results[i][0].transcript;
        document.getElementById(`skor${activeKalimat}`).innerHTML = hitungSkor(
          sentence,
          final_transcript,
          event.results[i][0].confidence
        );
      }
    }
    final_transcript = capitalize(final_transcript);
    document.getElementById(`result${activeKalimat}`).innerHTML =
      final_transcript;
    // final_span.innerHTML = linebreak(final_transcript);
    // interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons("inline-block");
    }
  };
}

function upgrade() {
  start_button.style.visibility = "hidden";
  showInfo("info_upgrade");
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, "<p></p>").replace(one_line, "<br>");
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function (m) {
    return m.toUpperCase();
  });
}

function createEmail() {
  var n = final_transcript.indexOf("\n");
  if (n < 0 || n >= 80) {
    n = 40 + final_transcript.substring(40).indexOf(" ");
  }
  var subject = encodeURI(final_transcript.substring(0, n));
  var body = encodeURI(final_transcript.substring(n + 1));
  window.location.href = "mailto:?subject=" + subject + "&body=" + body;
}

function copyButton() {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  copy_button.style.display = "none";
  copy_info.style.display = "inline-block";
  showInfo("");
}

function stopButton() {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  // hideButton
  document.getElementById(`stopBtn${activeKalimat}`).style.display = "none";
  document.getElementById(`mulaiBtn${activeKalimat}`).style.display =
    "inline-block";
}

function emailButton() {
  if (recognizing) {
    create_email = true;
    recognizing = false;
    recognition.stop();
  } else {
    createEmail();
  }
  email_button.style.display = "none";
  email_info.style.display = "inline-block";
  showInfo("");
}

var activeKalimat = 1;

/**
 *
 * @param {number} i
 */
function mulai(i) {
  sentence = document.getElementById(`kalimat${i}`).value;
  activeKalimat = i;
  document.getElementById(`mulaiBtn${i}`).style.display = "none";
  document.getElementById(`stopBtn${i}`).style.display = "inline-block";
  startButton();
}

function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = "";
  recognition.lang = select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = "";
  interim_span.innerHTML = "";
  start_img.src =
    "//google.com/intl/en/chrome/assets/common/images/content/mic-slash.gif";
  showInfo("info_allow");
  showButtons("none");
  start_timestamp = event.timeStamp;
}

function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? "inline" : "none";
      }
    }
    info.style.visibility = "visible";
  } else {
    info.style.visibility = "hidden";
  }
}

var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  copy_button.style.display = style;
  email_button.style.display = style;
  copy_info.style.display = "none";
  email_info.style.display = "none";
}
