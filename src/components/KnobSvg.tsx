import { forwardRef, type ReactElement } from 'react';

interface KnobProps {
  /**
   * The x-coordinate of the knob's center.
   */
  x: number;
  /**
   * The y-coordinate of the knob's center.
   */
  y: number;
  /**
   * Whether the knob is animated.
   */
  animated?: boolean;
  /**
   * Whether the knob is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the slider is controlled.
   * If true, the slider will not respond to mouse or touch events.
   */
  noControl?: boolean;
  /**
   * The width of the track.
   * This is the thickness of the arc.
   */
  trackWidth: number;
}

const Knob = forwardRef<SVGSVGElement, KnobProps>(({ x, y, disabled, animated, noControl, trackWidth }, ref): ReactElement => {
  const knobColor = disabled ? '#999' : '#364F6B';
  const cursorStyle = disabled ? 'not-allowed' : 'pointer';
  const scaleForTrack = Math.ceil(trackWidth * 1.7); // Ensure even scaling for track width
  return (
    <svg
      ref={ref}
      width={scaleForTrack}
      height={scaleForTrack}
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      x={x - scaleForTrack / 2}
      y={y - scaleForTrack / 2}
      style={{ cursor: noControl ? 'default' : cursorStyle }}
      preserveAspectRatio="xMidYMid meet"
    >
      <g filter="url(#filter0_dd_15981_45167)">
        <circle cx="23" cy="19" r="18" fill={knobColor} />
        <circle cx="23" cy="19" r="17.25" stroke="white" strokeWidth="1.5" />
      </g>
      <path d="M15 14H31" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 19H31" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 24H31" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <filter id="filter0_dd_15981_45167" x="0" y="0" width="46" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect1_dropShadow_15981_45167" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_15981_45167" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect2_dropShadow_15981_45167" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_15981_45167" result="effect2_dropShadow_15981_45167" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_15981_45167" result="shape" />
        </filter>
      </defs>
      {animated && !noControl && (
        <svg width="100%" height="100%" viewBox="-4 -2 32 32" fill="white" xmlns="http://www.w3.org/2000/svg" strokeWidth="1" stroke="black">
          <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74m9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38"></path>
        </svg>
      )}
    </svg>
  );
});

export default Knob;
