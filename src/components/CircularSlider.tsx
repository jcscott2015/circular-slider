import {
  Component,
  createRef,
  type MouseEvent,
  type RefObject,
  type TouchEvent,
} from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import {
  angleToPosition,
  positionToAngle,
  valueToAngle,
  angleToValue,
  type AngleDescription,
} from "../utilities/circularGeometry";
import { arcPathWithRoundedEnds } from "../utilities/svgPaths";
import Knob from "./KnobSvg";

export interface CircularSliderProps {
  /**
   * The type of angle used for the slider.
   * Can be either 'degree' or 'radian'.
   */
  angleType: AngleDescription;
  /**
   * Whether the slider is animated.
   * If true, the slider will not respond to mouse or touch events.
   * A pointer cursor over the knob will indicate that the slider is controlled by updates to initialValue.
   */
  animated?: boolean;
  /**
   * The background color of the arc.
   */
  arcBackgroundColor: string;
  /**
   * The color of the arc.
   * If not provided, a default gradient will be used.
   */
  arcColor?: string;
  /**
   * The class name for the slider.
   */
  className?: string;
  /**
   * Whether to coerce the value to an integer.
   * If true, the value will be rounded to the nearest integer.
   */
  coerceToInt?: boolean;
  /**
   * Whether to coerce the value to an integer.
   * If true, the value will be rounded to the nearest half integer.
   */
  coerceToHalf?: boolean;
  /**
   * Whether to coerce the value to an integer.
   * If true, the value will be rounded to the nearest quarter integer.
   */
  coerceToQuarter?: boolean;
  /**
   * Whether the slider is disabled.
   * If true, the slider will not respond to mouse or touch events.
   * Slider and knob will be rendered in a disabled state.
   */
  disabled?: boolean;
  /**
   * The end angle of the slider.
   * Should be between 0 and 360 degrees.
   */
  endAngle: number;
  /**
   * The knob configuration.
   * Contains the value and an optional onChange function.
   */
  knob: {
    value: number;
    onChange?: (value: number) => void;
  };
  /**
   * Callback function that is called when the user finishes controlling the slider.
   * This is useful for animations or other effects that should happen after the user has finished interacting with the slider.
   */
  onControlFinished?: () => void;
  /**
   * The maximum value of the slider.
   */
  maxValue: number;
  /**
   * The minimum value of the slider.
   */
  minValue: number;
  /**
   * Whether the slider is controlled.
   * If true, the slider will not respond to mouse or touch events.
   */
  noControl?: boolean;
  /**
   * The height of the slider.
   */
  sizeH: number;
  /**
   * The width of the slider.
   */
  sizeW: number;
  /**
   * The starting angle of the slider.
   * Should be between 0 and 360 degrees.
   */
  startAngle: number;
  /**
   * The width of the track.
   * This is the thickness of the arc.
   */
  trackWidth: number;
}

class CircularSlider extends Component<CircularSliderProps> {
  private readonly onMouseEnter: (ev: MouseEvent<SVGSVGElement>) => void;
  private readonly onMouseDown: (ev: MouseEvent<SVGSVGElement>) => void;
  private readonly removeMouseListeners: () => void;
  private readonly handleMousePosition: (
    ev: MouseEvent<SVGSVGElement> | MouseEvent
  ) => void;
  private readonly processSelection: (x: number, y: number) => void;
  private readonly onTouch: (ev: TouchEvent<SVGSVGElement>) => void;
  private readonly handleMouseMove: (ev: Event) => void;
  private readonly svgRef: RefObject<SVGSVGElement | null>;

  constructor(props: CircularSliderProps) {
    super(props);
    this.svgRef = createRef();

    this.handleMouseMove = (ev) => {
      this.handleMousePosition(ev as unknown as MouseEvent);
    };

    this.onMouseEnter = (ev) => {
      if (ev.buttons === 1) {
        // The left mouse button is pressed, act as though user clicked us
        this.onMouseDown(ev);
      }
    };

    this.onMouseDown = (ev) => {
      const svgRef = this.svgRef.current;
      if (svgRef) {
        svgRef.addEventListener("mousemove", this.handleMouseMove);
        svgRef.addEventListener("mouseleave", this.removeMouseListeners);
        svgRef.addEventListener("mouseup", this.removeMouseListeners);
      }
      this.handleMousePosition(ev);
    };

    this.removeMouseListeners = () => {
      const svgRef = this.svgRef.current;
      if (svgRef) {
        svgRef.removeEventListener("mousemove", this.handleMouseMove);
        svgRef.removeEventListener("mouseleave", this.removeMouseListeners);
        svgRef.removeEventListener("mouseup", this.removeMouseListeners);
      }
      if (this.props.onControlFinished) {
        this.props.onControlFinished();
      }
    };

    this.handleMousePosition = (ev) => {
      const { animated, noControl } = this.props;
      if (animated || noControl) return; // If animated or not controlled, don't handle mouse events
      const x = ev.clientX;
      const y = ev.clientY;
      this.processSelection(x, y);
    };

    this.onTouch = (ev) => {
      const { animated, noControl } = this.props;
      if (animated || noControl) return; // If animated or not controlled, don't handle touch events
      /* This is a very simplistic touch handler. Some optimzations might be:
        - Right now, the bounding box for a touch is the entire element. Having the bounding box
          for touched be circular at a fixed distance around the slider would be more intuitive.
        - Similarly, don't set `touchAction: 'none'` in CSS. Instead, call `ev.preventDefault()`
          only when the touch is within X distance from the slider
    */

      // This simple touch handler can't handle multiple touches. Therefore, bail if there are either:
      // - more than 1 touches currently active
      // - a touchEnd event, but there is still another touch active
      if (
        ev.touches.length > 1 ||
        (ev.type === "touchend" && ev.touches.length > 0)
      ) {
        return;
      }

      // Process the new position
      const touch = ev.changedTouches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      this.processSelection(x, y);

      // If the touch is ending, fire onControlFinished
      if (ev.type === "touchend" || ev.type === "touchcancel") {
        if (this.props.onControlFinished) {
          this.props.onControlFinished();
        }
      }
    };

    this.processSelection = (x, y) => {
      const {
        angleType,
        coerceToInt,
        coerceToHalf,
        coerceToQuarter,
        disabled,
        endAngle,
        knob,
        maxValue,
        minValue,
        sizeW,
        startAngle,
      } = this.props;
      if (!knob.onChange) {
        // Read-only, don't bother doing calculations
        return;
      }
      const svgRef = this.svgRef.current;
      if (!svgRef) {
        return;
      }
      // Find the coordinates with respect to the SVG
      const svgPoint = svgRef.createSVGPoint();
      svgPoint.x = x;
      svgPoint.y = y;
      const coordsInSvg = svgPoint.matrixTransform(
        svgRef.getScreenCTM()?.inverse()
      );

      const angle = positionToAngle(coordsInSvg, sizeW, angleType);
      let value = angleToValue({
        angle,
        minValue,
        maxValue,
        startAngle,
        endAngle,
      });

      if (coerceToInt) value = Math.round(value);
      if (coerceToHalf) value = Math.round(value * 2) / 2;
      if (coerceToQuarter) value = Math.round(value * 4) / 4;

      if (!disabled) {
        knob.onChange(value);
      }
    };
  }

  public render() {
    const {
      angleType,
      animated,
      arcBackgroundColor,
      arcColor,
      className,
      disabled,
      endAngle,
      knob,
      maxValue,
      minValue,
      noControl,
      sizeH,
      sizeW,
      startAngle,
      trackWidth,
    } = this.props;

    const trackInnerRadius = sizeW / 2 - trackWidth;

    const knobAngle = valueToAngle({
      value: knob.value,
      minValue,
      maxValue,
      startAngle,
      endAngle,
    });

    const knobPosition = angleToPosition(
      { degree: knobAngle, ...angleType },
      trackInnerRadius + trackWidth / 2,
      sizeW
    );

    const controllable = !disabled && Boolean(knob.onChange);

    const archBackgroundPath = arcPathWithRoundedEnds({
      startAngle,
      endAngle: knobAngle,
      angleType,
      innerRadius: trackInnerRadius,
      thickness: trackWidth,
      svgSize: sizeW,
      direction: angleType.direction,
    });

    // Generate a unique ID for the clip path. Needed when there are mutiple instances of the slider on the same page.
    const clipPathUrl = `arc-background-clip-${uuidv4()}`;
    const scaleForTrack = Math.ceil(trackWidth * 0.45); // Ensure even scaling for track width

    return (
      <svg
        className={clsx("circular-slider-svg", className)}
        ref={this.svgRef}
        width={sizeW}
        height={sizeH}
        viewBox={`-${scaleForTrack / 2} -${scaleForTrack / 2} ${
          sizeW + scaleForTrack
        } ${sizeH + scaleForTrack}`}
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onClick={
          /* TODO: be smarter about this -- for example, we could run this through our
          calculation and determine how close we are to the arc, and use that to decide
          if we propagate the click. */
          (ev) => controllable && ev.stopPropagation()
        }
        onTouchStart={this.onTouch}
        onTouchEnd={this.onTouch}
        onTouchMove={this.onTouch}
        onTouchCancel={this.onTouch}
        style={{ touchAction: "none" }}
      >
        {/* Arc Background  */}
        <path
          d={arcPathWithRoundedEnds({
            startAngle: knobAngle,
            endAngle,
            angleType,
            innerRadius: trackInnerRadius,
            thickness: trackWidth,
            svgSize: sizeW,
            direction: angleType.direction,
          })}
          fill={arcBackgroundColor}
        />
        {/* Arc (render after background so it overlays it) */}
        {arcColor ? (
          <path d={archBackgroundPath} fill={disabled ? "#999" : arcColor} />
        ) : (
          <>
            <defs>
              <clipPath id={clipPathUrl}>
                <path d={archBackgroundPath} />
              </clipPath>
            </defs>
            {/* Explicit dimensions needed for Safari rendering. */}
            <foreignObject
              width={sizeW}
              height={sizeH}
              clipPath={`url(#${clipPathUrl})`}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: disabled
                    ? "conic-gradient(from 150deg at center, #474747 -41.78deg, #8a8a8a 94.31deg, #b0b0b0 148.26deg, #9f9f9f 231.17deg, #474747 318.22deg, #a6a6a6 454.31deg)"
                    : "conic-gradient(from 150deg at center, #008e77 -41.78deg, #fc5185 94.31deg, #ffb961 148.26deg, #71c9ce 231.17deg, #008e77 318.22deg, #fc5185 454.31deg)",
                }}
              />
            </foreignObject>
          </>
        )}

        <Knob
          x={knobPosition.x}
          y={knobPosition.y}
          disabled={disabled}
          animated={animated}
          noControl={noControl}
          trackWidth={trackWidth}
        />
      </svg>
    );
  }
}

export default CircularSlider;
