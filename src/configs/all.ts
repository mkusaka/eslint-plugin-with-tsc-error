export function ruleLeveler(level: "error" | "warn" | "off") {
  return {
    rules: {
      "with-tsc-error/all": level,
    },
  };
}

const allErrorRules = ruleLeveler("error");
const allWarnRules = ruleLeveler("warn");

export { allErrorRules, allWarnRules };
