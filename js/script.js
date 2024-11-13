document.getElementById("submit-button").addEventListener("click", function() {
    const symbolsInput = document.getElementById("symbols").value;
    const probabilitiesInput = document.getElementById("probabilities").value;
    const sequenceInput = document.getElementById("sequence").value;
  
    // Przetworzenie wejściowych danych użytkownika
    const symbols = symbolsInput.split(',').map(s => s.trim());
    const probabilitiesArray = probabilitiesInput.split(',').map(p => parseFloat(p.trim()));
  
    // Walidacja
    if (symbols.length !== probabilitiesArray.length) {
      displayError("Ilość symboli i prawdopodobieństw musi być taka sama.");
      return;
    }
  
    const probabilities = {};
    let sum = 0;
    for (let i = 0; i < symbols.length; i++) {
      const probability = probabilitiesArray[i];
      if (isNaN(probability) || probability <= 0) {
        displayError("Prawdopodobieństwa muszą być liczbami dodatnimi.");
        return;
      }
      probabilities[symbols[i]] = { dolny: sum, gorny: sum + probability };
      sum += probability;
    }
  
    if (Math.abs(sum - 1) > 1e-6) {
      displayError("Prawdopodobieństwa muszą sumować się do 1.");
      return;
    }
  
    const result = kodowanieArytmetyczne(sequenceInput, probabilities);
    displayResult(result);
    scrollToResult();
  });
  
  function displayError(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
  
  function displayResult(result) {
    document.getElementById("result-section").style.display = "block";
    document.getElementById("result-box").textContent = result;
  }
  
  function scrollToResult() {
    document.getElementById("submit-button").scrollIntoView();
  }
  
  function kodowanieArytmetyczne(wiadomosc, prawdopodobienstwa) {
    let dolny_limit = 0.0;
    let gorny_limit = 1.0;
  
    for (let i = 0; i < wiadomosc.length; i++) {
      let symbol = wiadomosc[i];
      let zakres = gorny_limit - dolny_limit;
  
      gorny_limit = dolny_limit + zakres * prawdopodobienstwa[symbol].gorny;
      dolny_limit = dolny_limit + zakres * prawdopodobienstwa[symbol].dolny;
    }
  
    return "0." + znajdzBinarnaLiczbeWPrzedziale(dolny_limit, gorny_limit);
  }
  
  function znajdzBinarnaLiczbeWPrzedziale(dolny_limit, gorny_limit) {
    let binarna_wiadomosc = "";
    let aktualna_wartosc = 0.0;
    let krok = 0.5;
  
    while (krok > 0) {
      if (aktualna_wartosc + krok <= gorny_limit) {
        aktualna_wartosc += krok; 
        binarna_wiadomosc += "1";
      } else {
        binarna_wiadomosc += "0";
      }
      if (aktualna_wartosc >= dolny_limit && aktualna_wartosc <= gorny_limit) {
        break; 
      }
      krok /= 2;
    }
    return binarna_wiadomosc.replace(/0+$/, '');
  }
  