export class GradientCalculator {

  interpolateColors(color1, color2, ratio) {
    const c1 = this.hexToRgb(this.ensureHexColor(color1));
    const c2 = this.hexToRgb(this.ensureHexColor(color2));

    const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

    return this.rgbStrToHex(`rgb(${r}, ${g}, ${b})`);
  }

  rgbToHex({ r, g, b }) {
    const rr = r.toString(16).padStart(2, "0");
    const gg = g.toString(16).padStart(2, "0");
    const bb = b.toString(16).padStart(2, "0");
    return `#${rr}${gg}${bb}`;
  }

  rgbStrToHex(rgb) {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return "#000000";

    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");

    return `#${r}${g}${b}`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  // Input: { r: 0-255, g: 0-255, b: 0-255 }
  // Output: { h: 0-360, s: 0-100, l: 0-100 }
  rgbToHsl({ r, g, b }) {
    // normalize to [0,1]
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    // Lightness
    let l = (max + min) / 2;

    // Saturation
    let s = 0;
    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
    }

    // Hue
    let h = 0;
    if (delta !== 0) {
      if (max === rn) {
        h = ((gn - bn) / delta) % 6;
      } else if (max === gn) {
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h = h * 60;
      if (h < 0) h += 360;
    }

    // convert s and l to percentages
    return {
      h: Math.round(h * 100) / 100, // optional: round to 2 decimals
      s: Math.round(s * 10000) / 100, // s as percentage with 2 decimals
      l: Math.round(l * 10000) / 100, // l as percentage with 2 decimals
    };
  }

  hslToRgb({ h, s, l }) {
    // h: 0-360, s & l: 0-100 (percent)
    const H = ((h % 360) + 360) % 360; // normalize
    const S = Math.max(0, Math.min(100, s)) / 100;
    const L = Math.max(0, Math.min(100, l)) / 100;

    if (S === 0) {
      // achromatic (gray)
      const val = Math.round(L * 255);
      return { r: val, g: val, b: val };
    }

    const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    const p = 2 * L - q;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const hk = H / 360;
    const r = hue2rgb(p, q, hk + 1 / 3);
    const g = hue2rgb(p, q, hk);
    const b = hue2rgb(p, q, hk - 1 / 3);

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  ensureHexColor(color) {
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) return this.rgbStrToHex(color);
    return color;
  }

  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb);
    return hsl;
  }

  hslToHex(hsl) {
    const rgb = this.hslToRgb(hsl);
    const hex = this.rgbToHex(rgb);
    return hex;
  }

  toShade({ h, s, l }, shadeFactor = 0.4) {
    // shadeFactor: 0 = no change, 1 = completely dark
    // Clamp shadeFactor between 0 and 1
    shadeFactor = Math.max(0, Math.min(1, shadeFactor));

    // Primary effect: reduce lightness
    const newL = l * (1 - shadeFactor);

    // Secondary effect: slightly reduce saturation in deeper shadows
    // Saturation reduction is less pronounced than lightness reduction
    const saturationReduction = shadeFactor * 0.2; // 20% of the shade factor
    const newS = s * (1 - saturationReduction);

    // Tertiary effect: very subtle hue shift toward blue (cooler shadows)
    // This is optional and very subtle - only noticeable in deep shadows
    let newH = h;
    if (shadeFactor > 0.5) {
      // Shift slightly toward blue (240°) for deeper shadows
      const hueShiftAmount = (shadeFactor - 0.5) * 10; // Max 5° shift
      newH = h + hueShiftAmount;
      // Wrap hue around 360°
      if (newH >= 360) newH -= 360;
      if (newH < 0) newH += 360;
    }

    return {
      h: Math.round(newH),
      s: Math.round(Math.max(0, Math.min(100, newS))),
      l: Math.round(Math.max(0, Math.min(100, newL))),
    };
  }

  getColorAtPercentage(list, percentage) {
    if (!list.length) return "#000";

    // Prepare
    const sorted = [...list].sort((a, b) => a.percentage - b.percentage);

    // If percentate is less than the percentage of the first color stop, return that color-stops value
    if (percentage <= sorted[0].percentage) return sorted[0].color;

    // if percentate is beyond the last color, return that last colors value;
    if (percentage >= sorted[sorted.length - 1].percentage) return sorted[sorted.length - 1].color;

    // Simple interpolation for new stops
    for (let i = 0; i < sorted.length - 1; i++) {
      // if percenatare is between the two
      if (sorted[i].percentage <= percentage && sorted[i + 1].percentage >= percentage) {
        const ratio = (percentage - sorted[i].percentage) / (sorted[i + 1].percentage - sorted[i].percentage);
        return this.interpolateColors(sorted[i].color, sorted[i + 1].color, ratio);
      }
    }
  }

}
