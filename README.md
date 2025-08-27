# React Circular Slider Component

A flexible and customizable circular slider component built with React and TypeScript. Perfect for creating intuitive radial controls, progress indicators, and value selectors.

## Features

- 🎨 **Customizable Appearance**

  - Custom colors or gradient support
  - Adjustable track width
  - Configurable size and dimensions

- 🎯 **Precise Control**

  - Support for integer, half, and quarter value coercion
  - Configurable min/max values
  - Custom start and end angles

- 🔄 **Flexible Interaction**
  - Clockwise and counterclockwise rotation
  - Mouse and touch support
  - Animation capabilities
  - Disabled state support

## Installation

```bash
npm install @your-scope/react-circular-slider
```

## Basic Usage

```tsx
import { useState } from "react";
import CircularSlider from "@your-scope/react-circular-slider";

function App() {
  const [value, setValue] = useState(50);

  return (
    <CircularSlider
      angleType={{ axis: "-x", direction: "cw" }}
      startAngle={0}
      endAngle={360}
      minValue={0}
      maxValue={100}
      sizeW={200}
      sizeH={200}
      trackWidth={20}
      arcBackgroundColor="#e0e0e0"
      knob={{
        value: value,
        onChange: setValue,
      }}
    />
  );
}
```

## Props

| Prop                 | Type                                                    | Description                              | Default                     |
| -------------------- | ------------------------------------------------------- | ---------------------------------------- | --------------------------- |
| `angleType`          | `{ axis: string, direction: "cw" \| "ccw" }`            | Controls angle calculation and direction | Required                    |
| `startAngle`         | `number`                                                | Starting angle in degrees                | Required                    |
| `endAngle`           | `number`                                                | Ending angle in degrees                  | Required                    |
| `minValue`           | `number`                                                | Minimum value                            | Required                    |
| `maxValue`           | `number`                                                | Maximum value                            | Required                    |
| `sizeW`              | `number`                                                | Width of the component                   | Required                    |
| `sizeH`              | `number`                                                | Height of the component                  | Required                    |
| `trackWidth`         | `number`                                                | Width of the slider track                | Required                    |
| `arcBackgroundColor` | `string`                                                | Color of the unfilled track              | `"#e0e0e0"`                 |
| `arcColor`           | `string`                                                | Color of the filled track                | Gradient (if not specified) |
| `animated`           | `boolean`                                               | Enable animations                        | `false`                     |
| `disabled`           | `boolean`                                               | Disable interaction                      | `false`                     |
| `noControl`          | `boolean`                                               | Make slider read-only                    | `false`                     |
| `coerceToInt`        | `boolean`                                               | Round to integers                        | `false`                     |
| `coerceToHalf`       | `boolean`                                               | Round to half values                     | `false`                     |
| `coerceToQuarter`    | `boolean`                                               | Round to quarter values                  | `false`                     |
| `className`          | `string`                                                | Additional CSS classes                   | `""`                        |
| `knob`               | `{ value: number; onChange?: (value: number) => void }` | Slider value and change handler          | Required                    |

## Examples

### Gradient Slider

```tsx
<CircularSlider
  angleType={{ axis: "-x", direction: "cw" }}
  startAngle={0}
  endAngle={360}
  minValue={0}
  maxValue={100}
  sizeW={200}
  sizeH={200}
  trackWidth={20}
  animated
  knob={{
    value: value,
    onChange: setValue,
  }}
/>
```

### Custom Color Slider

```tsx
<CircularSlider
  angleType={{ axis: "-x", direction: "cw" }}
  startAngle={0}
  endAngle={270}
  minValue={0}
  maxValue={100}
  sizeW={200}
  sizeH={200}
  trackWidth={15}
  arcBackgroundColor="#f0f0f0"
  arcColor="#4CAF50"
  coerceToInt
  knob={{
    value: value,
    onChange: setValue,
  }}
/>
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © John C. Scott, Scott Communications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with ❤️ by John C. Scott, Scott Communications
