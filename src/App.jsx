import { useEffect, useState, useMemo } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as math from "mathjs";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { addStyles, EditableMathField } from "react-mathquill";
import { translateLatexFormula, getDefaultFunction } from "./utils.js";
addStyles();

const math_symbols = {
  R: "\\pmb{\\mathbb{R}}",
  Q: "\\pmb{\\mathbb{Q}}",
  Z: "\\pmb{\\mathbb{Z}}",
  N: "\\pmb{\\mathbb{N}}",
};

const defaultFunction = getDefaultFunction();

function App() {
  const [funcFormula, setFuncFormula] = useState(defaultFunction);
  const [draftFormula, setDraftFormula] = useState(defaultFunction);
  const [validFormula, setValidFormula] = useState(true);
  const [validImage, setValidImage] = useState(true);
  const [windowSize, setWindowSize] = useState({
    windowWidth:
      typeof window.innerWidth !== "undefined" ? window.innerWidth : 0,
    windowHeight:
      typeof window.innerHeight !== "undefined" ? window.innerHeight : 0,
  });

  // Handlers
  const handleMathChange = (mathField) => {
    setValidFormula(true);
    setDraftFormula(mathField.latex());
  };

  // useEffect(() => {
  //   console.log(draftFormula);
  // }, [draftFormula]);

  useEffect(() => {
    console.log("formula e: " + validFormula);
  }, [funcFormula]);

  const clickErrorHandler = () => {
    setValidFormula(true);
    setValidImage(true);
  };

  const submitHandler = (e) => {
    if (e.key === "Enter" && validFormula) {
      setFuncFormula(draftFormula);
      setValidFormula(true);
      setValidImage(true);
    }
  };

  useEffect(() => {
    let timeout;
    if (!validFormula || !validImage) {
      timeout = setTimeout(() => {
        setValidFormula(true);
        setValidImage(true);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [validFormula, validImage]);

  // Use Effect default (for event listeners)
  useEffect(() => {
    const preventDefaultHandler = (e) => {
      e.preventDefault();
    };

    const resizeWindowHandler = () => {
      setWindowSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    };

    document.addEventListener("contextmenu", preventDefaultHandler);
    document.addEventListener("resize", resizeWindowHandler);

    return () => {
      document.removeEventListener("contextmenu", preventDefaultHandler);
      document.removeEventListener("resize", resizeWindowHandler);
    };
  }, []);

  useEffect(() => {
    console.log(windowSize.windowHeight, windowSize.windowWidth);
  }, [windowSize]);

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
    responsive: true,
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
    let validFunction = false,
      validImage = false;

    for (let i = 0; i <= accuracy * 2; i++) {
      try {
        const input = X[i];
        const output = formulaTranslator.evaluate({ x: input });
        validFunction = true;
        if (input < domain.min || input > domain.max) throw new Error();
        if (output < codomain.min || output > codomain.max) throw new Error();
        validImage = true;
        Y[i] = output;
      } catch (e) {
        Y[i] = NaN;
      }
    }

    if (!validFunction) setValidFormula(false);
    else if (!validImage) setValidImage(false);

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
    name: "Puncte",
  };

  const data = [trace1];

  const layout = {
    height: windowSize.windowHeight - 20,
    width: windowSize.windowWidth - 20,
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
      rangemode: "tozero",
      rangemin: 0,
    },
    responsive: true,
  };

  useEffect(() => {
    Plotly.newPlot("myDiv", data, layout, config);
  }, [funcFormula]);

  return (
    <div className="app_container">
      {windowSize.windowWidth > 1024 && (
        <div className="input_container cont2">
          <div className="function_logo logo2">
            <InlineMath math={`f : `} />
            <div className="editable">
              <InlineMath math={math_symbols.R} />
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
      )}

      <div className="input_container">
        <div className="formula_container">
          <div className="function_logo">
            <InlineMath math="f(x):" />
          </div>
          <EditableMathField
            className="math-field"
            latex={draftFormula}
            onChange={handleMathChange}
            onKeyDown={submitHandler}
          />
        </div>
      </div>
      {!validFormula && (
        <div className="error_container" onClick={clickErrorHandler}>
          <div className="error_title">Error: Invalid Syntax</div>
          <div className="error_subtitle">Provide a valid function.</div>
          <div className="error_info">Click to remove</div>
        </div>
      )}
      {!validImage && validFormula && (
        <div
          className="error_container"
          onClick={clickErrorHandler}
          style={{ height: "5.5rem" }}
        >
          <div className="error_title">Error: Y-Axis Limit Exceeded</div>
          <div className="error_subtitle">
            View Range: &nbsp;
            <InlineMath math={"f(x) \\in [-15, +15]"} />
          </div>
          <div className="error_info">Click to remove</div>
        </div>
      )}
      <div id="myDiv"></div>
    </div>
  );
}

export default App;
