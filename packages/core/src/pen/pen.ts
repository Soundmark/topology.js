import { Options } from '../options';
import { Point } from '../point';
import { Rect } from '../rect';
import { s8 } from '../utils';

export enum PenType {
  Node,
  Line,
}

export enum LockState {
  None,
  DisableEdit,
  DisableMove,
  // DisableActive,
  Disable = 10,
}

export enum AnchorMode {
  Default,
  In,
  Out,
}


export interface TopologyPen {
  id: string;
  parentId?: string;
  type: PenType;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  borderRadius?: number;

  layer?: number;
  // Hidden only visible === false
  visible?: boolean;
  locked?: LockState;

  center?: Point;

  from?: Point;
  to?: Point;
  pointIn?: (pt: Point) => boolean;

  tags?: string[];
  title?: string;
  markdown?: string;
  // 外部用于提示的dom id
  tipDom?: string;

  autoRect?: boolean;

  lineWidth?: number;
  rotate?: number;
  globalAlpha?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  color?: string;
  background?: string;
  hoverAnchorColor?: string;
  hoverColor?: string;
  hoverBackground?: string;
  activeColor?: string;
  activeBackground?: string;
  bkType?: number;
  lineCap?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  text?: string;
  textWidth?: number;
  textHeight?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  fontStyle?: string;
  fontWeight?: string;
  textAlign?: string;
  textBaseline?: string;
  textBackground?: string;
  whiteSpace?: string;
  ellipsis?: boolean;

  image?: string;
  icon?: string;
  iconRotate?: number;
  iconWidth?: number;
  iconHeight?: number;
  iconTop?: number;
  iconRight?: number;
  iconBottom?: number;
  iconLeft?: number;
  iconColor?: string;
  iconFamily?: string;
  iconSize?: number;
  iconAlign?: string;

  animateStart?: number;
  // Cycle count. Infinite if <= 0.
  animateCycle?: number;
  animateCycleIndex?: number;
  nextAnimate?: string;
  autoPlay?: boolean;

  disableInput?: boolean;
  disableRotate?: boolean;
  disableSize?: boolean;
  disableAnchor?: boolean;

  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;

  backgroundImage?: string;
  strokeImage?: string;

  children?: TopologyPen[];

  anchors?: Point[];
  anchorRadius?: number;
  anchorBackground?: string;

  calculative?: {
    worldRect?: Rect;
    worldRotate?: number;
    worldAnchors?: Point[];
    worldIconRect?: Rect;
    worldTextRect?: Rect;
    textDrawRect?: Rect;
    textLines?: string[];
    image?: string;
    img?: HTMLImageElement;
    imgNaturalWidth?: number;
    imgNaturalHeight?: number;
    backgroundImage?: string;
    strokeImage?: string;
    backgroundImg?: HTMLImageElement;
    strokeImg?: HTMLImageElement;

    active?: boolean;
    hover?: boolean;
  };

  beforeAddPen: (pen: TopologyPen) => boolean;
  beforeAddAnchor: (pen: TopologyPen, anchor: Point) => boolean;
  beforeRemovePen: (pen: TopologyPen) => boolean;
  beforeRemoveAnchor: (pen: TopologyPen, anchor: Point) => boolean;
}

export function getParent(pens: any, pen: TopologyPen) {
  if (!pen.parentId) {
    return pen;
  }

  return getParent(pens, pens[pen.parentId]);
}

export function renderPen(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  pen: TopologyPen,
  path: Path2D,
  options: Options,
) {
  if (!path) {
    return;
  }

  ctx.save();
  ctx.beginPath();

  // for canvas2svg
  if ((ctx as any).setAttrs) {
    (ctx as any).setAttrs(pen);
  }
  // end

  if (pen.calculative.worldRotate) {
    ctx.translate(pen.center.x, pen.center.y);
    ctx.rotate((pen.calculative.worldRotate * Math.PI) / 180);
    ctx.translate(-pen.center.x, -pen.center.y);
  }

  if (pen.lineWidth > 1) {
    ctx.lineWidth = pen.lineWidth;
  }

  let fill: any;
  if (pen.calculative.hover) {
    ctx.strokeStyle = pen.hoverColor || options.hoverColor;
    ctx.fillStyle = pen.hoverBackground || options.hoverBackground;
    fill = pen.hoverBackground || options.hoverBackground;
  } else if (pen.calculative.active) {
    ctx.strokeStyle = pen.activeColor || options.activeColor;
    ctx.fillStyle = pen.activeBackground || options.activeBackground;
    fill = pen.activeBackground || options.activeBackground;
  } else {
    if (pen.strokeImage) {
      if (pen.calculative.strokeImg) {
        ctx.strokeStyle = ctx.createPattern(pen.calculative.strokeImg, "repeat");
        fill = true;
      }
    } else {
      ctx.strokeStyle = pen.color;
    }

    if (pen.backgroundImage) {
      if (pen.calculative.backgroundImg) {
        ctx.fillStyle = ctx.createPattern(pen.calculative.backgroundImg, "repeat");
        fill = true;
      }
    } else {
      ctx.fillStyle = pen.background;
      fill = pen.background;
    }
  }

  if (pen.lineCap) {
    ctx.lineCap = pen.lineCap as CanvasLineCap;
  } else if (pen.type === PenType.Line) {
    ctx.lineCap = 'round';
  }

  if (pen.globalAlpha < 1) {
    ctx.globalAlpha = pen.globalAlpha;
  }

  if (pen.lineDash) {
    ctx.setLineDash(pen.lineDash);
  }
  if (pen.lineDashOffset) {
    ctx.lineDashOffset = pen.lineDashOffset;
  }

  if (pen.shadowColor) {
    ctx.shadowColor = pen.shadowColor;
    ctx.shadowOffsetX = pen.shadowOffsetX;
    ctx.shadowOffsetY = pen.shadowOffsetY;
    ctx.shadowBlur = pen.shadowBlur;
  }

  fill && ctx.fill(path);
  ctx.stroke(path);

  if (pen.image && pen.calculative.img) {
    ctx.save();
    ctx.shadowColor = '';
    ctx.shadowBlur = 0;
    const rect = pen.calculative.worldIconRect;
    let x = rect.x;
    let y = rect.y;
    let w = rect.width;
    let h = rect.height;
    if (pen.iconWidth) {
      w = pen.iconWidth;
    }
    if (pen.iconHeight) {
      h = pen.iconHeight;
    }
    if (pen.calculative.imgNaturalWidth && pen.calculative.imgNaturalHeight) {
      if (pen.iconWidth) {
        h = (pen.calculative.imgNaturalHeight / pen.calculative.imgNaturalWidth) * w;
      } else {
        w = (pen.calculative.imgNaturalWidth / pen.calculative.imgNaturalHeight) * h;
      }
    }
    x += (rect.width - w) / 2;
    y += (rect.height - h) / 2;

    if (pen.iconRotate) {
      ctx.translate(rect.center.x, rect.center.y);
      ctx.rotate((pen.iconRotate * Math.PI) / 180);
      ctx.translate(-rect.center.x, -rect.center.y);
    }

    ctx.drawImage(pen.calculative.img, x, y, w, h);
    ctx.restore();
  } else if (pen.icon) {
    ctx.save();
    ctx.shadowColor = '';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const iconRect = pen.calculative.worldIconRect;
    let x = iconRect.x + iconRect.width / 2;
    let y = iconRect.y + iconRect.height / 2;

    if (pen.iconSize > 0) {
      ctx.font = `${pen.iconSize}px ${pen.iconFamily}`;
    } else if (iconRect.width > iconRect.height) {
      ctx.font = `${iconRect.height}px ${pen.iconFamily}`;
    } else {
      ctx.font = `${iconRect.width}px ${pen.iconFamily}`;
    }
    ctx.fillStyle = pen.iconColor || pen.textColor || options.textColor;

    if (pen.calculative.worldRect.rotate) {
      ctx.translate(iconRect.center.x, iconRect.center.y);
      ctx.rotate((pen.calculative.worldRect.rotate * Math.PI) / 180);
      ctx.translate(-iconRect.center.x, -iconRect.center.y);
    }

    ctx.beginPath();
    ctx.fillText(pen.icon, x, y);

    ctx.restore();
  }

  if (pen.text) {
    ctx.save();
    ctx.fillStyle = pen.textColor || pen.color;
    if (pen.textBackground) {
      ctx.save();
      ctx.fillStyle = pen.textBackground;
      let x = 0;
      if (pen.textAlign === 'right') {
        x = pen.calculative.textDrawRect.width;
      }
      ctx.fillRect(pen.calculative.textDrawRect.x - x, pen.calculative.textDrawRect.y, pen.calculative.textDrawRect.width, pen.calculative.textDrawRect.height);
      ctx.restore();
    }

    ctx.font = `${pen.fontStyle || 'normal'} normal ${pen.fontWeight || 'normal'
      } ${pen.fontSize}px/${pen.lineHeight} ${pen.fontFamily}`;

    if (pen.textAlign) {
      ctx.textAlign = pen.textAlign as any;
    } else {
      ctx.textAlign = 'center';
    }

    if (pen.textBaseline) {
      ctx.textBaseline = pen.textBaseline as any;
    }

    let y = 0.5;
    switch (pen.textBaseline) {
      case 'top':
        y = 0;
        break;
      case 'bottom':
        y = 1;
        break;
    }
    pen.calculative.textLines.forEach((text, i) => {
      let x = 0;
      if (!pen.textAlign) {
        x = pen.calculative.textDrawRect.width / 2;
      }
      ctx.fillText(
        text,
        pen.calculative.textDrawRect.x + x,
        pen.calculative.textDrawRect.y + (i + y) * pen.fontSize * pen.lineHeight
      );
    });

    ctx.restore();
  }

  ctx.restore();
}

export function calcWorldRects(pens: { [key: string]: TopologyPen; }, pen: TopologyPen) {
  const rect: Rect = {
    x: pen.x,
    y: pen.y
  };

  if (!pen.parentId) {
    rect.ex = pen.x + pen.width;
    rect.ey = pen.y + pen.height;
    rect.width = pen.width;
    rect.height = pen.height;
    rect.rotate = pen.rotate;
    rect.center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  } else {
    let parentRect = pens[pen.parentId].calculative.worldRect;
    if (!parentRect) {
      parentRect = calcWorldRects(pens, pens[pen.parentId]);
    }

    rect.x = parentRect.x + (pen.x >= 1 ? pen.x : parentRect.width * pen.x);
    rect.y = parentRect.y + (pen.y >= 1 ? pen.y : parentRect.height * pen.y);
    rect.width = pen.width >= 1 ? pen.width : parentRect.width * pen.width;
    rect.height = pen.height >= 1 ? pen.height : parentRect.height * pen.height;
    rect.ex = rect.x + rect.width;
    rect.ey = rect.y + rect.height;

    rect.rotate = parentRect.rotate + pen.rotate;
    rect.center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }

  if (!pen.calculative) {
    pen.calculative = {};
  }
  pen.calculative.worldRect = rect;

  return rect;
}

export function calcWorldAnchors(pen: TopologyPen) {
  const anchors: Point[] = [];
  if (pen.anchors) {
    pen.anchors.forEach((anchor) => {
      if (anchor.custom) {
        anchors.push({
          id: anchor.id || s8(),
          penId: pen.id,
          x: pen.calculative.worldRect.x + pen.calculative.worldRect.width * anchor.x,
          y: pen.calculative.worldRect.y + pen.calculative.worldRect.height * anchor.y,
          color: anchor.color,
          background: anchor.background,
          custom: true
        });
      }
    });
  }

  if (!anchors.length) {
    anchors.push({
      id: s8(),
      penId: pen.id,
      x: pen.calculative.worldRect.x + pen.calculative.worldRect.width * 0.5,
      y: pen.calculative.worldRect.y,
    });

    anchors.push({
      id: s8(),
      penId: pen.id,
      x: pen.calculative.worldRect.x + pen.calculative.worldRect.width,
      y: pen.calculative.worldRect.y + pen.calculative.worldRect.height * 0.5,
    });

    anchors.push({
      id: s8(),
      penId: pen.id,
      x: pen.calculative.worldRect.x + pen.calculative.worldRect.width * 0.5,
      y: pen.calculative.worldRect.y + pen.calculative.worldRect.height,
    });

    anchors.push({
      id: s8(),
      penId: pen.id,
      x: pen.calculative.worldRect.x,
      y: pen.calculative.worldRect.y + pen.calculative.worldRect.height * 0.5,
    });
  }

  pen.calculative.worldAnchors = anchors;
}

export function calcIconRect(pens: { [key: string]: TopologyPen; }, pen: TopologyPen) {
  let x = pen.iconLeft || 0;
  let y = pen.iconTop || 0;
  let width = pen.iconWidth || pen.width;
  let height = pen.iconHeight || pen.height;
  if (x && Math.abs(x) < 1) {
    x = pen.width * pen.iconLeft;
  }

  if (y && Math.abs(y) < 1) {
    y = pen.height * pen.iconLeft;
  }
  if (width && Math.abs(width) < 1) {
    width = pen.width * pen.iconWidth;
  }

  if (height && Math.abs(height) < 1) {
    height = pen.height * pen.iconHeight;
  }

  let rotate = pen.iconRotate || 0;
  let parentRect = pens[pen.parentId].calculative.worldRect;
  if (parentRect) {
    rotate += parentRect.rotate;
    rotate %= 360;
  }

  pen.calculative.worldIconRect = {
    x: pen.calculative.worldRect.x + x,
    y: pen.calculative.worldRect.y + y,
    width,
    height,
    ex: pen.calculative.worldRect.x + x + width,
    ey: pen.calculative.worldRect.y + y + height,
    rotate,
  };
}