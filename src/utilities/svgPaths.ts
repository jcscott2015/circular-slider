import { angleToPosition, type AngleDescription } from "./circularGeometry";

/**
 * Generates an SVG path string for an arc with rounded ends.
 * The arc is drawn from startAngle to endAngle, with the specified inner radius and thickness.
 * The arc can be drawn in either clockwise (cw) or counterclockwise (ccw) direction.
 *
 * @param {Object} opts - Options for the arc path.
 * @param {number} opts.startAngle - The starting angle of the arc in degrees.
 * @param {number} opts.endAngle - The ending angle of the arc in degrees.
 * @param {AngleDescription} opts.angleType - The type of angle description (e.g., axis orientation).
 * @param {number} opts.innerRadius - The inner radius of the arc.
 * @param {number} opts.thickness - The thickness of the arc.
 * @param {number} opts.svgSize - The size of the SVG canvas.
 * @param {"cw" | "ccw"} opts.direction - The direction of the arc (clockwise or counterclockwise).
 * @returns {string} - An SVG path string representing the arc with rounded ends.
 */
export function arcPathWithRoundedEnds(opts: {
  startAngle: number;
  endAngle: number;
  angleType: AngleDescription;
  innerRadius: number;
  thickness: number;
  svgSize: number;
  direction: "cw" | "ccw";
}): string {
  const { startAngle, innerRadius, thickness, direction, angleType, svgSize } =
    opts;
  let { endAngle } = opts;

  if (startAngle % 360 === endAngle % 360 && startAngle !== endAngle) {
    // Drawing a full circle, slightly offset end angle
    // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
    endAngle = endAngle - 0.001;
  }
  const largeArc = endAngle - startAngle >= 180;
  const outerRadius = innerRadius + thickness;

  const innerArcStart = angleToPosition(
    { degree: startAngle, ...angleType },
    innerRadius,
    svgSize
  );
  const startPoint = `
    M ${innerArcStart.x},${innerArcStart.y}
  `;

  const innerArcEnd = angleToPosition(
    { degree: endAngle, ...angleType },
    innerRadius,
    svgSize
  );
  const innerArc = `
    A ${innerRadius} ${innerRadius} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "1" : "0"}
      ${innerArcEnd.x} ${innerArcEnd.y}
  `;

  const outerArcStart = angleToPosition(
    { degree: endAngle, ...angleType },
    outerRadius,
    svgSize
  );
  const firstButt = `
    A ${thickness / 2} ${thickness / 2} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${outerArcStart.x} ${outerArcStart.y}
  `;

  const outerArcEnd = angleToPosition(
    { degree: startAngle, ...angleType },
    outerRadius,
    svgSize
  );
  const outerArc = `
    A ${outerRadius} ${outerRadius} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${outerArcEnd.x} ${outerArcEnd.y}
  `;

  const secondButt = `
    A ${thickness / 2} ${thickness / 2} 0
      ${largeArc ? "1" : "0"}
      ${direction === "cw" ? "0" : "1"}
      ${innerArcStart.x} ${innerArcStart.y}
  `;

  return startPoint + innerArc + firstButt + outerArc + secondButt + " Z";
}
