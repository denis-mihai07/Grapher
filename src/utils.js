export const translateLatexFormula = (latexString) => {
  if (!latexString || typeof latexString !== "string") return "";

  const processContent = (content) => {
    return translateLatexFormula(content);
  };

  let result = latexString;

  result = result.replace(/\\left|\\right/g, "");

  let changed;
  do {
    changed = false;

    const fracMatch = result.match(/\\frac\{([^{}]*?)\}\{([^{}]*?)\}/);
    if (fracMatch) {
      const [full, num, den] = fracMatch;
      result = result.replace(
        full,
        `(${processContent(num)})/(${processContent(den)})`
      );
      changed = true;
      continue;
    }

    const sqrtMatch = result.match(/\\sqrt\{([^{}]*?)\}/);
    if (sqrtMatch) {
      const [full, content] = sqrtMatch;
      result = result.replace(full, `sqrt(${processContent(content)})`);
      changed = true;
      continue;
    }

    const expMatch = result.match(/\^\{([^{}]*?)\}/);
    if (expMatch) {
      const [full, content] = expMatch;
      result = result.replace(full, `^(${processContent(content)})`);
      changed = true;
      continue;
    }

    const eExpMatch = result.match(/e\^\{([^{}]*?)\}/);
    if (eExpMatch) {
      const [full, content] = eExpMatch;
      result = result.replace(full, `exp(${processContent(content)})`);
      changed = true;
      continue;
    }

    const absMatch = result.match(/\|([^|]*?)\|/);
    if (absMatch) {
      const [full, content] = absMatch;
      result = result.replace(full, `abs(${processContent(content)})`);
      changed = true;
      continue;
    }
  } while (changed);

  const simpleReplacements = [
    { from: /\\ln\b/g, to: "log" },
    { from: /\\log\b/g, to: "log10" },
    { from: /\\sin\b/g, to: "sin" },
    { from: /\\cos\b/g, to: "cos" },
    { from: /\\tan\b/g, to: "tan" },
    { from: /\\exp\b/g, to: "exp" },
    { from: /\\cdot/g, to: "*" },
    { from: /\\/g, to: "" },
    { from: /\s+/g, to: " " },
  ];

  simpleReplacements.forEach(({ from, to }) => {
    result = result.replace(from, to);
  });

  const fixFunctionParentheses = (str) => {
    const functionPattern =
      /\b(sin|cos|tan|log|log10|ln|exp|sqrt|asin|acos|atan)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;

    return str.replace(functionPattern, (_, funcName, variable) => {
      return `${funcName}(${variable})`;
    });
  };

  result = fixFunctionParentheses(result);

  return result.trim();
};

const defaultGraphicFunctions = [
  "\\frac{1}{x^3 - 3x}",
  "0.25 x^3+0.25 x^2 - 2x",
  "\\sin\\ x\\ \\cdot e^{-0.1x}",
  "\\frac{1}{x-1}\\cdot\\pi",
];

export const getDefaultFunction = () => {
  const random_index = Math.floor(
    Math.random() * defaultGraphicFunctions.length
  );
  return defaultGraphicFunctions[random_index];
};
