# Interaktywne Kompendium Regresji Liniowej

Dedykowana aplikacja edukacyjna łącząca rygorystyczne wyprowadzenia matematyczne z interaktywnymi symulatorami wizualnymi.

## Szybkie Uruchomienie

Aplikacja jest w pełni samodzielna (standalone) i nie wymaga instalacji dodatkowych paczek. Wystarczy otworzyć plik `index.html` w dowolnej nowoczesnej przeglądarce:

```bash
open index.html
```

Lub uruchomić lokalny serwer HTTP:

```bash
python3 -m http.server 8000
# Otwórz w przeglądarce: http://localhost:8000
```

---

## Zawartość Merytoryczna & Moduły

1. **Intuicja Geometryczna i Sformułowanie Problemu**:
   - Wyraz wolny $\beta_0$, współczynnik kierunkowy $\beta_1$, składnik losowy $\varepsilon_i$ vs reszta $e_i$.
   - Interaktywny wykres z suwakami, kreskami reszt i dynamicznym licznikiem $RSS$, $MSE$, $MAE$.
   - Przycisk animowanego dopasowania optymalnego OLS.

2. **Matematyczne Wyprowadzenie OLS & Postać Macierzowa**:
   - Dlaczego minimalizujemy kwadraty reszt (różniczkowalność, MLE, jednoznaczność).
   - Wyprowadzenie układu równań normalnych dla prostej regresji ($\hat{\beta}_1 = \frac{\mathrm{Cov}(X,Y)}{\mathrm{Var}(X)}$).
   - Postać macierzowa dla wielu zmiennych: $\hat{\boldsymbol{\beta}} = (\mathbf{X}^T\mathbf{X})^{-1} \mathbf{X}^T\mathbf{y}$.
   - Żywy kalkulator macierzowy przeliczający macierze $\mathbf{X}, \mathbf{X}^T, \mathbf{X}^T\mathbf{X}, (\mathbf{X}^T\mathbf{X})^{-1}$ w KaTeX.

3. **Powierzchnia Kosztu & Spadek Wzdłuż Gradientu (Gradient Descent)**:
   - Dlaczego w Big Data stosujemy podejście numeryczne ($O(p^3)$ vs $O(k \cdot n \cdot p)$).
   - Interaktywny symulator ze zsynchronizowaną mapą poziomic 2D i wykresem regresji.
   - Kontrola Learning Rate $\alpha$, tryb krokowy, animacja i licznik kosztu $J$.

4. **Założenia Gaussa-Markowa & Twierdzenie BLUE**:
   - 5 założeń klasycznego modelu (liniowość, egzogeniczność, homoskedastyczność, brak autokorelacji, brak współliniowości).
   - Twierdzenie o najlepszym nieobciążonym estymatorze liniowym (BLUE).
   - Laboratorium diagnostyki reszt: 5 scenariuszy anomalii (heteroskedastyczność, nieliniowość, autokorelacja, wysoka dźwignia), równoległe wykresy danych, reszt $e_i$ vs $\hat{y}_i$ oraz Normal Q-Q Plot.

5. **Miary Jakości Dopasowania & Kwartet Anscombe'a**:
   - Dekompozycja wariancji: $TSS = ESS + RSS$.
   - $R^2$, skorygowany $R^2_{adj}$, $MSE$, $RMSE$, $MAE$.
   - Interaktywny eksplorator Kwartetu Anscombe'a (1973) pokazujący 4 zbiory o identycznych statystykach, lecz odmiennej naturze.

6. **Wnioskowanie Statystyczne: Pasy Ufności & Predykcji**:
   - Błędy standardowe $SE(\hat{\beta}_0)$, $SE(\hat{\beta}_1)$, statystyka $t$ i $p$-value.
   - Matematyczna różnica między Pasem Ufności (dla wartości oczekiwanej $\mathbb{E}[Y|X]$) a Pasem Predykcji (dla nowej obserwacji $Y_0$).
   - Interaktywny suwak poziomu istotności i wykres wstęg hiperbolicznych.

7. **Regularyzacja: Ridge (L2) vs Lasso (L1)**:
   - Problem multikolinearności i przeuczenia w wysokich wymiarach.
   - Matematyka i geometria Ridge vs Lasso.
   - Suwak kary $\lambda$ z wykresem ścieżki wag pokazującym wygaszanie cech do zera w Lasso.

8. **Interaktywny Sandbox (Płótno HTML5 Canvas)**:
   - Dodawanie punktów lewym przyciskiem myszy, usuwanie prawym, przeciąganie w czasie rzeczywistym.
   - Analiza punktów o wysokiej dźwigni (leverage).
   - Generator gotowego kodu w Pythonie (`scikit-learn` i `statsmodels`).

9. **Interaktywny Quiz Sprawdzający Wiedzę**:
   - 6 pytań wielokrotnego wyboru testujących intuicję, własności statystyczne i pułapki teoretyczne.

10. **Kompendium Wzorów & Ekosystem Pythona**:
    - Syntetyczna ściąga wzorów analitycznych i macierzowych.
    - Zestawienie bibliotek: `statsmodels`, `scikit-learn`, `numpy`.
