export type AngleDescription = {
  direction: "cw" | "ccw";
  axis: "+x" | "-x" | "+y" | "-y";
};

export type AngleWithDescription = {
  degree: number;
} & AngleDescription;

/**
 * Converts a given angle to a corresponding value within a specified range.
 *
 * The function maps an angle within the interval [`startAngle`, `endAngle`] to a value
 * within the interval [`minValue`, `maxValue`]. If the angle is less than `startAngle`,
 * it returns `minValue`. If the angle is greater than `endAngle`, it returns `maxValue`.
 * Otherwise, it linearly interpolates the value based on the angle's position between
 * `startAngle` and `endAngle`.
 *
 * @param params - The parameters for the conversion.
 * @param params.angle - The angle to convert.
 * @param params.minValue - The minimum value of the output range.
 * @param params.maxValue - The maximum value of the output range.
 * @param params.startAngle - The starting angle of the input range.
 * @param params.endAngle - The ending angle of the input range. Must be greater than `startAngle`.
 * @returns The value corresponding to the given angle within the specified range.
 * @throws If `endAngle` is less than or equal to `startAngle`.
 */
export function angleToValue(params: {
  angle: number;
  minValue: number;
  maxValue: number;
  startAngle: number;
  endAngle: number;
}) {
  const { angle, minValue, maxValue, startAngle, endAngle } = params;
  if (endAngle <= startAngle) {
    // math assumes endAngle > startAngle
    throw new Error("endAngle must be greater than startAngle");
  }

  if (angle < startAngle) {
    return minValue;
  } else if (angle > endAngle) {
    return maxValue;
  } else {
    const ratio = (angle - startAngle) / (endAngle - startAngle);
    const value = ratio * (maxValue - minValue) + minValue;
    return value;
  }
}

/**
 * Converts a numeric value within a specified range to a corresponding angle
 * between a given start and end angle. The conversion is linear, mapping
 * `minValue` to `startAngle` and `maxValue` to `endAngle`.
 *
 * @param params - An object containing the following properties:
 * @param params.value - The value to convert to an angle.
 * @param params.minValue - The minimum value of the range.
 * @param params.maxValue - The maximum value of the range.
 * @param params.startAngle - The angle corresponding to `minValue` (in degrees).
 * @param params.endAngle - The angle corresponding to `maxValue` (in degrees). Must be greater than `startAngle`.
 * @returns The angle (in degrees) corresponding to the given value.
 * @throws Will throw an error if `endAngle` is not greater than `startAngle`.
 */
export function valueToAngle(params: {
  value: number;
  minValue: number;
  maxValue: number;
  startAngle: number;
  endAngle: number;
}) {
  const { value, minValue, maxValue, startAngle, endAngle } = params;
  if (endAngle <= startAngle) {
    // math assumes endAngle > startAngle
    throw new Error("endAngle must be greater than startAngle");
  }
  const ratio = (value - minValue) / (maxValue - minValue);
  const angle = ratio * (endAngle - startAngle) + startAngle;
  return angle;
}

/**
 * Converts an angle from one angular description to another, accounting for direction and axis.
 *
 * @param degree - The angle in degrees to convert.
 * @param from - The original angle description, specifying direction and axis.
 * @param to - The target angle description, specifying direction and axis. Defaults to `{ direction: "ccw", axis: "+x" }` if not provided.
 * @returns The converted angle in degrees.
 * @throws {Error} If the conversion combination is unhandled.
 *
 * @example
 * ```typescript
 * const angle = convertAngle(90, { direction: "ccw", axis: "+x" }, { direction: "cw", axis: "-y" });
 * ```
 */
function convertAngle(
  degree: number,
  from: AngleDescription,
  to?: AngleDescription
) {
  to = to || { direction: "ccw", axis: "+x" };

  if (from.direction !== to.direction) {
    degree = degree === 0 ? 0 : 360 - degree;
  }

  if (from.axis === to.axis) {
    // e.g. +x to +x
    return degree;
  }

  if (from.axis[1] === to.axis[1]) {
    // e.g. +x to -x
    return (180 + degree) % 360;
  }

  switch (to.direction + from.axis + to.axis) {
    case "ccw+x-y":
    case "ccw-x+y":
    case "ccw+y+x":
    case "ccw-y-x":
    case "cw+y-x":
    case "cw-y+x":
    case "cw-x-y":
    case "cw+x+y":
      return (90 + degree) % 360;
    case "ccw+y-x":
    case "ccw-y+x":
    case "ccw+x+y":
    case "ccw-x-y":
    case "cw+x-y":
    case "cw-x+y":
    case "cw+y+x":
    case "cw-y-x":
      return (270 + degree) % 360;
    default:
      // This is impossible, just for TS
      throw new Error("Unhandled conversion");
  }
}

/**
 * Converts a given angle and radius to an (x, y) position within an SVG coordinate system.
 *
 * The function takes an angle (with description), a radius, and the SVG's size, and returns
 * the corresponding (x, y) coordinates. The angle is first converted to radians, assuming
 * counterclockwise direction from the positive x-axis. The resulting coordinates are
 * translated so that (0, 0) is at the center of the SVG, and then adjusted to the SVG's
 * coordinate system where (0, 0) is at the top-left corner.
 *
 * @param angle - The angle (with description) to convert, including its degree value and metadata.
 * @param radius - The radius from the center at which to calculate the position.
 * @param svgSize - The size (width and height) of the SVG canvas.
 * @returns An object containing the `x` and `y` coordinates within the SVG.
 */
export function angleToPosition(
  angle: AngleWithDescription,
  radius: number,
  svgSize: number
) {
  // js functions need radians, counterclockwise from positive x axis
  const angleConverted = convertAngle(angle.degree, angle, {
    direction: "ccw",
    axis: "+x",
  });
  const angleInRad = (angleConverted / 180) * Math.PI;
  let dX: number;
  let dY: number;

  if (angleInRad <= Math.PI) {
    // we are in the upper two quadrants
    if (angleInRad <= Math.PI / 2) {
      dY = Math.sin(angleInRad) * radius;
      dX = Math.cos(angleInRad) * radius;
    } else {
      dY = Math.sin(Math.PI - angleInRad) * radius;
      dX = Math.cos(Math.PI - angleInRad) * radius * -1;
    }
  } else if (angleInRad <= Math.PI * 1.5) {
    // we are in the lower two quadrants
    dY = Math.sin(angleInRad - Math.PI) * radius * -1;
    dX = Math.cos(angleInRad - Math.PI) * radius * -1;
  } else {
    dY = Math.sin(2 * Math.PI - angleInRad) * radius * -1;
    dX = Math.cos(2 * Math.PI - angleInRad) * radius;
  }

  // dX and dY are calculated based on having (0, 0) at the center
  // Now, translate dX and dY to svg coordinates, where (0, 0) is at the top left
  const x = dX + svgSize / 2;
  const y = svgSize / 2 - dY;

  return { x, y };
}

/**
 * Converts a 2D position within an SVG coordinate system to an angle,
 * then transforms that angle to a specified angle description.
 *
 * The function calculates the angle in degrees from the positive X axis
 * (counterclockwise), taking into account that the SVG Y axis increases downwards.
 * The resulting angle is then converted to the desired angle type using `convertAngle`.
 *
 * @param position - The position within the SVG, with `x` and `y` coordinates.
 * @param svgSize - The width/height of the SVG (assumed square).
 * @param angleType - The target angle description to convert to.
 * @returns The angle corresponding to the position, described by `angleType`.
 */
export function positionToAngle(
  position: { x: number; y: number },
  svgSize: number,
  angleType: AngleDescription
) {
  const dX = position.x - svgSize / 2;
  const dY = svgSize / 2 - position.y; // position.y increases downwards in svg
  let theta = Math.atan2(dY, dX); // radians, counterclockwise from positive x axis
  if (theta < 0) {
    theta = theta + 2 * Math.PI;
  }
  const degree = (theta / Math.PI) * 180; // degrees, counterclockwise from positive x axis
  return convertAngle(
    degree,
    {
      direction: "ccw",
      axis: "+x",
    },
    angleType
  );
}
