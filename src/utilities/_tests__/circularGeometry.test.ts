import { describe, it, expect } from "vitest";
import {
  angleToValue,
  valueToAngle,
  angleToPosition,
  positionToAngle,
  AngleWithDescription,
  AngleDescription,
} from "../circularGeometry";

describe("angleToValue", () => {
  it("returns minValue if angle < startAngle", () => {
    expect(
      angleToValue({
        angle: 10,
        minValue: 0,
        maxValue: 100,
        startAngle: 20,
        endAngle: 100,
      })
    ).toBe(0);
  });

  it("returns maxValue if angle > endAngle", () => {
    expect(
      angleToValue({
        angle: 120,
        minValue: 0,
        maxValue: 100,
        startAngle: 20,
        endAngle: 100,
      })
    ).toBe(100);
  });

  it("returns interpolated value for angle within range", () => {
    expect(
      angleToValue({
        angle: 60,
        minValue: 0,
        maxValue: 100,
        startAngle: 20,
        endAngle: 100,
      })
    ).toBeCloseTo(50);
  });

  it("throws if endAngle <= startAngle", () => {
    expect(() =>
      angleToValue({
        angle: 50,
        minValue: 0,
        maxValue: 100,
        startAngle: 100,
        endAngle: 100,
      })
    ).toThrow();
  });
});

describe("valueToAngle", () => {
  it("returns startAngle for minValue", () => {
    expect(
      valueToAngle({
        value: 0,
        minValue: 0,
        maxValue: 100,
        startAngle: 30,
        endAngle: 90,
      })
    ).toBe(30);
  });

  it("returns endAngle for maxValue", () => {
    expect(
      valueToAngle({
        value: 100,
        minValue: 0,
        maxValue: 100,
        startAngle: 30,
        endAngle: 90,
      })
    ).toBe(90);
  });

  it("returns interpolated angle for value within range", () => {
    expect(
      valueToAngle({
        value: 50,
        minValue: 0,
        maxValue: 100,
        startAngle: 30,
        endAngle: 90,
      })
    ).toBeCloseTo(60);
  });

  it("throws if endAngle <= startAngle", () => {
    expect(() =>
      valueToAngle({
        value: 50,
        minValue: 0,
        maxValue: 100,
        startAngle: 90,
        endAngle: 30,
      })
    ).toThrow();
  });
});

describe("angleToPosition", () => {
  const svgSize = 200;
  const radius = 50;

  it("returns correct position for 0deg (+x axis)", () => {
    const angle: AngleWithDescription = {
      degree: 0,
      direction: "ccw",
      axis: "+x",
    };
    const pos = angleToPosition(angle, radius, svgSize);
    expect(pos.x).toBeCloseTo(svgSize / 2 + radius);
    expect(pos.y).toBeCloseTo(svgSize / 2);
  });

  it("returns correct position for 90deg (+y axis)", () => {
    const angle: AngleWithDescription = {
      degree: 90,
      direction: "ccw",
      axis: "+x",
    };
    const pos = angleToPosition(angle, radius, svgSize);
    expect(pos.x).toBeCloseTo(svgSize / 2);
    expect(pos.y).toBeCloseTo(svgSize / 2 - radius);
  });

  it("returns correct position for 180deg (-x axis)", () => {
    const angle: AngleWithDescription = {
      degree: 180,
      direction: "ccw",
      axis: "+x",
    };
    const pos = angleToPosition(angle, radius, svgSize);
    expect(pos.x).toBeCloseTo(svgSize / 2 - radius);
    expect(pos.y).toBeCloseTo(svgSize / 2);
  });

  it("returns correct position for 270deg (-y axis)", () => {
    const angle: AngleWithDescription = {
      degree: 270,
      direction: "ccw",
      axis: "+x",
    };
    const pos = angleToPosition(angle, radius, svgSize);
    expect(pos.x).toBeCloseTo(svgSize / 2);
    expect(pos.y).toBeCloseTo(svgSize / 2 + radius);
  });
});

describe("positionToAngle", () => {
  const svgSize = 200;
  const center = svgSize / 2;
  const radius = 50;

  const angleType: AngleDescription = { direction: "ccw", axis: "+x" };

  it("returns 0deg for position on +x axis", () => {
    const pos = { x: center + radius, y: center };
    expect(positionToAngle(pos, svgSize, angleType)).toBeCloseTo(0);
  });

  it("returns 90deg for position on +y axis", () => {
    const pos = { x: center, y: center - radius };
    expect(positionToAngle(pos, svgSize, angleType)).toBeCloseTo(90);
  });

  it("returns 180deg for position on -x axis", () => {
    const pos = { x: center - radius, y: center };
    expect(positionToAngle(pos, svgSize, angleType)).toBeCloseTo(180);
  });

  it("returns 270deg for position on -y axis", () => {
    const pos = { x: center, y: center + radius };
    expect(positionToAngle(pos, svgSize, angleType)).toBeCloseTo(270);
  });
});
