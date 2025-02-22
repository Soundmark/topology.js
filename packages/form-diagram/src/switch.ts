export function le5leSwitch(ctx: CanvasRenderingContext2D, pen: any) {
  if (!pen.onDestroy) {
    pen.onClick = click;
  }
  let x = pen.calculative.worldRect.x;
  let y = pen.calculative.worldRect.y;
  let w = pen.calculative.worldRect.width;
  let h = pen.calculative.worldRect.height;
  ctx.beginPath();
  ctx.arc(x + h / 2, y + h / 2, h / 2, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.lineTo(x + (h * 3) / 2, y);
  ctx.arc(x + (h * 3) / 2, y + h / 2, h / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + h / 2, y + h);
  if (pen.checked) {
    ctx.fillStyle = pen.onColor;
    if (pen.disable) {
      ctx.fillStyle = pen.disableOnColor;
    }
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.moveTo(x + h * 2, y + h / 2);
    ctx.arc(
      x + (h * 3) / 2,
      y + h / 2,
      h / 2 > 2 ? h / 2 - 2 : 1,
      0,
      Math.PI * 2
    );

    ctx.fill();
  } else {
    ctx.fillStyle = pen.offColor;
    if (pen.disable) {
      ctx.fillStyle = pen.disableOffColor;
    }
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.moveTo(x + h, y + h / 2);
    ctx.arc(x + h / 2, y + h / 2, h / 2 > 2 ? h / 2 - 2 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.closePath();
  return false;
}

function click(pen: any) {
  if (pen.disable) {
    return;
  }
  pen.checked = !pen.checked;
  pen.calculative.canvas.store.emitter.emit('valueUpdate', pen);
  pen.calculative.canvas.render(Infinity);
}
