---
layout: default
---
<div class="app-container">
  <h2>Zbiór symboli S</h2>
  <div class="input-section">
    <textarea id="symbols" placeholder="a,b,c,d"></textarea>
    <div id="error-symbols" class="error-message" style="display: none;"></div>
  </div>
  <h2>Zbiór prawdopodobieństw</h2>
  <div class="input-section">
    <textarea id="probabilities" placeholder="0.4,0.3,0.2,0.1"></textarea>
    <div id="error-probabilities" class="error-message" style="display: none;"></div>
  </div>
  <h2>Ciąg do zakodowania</h2>
  <div class="input-section">
    <textarea id="sequence" placeholder="abc"></textarea>
    <div id="error-sequence" class="error-message" style="display: none;"></div>
  </div>
  <button id="submit-button" class="btn">Zatwierdź</button>
  <div id="result-section" style="display: none; text-align: center;">
    <h2>WYNIK</h2>
    <div style="margin: 20px;">
      <h3>Zapis binarny</h3>
      <div id="binary-result" class="result-box"></div>
    </div>
    <div style="margin: 20px 0;">
        <h3>Zapis dziesiętny</h3>
        <div id="decimal-result" class="result-box"></div>
    </div>
    <button id="step-by-step-button" class="btn">Krok po kroku</button>
    <div id="steps-section" style="margin-top: 20px;"></div>
  </div>
</div>

