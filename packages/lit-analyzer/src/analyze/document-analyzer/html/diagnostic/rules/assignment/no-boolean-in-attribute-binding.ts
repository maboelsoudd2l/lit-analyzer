import { isAssignableToSimpleTypeKind, SimpleTypeKind, toTypeString } from "ts-simple-type";
import { litDiagnosticRuleSeverity } from "../../../../../lit-analyzer-config";
import { HtmlNodeAttrAssignmentKind } from "../../../../../types/html-node/html-node-attr-assignment-types";
import { HtmlNodeAttrKind } from "../../../../../types/html-node/html-node-attr-types";
import { LitHtmlDiagnosticKind } from "../../../../../types/lit-diagnostic";
import { RuleModule } from "../rule-module";
import { isAssignableToType } from "./util/is-assignable-to-type";

const rule: RuleModule = {
	name: "no-boolean-in-attribute-binding",
	visitHtmlAssignment(assignment, { typeA, typeB }, request) {
		if (assignment.kind === HtmlNodeAttrAssignmentKind.BOOLEAN) return;

		const { htmlAttr } = assignment;
		if (htmlAttr.kind !== HtmlNodeAttrKind.ATTRIBUTE) return;

		// Return early if the attribute is like: required=""
		if (typeB.kind === SimpleTypeKind.STRING_LITERAL && typeB.value.length === 0) {
			return;
		}

		if (
			!isAssignableToSimpleTypeKind(typeB, [SimpleTypeKind.ANY, SimpleTypeKind.UNKNOWN], { op: "or" }) &&
			isAssignableToType({ typeA: { kind: SimpleTypeKind.BOOLEAN }, typeB }, request)
		) {
			return [
				{
					kind: LitHtmlDiagnosticKind.EXPRESSION_ONLY_ASSIGNABLE_WITH_BOOLEAN_BINDING,
					severity: litDiagnosticRuleSeverity(request.config, "no-boolean-in-attribute-binding"),
					source: "no-boolean-in-attribute-binding",
					message: `The type '${toTypeString(typeB)}' is a boolean type but you are not using a boolean binding. Change to boolean binding?`,
					location: { document: request.document, ...htmlAttr.location.name },
					htmlAttr,
					typeA,
					typeB
				}
			];
		} else if (
			!isAssignableToSimpleTypeKind(typeA, [SimpleTypeKind.ANY, SimpleTypeKind.UNKNOWN], { op: "or" }) &&
			isAssignableToType(
				{
					typeA: { kind: SimpleTypeKind.BOOLEAN },
					typeB: typeA
				},
				request
			)
		) {
			return [
				{
					kind: LitHtmlDiagnosticKind.EXPRESSION_ONLY_ASSIGNABLE_WITH_BOOLEAN_BINDING,
					severity: litDiagnosticRuleSeverity(request.config, "no-boolean-in-attribute-binding"),
					source: "no-boolean-in-attribute-binding",
					message: `The '${htmlAttr.name}' attribute is of boolean type but you are not using a boolean binding. Change to boolean binding?`,
					location: { document: request.document, ...htmlAttr.location.name },
					htmlAttr,
					typeA,
					typeB
				}
			];
		}

		return;
	}
};

export default rule;