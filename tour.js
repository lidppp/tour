/**
 * Tour核心操作
 */
class TourCore {
  /**
   * 高亮区域
   * @type {null | HTMLElement}
   */
  backdrop = null;
  /**
   * 消息区域
   * @type {null | HTMLElement}
   */
  msgbox = null;
  /**
   * 箭头引用
   * @type {null | HTMLElement}
   */
  arrow = null
  /**
   * html插入容器
   * @type {null | HTMLElement}
   */
  msgContent = null
  /**
   * 当前高亮元素
   * @type {null | HTMLElement}
   */
  currentDom = null;
  /**
   * 消息要插入的HTML字符串
   * @type {null | String}
   */
  innerHTML = null;
  /**
   * 是否插入body中
   * @type {boolean}
   */
  isAppend = false;

  /**
   * 配置项
   * radius 高亮框外扩大小
   * arrowHeight 箭头高度
   * arrowWidth 箭头宽度
   * scrollTopOffset 当position为'top'时 距离顶部的偏移量
   * scrollBottomOffset 当position为'bottom'时 距离底部的偏移量
   * parentNode 插入节点的父元素
   * @type {{scrollTopOffset: number, scrollBottomOffset: number, arrowHeight: number, radius: number, arrowWidth: number, parentNode: HTMLElement}}
   */
  options = {
    radius: 10,
    arrowWidth: 10,
    arrowHeight: 50,
    scrollTopOffset: 100,
    scrollBottomOffset: 100,
    parentNode: document.body
  };

  /**
   * @param options {TourCore.options}
   */
  constructor(options) {
    this._createDom()
    this.options = {
      ...this.options,
      ...options
    }
  }

  /**
   * 创建html元素
   * @private
   */
  _createDom () {
    this.backdrop = document.createElement("div");
    this.backdrop.classList.add("dp-backdrop")
    this.msgbox = document.createElement("div")
    this.msgbox.classList.add("dp-msgbox")
    this.arrow = document.createElement("div")
    this.arrow.classList.add("dp-arrow")
    this.msgbox.appendChild(this.arrow)
    this.msgContent = document.createElement('div')
    this.msgContent.classList.add("dp-msgContent")
    this.msgbox.appendChild(this.msgContent)
  }

  /**
   * 计算渲染位置, 并且插入到body中
   * @param position {'bottom' | 'top'}
   */
  start (position) {
    let {
      x,
      y,
      width,
      height
    } = this.currentDom.getBoundingClientRect()
    // 获取当前文档位置
    const currentDocumentScrollY = window.scrollY
    const currentDocumentScrollX = window.scrollX
    // 计算当前元素的绝对位置
    x = currentDocumentScrollX + x
    y = currentDocumentScrollY + y

    this.backdrop.style = `--x:${x - this.options.radius}px;
    --y:${y - this.options.radius}px;
    --w:${width + this.options.radius * 2}px;
    --h:${height + this.options.radius * 2}px;`;
    this.msgContent.innerHTML = this.innerHTML

    if (!this.isAppend) {
      this.options.parentNode.append(this.backdrop)
      this.options.parentNode.append(this.msgbox)
      this.isAppend = true;
    }


    window.scrollTo({
      left: 0,
      top: position === "top" ? y - document.documentElement.clientHeight + height + this.options.radius + this.options.scrollBottomOffset : y - this.options.radius - this.options.scrollBottomOffset,
      behavior: 'smooth'
    });

    requestAnimationFrame(() => {
      const { height: h } = this.msgbox.getBoundingClientRect()
      console.log(h)
      this.msgbox.style = `
      --y:${y + (position === "top" ? ((this.options.radius * -1) - this.options.arrowHeight - h) : (height + this.options.radius + this.options.arrowHeight))}px;
      --arroww:${this.options.arrowWidth}px;
      --arrowh:${this.options.arrowHeight}px;
      --arrowx: ${x + (width / 2) - (this.options.arrowWidth / 2)}px;
      --arrowy: ${(position === "top" ? (h) : (this.options.arrowHeight * -1))}px;`;
    })
  }

  /**
   * 更新渲染元素和msg内容
   * @param dom {HTMLElement} 高亮dom元素
   * @param _innerHTML {String} msgHTML内容
   * @param position {'bottom'|'top'} 位置
   */
  update (dom, _innerHTML, position = "bottom") {
    this.currentDom = dom;
    this.innerHTML = _innerHTML;
    this.start(position);
  }

  /**
   * 卸载元素
   */
  unmount () {
    this.options.parentNode.removeChild(this.backdrop);
    this.options.parentNode.removeChild(this.msgbox);
    this.isAppend = false;
  }
}


class Tour {
  /**
   *
   * @type {[{dom: HTMLElement, html: String, msgPosition: 'top' | 'bottom'}]}
   */
  dataList = [];
  /**
   * 当前选中下标
   * @private
   * @type {Number}
   */
  _activeIndex = 0;
  /**
   *
   * @type {null | TourCore}
   */
  core = null;

  /**
   * constructor
   * @param _dataList {[{dom: HTMLElement, html: String}]}  数据列表
   * @param options {TourCore.options} 配置项
   */
  constructor(_dataList, options) {
    this.dataList = _dataList
    this.core = new TourCore(options)
  }

  /**
   * 开始执行
   * @param index {Number} 数据列表中的开始位置
   */
  start (index = 0) {
    this._activeIndex = index
    const data = this.dataList[this._activeIndex];
    this.core.update(data.dom, data.html, data.msgPosition);
  }

  /**
   * 隐藏
   */
  hidden () {
    this.core.unmount();
  }

  /**
   * 下一个, 如果碰到最后一个直接销毁
   */
  next () {
    if (this._activeIndex + 1 > this.dataList.length - 1) {
      this.hidden()
      return;
    }
    this._activeIndex++
    this.start(this._activeIndex)
  }

  /**
   * 上一个, 如果是第一个则无操作
   */
  previous () {
    if (this._activeIndex === 0) {
      return;
    }
    this._activeIndex--
    this.start(this._activeIndex)
  }

}
