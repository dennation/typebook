import { describe, expect, test } from "vitest";
import { classifyPropGroup } from "../propGroup";

describe("classifyPropGroup", () => {
	test("ARIA: role and aria-* → aria", () => {
		expect(classifyPropGroup("role")).toBe("aria");
		expect(classifyPropGroup("aria-label")).toBe("aria");
		expect(classifyPropGroup("aria-hidden")).toBe("aria");
	});

	test("events → their DOM category", () => {
		expect(classifyPropGroup("onClick")).toBe("event:mouse");
		expect(classifyPropGroup("onKeyDown")).toBe("event:keyboard");
		expect(classifyPropGroup("onFocus")).toBe("event:focus");
		expect(classifyPropGroup("onChange")).toBe("event:form");
		expect(classifyPropGroup("onPlay")).toBe("event:media");
		expect(classifyPropGroup("onLoad")).toBe("event:image");
		expect(classifyPropGroup("onAnimationEnd")).toBe("event:animation");
		expect(classifyPropGroup("onDrop")).toBe("event:drag");
	});

	test("capture-phase twins → capture", () => {
		expect(classifyPropGroup("onClickCapture")).toBe("capture");
		expect(classifyPropGroup("onChangeCapture")).toBe("capture");
		// double-Capture twin of a pointer-capture event
		expect(classifyPropGroup("onGotPointerCaptureCapture")).toBe("capture");
	});

	test("pointer-capture events are pointer, NOT capture (name ends in Capture)", () => {
		expect(classifyPropGroup("onGotPointerCapture")).toBe("event:pointer");
		expect(classifyPropGroup("onLostPointerCapture")).toBe("event:pointer");
	});

	test("global / element / svg attributes", () => {
		expect(classifyPropGroup("id")).toBe("global");
		expect(classifyPropGroup("tabIndex")).toBe("global");
		expect(classifyPropGroup("disabled")).toBe("element");
		expect(classifyPropGroup("placeholder")).toBe("element");
		expect(classifyPropGroup("strokeWidth")).toBe("svg");
	});

	test("microdata / rdfa / react / data", () => {
		expect(classifyPropGroup("itemProp")).toBe("microdata");
		expect(classifyPropGroup("typeof")).toBe("rdfa");
		expect(classifyPropGroup("ref")).toBe("react");
		expect(classifyPropGroup("children")).toBe("react");
		expect(classifyPropGroup("data-testid")).toBe("data");
	});

	test("unrecognised names (a component's own props) → undefined", () => {
		expect(classifyPropGroup("variant")).toBeUndefined();
		expect(classifyPropGroup("isLoading")).toBeUndefined();
		expect(classifyPropGroup("leftIcon")).toBeUndefined();
		// a custom callback matches on* but isn't a DOM event
		expect(classifyPropGroup("onValueChange")).toBeUndefined();
	});
});
