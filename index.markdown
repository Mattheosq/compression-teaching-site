---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

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
    <textarea id="probabilities" placeholder="0.1,0.2,0.3,0.4"></textarea>
    <div id="error-probabilities" class="error-message" style="display: none;"></div>
  </div>

  <h2>Ciąg do zakodowania</h2>
  <div class="input-section">
    <textarea id="sequence" placeholder="abc"></textarea>
    <div id="error-sequence" class="error-message" style="display: none;"></div>
  </div>

  <button id="submit-button" class="btn">Zatwierdź</button>

  <div id="error-message" class="error" style="display: none;"></div>

  <div id="result-section" style="display: none; text-align: center;">
    <h2>WYNIK</h2>
  
  <div style="margin: 20px 0;">
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

