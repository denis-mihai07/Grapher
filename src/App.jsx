import { useEffect, useState, useMemo } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as math from "mathjs";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { addStyles, EditableMathField } from "react-mathquill";
import translateLatexFormula from "./utils.js";
addStyles();

const math_symbols = {
  R: "\\pmb{\\mathbb{R}}",
  Q: "\\pmb{\\mathbb{Q}}",
  Z: "\\pmb{\\mathbb{Z}}",
  N: "\\pmb{\\mathbb{N}}",
};

function App() {
  const [funcFormula, setFuncFormula] = useState("x");
  const [draftFormula, setDraftFormula] = useState("x");
  const [validFormula, setValidFormula] = useState(true);

  const handleMathChange = (mathField) => {
    setValidFormula(true);
    setDraftFormula(mathField.latex());
  };

  useEffect(() => {
    console.log(draftFormula);
  }, [draftFormula]);

  const clickHandler = (e) => {};

  const submitHandler = (e) => {
    if (e.key === "Enter" && validFormula) {
      setFuncFormula(draftFormula);
    }
  };

  useEffect(() => {
    const functie = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", functie);

    return () => {
      document.removeEventListener("contextmenu", functie);
    };
  }, []);

  const formulaTranslator = useMemo(() => {
    const translatedFormula = translateLatexFormula(funcFormula);
    console.log("f(x) = " + translatedFormula.replace(/\s/g, ""));
    try {
      const compiled = math.compile(translatedFormula);
      setValidFormula(true);
      return compiled;
    } catch (e) {
      console.error("Invalid syntax");
      setFuncFormula("");
      setValidFormula(false);
    }
  }, [funcFormula]);

  const config = {
    contextMenu: false,
    displayModeBar: true,
    displaylogo: false,
    scrollZoom: true,
    doubleClick: "none",
    modeBarButtonsToRemove: [
      "zoom2d",
      "select2d",
      "lasso2d",
      "zoomIn2d",
      "zoomOut2d",
    ],
    // responsive: true,
  };

  const { trace1 } = useMemo(() => {
    const accuracy = 10000;
    const domain = { min: -30, max: 30 };
    const codomain = { min: -15, max: 15 };

    let X = Array.from(
      { length: 2 * accuracy + 1 },
      (_, i) => (i - accuracy) / (accuracy / 30)
    );

    let Y = Array.from({ length: 2 * accuracy + 1 });

    for (let i = 0; i <= accuracy * 2; i++) {
      try {
        const input = X[i];
        const output = formulaTranslator.evaluate({ x: input });
        if (input < domain.min || input > domain.max) throw new Error();
        if (output < codomain.min || output > codomain.max) throw new Error();
        Y[i] = output;
      } catch (e) {
        Y[i] = NaN;
      }
    }

    const trace1 = {
      x: X,
      y: Y,
      type: "scattergl",
      mode: "lines",
      maxpoints: 1000,
      hovertemplate: `x: %{x:.2f}<br>` + "y: %{y:.2f}<extra></extra>",
    };

    return { trace1 };
  }, [funcFormula]);

  const specificPoints = [
    // { x: 0, y: formulaTranslator.evaluate({ x: 0 }) },
    // { x: 2, y: formulaTranslator.evaluate({ x: 2 }) },
  ];

  const trace2 = {
    // x: [0, formulaTranslator.evaluate({ x: 0 })],
    y: [2, 3],
    type: "scatter",
    mode: "markers",
    marker: {
      size: 15,
      color: "red",
      line: { width: 2, color: "DarkRed" },
    },
    name: "Puncte Cheie",
  };

  const data = [trace1];

  const layout = {
    height: 980,
    width: 1890,
    title: "",
    dragmode: "pan",
    margin: {
      t: 20,
      b: 35,
      l: 20,
      r: 20,
    },
    yaxis: {
      range: [-5, 5],
      scaleanchor: "x",
      scaleratio: 1,
      dtick: 1,
      title: "",
      minallowed: -15,
      maxallowed: 15,
    },
    xaxis: {
      range: [-10, 10],
      dtick: 1,
      title: "",
      minallowed: -30,
      maxallowed: 30,
    },
  };

  useEffect(() => {
    Plotly.newPlot("myDiv", data, layout, config);
  }, [funcFormula]);

  return (
    <div className="app_container">
      <div className="input_container cont2">
        <div className="function_logo logo2">
          <InlineMath math={`f : `} />
          <div className="editable">
            <InlineMath math={"[-1, +\\infty)"} />
          </div>
          <InlineMath math={`\\pmb{\\to}`} />
          <div className="editable">
            <InlineMath math={math_symbols.R} />
          </div>
        </div>
        {/* <div className="input">
          <InlineMath math={processedInput ? draftFormula : ""} />
        </div>
        <input
          onChange={inputHandler}
          onKeyDown={submitHandler}
          value={processedInput ? "" : draftFormula}
          type="text"
          id="function"
          name="function"
          style={
            processedInput
              ? { caretColor: "transparent" }
              : { caretColor: "black" }
          }
        ></input> */}
      </div>

      <div className="input_container">
        <div className="function_logo">
          <InlineMath math="f(x):" />
        </div>
        {/* <div className="input">
          <InlineMath math={draftFormula} />
        </div> */}
        {/* <input
          onChange={inputHandler}
          onKeyDown={submitHandler}
          value={processedInput ? "" : draftFormula}
          type="text"
          id="function"
          name="function"
          style={
            processedInput
              ? { caretColor: "transparent" }
              : { caretColor: "black" }
          }
        ></input> */}
        <EditableMathField
          className="math-field"
          latex={draftFormula}
          onChange={handleMathChange}
          onKeyDown={submitHandler}
        />
      </div>

      <div id="myDiv"></div>
    </div>
  );
}

export default App;
