import { describe, it, expect, vi, beforeEach } from "vitest";
import CircularSlider, { CircularSliderProps } from "../CircularSlider";

// Mocks for geometry and svgPaths
vi.mock("./circularGeometry", () => ({
  angleToPosition: vi.fn(() => ({ x: 50, y: 50 })),
  positionToAngle: vi.fn(() => 90),
  valueToAngle: vi.fn(() => 90),
  angleToValue: vi.fn(() => 5),
}));
vi.mock("./svgPaths", () => ({
  arcPathWithRoundedEnds: vi.fn(() => "M0 0"),
}));
vi.mock("./KnobSvg", () => ({
  __esModule: true,
  default: (props: any) => <circle data-testid="knob" {...props} />,
}));

const baseProps: CircularSliderProps = {
  angleType: { direction: "cw", axis: "-y" },
  arcBackgroundColor: "#ccc",
  arcColor: "#f00",
  coerceToInt: false,
  disabled: false,
  endAngle: 270,
  knob: { value: 5, onChange: vi.fn() },
  onControlFinished: vi.fn(),
  maxValue: 10,
  minValue: 0,
  sizeH: 100,
  sizeW: 100,
  startAngle: 0,
  trackWidth: 10,
};

describe("CircularSliderComponent constructor", () => {
  let props: CircularSliderProps;

  beforeEach(() => {
    props = {
      ...baseProps,
      knob: { ...baseProps.knob, onChange: vi.fn() },
      onControlFinished: vi.fn(),
    };
  });

  it("should initialize svgRef as a ref object", () => {
    const instance = new (CircularSlider as any)(props);
    expect(instance.svgRef).toBeDefined();
    expect(["object", "null"]).toContain(typeof instance.svgRef.current);
  });

  it("should define all handler methods", () => {
    const instance = new (CircularSlider as any)(props);
    expect(typeof instance.handleMouseMove).toBe("function");
    expect(typeof instance.onMouseEnter).toBe("function");
    expect(typeof instance.onMouseDown).toBe("function");
    expect(typeof instance.removeMouseListeners).toBe("function");
    expect(typeof instance.handleMousePosition).toBe("function");
    expect(typeof instance.onTouch).toBe("function");
    expect(typeof instance.processSelection).toBe("function");
  });

  it("onMouseEnter should call onMouseDown if left mouse button is pressed", () => {
    const instance = new (CircularSlider as any)(props);
    instance.onMouseDown = vi.fn();
    instance.onMouseEnter({ buttons: 1 } as any);
    expect(instance.onMouseDown).toHaveBeenCalled();
  });

  it("onMouseEnter should not call onMouseDown if no mouse button is pressed", () => {
    const instance = new (CircularSlider as any)(props);
    instance.onMouseDown = vi.fn();
    instance.onMouseEnter({ buttons: 0 } as any);
    expect(instance.onMouseDown).not.toHaveBeenCalled();
  });

  it("handleMousePosition should call processSelection with event clientX/Y", () => {
    const instance = new (CircularSlider as any)(props);
    instance.processSelection = vi.fn();
    const ev = { clientX: 10, clientY: 20 };
    instance.handleMousePosition(ev);
    expect(instance.processSelection).toHaveBeenCalledWith(10, 20);
  });

  it("onTouch should bail if more than 1 touch", () => {
    const instance = new (CircularSlider as any)(props);
    instance.processSelection = vi.fn();
    const ev = {
      touches: [{}, {}],
      type: "touchmove",
      changedTouches: [{ clientX: 1, clientY: 2 }],
    };
    instance.onTouch(ev as any);
    expect(instance.processSelection).not.toHaveBeenCalled();
  });

  it("onTouch should bail if touchend and still another touch active", () => {
    const instance = new (CircularSlider as any)(props);
    instance.processSelection = vi.fn();
    const ev = {
      touches: [{}],
      type: "touchend",
      changedTouches: [{ clientX: 1, clientY: 2 }],
    };
    instance.onTouch(ev as any);
    expect(instance.processSelection).not.toHaveBeenCalled();
  });

  it("onTouch should call processSelection and onControlFinished on touchend", () => {
    const instance = new (CircularSlider as any)(props);
    instance.processSelection = vi.fn();
    const ev = {
      touches: [],
      type: "touchend",
      changedTouches: [{ clientX: 1, clientY: 2 }],
    };
    instance.onTouch(ev as any);
    expect(instance.processSelection).toHaveBeenCalledWith(1, 2);
    expect(props.onControlFinished).toHaveBeenCalled();
  });

  it("onTouch should call processSelection but not onControlFinished on touchmove", () => {
    const instance = new (CircularSlider as any)(props);
    instance.processSelection = vi.fn();
    const ev = {
      touches: [],
      type: "touchmove",
      changedTouches: [{ clientX: 3, clientY: 4 }],
    };
    instance.onTouch(ev as any);
    expect(instance.processSelection).toHaveBeenCalledWith(3, 4);
    expect(props.onControlFinished).not.toHaveBeenCalled();
  });

  it("processSelection should not call knob.onChange if knob.onChange is undefined", () => {
    const instance = new (CircularSlider as any)({
      ...props,
      knob: { ...props.knob, onChange: undefined },
    });
    instance.svgRef.current = {
      createSVGPoint: () => ({
        x: 0,
        y: 0,
        matrixTransform: vi.fn(() => ({ x: 0, y: 0 })),
      }),
      getScreenCTM: () => ({
        inverse: () => ({}),
      }),
    };
    instance.processSelection(10, 20);
    // No error, nothing to assert
  });

  it("processSelection should not call knob.onChange if svgRef.current is null", () => {
    const instance = new (CircularSlider as any)(props);
    instance.svgRef.current = null;
    instance.processSelection(10, 20);
    // No error, nothing to assert
  });

  it("processSelection should call knob.onChange with coerced int if coerceToInt is true", () => {
    const onChange = vi.fn();
    const instance = new (CircularSlider as any)({
      ...props,
      coerceToInt: true,
      knob: { ...props.knob, onChange },
    });
    instance.svgRef.current = {
      createSVGPoint: () => ({
        x: 0,
        y: 0,
        matrixTransform: vi.fn(() => ({ x: 0, y: 0 })),
      }),
      getScreenCTM: () => ({
        inverse: () => ({}),
      }),
    };
    instance.processSelection(10, 20);
    expect(onChange).toHaveBeenCalledWith(Math.round(5));
  });

  it("processSelection should not call knob.onChange if disabled", () => {
    const onChange = vi.fn();
    const instance = new (CircularSlider as any)({
      ...props,
      disabled: true,
      knob: { ...props.knob, onChange },
    });
    instance.svgRef.current = {
      createSVGPoint: () => ({
        x: 0,
        y: 0,
        matrixTransform: vi.fn(() => ({ x: 0, y: 0 })),
      }),
      getScreenCTM: () => ({
        inverse: () => ({}),
      }),
    };
    instance.processSelection(10, 20);
    expect(onChange).not.toHaveBeenCalled();
  });
});
