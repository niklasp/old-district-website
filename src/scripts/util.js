/**
 * @param {Function} onRatioChange The callback when the scroll ratio changes
 */
 export const monitorScroll = onRatioChange => {
  const html = document.documentElement;
  const body = document.body;

  window.addEventListener('scroll', () => {
    onRatioChange(
      (html.scrollTop || body.scrollTop)
      /
      ((html.scrollHeight || body.scrollHeight) - html.clientHeight)
    );
  });
};

export const monitorWheel = onWheelChange => {
  let scrollTarget = 0;

  document.addEventListener( 'wheel', ( e ) => {
    scrollTarget = e.deltaY / 3.0;
    onWheelChange( scrollTarget );
  });
};

export class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}