// Even listener dla przycisku Zatwierdz
document.getElementById("submit-button").addEventListener("click", function() {
  const symbolsInput = document.getElementById("symbols");
  const probabilitiesInput = document.getElementById("probabilities");
  const sequenceInput = document.getElementById("sequence");

  const symbolsValue = symbolsInput.value;
  const probabilitiesValue = probabilitiesInput.value;
  const sequenceValue = sequenceInput.value;
  
  clearErrors();

  if (symbolsValue === "") {
    displayError(symbolsInput, "Pole symboli nie może być puste.");
    return;
  }

  if (probabilitiesValue === "") {
      displayError(probabilitiesInput, "Pole prawdopodobieństw nie może być puste.");
      return;
  }

  // Przetworzenie wejściowych danych użytkownika
  const symbols = symbolsValue.split(',').map(s => s.trim());
  const probabilitiesArray = probabilitiesValue.split(',').map(p => parseFloat(p.trim()));
  

  if (symbols.length !== probabilitiesArray.length) {
    displayError(symbolsInput, "Ilość symboli i prawdopodobieństw musi być taka sama.");
    return;
  }
  
  const probabilities = {};
  let sum = 0;
  for (let i = 0; i < symbols.length; i++) {
    const probability = probabilitiesArray[i];
    if (isNaN(probability) || probability <= 0) {
      displayError(probabilitiesInput, "Prawdopodobieństwa muszą być liczbami dodatnimi z zakresu (0 - 1).");
      return;
    }
    probabilities[symbols[i]] = { dolny: sum, gorny: sum + probability };
    sum += probability;
  }
  
  if (Math.abs(sum - 1) > 1e-6) {
    displayError(probabilitiesInput, "Prawdopodobieństwa muszą sumować się do 1.");
    return;
  }

  if (sequenceValue === "") {
    displayError(sequenceInput, "Pole ciągu do zakodowania nie może być puste.");
    return;
  }

  for (const char of sequenceValue) {
    if (!probabilities[char]) {
        displayError(sequenceInput, `Symbol "${char}" nie jest uwzględniony w zbiorze symboli.`);
        return;
    }
  }
  // Ustawienie globalnych zmiennych
  window.currentSymbols = symbols;
  window.currentProbabilities = probabilities;
  window.currentSequence = sequenceValue;

  // Wywołanie funkcji aktualizacji wyników
  updateResults();
  scrollToResult();

});

// Aktualizacja wyników na podstawie obecnych wartości
function updateResults() {
  const maxBits = parseInt(document.getElementById("binary-precision").value, 10) || 8;

  const binary = kodowanieArytmetyczne(window.currentSequence, window.currentProbabilities, maxBits);

  let binaryArray = binary.slice(2).split("").map(Number);
  let decimalFromBinary = 0;
  for (let i = 0; i < binaryArray.length; i++) {
      decimalFromBinary += binaryArray[i] * Math.pow(2, -(i + 1));
  }

  displayResult(binary, formatNumber(decimalFromBinary));
}

function displayResult(binaryResult, decimalResult) {
  document.getElementById("result-section").style.display = "block";
  document.getElementById("binary-result").textContent = binaryResult;
  document.getElementById("decimal-result").textContent = decimalResult;
}

// Event listener dla zmiany precyzji
document.getElementById("binary-precision").addEventListener("input", updateResults);

// Event listener dla przycisku Krok po kroku
document.getElementById("step-by-step-button").addEventListener("click", function () {
  const stepsContainer = document.getElementById("steps-section");
  stepsContainer.innerHTML = ""; 

  // Rozkład prawdopodobieństwa
  const distributionBlock = createStepBlock("Rozkład prawdopodobieństwa", "", true);
  stepsContainer.appendChild(distributionBlock);

  // Iteracja po symbolach w wiadomości
  let dolny_limit = 0.0;
  let gorny_limit = 1.0;

  for (let i = 0; i < window.currentSequence.length; i++) {
      const symbol = window.currentSequence[i];
      const zakres = gorny_limit - dolny_limit;

      // Obliczenia nowych przedziałów
      const nowy_gorny = dolny_limit + zakres * window.currentProbabilities[symbol].gorny;
      const nowy_dolny = dolny_limit + zakres * window.currentProbabilities[symbol].dolny;

      const opis = `
        <div style="text-align: left;">
            Delta: <span style="color: #f00;">${formatNumber(gorny_limit)}</span> − <span style="color: #0f0;">${formatNumber(dolny_limit)}</span> = <span style="color: #ffa500;">${formatNumber(zakres)}</span>
        </div>
        <div style="text-align: left;">
            Nowy lewy kraniec: <span style="color: #0f0;">${formatNumber(dolny_limit)}</span> + <span style="color: #ffa500;">${formatNumber(zakres)}</span> · <span style="color: #00f;">${formatNumber(window.currentProbabilities[symbol].dolny)}</span> = ${formatNumber(nowy_dolny)}
        </div>
        <div style="text-align: left;">
            Nowy prawy kraniec: <span style="color: #0f0;">${formatNumber(dolny_limit)}</span> + <span style="color: #ffa500;">${formatNumber(zakres)}</span> · <span style="color: #00f;">${formatNumber(window.currentProbabilities[symbol].gorny)}</span> = ${formatNumber(nowy_gorny)}
        </div>
        <div style="text-align: left;">
            Wyliczony przedział: ⟨<span style="color: #0f0;">${formatNumber(nowy_dolny)}</span>, <span style="color: #f00;">${formatNumber(nowy_gorny)}</span>)
        </div>
      `;

      // Dodanie kroku do kontenera
      const stepBlock = createStepBlock(`Krok ${i + 1}, symbol ${symbol}:`, opis, false);
      stepsContainer.appendChild(stepBlock);

      // Aktualizacja limitów
      dolny_limit = nowy_dolny;
      gorny_limit = nowy_gorny;
  }
  scrollToSteps();
});

function formatNumber(value) {
  const decimalValue = new Decimal(value);
  return decimalValue.toFixed(12).replace(/\.?0+$/, '');
}

function createStepBlock(title, content, isDistribution) {
  const stepBlock = document.createElement("div");
  stepBlock.className = "step-block";

  const header = document.createElement("h3");
  header.textContent = title;
  stepBlock.appendChild(header);

  const graphic = document.createElement("div");
  graphic.className = "graphic-placeholder";
  stepBlock.appendChild(graphic);

  if (content && !isDistribution) {
      const description = document.createElement("p");
      description.className = "step-description";
      description.innerHTML = content;
      stepBlock.appendChild(description);
  }

  return stepBlock;
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
  
function scrollToResult() {
  document.getElementById("result-section").scrollIntoView({ behavior: "smooth" });
}

function scrollToSteps() {
  document.getElementById("steps-section").scrollIntoView({ behavior: "smooth" });
}

function kodowanieArytmetyczne(wiadomosc, prawdopodobienstwa, maxBits) {
  let dolny_limit = 0.0;
  let gorny_limit = 1.0;
  
  for (let i = 0; i < wiadomosc.length; i++) {
    let symbol = wiadomosc[i];
    let zakres = gorny_limit - dolny_limit;
  
    gorny_limit = dolny_limit + zakres * prawdopodobienstwa[symbol].gorny;
    dolny_limit = dolny_limit + zakres * prawdopodobienstwa[symbol].dolny;
  }
    
  // Wynik w postaci binarnej
  let binaryResult = "0.";
  let tempDecimal = (dolny_limit + gorny_limit) / 2; 
    
  let binaryArray = []; 
    
  while (tempDecimal > 0 && binaryArray.length < maxBits) { 
    tempDecimal *= 2;
    if (tempDecimal >= 1) {
        binaryArray.push(1);
        tempDecimal -= 1;
    } else {
        binaryArray.push(0);
    }
  }

  // Zaokrąglanie ostatniego bitu do jedynki
  if (binaryArray.length === maxBits) {
    let testArray = [...binaryArray];
    testArray[testArray.length - 1] = 1; 
      
    let testDecimal = 0;
    for (let i = 0; i < testArray.length; i++) {
          testDecimal += testArray[i] * Math.pow(2, -(i + 1));
    }
      
    // Sprawdzenie czy tak zmodyfikowany wynik dalej zmieści się w przedziale
    if (testDecimal >= dolny_limit && testDecimal < gorny_limit) { 
        binaryArray = testArray; 
    }
  }

  binaryResult += binaryArray.join("");


  return binaryResult;
}
  
  