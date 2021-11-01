import Phaser, { Scene, Utils, Events, GameObjects, Types, Tweens } from 'phaser'

const DEFAULTS = {
  align: 0,
  autofocus: false,
  background: true,
  backgroundAlpha: 0.90,
  backgroundColor: 0x454545,
  backgroundExpand: true,
  backgroundHoverColor: null,
  cursorAlpha: 1,
  cursorColor: 0xe1e500,
  cursorEase: 'Sine.inOut',
  cursorHeight: null,
  cursorSpeed: 400,
  cursorWidth: 2,
  decimalPlaces: 0,
  height: null,
  hideOutlineOnFocusLoss: true,
  label: null,
  labelAlign: true,
  labelPadding: 0,
  max: Number.MAX_VALUE,
  maxlength: Number.MAX_SAFE_INTEGER,
  maxWidth: null,
  min: 0,
  minlength: 0,
  minWidth: null,
  nextInput: null,
  onChange: null,
  originX: 0.5,
  originY: 0.5,
  outline: true,
  outlineAlpha: 1,
  outlineColor: 0x1473e6,
  outlineHoverColor: null,
  outlineWidth: 1,
  padding: null,
  paddingH: 0,
  paddingV: 0,
  placeholder: '',
  prevInput: null,
  shiftStep: 10,
  size: 64,
  step: 1,
  suffix: null,
  suffixPadding: 0,
  text: '',
  type: 'text',
  value: null,
  width: null,
  x: 0,
  y: 0
}

class TextInput extends Events.EventEmitter {
  scene:Scene
  type:string
  _value:number | string
  font:GameObjects.BitmapText

  onChange:any

  originX:number
  originY:number

  nextInput:any
  prevInput:any

  container:GameObjects.Container

  parent:GameObjects.Container

  label:any
  suffix:GameObjects.BitmapText | null
  suffixPadding:number

  fontOffset:number

  labelAlign:string

  textInfo:Types.GameObjects.BitmapText.BitmapTextSize

  cursor:GameObjects.Rectangle
  background:GameObjects.Rectangle

  minWidth:number
  maxWidth:number

  fixedWidth:boolean

  paddingH:number
  paddingV:number

  align:number

  hideOutlineOnFocusLoss:boolean

  prev:number | string

  cursorPosition:number

  cursorSpeed:number
  cursorAlpha:number
  cursorEase:number

  downTime:number

  //  Specifies the minimum number of characters allowed in an <input> element
  minlength:number

  //  Specifies the maximum number of characters allowed in an <input> element
  maxlength:number

  //  Specifies a minimum value for an <input> element
  min:number

  //  Specifies the maximum value for an <input> element
  max:number

  step:number
  shiftStep:number

  decimalPlaces:number

  placeholder:string

  hasFocus:boolean
  isOver:boolean

  autofocus:boolean

  backgroundExpand:number
  backgroundColor:number
  backgroundAlpha:number
  backgroundHoverColor:number

  outlineColor:number
  outlineAlpha:number
  outlineWidth:number
  outlineHoverColor:number

  cursorTween?:Tweens.Tween

  constructor(scene:Scene, font:string, config:any) {
    super();

    this.scene = scene;

    config = Utils.Objects.MergeRight(DEFAULTS, config);

    const {
      align,
      autofocus,
      background,
      backgroundColor,
      backgroundHoverColor,
      cursorAlpha,
      cursorColor,
      cursorEase,
      cursorSpeed,
      cursorWidth,
      decimalPlaces,
      hideOutlineOnFocusLoss,
      label,
      labelAlign,
      labelPadding,
      max,
      min,
      nextInput,
      onChange,
      originX,
      originY,
      outline,
      outlineAlpha,
      outlineColor,
      outlineHoverColor,
      padding,
      placeholder,
      prevInput,
      shiftStep,
      size,
      step,
      suffix,
      suffixPadding,
      type,
      value,
      x,
      y
    } = config;

    let {
      backgroundAlpha,
      backgroundExpand,
      cursorHeight,
      height,
      maxlength,
      maxWidth,
      minlength,
      minWidth,
      outlineWidth,
      paddingH,
      paddingV,
      text,
      width
    } = config;

    //  text
    //  number
    //  password
    this.type = type;

    if (value !== null) {
      text = value;
    }

    text = this.tidyString(text);

    this._value = text;

    let displayText = text;

    if (type === 'password') {
      displayText = Utils.String.Pad('', text.length, '*', 1);
    }

    this.onChange = onChange;

    this.originX = originX;
    this.originY = originY;

    this.nextInput = nextInput;
    this.prevInput = prevInput;

    this.container = new GameObjects.Container(scene, x, y);

    this.parent = new GameObjects.Container(scene, 0, 0);

    this.label = null;
    this.suffix = null;
    this.suffixPadding = 0;

    this.fontOffset = 0;

    this.labelAlign = labelAlign;

    if (label) {
      this.label = new GameObjects.BitmapText(scene, 0, 0, font, label, size);

      const labelSize = this.label.getTextBounds(true);

      this.fontOffset = labelSize.local.width + labelPadding;
    }

    if (suffix) {
      this.suffix = new GameObjects.BitmapText(scene, 0, 0, font, suffix, size);

      this.suffixPadding = suffixPadding;
    }

    this.font = new GameObjects.BitmapText(scene, this.fontOffset, 0, font, displayText, size);

    this.textInfo = this.font.getTextBounds(true);

    const lineHeight = this.font.fontData.lineHeight * this.textInfo.scale;

    let fixedWidth = false;

    if (!width && text === '') {
      width = 128;
    }
    else if (!width) {
      width = this.textInfo.local.width;
    }
    else if (width !== null) {
      fixedWidth = true;

      //  Fixed width? Force background to not expand
      backgroundExpand = false;
    }

    if (padding !== null) {
      paddingH = padding;
      paddingV = padding;
    }

    const doublePadding = paddingH * 2;

    if (!minWidth) {
      minWidth = width;
    }

    if (!maxWidth) {
      if (fixedWidth || !backgroundExpand) {
        maxWidth = width;
      }
      else {
        maxWidth = Number.MAX_SAFE_INTEGER;
      }
    }

    if (!height || height < this.textInfo.local.height) {
      height = lineHeight;
    }

    if (!cursorHeight) {
      cursorHeight = height;
    }

    const cursorY = height - cursorHeight;

    width += doublePadding;
    height += (paddingV * 2);

    if (!background) {
      backgroundAlpha = 0;
    }

    this.cursor = new GameObjects.Rectangle(scene, this.fontOffset + paddingH, cursorY, cursorWidth, cursorHeight, cursorColor);
    this.background = new GameObjects.Rectangle(scene, this.fontOffset, -paddingV, width, height, backgroundColor, backgroundAlpha);

    if (!outline) {
      outlineWidth = 0;
    }

    if (outlineWidth > 0) {
      if (hideOutlineOnFocusLoss) {
        this.background.setStrokeStyle(outlineWidth, outlineColor, 0);
      }
      else {
        this.background.setStrokeStyle(outlineWidth, outlineColor, outlineAlpha);
      }
    }

    this.font.setOrigin(0, 0);
    this.cursor.setOrigin(0, 0);
    this.background.setOrigin(0, 0);

    this.minWidth = minWidth + doublePadding;
    this.maxWidth = maxWidth + doublePadding;

    this.fixedWidth = fixedWidth;

    this.paddingH = paddingH;
    this.paddingV = paddingV;

    this.align = align;

    this.hideOutlineOnFocusLoss = hideOutlineOnFocusLoss;

    this.prev = text;

    this.cursorPosition = 0;

    this.cursorSpeed = cursorSpeed;
    this.cursorAlpha = cursorAlpha;
    this.cursorEase = cursorEase;

    this.downTime = 0;

    if (this.type === 'number') {
      minlength = min.toString().length;
      maxlength = max.toString().length;

      if (decimalPlaces > 0) {
        minlength += 1 + decimalPlaces;
        maxlength += 1 + decimalPlaces;
      }
    }

    //  Specifies the minimum number of characters allowed in an <input> element
    this.minlength = minlength;

    //  Specifies the maximum number of characters allowed in an <input> element
    this.maxlength = maxlength;

    //  Specifies a minimum value for an <input> element
    this.min = min;

    //  Specifies the maximum value for an <input> element
    this.max = max;

    this.step = step;
    this.shiftStep = shiftStep;

    this.decimalPlaces = decimalPlaces;

    this.placeholder = placeholder;

    this.hasFocus = false;
    this.isOver = false;

    this.autofocus = autofocus;

    this.backgroundExpand = backgroundExpand;
    this.backgroundColor = backgroundColor;
    this.backgroundAlpha = backgroundAlpha;
    this.backgroundHoverColor = backgroundHoverColor;

    this.outlineColor = outlineColor;
    this.outlineAlpha = outlineAlpha;
    this.outlineWidth = outlineWidth;
    this.outlineHoverColor = outlineHoverColor;

    this.background.setInteractive();

    this.background.on('pointerdown', this.onDownHandler, this);
    this.background.on('pointerover', this.onOverHandler, this);
    this.background.on('pointerout', this.onOutHandler, this);
    this.background.on('wheel', this.onWheelHandler, this);

    if (this.label) {
      this.label.setInteractive();

      this.label.on('pointerdown', this.onDownHandler, this);
      this.label.on('pointerover', this.onOverHandler, this);
      this.label.on('pointerout', this.onOutHandler, this);
    }

    scene.input.on('pointerdown', this.globalOnDownHandler, this);

    this.cursor.setVisible(false);

    if (this.label) {
      this.parent.add(this.label);
    }

    this.parent.add([this.background, this.font, this.cursor]);

    if (this.suffix) {
      this.parent.add(this.suffix);
    }

    this.container.add(this.parent);

    scene.sys.displayList.add(this.container);

    this.updateBackground();

    if (placeholder !== '') {
      this.value = placeholder;
    }

    if (autofocus) {
      this.setFocus();
    }
  }

  globalOnDownHandler(pointer:any, over:any) {
    if (this.hasFocus && over.indexOf(this.background) === -1 && over.indexOf(this.label) === -1) {
      this.stopInput();

      this.emit('lostfocus');
    }
  }

  onOverHandler() {
    this.isOver = true;

    if (this.hasFocus) {
      return;
    }

    if (this.backgroundHoverColor !== null) {
      this.background.setFillStyle(this.backgroundHoverColor, this.backgroundAlpha);
    }

    if (this.outlineHoverColor !== null) {
      this.background.setStrokeStyle(this.outlineWidth, this.outlineHoverColor, this.outlineAlpha);
    }

    this.emit('over');
  }

  onOutHandler() {
    this.isOver = false;

    if (this.hasFocus) {
      return;
    }

    if (this.backgroundHoverColor !== null) {
      this.background.setFillStyle(this.backgroundColor, this.backgroundAlpha);
    }

    if (this.outlineHoverColor !== null) {
      if (this.hideOutlineOnFocusLoss) {
        this.background.setStrokeStyle(this.outlineWidth, this.outlineColor, 0);
      }
      else {
        this.background.setStrokeStyle(this.outlineWidth, this.outlineColor, this.outlineAlpha);
      }
    }

    this.emit('out');
  }

  onDownHandler(pointer:any) {
    if (!this.isOver) {
      return;
    }

    if (this.hasFocus) {
      if (pointer.downTime - this.downTime < 250) {
        //  Double-click, erase the value
        this.value = '';
      }
      else {
        const char = this.font.getCharacterAt(pointer.worldX, pointer.worldY);

        if (char) {
          this.cursor.x = this.font.x + char.x;

          this.cursorPosition = char.i;

          this.getCursorInfo();
        }
        else {
          this.moveCursorEnd();
        }
      }

      this.downTime = pointer.downTime;

      return;
    }

    this.hasFocus = true;

    this.downTime = pointer.downTime;

    this.prev = this.value;

    if (this.value === this.placeholder) {
      this.value = '';
    }
    else {
      const char = this.font.getCharacterAt(pointer.worldX, pointer.worldY);

      if (char) {
        this.cursor.x = this.font.x + char.x;

        this.cursorPosition = char.i;

        this.getCursorInfo();
      }
      else {
        this.moveCursorEnd();
      }
    }

    this.cursor.setVisible(true);
    this.cursor.setAlpha(this.cursorAlpha);

    if (this.cursorTween) {
      this.cursorTween.stop();
    }

    if (this.cursorSpeed > 0) {
      this.cursorTween = this.scene.tweens.add({
        targets: this.cursor,
        alpha: 0,
        duration: this.cursorSpeed,
        ease: this.cursorEase,
        yoyo: true,
        repeat: -1
      });
    }

    this.scene.input.keyboard.on('keydown', this.onKeyDownHandler, this);

    if (this.hideOutlineOnFocusLoss) {
      this.background.setStrokeStyle(this.outlineWidth, this.outlineColor, this.outlineAlpha);
    }

    this.emit('focus');
  }

  stopInput() {
    if (!this.hasFocus) {
      return;
    }

    if (this.placeholder !== '' && this.value === '') {
      this.value = this.placeholder;
    }

    this.scene.input.keyboard.off('keydown', this.onKeyDownHandler, this);

    this.cursor.setVisible(false);

    if (this.cursorTween) {
      this.cursorTween.stop();
    }

    if (this.hideOutlineOnFocusLoss) {
      this.background.setStrokeStyle(this.outlineWidth, this.outlineColor, 0);
    }
    else if (this.outlineHoverColor !== null && !this.isOver) {
      this.background.setStrokeStyle(this.outlineWidth, this.outlineColor, this.outlineAlpha);
    }

    if (this.backgroundHoverColor !== null && !this.isOver) {
      this.background.setFillStyle(this.backgroundColor, this.backgroundAlpha);
    }

    this.hasFocus = false;
  }

  tabLink(target:any) {
    this.nextInput = target;

    target.prevInput = this;
  }

  onTab(event:any) {
    if (event.shiftKey && this.prevInput) {
      event.preventDefault()

      this.onCommit();

      this.prevInput.setFocus();
    }
    else if (this.nextInput) {
      event.preventDefault();

      this.onCommit();

      this.nextInput.setFocus();
    }
  }

  onKeyDownHandler(event:any) {
    if (!this.hasFocus) {
      return;
    }

    // console.log(event);

    switch (event.key) {
      case 'Tab':
        {
          this.onTab(event);

          break;
        }

      case 'Escape':
        {
          this.onAbort();

          break;
        }

      case 'Enter':
        {
          this.onCommit();

          break;
        }

      case 'Backspace':
        {
          this.removeCharacterBeforeCursor();

          break;
        }

      case 'Delete':
        {
          this.removeCharacterAfterCursor();

          break;
        }

      case 'Home':
        {
          this.moveCursorHome();

          break;
        }

      case 'End':
        {
          this.moveCursorEnd();

          break;
        }

      case 'ArrowLeft':
        {
          if (event.ctrlKey) {
            this.jumpCursorLeft();
          }
          else {
            this.moveCursorLeft();
          }

          break;
        }

      case 'ArrowRight':
        {
          if (event.ctrlKey) {
            this.jumpCursorRight();
          }
          else {
            this.moveCursorRight();
          }

          break;
        }

      case 'ArrowUp':
        {
          this.onArrowUp(event);

          break;
        }

      case 'ArrowDown':
        {
          this.onArrowDown(event);

          break;
        }

      default:
        {
          if (this.type === 'number') {
            this.insertNumber(event);
          }
          else {
            this.insertCharacter(event);
          }
        }
    }
  }

  onWheelHandler(pointer:any, deltaX:number, deltaY:number) {
    if (this.type !== 'number' || !this.hasFocus) {
      return;
    }

    let value = parseFloat(this.value as string);

    if (isNaN(value)) {
      value = this.min;
    }

    if (deltaY < 0) {
      value += this.step;
    }
    else if (deltaY > 0) {
      value -= this.step;
    }

    if (value > this.max) {
      value = this.max;
    }
    else if (value < this.min) {
      value = this.min;
    }

    this.value = value;

    this.updateBackground();
  }

  onArrowUp(event:any) {
    let value = null;

    if (this.type === 'number') {
      value = parseFloat(this.value as string);
    }

    if (value === null) {
      return;
    }

    value += (event.shiftKey) ? this.shiftStep : this.step;

    if (value > this.max) {
      value = this.max;
    }
    else if (value < this.min) {
      value = this.min;
    }

    this.value = value;

    this.updateBackground();
  }

  onArrowDown(event:any) {
    let value = null;

    if (this.type === 'number') {
      value = parseFloat(this.value as string);
    }

    if (value === null) {
      return;
    }

    value -= (event.shiftKey) ? this.shiftStep : this.step;

    if (value > this.max) {
      value = this.max;
    }
    else if (value < this.min) {
      value = this.min;
    }

    this.value = value;

    this.updateBackground();
  }

  //  Backspace
  removeCharacterBeforeCursor() {
    if (!this.cursorAtStart()) {
      if ((this.value as string).length === this.minlength) {
        return;
      }

      this.cursorPosition--;

      this.value = Utils.String.RemoveAt((this.value as string), this.cursorPosition + 1);
    }
  }

  //  Delete
  removeCharacterAfterCursor() {
    if (!this.cursorAtEnd()) {
      if ((this.value as string).length === this.minlength) {
        return;
      }

      if (this.cursorAtStart()) {
        this.value = Utils.String.RemoveAt((this.value as string), 0);
      }
      else {
        this.value = Utils.String.RemoveAt((this.value as string), this.cursorPosition + 1);
      }
    }
  }

  insertNumber(event:any) {
    if (this.decimalPlaces > 0 && event.key === '.') {
      //  Check we don't have one already in the string
      if ((this.value as string).indexOf('.') === -1) {
        this.insertCharacter(event);
      }

      return;
    }

    const value = parseInt(event.key, 10);

    if (isNaN(value)) {
      return;
    }

    this.updateText(event.key);

    this.moveCursorRight();
  }

  updateText(key:string) {
    if (this.cursorAtEnd()) {
      this.value = (this.value as string).concat(key);
    }
    else if (this.cursorAtStart()) {
      this.value = key.concat((this.value as string));
    }
    else {
      const start = (this.value as string).substring(0, this.cursorPosition);
      const end = (this.value as string).substr(this.cursorPosition);

      this.value = start.concat(key, end);
    }
  }

  countDecimals(value:number) {
    if (Math.floor(value) === value) {
      return 0;
    }

    return value.toString().split('.')[1].length || 0;
  }

  onAbort() {
    this.value = this.prev;

    this.stopInput();

    this.emit('abort', this.value);
  }

  onCommit() {
    if (this.type === 'number') {
      let total = parseFloat((this.value as string));

      if (total > this.max) {
        total = this.max;
      }
      else if (total < this.min) {
        total = this.min;
      }

      //  Decimal limit check
      const p = this.countDecimals(total);

      let t:any = total

      if (p > this.decimalPlaces) {
        //  Truncate
        t = total.toString();

        t = t.substring(0, t.length - (p - this.decimalPlaces));
      }

      this.value = t;
    }

    this.prev = this.value;

    this.stopInput();

    this.emit('submit', this.value);
  }

  insertCharacter(event:any) {
    const key = event.key;

    if ((this.value as string).length === this.maxlength) {
      return;
    }

    //  Ignore things like Shift, etc
    if (key.length === 1) {
      if (this.cursorAtEnd()) {
        this.value = (this.value as string).concat(key);
      }
      else if (this.cursorAtStart()) {
        this.value = key.concat(this.value);
      }
      else {
        const start = (this.value as string).substring(0, this.cursorPosition);
        const end = (this.value as string).substr(this.cursorPosition);

        this.value = start.concat(key, end);
      }

      this.moveCursorRight();
    }
  }

  updateBackground() {
    this.textInfo = this.font.getTextBounds(true);

    const localWidth = this.textInfo.local.width;

    const width = Phaser.Math.Clamp(localWidth + (this.paddingH * 2), this.minWidth, this.maxWidth);

    if (!this.fixedWidth && this.backgroundExpand) {
      this.background.setSize(width, this.background.height);
    }

    if (this.align === 0) {
      this.font.x = this.paddingH;
    }
    else if (this.align === 1) {
      if (this.fixedWidth) {
        this.font.x = Math.floor((this.background.width / 2) - (localWidth / 2));
      }
      else {
        this.font.x = Math.floor((width / 2) - (localWidth / 2));
      }
    }
    else if (this.align === 2) {
      if (this.fixedWidth) {
        this.font.x = Math.floor(this.background.width - localWidth);
      }
      else {
        this.font.x = Math.floor(width - localWidth);
      }
    }

    this.font.x += this.fontOffset;

    this.textInfo = this.font.getTextBounds(true);

    this.background.input.hitArea.width = width;

    if (this.suffix) {
      this.suffix.x = this.background.x + width + this.suffixPadding;
    }

    if (this.cursorPosition > this.totalChars) {
      this.moveCursorEnd();
    }

    //  Update the cursor location
    if (this.totalChars > 0) {
      if (this.cursorAtEnd()) {
        this.moveCursorEnd();
      }
      else if (this.cursorAtStart()) {
        this.moveCursorHome();
      }
      else {
        this.cursor.x = Math.floor(this.font.x + this.chars[this.cursorPosition].x);
      }
    }
    else {
      this.cursor.x = this.font.x;
    }

    this.updateParent();
  }

  updateParent() {
    //  Shuffle the parent
    const pb = this.parent.getBounds();

    this.parent.x = -(pb.width * this.originX);
    this.parent.y = -(pb.height * this.originY);

    if (this.labelAlign) {
      this.parent.x -= this.fontOffset;
    }
  }

  cursorAtEnd() {
    return (this.cursorPosition === this.totalChars);
  }

  cursorAtStart() {
    return (this.cursorPosition === 0);
  }

  getCursorInfo() {
    // const t = (this.cursorAtEnd()) ? 'End' : this.textInfo.characters[this.cursorPosition].char;

    // console.log('Cursor position: ', this.cursorPosition, '->', t);
  }

  moveCursorHome() {
    const chars = this.chars;

    if (this.totalChars > 0) {
      this.cursorPosition = 0;

      this.cursor.x = Math.floor(this.font.x + chars[0].x);
    }
    else {
      this.cursor.x = this.font.x;
    }

    this.getCursorInfo();
  }

  moveCursorEnd() {
    const chars = this.chars;

    if (this.totalChars > 0) {
      this.cursorPosition = this.totalChars;

      this.cursor.x = Math.floor(this.font.x + chars[this.cursorPosition - 1].x + chars[this.cursorPosition - 1].w);
    }
    else {
      this.cursor.x = this.font.x;
    }

    this.getCursorInfo();
  }

  moveCursorLeft() {
    const chars = this.chars;

    if (this.cursorPosition > 0) {
      this.cursorPosition--;

      this.cursor.x = Math.floor(this.font.x + chars[this.cursorPosition].x);
    }

    this.getCursorInfo();
  }

  moveCursorRight() {
    const chars = this.chars;

    if (this.cursorPosition < this.totalChars) {
      this.cursorPosition++;

      if (this.cursorPosition === this.totalChars) {
        this.cursor.x = this.font.x + chars[this.cursorPosition - 1].x + chars[this.cursorPosition - 1].w;

        const br = this.fontOffset + this.background.width;

        if (this.cursor.x > br) {
          this.cursor.x = br;
        }
      }
      else {
        this.cursor.x = this.font.x + chars[this.cursorPosition].x;
      }
    }

    this.getCursorInfo();
  }

  //  Move by word
  jumpCursorLeft() {
    const chars = this.chars;

    if (this.cursorAtStart()) {
      return;
    }

    for (let i = this.cursorPosition - 1; i >= 0; i--) {
      let char = chars[i];

      if (char.char === ' ' || char.char === '.' || char.char === ';') {
        this.cursorPosition = i;

        this.cursor.x = this.font.x + chars[this.cursorPosition].x;

        return;
      }
    }

    this.moveCursorHome();
  }

  jumpCursorRight() {
    const chars = this.chars;

    if (this.cursorAtEnd()) {
      return;
    }

    for (let i = this.cursorPosition + 1; i < this.totalChars; i++) {
      let char = chars[i];

      if (char.char === ' ' || char.char === '.' || char.char === ';') {
        this.cursorPosition = i;

        this.cursor.x = this.font.x + chars[this.cursorPosition].x;

        this.getCursorInfo();

        return;
      }
    }

    this.moveCursorEnd();
  }

  setFocus() {
    this.isOver = true;

    this.onDownHandler({ worldX: 0, worldY: 0 });
  }

  tidyString(value:any) {
    value = value.toString();

    value = value.replace(/\r?\n|\r/g, ' ');

    if (this.type === 'number' && value.length > this.maxlength) {
      //  Decimal limit check
      const p = this.countDecimals(value);

      if (p > this.decimalPlaces) {
        //  Truncate
        value = value.substring(0, value.length - (p - this.decimalPlaces));
      }
    }

    return value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    value = this.tidyString(value);

    if (value !== this._value) {
      this.emit('onchange', value);

      if (this.onChange) {
        this.onChange(value);
      }
    }

    this._value = value;

    if (this.type === 'password') {
      this.font.setText(Utils.String.Pad('', (this.value as string).length, '*', 1));
    }
    else {
      this.font.setText((this.value as string));
    }

    this.updateBackground();
  }

  get chars() {
    return this.textInfo.characters;
  }

  get totalChars() {
    return this.textInfo.characters.length;
  }

  destroy() {
    this.removeAllListeners();

    this.background.off('pointerdown', this.onDownHandler, this);
    this.background.off('pointerover', this.onOverHandler, this);
    this.background.off('pointerout', this.onOutHandler, this);
    this.background.off('wheel', this.onWheelHandler, this);

    if (this.label) {
      this.label.off('pointerdown', this.onDownHandler, this);
      this.label.off('pointerover', this.onOverHandler, this);
      this.label.off('pointerout', this.onOutHandler, this);

      this.label.destroy();
    }

    this.font.destroy();
    this.background.destroy();
    this.cursor.destroy();

    if (this.suffix) {
      this.suffix.destroy();
    }

    this.parent.destroy();

    this.scene.input.off('pointerdown', this.globalOnDownHandler, this);

    // @ts-ignore
    this.scene = null;
  }
}

export default TextInput