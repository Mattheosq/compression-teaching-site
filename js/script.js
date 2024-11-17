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
        displayError(probabilitiesInput, "Prawdopodobieństwa muszą być liczbami dodatnimi.");
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
    // Pobranie precyzji od użytkownika
    //const maxBits = parseInt(document.getElementById("binary-precision").value, 10) || 8;
  
    // const { binary, decimal } = kodowanieArytmetyczne(sequenceValue, probabilities, maxBits, maxDigits);
    // displayResult(binary, decimal);
    // scrollToResult();
    // Ustawienie globalnych zmiennych
    window.currentSymbols = symbols;
    window.currentProbabilities = probabilities;
    window.currentSequence = sequenceValue;

    // Wywołanie funkcji aktualizacji wyników
    updateResults();

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

    displayResult(binary, decimalFromBinary);
}

  // Event listener dla zmiany precyzji
  document.getElementById("binary-precision").addEventListener("input", updateResults);

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
  
  function displayResult(binaryResult, decimalResult) {
    document.getElementById("result-section").style.display = "block";
    document.getElementById("binary-result").textContent = binaryResult;
    document.getElementById("decimal-result").textContent = decimalResult;
}
  
  function scrollToResult() {
    document.getElementById("result-section").scrollIntoView({ behavior: "smooth" });
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
    // Wynik w postaci dziesiętnej
    //const decimalResult = (dolny_limit + gorny_limit) / 2;
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
      
      //let testBinary = "0." + testArray.join("");
      let testDecimal = 0;
      for (let i = 0; i < testArray.length; i++) {
          testDecimal += testArray[i] * Math.pow(2, -(i + 1));
      }
    
      if (testDecimal >= dolny_limit && testDecimal < gorny_limit) { // Sprawdzenie czy tak zmodyfikowany wynik dalej zmieści się w przedziale
          binaryArray = testArray; 
      }
    }

    binaryResult += binaryArray.join("");


    return binaryResult;
  }
  
  