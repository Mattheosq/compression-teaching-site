document.getElementById("submit-button").addEventListener("click", function() {
  const symbolsInput = document.getElementById("symbols");
  const probabilitiesInput = document.getElementById("probabilities");
  const sequenceInput = document.getElementById("sequence");

  const symbolsValue = symbolsInput.value;
  const probabilitiesValue = probabilitiesInput.value;
  const sequenceValue = sequenceInput.value;
  
  clearErrors();

  const stepsContainer = document.getElementById("steps-section");
  stepsContainer.innerHTML = "";

  if (symbolsValue === "") {
    hideResults();
    displayError(symbolsInput, "Pole symboli nie może być puste.");
    return;
  }

  if (probabilitiesValue === "") {
    hideResults();
    displayError(probabilitiesInput, "Pole prawdopodobieństw nie może być puste.");
    return;
  }

  if (sequenceValue === "") {
    hideResults();
    displayError(sequenceInput, "Pole ciągu do zakodowania nie może być puste.");
    return;
  }
  const symbols = symbolsValue.split(',').map(s => s.trim());
  const probabilitiesArray = probabilitiesValue.split(',').map(p => parseFloat(p.trim()));
  
  if (symbols.length !== probabilitiesArray.length) {
    hideResults();
    displayError(symbolsInput, "Ilość symboli i prawdopodobieństw musi być taka sama.");
    return;
  }

  const paired = symbols.map((symbol, index) => ({
    symbol: symbol,
    probability: probabilitiesArray[index]
  }));

  paired.sort((a, b) => b.probability - a.probability);

  const sortedSymbols = paired.map(item => item.symbol);
  const sortedProbabilitiesArray = paired.map(item => item.probability);
  const probabilities = {};
  let sum = 0;
  for (let i = 0; i < sortedSymbols.length; i++) {
    const symbol = sortedSymbols[i];
    const probability = sortedProbabilitiesArray[i];
    if (isNaN(probability) || probability <= 0 || probability >= 1) {
      hideResults();
      displayError(probabilitiesInput, "Prawdopodobieństwa muszą być liczbami dodatnimi z zakresu (0 - 1).");
      return;
    }
    probabilities[symbol] = { dolny: sum, gorny: sum + probability };
    sum += probability;
  }

  if (Math.abs(sum - 1) > 1e-6) {
    hideResults();
    displayError(probabilitiesInput, "Prawdopodobieństwa muszą sumować się do 1.");
    return;
  }

  for (const char of sequenceValue) {
    if (!probabilities[char]) {
      hideResults();  
      displayError(sequenceInput, `Symbol "${char}" nie jest uwzględniony w zbiorze symboli.`);
      return;
    }
  }

  window.currentSymbols = sortedSymbols;
  window.currentProbabilities = probabilities;
  window.currentSequence = sequenceValue;
  updateResults();
});

function updateResults() {
  const {binaryResult, binaryArray} = kodowanieArytmetyczne(window.currentSequence, window.currentProbabilities);
  
  let decimalResult = new Decimal(0);
  for (let i = 0; i < binaryArray.length; i++) {
    decimalResult = decimalResult.plus(new Decimal(binaryArray[i]).times(Decimal.pow(2, -(i + 1))));
  }

  displayResult(binaryResult, decimalResult);
}

function displayResult(binaryResult, decimalResult) {
  const resultSection = document.getElementById("result-section");
  resultSection.style.display = "block";

  const binaryResultBox = document.getElementById("binary-result");
  binaryResultBox.className = "result-box center-text";
  binaryResultBox.textContent = binaryResult;

  const decimalResultBox = document.getElementById("decimal-result");
  decimalResultBox.className = "result-box center-text";
  decimalResultBox.textContent = decimalResult;
}

function hideResults() {
  const resultSection = document.getElementById("result-section");
  resultSection.style.display = "none";
}

document.getElementById("step-by-step-button").addEventListener("click", function () {
  const stepsContainer = document.getElementById("steps-section");
  stepsContainer.innerHTML = ""; 

  const distributionBlock = createStepBlock("Rozkład prawdopodobieństwa", "", true);
  distributionBlock.classList.add("result-box", "center-text");

  const probabilities = Object.values(window.currentProbabilities).map(p => p.gorny);
  probabilities.unshift(0);
  const symbols = window.currentSymbols;

  createDynamicAxis(
      distributionBlock.querySelector(".graphic-placeholder"), 
      probabilities, 
      symbols, 
      0,
      1 
  );

  stepsContainer.appendChild(distributionBlock);

  let dolny_limit = Decimal(0);
  let gorny_limit = Decimal(1);

  for (let i = 0; i < window.currentSequence.length; i++) {
    const symbol = window.currentSequence[i];
    const zakres = gorny_limit.minus(dolny_limit);

    const nowy_gorny = dolny_limit.plus(zakres.times(window.currentProbabilities[symbol].gorny));
    const nowy_dolny = dolny_limit.plus(zakres.times(window.currentProbabilities[symbol].dolny));

    const tytul = `Krok ${i + 1}, symbol ${symbol}:`;
    const opis = `
      <div style="text-align: left;">
          Delta: <span style="color: #f00;">${gorny_limit}</span> − <span style="color: #0f0;">${dolny_limit}</span> = <span style="color: #ffa500;">${zakres}</span>
      </div>
      <div style="text-align: left;">
          Nowy lewy koniec przedziału: <span style="color: #0f0;">${dolny_limit}</span> + <span style="color: #ffa500;">${zakres}</span> · <span style="color: #00f;">${window.currentProbabilities[symbol].dolny}</span> = ${nowy_dolny}
      </div>
      <div style="text-align: left;">
          Nowy prawy koniec przedziału: <span style="color: #0f0;">${dolny_limit}</span> + <span style="color: #ffa500;">${zakres}</span> · <span style="color: #00f;">${window.currentProbabilities[symbol].gorny}</span> = ${nowy_gorny}
      </div>
      <div style="text-align: left;">
          Wyliczony przedział: ⟨<span style="color: #0f0;">${nowy_dolny}</span>, <span style="color: #f00;">${nowy_gorny}</span>)
      </div>
    `;

    const stepBlock = createStepBlock(tytul, opis, false);
    stepBlock.classList.add("result-box","left-text");
    const updatedProbabilities = probabilities.map(p => dolny_limit.plus(zakres.times(p)).toNumber()); // temp

    createDynamicAxis(
        stepBlock.querySelector(".graphic-placeholder"), 
        updatedProbabilities, 
        symbols, 
        dolny_limit.toNumber(), 
        gorny_limit.toNumber(), 
        [nowy_dolny.toNumber(), nowy_gorny.toNumber()] 
    );

    stepsContainer.appendChild(stepBlock);

    dolny_limit = nowy_dolny;
    gorny_limit = nowy_gorny;
  }
  scrollToSteps();
});

function formatNumber(value) {
  return value.toFixed(12).replace(/\.?0+$/, '');
}

function createStepBlock(title, content, isDistribution) {
  const stepBlock = document.createElement("div");
  stepBlock.className = "step-block";

  const header = document.createElement("h3");
  header.textContent = title;
  header.style.marginBottom = "5px";
  stepBlock.appendChild(header);

  const graphic = document.createElement("div");
  graphic.className = "graphic-placeholder";
  stepBlock.appendChild(graphic);

  if (content && !isDistribution) {
    const description = document.createElement("div");
    description.className = "step-description";
    description.innerHTML = content;
    stepBlock.appendChild(description);
  }

  return stepBlock;
}

function createDynamicAxis(containerId, probabilities, symbols, dolny_limit, gorny_limit, highlightRange = null) {
  const container = d3.select(containerId);

  const width = 720; 
  const height = 150;
  const padding = 40;

  const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")

  const scale = d3.scaleLinear()
      .domain([dolny_limit, gorny_limit])
      .range([padding, width - padding]);

  const axis = d3.axisBottom(scale)
      .tickValues(probabilities)
      .tickFormat(highlightRange == null 
          ? d => parseFloat(d.toFixed(5)).toString() 
          : (d, i) => i === 0 || i === probabilities.length - 1 || highlightRange.includes(d) 
              ? parseFloat(d.toFixed(5)).toString() 
              : ''
      );

  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height / 2})`)
      .call(axis);

  symbols.forEach((symbol, index) => {
      const midPoint = (probabilities[index] + probabilities[index + 1]) / 2;
      svg.append("text")
          .attr("x", scale(midPoint))
          .attr("y", (height / 2) - 20)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(symbol);
  });

  if (highlightRange) {
      const [start, end] = highlightRange;
      svg.append("line")
          .attr("x1", scale(start))
          .attr("x2", scale(end))
          .attr("y1", height / 2)
          .attr("y2", height / 2)
          .attr("stroke", "red")
          .attr("stroke-width", 4);
  }
}

function clearErrors() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(error => error.remove());
}
  
function displayError(inputElement, message) {
  const errorMessage = document.createElement("div");
  errorMessage.className = "error-message";
  errorMessage.textContent = message;

  const parent = inputElement.parentElement;
  parent.style.position = "relative";
  parent.appendChild(errorMessage);
}
  
function scrollToSteps() {
  const stepsSection = document.getElementById("steps-section");
  const offset = 0; 
  const elementPosition = stepsSection.getBoundingClientRect().top + offset; 
  window.scrollTo({ 
    top: elementPosition,
    behavior: "smooth"
  });
}

function kodowanieArytmetyczne(wiadomosc, prawdopodobienstwa) {
  let dolny_limit = new Decimal(0);
  let gorny_limit = new Decimal(1);
  
  for (let i = 0; i < wiadomosc.length; i++) {
    const symbol = wiadomosc[i];
    const zakres = gorny_limit.minus(dolny_limit);
    
    gorny_limit = dolny_limit.plus(zakres.times(prawdopodobienstwa[symbol].gorny));
    dolny_limit = dolny_limit.plus(zakres.times(prawdopodobienstwa[symbol].dolny));
  }
  
  let binaryResult = "0.";
  let binaryArray = [];
  let delay = 0;
  let a = dolny_limit;
  let b = gorny_limit;

  while(true) { 
    if(a.greaterThanOrEqualTo(0.5)){ 
      binaryArray.push(1);
      for (let i = 0; i < delay; i++) {
        binaryArray.push(0);
      }
      delay = 0;
      a = a.minus(0.5);
      b = b.minus(0.5);
    }
    else if(b.lessThan(0.5)){ 
      binaryArray.push(0);
      for (let i = 0; i < delay; i++) {
        binaryArray.push(1);
      }
      delay = 0;
    }
    else if(a.lessThan(0.25)){ 
      binaryArray.push(0);
      binaryArray.push(1);
      for (let i = 0; i < delay; i++) {
        binaryArray.push(1);
      }
      break;
    }
    else if(b.greaterThanOrEqualTo(0.75)){ 
      binaryArray.push(1);
      binaryArray.push(0);
      for (let i = 0; i < delay; i++) {
        binaryArray.push(0);
      }
      break;
    }
    else{ 
      delay += 1;
      a = a.minus(0.25);
      b = b.minus(0.25);
    }
    a = a.times(2);
    b = b.times(2);
  }
  binaryResult += binaryArray.join("");
  return {binaryResult, binaryArray};
}
  
  