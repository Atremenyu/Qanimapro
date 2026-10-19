import { evaluateLayer, evaluateProp, evaluateSpring, lerpNumber, lerpColor } from '../animEngine';
import { MOTION_PRESETS, createPresetClonedLayer } from '../motionPresets';
import { VectorLayer, Composition } from '../../types';
import { GOOGLE_FONTS_CATALOG, getGoogleFontsExportUrls } from '../googleFonts';
import { applyFigmaAlignment, computeSnapGuidelines, getLayerBoundingBox } from '../figmaTools';
import { adaptCompositionToDimensions } from '../templateAdapter';

function createMockLayer(id: string = 'layer-test-1'): VectorLayer {
  return {
    id,
    name: 'Test Rectangle',
    type: 'rect',
    visible: true,
    locked: false,
    solo: false,
    colorTag: '#3b82f6',
    motionBlur: false,
    expandedInTimeline: false,
    transform: {
      position: { isKeyframed: false, value: { x: 200, y: 150 }, keyframes: [] },
      scale: { isKeyframed: false, value: { x: 100, y: 100 }, keyframes: [] },
      rotation: { isKeyframed: false, value: 0, keyframes: [] },
      opacity: { isKeyframed: false, value: 100, keyframes: [] },
      anchorPoint: { isKeyframed: false, value: { x: 0, y: 0 }, keyframes: [] },
      skew: { isKeyframed: false, value: { x: 0, y: 0 }, keyframes: [] },
    },
    style: {
      fillType: 'solid',
      blendMode: 'normal',
      fill: { isKeyframed: false, value: '#3b82f6', keyframes: [] },
      fillOpacity: { isKeyframed: false, value: 100, keyframes: [] },
      stroke: { isKeyframed: false, value: '#1d4ed8', keyframes: [] },
      strokeWidth: { isKeyframed: false, value: 4, keyframes: [] },
      strokeOpacity: { isKeyframed: false, value: 100, keyframes: [] },
      strokeDashArray: { isKeyframed: false, value: '', keyframes: [] },
      lineCap: 'round',
      lineJoin: 'round',
      trimStart: { isKeyframed: false, value: 0, keyframes: [] },
      trimEnd: { isKeyframed: false, value: 100, keyframes: [] },
      trimOffset: { isKeyframed: false, value: 0, keyframes: [] },
      blur: { isKeyframed: false, value: 0, keyframes: [] },
      shadowColor: '#38bdf8',
      shadowBlur: { isKeyframed: false, value: 0, keyframes: [] },
      shadowOffsetX: 0,
      shadowOffsetY: 4,
    },
    rect: {
      width: { isKeyframed: false, value: 120, keyframes: [] },
      height: { isKeyframed: false, value: 80, keyframes: [] },
      cornerRadius: { isKeyframed: false, value: 12, keyframes: [] },
    },
    modifiers: [],
  };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n🧪 Running Effects & Animation Engine Test Suite...\n');

// 1. Test createPresetClonedLayer deep cloning
try {
  const original = createMockLayer('layer-1');
  const cloned = createPresetClonedLayer(original);
  assert(cloned.id === original.id, 'createPresetClonedLayer preserves id');
  assert(cloned !== original, 'createPresetClonedLayer creates distinct object reference');
  cloned.transform.position.value.x = 999;
  assert(original.transform.position.value.x === 200, 'createPresetClonedLayer creates a true deep copy');
} catch (e) {
  assert(false, `createPresetClonedLayer threw error: ${e}`);
}

// 2. Test Motion Presets application across all presets
MOTION_PRESETS.forEach((preset) => {
  try {
    const mock = createMockLayer(`preset-layer-${preset.id}`);
    const modified = preset.apply(mock, 1.0);
    assert(
      modified && typeof modified === 'object' && modified.id.length > 0,
      `Preset "${preset.name}" (${preset.id}) applies cleanly without recursion or exception`
    );
  } catch (err) {
    assert(false, `Preset "${preset.name}" (${preset.id}) threw error: ${err}`);
  }
});

// 3. Test evaluateProp & lerp functions
const evaluatedStatic = evaluateProp({ isKeyframed: false, value: 50, keyframes: [] }, 1.5);
assert(evaluatedStatic === 50, 'evaluateProp returns static value when not keyframed');

const evaluatedKeyframed = evaluateProp(
  {
    isKeyframed: true,
    value: 0,
    keyframes: [
      { id: 'k1', time: 0, value: 0, easing: 'linear' },
      { id: 'k2', time: 2, value: 100, easing: 'linear' },
    ],
  },
  1.0,
  lerpNumber
);
assert(evaluatedKeyframed === 50, 'evaluateProp computes correct interpolated value at mid-time (1.0s)');

// 4. Test evaluateLayer with Wiggle Modifier
const layerWithWiggle = createMockLayer('layer-wiggle');
layerWithWiggle.modifiers = [
  {
    id: 'mod-w1',
    type: 'wiggle',
    enabled: true,
    wiggle: {
      frequency: 4,
      positionAmp: 30,
      rotationAmp: 20,
      scaleAmp: 10,
    },
  },
];

const evalWiggle0 = evaluateLayer(layerWithWiggle, 0.2);
const evalWiggle1 = evaluateLayer(layerWithWiggle, 1.4);
assert(
  evalWiggle0.position.x !== 200 || evalWiggle0.rotation !== 0,
  'evaluateLayer applies non-zero wiggle offset at t=0.2s'
);
assert(
  evalWiggle0.position.x !== evalWiggle1.position.x,
  'evaluateLayer varies wiggle offsets over time (t=0.2s vs t=1.4s)'
);

// 5. Test evaluateLayer with Trim Path keyframing
const layerWithTrim = createMockLayer('layer-trim');
layerWithTrim.style.trimStart = {
  isKeyframed: true,
  value: 0,
  keyframes: [
    { id: 't1', time: 0, value: 0, easing: 'linear' },
    { id: 't2', time: 2, value: 100, easing: 'linear' },
  ],
};
const evalTrimStartAt1sInt = evaluateLayer(layerWithTrim, 1.0);
assert(evalTrimStartAt1sInt.trimStart === 50, 'evaluateLayer correctly interpolates trimStart property to 50% at 1.0s');

// 6. Test Image Extraction and HTML5 <img> Tag Export
const { extractCompositionImages, generateStandaloneHTML5, generateHTML5ZipBundle } = await import('../exportEngine');

const mockCompWithImages: Composition = {
  id: 'comp_test_img',
  name: 'Test Ad Banner',
  width: 300,
  height: 250,
  fps: 60,
  duration: 4.0,
  backgroundColor: '#000000',
  layers: [
    {
      ...createMockLayer('layer-img-jpg'),
      name: 'Hero Photo',
      type: 'image',
      image: {
        src: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
        fileName: 'vacaciones-playa.jpg',
        mimeType: 'image/jpeg',
        width: { value: 300, isKeyframed: false, keyframes: [] },
        height: { value: 250, isKeyframed: false, keyframes: [] },
      },
    },
    {
      ...createMockLayer('layer-img-png'),
      name: 'Brand Logo',
      type: 'image',
      image: {
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        fileName: 'logotipo_empresa.png',
        mimeType: 'image/png',
        width: { value: 120, isKeyframed: false, keyframes: [] },
        height: { value: 40, isKeyframed: false, keyframes: [] },
      },
    },
    {
      ...createMockLayer('layer-img-gif'),
      name: 'Dynamic Badge',
      type: 'image',
      image: {
        src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        fileName: 'rebaja_animada.gif',
        mimeType: 'image/gif',
        width: { value: 80, isKeyframed: false, keyframes: [] },
        height: { value: 80, isKeyframed: false, keyframes: [] },
      },
    },
  ],
};

const extracted = extractCompositionImages(mockCompWithImages, 'images/');
assert(extracted.length === 3, 'extractCompositionImages extracts all 3 image layers');
assert(extracted[0].format === 'jpg' && extracted[0].fileName.endsWith('.jpg'), 'Preserves JPG format and extension');
assert(extracted[1].format === 'png' && extracted[1].fileName.endsWith('.png'), 'Preserves PNG format and extension');
assert(extracted[2].format === 'gif' && extracted[2].fileName.endsWith('.gif'), 'Preserves GIF format and extension');
assert(extracted[0].relativePath === 'images/vacaciones-playa.jpg', 'Generates correct relative path for images/ folder');

// 7. Verify exported HTML contains standard <img> tags and no base64 in files mode
const exportedHtml = generateStandaloneHTML5(mockCompWithImages, { imageMode: 'files' });
assert(exportedHtml.includes('<img id="img_layer-img-jpg" src="images/vacaciones-playa.jpg"'), 'Exported HTML renders standard <img> tag for JPG');
assert(exportedHtml.includes('<img id="img_layer-img-png" src="images/logotipo_empresa.png"'), 'Exported HTML renders standard <img> tag for PNG');
assert(exportedHtml.includes('<img id="img_layer-img-gif" src="images/rebaja_animada.gif"'), 'Exported HTML renders standard <img> tag for GIF');
assert(!exportedHtml.includes('data:image/'), 'Exported HTML in files mode has NO embedded base64 strings');
assert(!exportedHtml.includes('<image href='), 'Exported HTML does not use SVG <image> tag');

// 8. Verify ZIP bundle generation
const zipBlob = await generateHTML5ZipBundle(mockCompWithImages);
assert(zipBlob !== null && zipBlob.size > 0, 'generateHTML5ZipBundle returns valid non-empty zip Blob');

// 9. Google Fonts catalog and export URLs
assert(GOOGLE_FONTS_CATALOG.length >= 10, 'Google Fonts catalog has popular fonts loaded');
const fontUrls = getGoogleFontsExportUrls(['Inter', 'Bebas Neue', 'Syne']);
assert(fontUrls.some(u => u.includes('Bebas+Neue')), 'Generates correct Google Font URL for Bebas Neue');

// 10. Spring Dynamics physical harmonic response
const springMid = evaluateSpring(0.5, 180, 12, 1);
assert(typeof springMid === 'number' && springMid > 0.5, 'evaluateSpring computes harmonic response at mid progress');

// 11. Parenting / Motion Linking inheritance
const parentLayer: VectorLayer = {
  ...createMockLayer('parent-1'),
  transform: {
    ...createMockLayer('parent-1').transform,
    position: {
      isKeyframed: true,
      value: { x: 100, y: 100 },
      keyframes: [
        { id: 'k1', time: 0, value: { x: 100, y: 100 }, easing: 'linear' },
        { id: 'k2', time: 1, value: { x: 300, y: 200 }, easing: 'linear' },
      ],
    },
  },
};
const childLayer: VectorLayer = {
  ...createMockLayer('child-1'),
  parentLayerId: 'parent-1',
  parentFollowOptions: { followPosition: true, followRotation: true, followScale: true, lagSeconds: 0 },
  transform: {
    ...createMockLayer('child-1').transform,
    position: { isKeyframed: false, value: { x: 50, y: 50 }, keyframes: [] },
  },
};
const evaluatedChildAt1s = evaluateLayer(childLayer, 1.0, [parentLayer, childLayer]);
assert(evaluatedChildAt1s.position.x === 250, 'Child layer inherits parent deltaX of +200px at t=1s');
assert(evaluatedChildAt1s.position.y === 150, 'Child layer inherits parent deltaY of +100px at t=1s');

// 12. Smart Snapping & Guides
const testComp: Composition = {
  id: 'test-comp',
  name: 'Test Canvas',
  width: 1080,
  height: 1080,
  backgroundColor: '#000000',
  fps: 60,
  duration: 5,
  layers: [parentLayer, childLayer],
};
const snapRes = computeSnapGuidelines(childLayer, { x: 538, y: 541 }, [parentLayer], 1080, 1080, 0, 12);
assert(snapRes.snappedPos.x === 540, 'Snaps x coordinate to canvas center 540');
assert(snapRes.snappedPos.y === 540, 'Snaps y coordinate to canvas center 540');
assert(snapRes.guides.length > 0, 'Generates active snap guide lines for center alignment');

// 13. Figma Proportional Distribution
const layerA = { ...createMockLayer('l-a'), transform: { ...createMockLayer('l-a').transform, position: { value: { x: 100, y: 200 }, isKeyframed: false, keyframes: [] } } };
const layerB = { ...createMockLayer('l-b'), transform: { ...createMockLayer('l-b').transform, position: { value: { x: 300, y: 200 }, isKeyframed: false, keyframes: [] } } };
const layerC = { ...createMockLayer('l-c'), transform: { ...createMockLayer('l-c').transform, position: { value: { x: 700, y: 200 }, isKeyframed: false, keyframes: [] } } };
const multiComp: Composition = { ...testComp, layers: [layerA, layerB, layerC] };
const distributed = applyFigmaAlignment(multiComp, ['l-a', 'l-b', 'l-c'], 'distributeH');
assert(distributed.layers.find(l => l.id === 'l-b')?.transform.position.value.x === 400, 'Distributes middle layer center to 400px (equal step)');

// 14. Intelligent Reframe adaptation
const reframed = adaptCompositionToDimensions(multiComp, 1920, 1080);
assert(reframed.width === 1920 && reframed.height === 1080, 'Reframe adapts composition to 1920x1080');

console.log(`\n========================================`);
console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
