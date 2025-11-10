/**
 * Documentation data structure for mathematical analysis metrics
 * Contains LaTeX formulas, parameter definitions, and explanations
 */

export interface DocumentationData {
  title: string
  concept: string
  formula: string
  parameters: Array<{
    symbol: string
    definition: string
  }>
  description: string
  interpretation: string
}

export const documentationDatabase: Record<string, DocumentationData> = {
  sparc_value: {
    title: "SPARC Value",
    concept: "Spectral Arc Length",
    formula: "SPARC = -\\int \\sqrt{(\\omega_{\\text{max}} - \\omega_{\\text{min}})^{-2} + \\left(M'(\\omega)\\right)^2} \\, d\\omega",
    parameters: [
      { symbol: "ω", definition: "frequency domain variable" },
      { symbol: "\\omega_{\\text{max}}", definition: "maximum frequency in the spectrum" },
      { symbol: "\\omega_{\\text{min}}", definition: "minimum frequency in the spectrum" },
      { symbol: "M'(ω)", definition: "derivative of magnitude spectrum with respect to frequency" },
      { symbol: "M(ω)", definition: "magnitude spectrum of the speed profile" }
    ],
    description: "State-of-the-art smoothness metric using Fourier magnitude spectra of speed profiles. This dimensionless metric demonstrates exceptional robustness to noise while maintaining sensitivity to genuine smoothness variations.",
    interpretation: "Lower values indicate smoother contours. Values < -2.5 indicate excellent smoothness, while values > -1.5 suggest significant irregularities. The negative sign ensures that smoother movements yield more negative (lower) values."
  },

  mean_curvature: {
    title: "Mean Curvature",
    concept: "Multi-scale Curvature Analysis",
    formula: "\\kappa_i = \\frac{\\left|\\det(\\mathbf{v}_{i-1}, \\mathbf{v}_i)\\right|}{\\left|\\mathbf{v}_{i-1}\\right|^3}",
    parameters: [
      { symbol: "\\kappa_i", definition: "curvature at point i" },
      { symbol: "\\mathbf{v}_{i-1}", definition: "velocity vector at previous point" },
      { symbol: "\\mathbf{v}_i", definition: "velocity vector at current point" },
      { symbol: "\\det(\\cdot,\\cdot)", definition: "determinant of two vectors (cross product magnitude)" },
      { symbol: "|\\cdot|", definition: "Euclidean norm (magnitude) of vector" }
    ],
    description: "Curvature estimation using Gaussian kernel convolution providing complementary geometric insight to boundary smoothness analysis. The method employs multi-scale analysis to reduce noise sensitivity.",
    interpretation: "Higher values indicate sharper turns or irregularities. Gaussian smoothing reduces noise sensitivity while preserving genuine geometric features. Values > 0.1 typically indicate significant curvature variations."
  },

  overall_circularity: {
    title: "Overall Circularity",
    concept: "Corrected Roundness Parameter",
    formula: "R = CI + (0.913 - CAR)",
    parameters: [
      { symbol: "R", definition: "corrected roundness parameter" },
      { symbol: "CI", definition: "basic circularity index" },
      { symbol: "CAR", definition: "corrected aspect ratio from sixth-degree polynomial" },
      { symbol: "0.913", definition: "empirically determined correction constant for digital images" }
    ],
    description: "Superior circularity metric for digital images addressing limitations of basic measures through aspect ratio correction. Uses sixth-degree polynomial accounting for digitization effects inherent in pixelated boundaries.",
    interpretation: "Values approaching 1.0 indicate perfect circularity. The correction factor CAR addresses pixelation artifacts inherent in digital boundaries. Values < 0.8 suggest significant deviation from circular form."
  },

  form_factor: {
    title: "Form Factor",
    concept: "Shape Compactness Measure",
    formula: "FF = \\frac{4\\pi \\cdot Area}{Perimeter^2}",
    parameters: [
      { symbol: "FF", definition: "form factor (compactness measure)" },
      { symbol: "Area", definition: "enclosed area of the shape" },
      { symbol: "Perimeter", definition: "total perimeter length" },
      { symbol: "π", definition: "mathematical constant pi (≈ 3.14159)" },
      { symbol: "4π", definition: "normalization factor for perfect circle" }
    ],
    description: "Normalized measure of shape compactness comparing actual shape to perfect circle. This metric is invariant to size and rotation transformations, making it ideal for shape classification.",
    interpretation: "Perfect circle yields FF = 1.0. Lower values indicate deviation from circular form. Values > 0.8 suggest good circularity, while values < 0.6 indicate significant shape irregularities."
  },

  eccentricity: {
    title: "Eccentricity",
    concept: "Elliptical Deformation Measure",
    formula: "e = \\sqrt{1 - \\frac{b^2}{a^2}}",
    parameters: [
      { symbol: "e", definition: "eccentricity (shape deviation measure)" },
      { symbol: "a", definition: "semi-major axis length (longest radius)" },
      { symbol: "b", definition: "semi-minor axis length (shortest radius)" },
      { symbol: "b²/a²", definition: "squared aspect ratio of the fitted ellipse" }
    ],
    description: "Quantifies deviation from circular to elliptical shape using semi-major and semi-minor axes from robust ellipse fitting algorithms. Employs Fitzgibbon direct least squares method for numerical stability.",
    interpretation: "e = 0 indicates perfect circle, e → 1 indicates increasing elliptical deformation. Values > 0.5 suggest significant shape distortion. Values > 0.8 indicate highly elongated shapes."
  },

  rms_error: {
    title: "RMS Error",
    concept: "Root Mean Square Fitting Error",
    formula: "RMS = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}[\\sqrt{(x_i-a)^2+(y_i-b)^2} - R]^2}",
    parameters: [
      { symbol: "RMS", definition: "root mean square error" },
      { symbol: "n", definition: "total number of boundary points" },
      { symbol: "(x_i, y_i)", definition: "coordinates of boundary point i" },
      { symbol: "(a, b)", definition: "center coordinates of fitted circle" },
      { symbol: "R", definition: "radius of fitted circle" },
      { symbol: "√[(x_i-a)² + (y_i-b)²]", definition: "Euclidean distance from point to center" }
    ],
    description: "Geometric accuracy measure from circle fitting using Levenberg-Marquardt optimization with LMA variant achieving nearly 100% convergence reliability across all arc lengths.",
    interpretation: "Lower values indicate better circular fit. Values < 2.0 pixels suggest excellent geometric accuracy for typical imaging conditions. Values > 5.0 pixels indicate poor circular approximation."
  },

  r_squared: {
    title: "R-Squared",
    concept: "Coefficient of Determination",
    formula: "R^2 = 1 - \\frac{SS_{res}}{SS_{tot}} = 1 - \\frac{\\sum_i (y_i - \\hat{y}_i)^2}{\\sum_i (y_i - \\bar{y})^2}",
    parameters: [
      { symbol: "R²", definition: "coefficient of determination" },
      { symbol: "SS_res", definition: "sum of squares of residuals" },
      { symbol: "SS_tot", definition: "total sum of squares" },
      { symbol: "y_i", definition: "observed value at point i" },
      { symbol: "ŷ_i", definition: "predicted value from fitted model" },
      { symbol: "ȳ", definition: "mean of observed values" }
    ],
    description: "Statistical measure of how well the fitted circle explains the variance in contour data. Indicates goodness-of-fit for geometric models with clear statistical interpretation.",
    interpretation: "Values approaching 1.0 indicate excellent fit quality. R² > 0.95 suggests high confidence in fitted geometric parameters. R² < 0.8 indicates poor model fit requiring alternative approaches."
  },

  missing_area: {
    title: "Missing Area",
    concept: "Gap Detection Analysis",
    formula: "A = \\frac{1}{2} \\oint_C (x \\, dy - y \\, dx)",
    parameters: [
      { symbol: "A", definition: "area computed via line integral" },
      { symbol: "C", definition: "closed contour boundary" },
      { symbol: "(x, y)", definition: "coordinates along the boundary" },
      { symbol: "dx, dy", definition: "differential elements along boundary" },
      { symbol: "∮", definition: "line integral around closed contour" }
    ],
    description: "Uses Green's theorem for mathematically rigorous area computation through line integral conversion. Employs circular binary segmentation (CBS) for change-point detection in boundary data.",
    interpretation: "Quantifies genuine missing regions versus noise artifacts. Statistical significance testing validates detected gaps using hypothesis frameworks. Positive values indicate actual missing material or boundary segments."
  },

  excess_area: {
    title: "Excess Area",
    concept: "Boundary Overgrowth Analysis",
    formula: "A_{excess} = A_{contour} - A_{fitted\\_circle}",
    parameters: [
      { symbol: "A_excess", definition: "excess area beyond ideal boundary" },
      { symbol: "A_contour", definition: "actual contour area" },
      { symbol: "A_fitted_circle", definition: "area of fitted reference circle" },
      { symbol: "A_fitted_circle = πR²", definition: "circular area formula" }
    ],
    description: "Measures additional area beyond ideal circular boundary using Shoelace algorithm for polygonal approximations with guaranteed accuracy. Combined with morphological analysis for noise filtering.",
    interpretation: "Positive values indicate material excess or boundary irregularities. Values > 10% of total area suggest significant boundary overgrowth. Combined with gap analysis provides complete boundary assessment."
  },

  radius_deviation: {
    title: "Radius Deviation",
    concept: "Radial Distance Variance",
    formula: "\\sigma_r = \\sqrt{\\frac{\\sum_{i=1}^{n}(r_i - \\bar{r})^2}{n-1}}",
    parameters: [
      { symbol: "σ_r", definition: "standard deviation of radial distances" },
      { symbol: "r_i", definition: "radial distance from center to point i" },
      { symbol: "r̄", definition: "mean radial distance" },
      { symbol: "n", definition: "total number of boundary points" },
      { symbol: "n-1", definition: "degrees of freedom for sample standard deviation" }
    ],
    description: "Standard deviation of radial distances from fitted center providing edge quality assessment. Uses robust M-estimators to reduce sensitivity to outliers in the boundary data.",
    interpretation: "Lower values indicate more uniform edge quality. Values < 3.0 pixels typically indicate good boundary consistency. Higher values suggest irregular or noisy boundary conditions."
  },

  quality_score: {
    title: "Quality Score",
    concept: "Integrated Assessment Framework",
    formula: "Q = w_1 \\cdot S + w_2 \\cdot C + w_3 \\cdot F + w_4 \\cdot E",
    parameters: [
      { symbol: "Q", definition: "overall quality score" },
      { symbol: "S", definition: "smoothness component score (SPARC-based)" },
      { symbol: "C", definition: "circularity component score" },
      { symbol: "F", definition: "fitting accuracy component score" },
      { symbol: "E", definition: "edge quality component score" },
      { symbol: "w_1 = 0.30", definition: "smoothness weight - highest priority for surface uniformity" },
      { symbol: "w_2 = 0.25", definition: "circularity weight - critical for geometric conformance" },
      { symbol: "w_3 = 0.25", definition: "fitting accuracy weight - essential for measurement precision" },
      { symbol: "w_4 = 0.20", definition: "edge quality weight - important for boundary definition" }
    ],
    description: "Multi-stage analytical pipeline combining smoothness, circularity, fitting accuracy, and edge quality with empirically tuned weighting factors. The four-component framework targets high-precision specimen analysis workflows where smoothness (w_1 = 0.30) preserves uniform fabrication, circularity and fitting terms (w_2 = w_3 = 0.25) enforce dimensional fidelity, and edge quality (w_4 = 0.20) safeguards boundary clarity. The mix aligns with broadly adopted quality-control heuristics across materials research and digital metrology.",
    interpretation: "Normalized score [0-100] representing overall contour quality. The weights emphasize (1) smoothness because uniform surfaces behave more predictably, (2) geometric accuracy through equal attention on circularity and fitting precision, and (3) boundary fidelity for robust defect detection. Scores above 80 signal excellent geometric quality, while scores below 50 highlight areas that need review."
  }
}