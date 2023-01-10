function setCanvasImage(path, func) {
  const img = new Image();
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  img.onload = function () {
    c.width = this.naturalWidth;
    c.height = this.naturalHeight;
    ctx.drawImage(this, 0, 0);
    c.toBlob((blob) => {
      func(blob);
    }, 'image/png');
  };
  img.src = path;
}
const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};
let myalert = alert;
alert = function() {};
window.alert = function() {};
class Site {
  static _domain = "";
  static _category_page_detect = null;
  static _post_page_detect = null;
  static _accent_page_detect = null;
  static _author_page_detect = null;
  constructor(domainValue) {
    this._domain = domainValue;
  }
  static get domain() {
    return this._domain;
  }
  static set domain(value) {
    this._domain = value;
  }
  static get category_page_detect() {
    return this._category_page_detect;
  }
  static set category_page_detect(value) {
    this._category_page_detect = value;
  }
  static get post_page_detect() {
    return this._post_page_detect;
  }
  static set post_page_detect(value) {
    this._post_page_detect = value;
  }
  static get accent_page_detect() {
    return this._accent_page_detect;
  }
  static set accent_page_detect(value) {
    this._accent_page_detect = value;
  }
  static get author_page_detect() {
    return this._author_page_detect;
  }
  static set author_page_detect(value) {
    this._author_page_detect = value;
  }
  static isThis() {
    return window.location.href.match(new RegExp(`/${this.domain}/`));
  }
  static isCategory() {
    if (typeof this.category_page_detect == "string") {
      if (this.category_page_detect == "") {
        return false;
      }
      return this.isThis() && $(this.category_page_detect).length > 0;
    }
    else {
      return this.isThis() && this.category_page_detect();
    }
  }
  static isPost() {
    if (typeof this.post_page_detect == "string") {

      return this.isThis() && $(this.post_page_detect).length > 0;
    }
    else {
      return this.isThis() && this.post_page_detect();
    }
  }
  static isAccent() {
    if (typeof this.accent_page_detect == "string") {
      if (this.accent_page_detect == "") {
        return false;
      }
      return this.isThis() && $(this.accent_page_detect).length > 0;
    }
    else {
      return this.isThis() && this.accent_page_detect();
    }
  }
  static isAuthor() {
    if (typeof this.author_page_detect == "string") {
      if (this.author_page_detect == "") {
        return false;
      }
      return this.isThis() && $(this.author_page_detect).length > 0;
    }
    else {
      return this.isThis() && this.author_page_detect();
    }
  }
  static isCrawable() {
    return this.isAccent() || this.isAuthor() || this.isCategory() || this.isPost();
  }
}
