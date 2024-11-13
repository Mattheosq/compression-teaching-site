---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

<div class="app-container">
  <h2>Zbiór symboli S</h2>
  <textarea id="symbols" placeholder="a,b,c,d"></textarea>

  <h2>Zbiór prawdopodobieństw</h2>
  <textarea id="probabilities" placeholder="0.1,0.2,0.3,0.4"></textarea>

  <h2>Ciąg do zakodowania</h2>
  <textarea id="sequence" placeholder="abc"></textarea>

  <button id="submit-button" class="btn">Zatwierdź</button>

  <div id="error-message" class="error" style="display: none;"></div>

  <div id="result-section" style="display: none;">
    <h2>WYNIK</h2>
    <div id="result-box"></div>
    <a href="#" id="step-by-step-link">Krok po kroku</a>
  </div>
</div>

