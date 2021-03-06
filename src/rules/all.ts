import { RuleFixer } from "@typescript-eslint/experimental-utils/dist/ts-eslint";
import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import ts from "typescript";
import { compare } from "compare-versions";

const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

type CommentVariables = "ts-ignore" | "ts-expect-error";
// ts 3.9 introduce ts-expect-error comment.
// @see https://devblogs.microsoft.com/typescript/announcing-typescript-3-9-beta/
const defaultType: CommentVariables = compare(ts.versionMajorMinor, "3.9", ">=") ? "ts-expect-error" : "ts-ignore";

type SchemaType = {
  tsCommentType: CommentVariables;
  reportOnly: boolean;
};

const defaultOptions: SchemaType = {
  tsCommentType: defaultType,
  reportOnly: false,
};

export const all = createRule<[SchemaType], "message">({
  name: "all",
  meta: {
    type: "suggestion",
    docs: {
      description: "show tsc error plugin.",
      category: "Best Practices",
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      // see: https://eslint.org/docs/developer-guide/working-with-rules#using-message-placeholders
      message: "{{ message }}",
    },
    schema: [
      {
        type: "object",
        properties: {
          tsCommentType: {
            type: "string",
            enum: ["ts-ignore", "ts-expect-error"],
          },
          reportOnly: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: "code",
  },
  defaultOptions: [defaultOptions],
  create(context, [options]) {
    const { program } = ESLintUtils.getParserServices(context);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const emitResults = program.emit(undefined, () => {});
    const allDiagnostics = [
      ...ts.getPreEmitDiagnostics(program, program.getSourceFile(context.getFilename())),
      ...emitResults.diagnostics,
    ];

    return {
      "Program:exit": function () {
        allDiagnostics.forEach((diagnostic) => {
          if (diagnostic.file) {
            const { line: startLine, character: startCharacter } = diagnostic.file.getLineAndCharacterOfPosition(
              diagnostic.start!
            );
            const { line: endLine, character: endCharacter } = diagnostic.file.getLineAndCharacterOfPosition(
              diagnostic.start! + diagnostic.length!
            );
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            const firstOfLineToken = diagnostic.file.getPositionOfLineAndCharacter(startLine, 0);
            const { reportOnly } = options;
            // eslint line loc and ts line loc has difference.
            // should we use tsNodeToESTreeNodeMap?
            const esStartLine = startLine + 1;
            const esEndLine = endLine + 1;
            // TODO: filter error via typescript error codes.
            context.report({
              loc: {
                start: {
                  line: esStartLine,
                  column: startCharacter,
                },
                end: {
                  line: esEndLine,
                  column: endCharacter,
                },
              },
              messageId: "message",
              data: {
                message,
              },
              fix: (() => {
                if (reportOnly) {
                  return null;
                }
                return (fixer: RuleFixer) => {
                  const { tsCommentType = "ts-ignore" } = options;
                  const comment = `/** ${message} */
// @${tsCommentType} with above original error.
`;
                  return fixer.insertTextBeforeRange([firstOfLineToken, firstOfLineToken], comment);
                };
              })(),
            });
          }
        });
      },
    };
  },
});
