/**
 * DFlip Texture Library Class
 */

import { SOURCE_TYPE, PAGE_SIZE, VERSION } from '../constants.js';
import { httpsCorrection, log, nearestPowerOfTwo, getBasePage, isBookletMode, isRTLMode, limitAt, createObjectURL, getScript } from '../utils.js';
import { PDFLinkService } from '../features/pdf-link-service.js';
import { ThumbList } from '../features/thumb-list.js';
import { BookMarkViewer } from '../features/bookmark.js';

export class TextureLibrary {
  constructor(source, callback, options, flipbook) {
    const self = this;
    options = options || {};
    self.contentRawSource = source || [options.textureLoadFallback];
    self.contentSource = self.contentRawSource;
    self.contentSourceType = null;
    self.minDimension = options.minTextureSize || 256;
    self.maxDimension = options.maxTextureSize || 2048;
    self.pdfRenderQuality = options.pdfRenderQuality || 0.9;
    self.flipbook = flipbook;
    self.waitPeriod = 50;
    self.maxLength = 297;
    self.enableDebug = false;
    self.zoomScale = 1;
    self.maxZoom = 2;
    self.options = options;
    self.outline = options.outline;
    self.links = options.links;
    self.html = options.html;
    self.isCrossOrigin = options.isCrossOrigin;
    self.normalViewport = { height: 297, width: 210, scale: 1 };
    self.viewport = { height: 297, width: 210, scale: 1 };
    self.imageViewport = { height: 297, width: 210, scale: 1 };
    self.bookSize = { height: 297, width: 210 };
    self.zoomViewport = { height: 297, width: 210 };
    self.thumbsize = 128;
    self.cacheIndex = 256;
    self.cache = [];
    self.pageRatio = options.pageRatio || self.viewport.width / self.viewport.height;
    self.textureLoadTimeOut = null;
    self.type = "TextureLibrary";

    const $ = jQuery;

    if (Array.isArray(self.contentSource)) {
      self.contentSourceType = SOURCE_TYPE.IMAGE;
      self.pageCount = self.contentSource.length;
      for (let i = 0; i < self.contentSource.length; i++) {
        self.contentSource[i] = httpsCorrection(self.contentSource[i].toString());
      }
      $("<img/>")
        .attr("src", self.contentSource[0])
        .on("load", function () {
          self.viewport.height = this.height;
          self.viewport.width = this.width;
          self.pageRatio = self.viewport.width / self.viewport.height;
          self.bookSize = {
            width: (self.pageRatio > 1 ? 1 : self.pageRatio) * self.maxLength,
            height: self.maxLength / (self.pageRatio < 1 ? 1 : self.pageRatio),
          };
          self.zoomViewport = {
            width: (self.pageRatio > 1 ? 1 : self.pageRatio) * self.maxDimension,
            height: self.maxDimension / (self.pageRatio < 1 ? 1 : self.pageRatio),
          };
          self.linkService = new PDFLinkService();
          $(this).off();
          if (self.options.pageSize == PAGE_SIZE.DOUBLEINTERNAL) {
            self.pageCount = self.contentSource.length * 2 - 2;
            if (self.options.webgl == true) self.requiresImageTextureScaling = true;
          }
          if (callback != null) {
            callback(self);
            callback = null;
          }
          log(this.height + ":" + this.width);
        });
    } else if (typeof self.contentSource == "string") {
      const loadBase64 = () => {
        if (self.contentSource.indexOf(".base64") > 1) {
          $.ajax({
            url: self.contentSource,
            xhrFields: {
              onprogress: (e) => {
                if (e.lengthComputable) {
                  const percent = (100 * e.loaded) / e.total;
                  self.updateInfo(self.options.text.loading + " PDF " + percent.toString().split(".")[0] + "% ...");
                }
              },
            },
            success: (data) => {
              self.options.docParameters = { data: atob(data) };
              loadPdf();
            },
          });
        } else {
          loadPdf();
        }
      };

      const loadPdf = () => {
        if (!self) return;
        // console.log("[DFlip] Setting Worker Path:", options.pdfjsWorkerSrc);
        pdfjsLib.GlobalWorkerOptions.workerSrc = options.pdfjsWorkerSrc;
        self.contentSourceType = SOURCE_TYPE.PDF;
        const o = (self.loading = pdfjsLib.getDocument(
          self.options.docParameters
            ? self.options.docParameters
            : {
                url: httpsCorrection(source),
                rangeChunkSize: isNaN(self.options.rangeChunkSize) ? 524288 : self.options.rangeChunkSize,
                cMapUrl: options.cMapUrl,
                cMapPacked: true,
                imageResourcesPath: options.imageResourcesPath,
                disableAutoFetch: true,
                disableStream: true,
                disableFontFace: self.options.disableFontFace,
              }
        ));
        o.promise.then(
          (pdf) => {
            self.pdfDocument = pdf;
            pdf.getPage(1).then((page) => {
              self.normalViewport = page.getViewport({ scale: 1 });
              self.viewport = page.getViewport({ scale: 1 });
              self.viewport.height = self.viewport.height / 10;
              self.viewport.width = self.viewport.width / 10;
              self.pageRatio = self.viewport.width / self.viewport.height;
              self.bookSize = {
                width: (self.pageRatio > 1 ? 1 : self.pageRatio) * self.maxLength,
                height: self.maxLength / (self.pageRatio < 1 ? 1 : self.pageRatio),
              };
              self.zoomViewport = {
                width: (self.pageRatio > 1 ? 1 : self.pageRatio) * self.maxDimension,
                height: self.maxDimension / (self.pageRatio < 1 ? 1 : self.pageRatio),
              };
              self.refPage = page;
              if (pdf.numPages > 1) {
                pdf.getPage(2).then((page2) => {
                  if (self.options.pageSize == PAGE_SIZE.AUTO) {
                    const vp = page2.getViewport({ scale: 1 });
                    const ratio = vp.width / vp.height;
                    if (ratio > self.pageRatio * 1.5) {
                      self.options.pageSize = PAGE_SIZE.DOUBLEINTERNAL;
                      self.pageCount = pdf.numPages * 2 - 2;
                    } else {
                      self.options.pageSize = PAGE_SIZE.SINGLE;
                    }
                  }
                  if (callback != null) {
                    callback(self);
                    callback = null;
                  }
                });
              } else {
                if (callback != null) {
                  callback(self);
                  callback = null;
                }
              }
            });
            self.linkService = new PDFLinkService();
            self.linkService.setDocument(pdf, null);
            self.pageCount = pdf.numPages;
            self.contentSource = pdf;
          },
          (err) => {
            if (self) {
              let msg = "";
              const a = document.createElement("a");
              a.href = self.contentSource;
              if (a.hostname !== window.location.hostname) msg = "CROSS ORIGIN!! ";
              self.updateInfo(msg + "Cannot access file!  " + self.contentSource);
            }
          }
        );
        o.onProgress = (progress) => {
          if (self) {
            const percent = (100 * progress.loaded) / progress.total;
            if (isNaN(percent)) {
              if (progress && progress.loaded) {
                self.updateInfo(self.options.text.loading + " PDF " + (Math.ceil(progress.loaded / 1e4) / 100).toString() + "MB ...");
              } else {
                self.updateInfo(self.options.text.loading + " PDF ...");
              }
            } else {
              self.updateInfo(self.options.text.loading + " PDF " + percent.toString().split(".")[0] + "% ...");
            }
          }
        };
      };

      const loadWorker = () => {
        if (!self) return;
        if (options.pdfjsWorkerSrc.indexOf("?ver") < 0) options.pdfjsWorkerSrc += "?ver=" + VERSION;
        self.updateInfo(self.options.text.loading + " PDF Worker ...");
        const a = document.createElement("a");
        a.href = options.pdfjsWorkerSrc;
        if (a.hostname !== window.location.hostname && a.hostname !== "") {
          self.updateInfo(self.options.text.loading + " PDF Worker CORS ...");
          $.ajax({
            url: options.pdfjsWorkerSrc,
            cache: true,
            success: (data) => {
              options.pdfjsWorkerSrc = createObjectURL(data, "text/javascript");
              loadBase64();
            },
          });
        } else {
          loadBase64();
        }
      };

      if (window.pdfjsLib == null) {
        self.updateInfo(self.options.text.loading + " PDF Service ...");
        getScript(options.pdfjsSrc + "?ver=" + VERSION, () => {
          loadWorker();
        }, () => {
          self.updateInfo("Unable to load PDF service..");
        });
      } else {
        loadWorker();
      }
    } else {
      console.error("Unknown source type. Please check documentation for help");
    }

    this.dispose = () => {
      if (self.loading && self.loading.destroy) {
        self.loading.destroy();
      }
      self.loading = null;
      if (self.textureLoadTimeOut) {
        clearTimeout(self.textureLoadTimeOut);
        self.textureLoadTimeOut = null;
      }
      if (this.targetObject) {
        if (this.targetObject.thumbContainer) this.targetObject.thumbContainer.remove();
        if (this.targetObject.outlineContainer) this.targetObject.outlineContainer.remove();
        if (this.targetObject.dispose) this.targetObject.dispose();
        this.targetObject.processPage = null;
        this.targetObject.requestPage = null;
        if (this.targetObject.container) this.targetObject.container.off();
      }
      if (this.pdfDocument) this.pdfDocument.destroy();
      if (this.linkService) this.linkService.dispose();
      if (this.outlineViewer) this.outlineViewer.dispose();
      if (this.thumblist) this.thumblist.dispose();
      this.activeThumb = null;
      this.targetObject = null;
      this.pdfDocument = null;
      this.linkService = null;
      this.outlineViewer = null;
      this.thumblist = null;
    };
  }

  updateInfo(msg) {
    if (this.flipbook && this.flipbook.updateInfo) {
      this.flipbook.updateInfo(msg);
    }
  }

  initThumbs() {
    const self = this;
    const $ = jQuery;
    if (self.cache[self.thumbsize] == null) self.cache[self.thumbsize] = [];
    let timer;

    const scheduleReview = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = setTimeout(review, self.waitPeriod / 2);
      }, self.waitPeriod);
    };

    const review = () => {
      let count = 0;
      if (Date.now() - self.thumblist.lastScrolled < 100) {
        count = 1;
      } else {
        self.targetObject.container
          .find(".df-thumb-container .df-vrow")
          .each(function () {
            const row = $(this);
            if (!row.hasClass("df-thumb-loaded")) {
              count++;
              const pageIdx = row.attr("id").replace("df-thumb", "");
              self.getPage(pageIdx, scheduleReview, true);
              row.addClass("df-thumb-loaded");
              return false;
            }
          });
        if (count == 0) clearTimeout(timer);
      }
      if (count > 0) scheduleReview();

      if (self.activeThumb != self.targetObject._activePage) {
        const isVisible = self.targetObject.thumbContainer != null && self.targetObject.thumbContainer.hasClass("df-sidemenu-visible");
        if (isVisible) {
          const container = self.thumblist.container;
          const scrollTop = container.scrollTop;
          const height = container.getBoundingClientRect().height;
          const selected = self.targetObject.thumbContainer.find("#df-thumb" + self.targetObject._activePage);
          if (selected.length > 0) {
            self.targetObject.thumbContainer.find(".df-selected").removeClass("df-selected");
            selected.addClass("df-selected");
            const el = selected[0];
            if (scrollTop + height < el.offsetTop + el.scrollHeight) {
              // scrollIntoView needs to be imported or available
              el.scrollIntoView();
            } else if (scrollTop > el.offsetTop) {
              el.scrollIntoView();
            }
            self.activeThumb = self.targetObject._activePage;
          } else {
            $(container).scrollTop(self.targetObject._activePage * 124);
            scheduleReview();
          }
        }
      }
    };

    self.thumblist = self.targetObject.thumblist = new ThumbList({
      h: 500,
      addFn: (idx) => {},
      scrollFn: scheduleReview,
      itemHeight: 148, /* Matched with CSS height 140px + 8px margin */
      totalRows: self.pageCount,
      generatorFn: (idx) => {
        const div = document.createElement("div");
        const pageNum = idx + 1;
        div.id = "df-thumb" + pageNum;
        const inner = document.createElement("div");
        inner.innerHTML = pageNum;
        div.appendChild(inner);
        return div;
      },
    });

    self.thumblist.lastScrolled = Date.now();
    self.thumblist.review = scheduleReview;
    
    // Start background preloading of all thumbnails
    const preloadAllThumbs = () => {
      let currentIdx = 1;
      const loadNext = () => {
        if (!self || !self.thumblist) return;
        if (currentIdx <= self.pageCount) {
          const cached = self.getCache(currentIdx, true);
          if (!cached) {
            self.getPage(currentIdx, () => {
              currentIdx++;
              setTimeout(loadNext, 100); // Small delay to yield
            }, true);
          } else {
            currentIdx++;
            loadNext();
          }
        }
      };
      setTimeout(loadNext, 1000); // Wait a bit after init
    };
    preloadAllThumbs();
    
    scheduleReview();

    const thumbContainer = $("<div>").addClass("df-thumb-container df-sidemenu-visible df-sidemenu");

    // Pro-level fix: Disable OrbitControls and library scrollWheel option when hovering panel
    const disableOrbit = () => {
      if (self.targetObject && self.targetObject.stage && self.targetObject.stage.orbitControl) {
        self.targetObject.stage.orbitControl.enabled = false;
      }
    };
    const enableOrbit = () => {
      if (self.targetObject && self.targetObject.stage && self.targetObject.stage.orbitControl) {
        self.targetObject.stage.orbitControl.enabled = true;
      }
      if (self.flipbook && self.flipbook.options) {
        self.flipbook.options.scrollWheel = true;
      }
    };
    thumbContainer.on("mouseenter", disableOrbit).on("mouseleave", enableOrbit);

    thumbContainer.append($(self.thumblist.container).addClass("df-thumb-wrapper"));
    self.targetObject.thumbContainer = thumbContainer;
    self.targetObject.container.append(thumbContainer);
    const closeBtn = $("<div>").addClass("df-ui-btn df-ui-sidemenu-close ti-close")
      .on("click", (e) => {
        e.stopPropagation();
        thumbContainer.removeClass("df-sidemenu-visible");
        if(self.targetObject.ui && self.targetObject.ui.thumbnail) {
          self.targetObject.ui.thumbnail.removeClass("df-active");
        }
        if(self.targetObject.ui && self.targetObject.ui.update) self.targetObject.ui.update();
      });
    thumbContainer.append(closeBtn);
    self.thumblist.reset($(self.thumblist.container).height());

    self.targetObject.container.on("click", ".df-thumb-container .df-vrow", function (e) {
      e.stopPropagation();
      const pageIdx = $(this).attr("id").replace("df-thumb", "");
      self.targetObject.gotoPage(parseInt(pageIdx, 10));
    });
  }

  initOutline() {
    const self = this;
    const $ = jQuery;
    const container = $("<div>").addClass("df-outline-container df-sidemenu");
    const wrapper = $("<div>").addClass("df-outline-wrapper");

    // Pro-level fix: Disable OrbitControls when hovering panel (prevents accidental rotation)
    const disableOrbit = () => {
      if (self.targetObject && self.targetObject.stage && self.targetObject.stage.orbitControl) {
        self.targetObject.stage.orbitControl.enabled = false;
      }
    };
    const enableOrbit = () => {
      if (self.targetObject && self.targetObject.stage && self.targetObject.stage.orbitControl) {
        self.targetObject.stage.orbitControl.enabled = true;
      }
      if (self.flipbook && self.flipbook.options) {
        self.flipbook.options.scrollWheel = true;
      }
    };
    container.on("mouseenter", disableOrbit).on("mouseleave", enableOrbit);

    // Prevent scroll events from bubbling up to the flipbook (prevents unwanted zoom while scrolling)
    const stopPropagation = (e) => {
      if (e.ctrlKey) return; // Allow Ctrl+Wheel (Zoom) to propagate
      e.stopPropagation();
    };
    wrapper[0].addEventListener("wheel", stopPropagation, { passive: false, capture: true });
    wrapper[0].addEventListener("touchstart", stopPropagation, { passive: true });
    wrapper[0].addEventListener("touchmove", stopPropagation, { passive: true });

    const closeBtn = $("<div>").addClass("df-ui-btn df-ui-sidemenu-close ti-close")
      .on("click", (e) => {
        e.stopPropagation();
        container.removeClass("df-sidemenu-visible");
        if(self.targetObject.ui && self.targetObject.ui.outline) {
          self.targetObject.ui.outline.removeClass("df-active");
        }
        if(self.targetObject.ui && self.targetObject.ui.update) self.targetObject.ui.update();
      });
    container.append(closeBtn).append(wrapper);
    self.targetObject.container.append(container);
    self.targetObject.outlineContainer = container;

    self.outlineViewer = new BookMarkViewer({
      container: wrapper[0],
      linkService: self.linkService,
      outlineItemClass: "df-outline-item",
      outlineToggleClass: "df-outline-toggle",
      outlineToggleHiddenClass: "df-outlines-hidden",
    });

    const renderOutline = (outline) => {
      if (self.options.overwritePDFOutline == true) outline = [];
      outline = outline || [];
      if (self.outline) {
        for (let i = 0; i < self.outline.length; i++) {
          self.outline[i].custom = true;
          outline.push(self.outline[i]);
        }
      }
      if (outline.length === 0 && self.targetObject.ui.outline != null) {
        self.targetObject.ui.outline.hide();
      }
      self.outlineViewer.render({ outline });
    };

    if (self.pdfDocument) {
      self.pdfDocument.getOutline().then(renderOutline);
    } else {
      renderOutline([]);
    }

    if (self.options.autoEnableOutline == true) self.targetObject.ui.outline.trigger("click");
    if (self.options.autoEnableThumbnail == true) self.targetObject.ui.thumbnail.trigger("click");
  }

  checkViewportSize(width, height, scale) {
    const self = this;
    const target = self.targetObject;
    const cacheIdx = self.cacheIndex;

    if (self.contentSourceType == SOURCE_TYPE.PDF) {
      self.cacheIndex = Math.floor(Math.max(width * scale, height * scale));
      self.cacheIndex = limitAt(self.cacheIndex * (window.devicePixelRatio || 1), self.minDimension, self.maxDimension);

      if (self.cache[self.cacheIndex] == null) self.cache[self.cacheIndex] = [];
      if (cacheIdx !== self.cacheIndex) {
        target.refresh();
      }
      self.imageViewport = self.refPage.getViewport({ scale: (height * scale) / self.normalViewport.height });
      self.viewport = target.mode == "css" ? self.imageViewport : self.refPage.getViewport({ scale: self.bookSize.height / self.normalViewport.height });
      self.annotedPage = undefined;
      self.review();
    } else {
      if (self.cache[self.cacheIndex] == null) self.cache[self.cacheIndex] = [];
    }
  }

  getCache(idx, isThumb) {
    const cacheIdx = isThumb ? this.thumbsize : this.cacheIndex;
    return this.cache[cacheIdx] ? this.cache[cacheIdx][idx] : null;
  }

  setCache(idx, data, isThumb, forcedIdx) {
    const cacheIdx = isThumb ? this.thumbsize : (forcedIdx || this.cacheIndex);
    if (!this.cache[cacheIdx]) this.cache[cacheIdx] = [];
    this.cache[cacheIdx][idx] = data;
  }

  setTarget(target) {
    const self = this;
    if (target == null) return this.targetObject;
    this.targetObject = target;
    target.contentProvider = this;
    target.container.removeClass("df-loading df-init");
    if (self.linkService != null) {
      self.linkService.setViewer(target);
      self.initOutline();
    }
    target.processPage = (idx, callback) => {
      if (idx > 0 && idx <= self.pageCount) {
        self.getPage(idx, callback);
      } else {
        self.setPage(idx, self.options.textureLoadFallback, callback);
      }
    };
    target.requestPage = () => {
      self.review("Request");
    };
    if (target.resize != null) target.resize();
  }

  review(reason) {
    const self = this;
    clearTimeout(self.textureLoadTimeOut);
    self.textureLoadTimeOut = setTimeout(() => {
      self.textureLoadTimeOut = setTimeout(() => self.reviewPages(self, reason), self.waitPeriod / 2);
    }, self.waitPeriod);
  }

  reviewPages(self, reason) {
    const target = self.targetObject;
    if (!target) return;
    const isBooklet = isBookletMode(target);
    let isFlipping = false;

    for (let i = 0; i < target.children.length; i++) {
      if (target.children[i].isFlipping) {
        isFlipping = true;
        break;
      }
    }

    if (!isFlipping) {
      const numVisible = Math.min(target.children.length, 3);
      const activeIdx = isBooklet ? target._activePage : getBasePage(target._activePage);
      self.baseNumber = activeIdx;
      const range = self.zoomScale > 1 ? 1 : numVisible;

      for (let i = 0; i < range; i++) {
        const offset = Math.floor(i / 2);
        const delta = i % 2 == 0 ? -offset * (isBooklet ? 1 : 2) : (offset == 0 ? 1 : offset) * (isBooklet ? 1 : 2);
        const p1 = activeIdx + delta, p2 = activeIdx + delta + 1;
        const page1 = target.getPageByNumber(p1), page2 = target.getPageByNumber(p2);
        const stamp1 = p1 + "|" + self.cacheIndex, stamp2 = p2 + "|" + self.cacheIndex;
        let loaded = 0;

        if (page1 && page1.frontPageStamp != stamp1 && page1.visible) {
          page1.frontTextureLoaded = false;
          target.processPage(p1, () => self.review("Batch Call"));
          page1.frontPageStamp = stamp1;
          loaded++;
        }
        if (page2 && page2.backPageStamp != stamp2 && page2.visible && !isBooklet) {
          page2.backTextureLoaded = false;
          target.processPage(p2, () => self.review("Batch Call"));
          page2.backPageStamp = stamp2;
          loaded++;
        }

        if (delta == 0 && self.annotedPage !== activeIdx) {
          self.getAnnotations(p1);
          if (!isBooklet) self.getAnnotations(p2);
          self.annotedPage = activeIdx;
        }
        if (loaded > 0) break;
      }
    } else {
      self.review("Revisit request");
    }
  }

  getPage(idx, callback, isThumb) {
    const self = this;
    const pageIdx = parseInt(idx, 10);
    let sourceIdx = pageIdx;
    const source = self.contentSource;

    if (pageIdx <= 0 && pageIdx >= self.pageCount) {
      self.setPage(pageIdx, self.options.textureLoadFallback, callback, isThumb);
    } else {
      const cached = self.getCache(pageIdx, isThumb);
      if (cached) {
        self.setPage(pageIdx, cached, callback, isThumb);
      } else {
        if (!isThumb) self.setLoading(pageIdx, true);
        if (self.options.pageSize == PAGE_SIZE.DOUBLEINTERNAL && pageIdx > 2) {
          sourceIdx = Math.ceil((pageIdx - 1) / 2) + 1;
        }

        if (self.contentSourceType == SOURCE_TYPE.PDF) {
          source.getPage(sourceIdx).then((page) => {
            renderPdfPage(page, pageIdx, callback, isThumb);
          });
        } else {
          const imgSrc = source[sourceIdx - 1];
          const img = new Image();
          if (self.isCrossOrigin) img.crossOrigin = "Anonymous";
          img.onload = () => {
            self.setCache(pageIdx, imgSrc, isThumb, self.cacheIndex);
            self.setPage(pageIdx, imgSrc, callback, isThumb);
            if (callback) callback();
          };
          img.src = imgSrc;
        }
      }
    }

    function renderPdfPage(page, idx, callback, isThumb) {
      const forceFit = self.options.forceFit;
      const isInternalDouble = self.options.pageSize == PAGE_SIZE.DOUBLEINTERNAL && idx > 1 && idx < self.pageCount;
      const ratio = (isInternalDouble && forceFit) ? 2 : 1;
      const baseViewport = forceFit ? page.getViewport({ scale: 1 }) : self.normalViewport;
      let scale = self.cacheIndex / Math.max(baseViewport.width / ratio, baseViewport.height);

      if (self.webgl) {
        scale = nearestPowerOfTwo(self.cacheIndex) / (self.pageRatio > 1 ? baseViewport.width / ratio : baseViewport.height);
      }

      if (isThumb) {
        scale = self.thumbsize / self.normalViewport.height;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = Math.round(baseViewport.height * scale);
      canvas.width = Math.round((baseViewport.width / ratio) * scale);

      if (self.targetObject.mode == "css" && Math.abs(self.targetObject.zoomHeight - canvas.height) < 2) {
        canvas.height = self.targetObject.zoomHeight;
        canvas.width = self.targetObject.zoomWidth;
      }

      const viewport = page.getViewport({ scale });
      if (isInternalDouble) {
        if (isRTLMode(self.targetObject)) {
          if (idx % 2 == 0) viewport.transform[4] = -canvas.width;
        } else {
          if (idx % 2 == 1) viewport.transform[4] = -canvas.width;
        }
      }

      page.cleanupAfterRender = true;
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        if (isThumb || (self.options.canvasToBlob && !self.webgl)) {
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            self.setCache(idx, url, isThumb, self.cacheIndex);
            self.setPage(idx, url, callback, isThumb);
          }, "image/jpeg", self.pdfRenderQuality);
        } else {
          self.setPage(idx, canvas, callback, isThumb);
        }
      });
    }
  }

  setLoading(idx, loading) {
    const $ = jQuery;
    if (!this.targetObject) return;
    if (this.webgl) {
      const container = this.targetObject.container;
      if (loading) {
        if (!container.isLoading) {
          container.addClass("df-loading");
          container.isLoading = true;
        }
      } else {
        if (container.isLoading) {
          container.removeClass("df-loading");
          container.isLoading = null;
        }
      }
    } else {
      const layer = $(this.targetObject.getContentLayer(idx));
      if (layer) {
        if (loading) layer.addClass("df-page-loading");
        else layer.removeClass("df-page-loading");
      }
    }
  }

  getAnnotations(idx) {
    const self = this;
    const $ = jQuery;
    if (self.options.enableAnnotation == false) return;
    const target = self.targetObject;
    const pageIdx = parseInt(idx, 10);
    const layer = $(target.getContentLayer(pageIdx));
    layer.empty();

    if (pageIdx > 0 && pageIdx <= self.pageCount) {
      if (self.contentSourceType == SOURCE_TYPE.PDF) {
        let srcIdx = pageIdx;
        if (self.options.pageSize == PAGE_SIZE.DOUBLEINTERNAL && pageIdx > 2) {
          srcIdx = Math.ceil((pageIdx - 1) / 2) + 1;
        }
        self.contentSource.getPage(srcIdx).then((page) => {
          if (layer.length > 0) {
            const vp = page.getViewport({ scale: self.viewport.height / page.getViewport({ scale: 1 }).height });
            self.setupAnnotations(page, vp, layer, pageIdx);
          }
        });
      }
      // Custom links and HTML annotations could be added here
    }
  }

  setPage(idx, data, callback, isThumb) {
    const self = this;
    const target = self.targetObject;
    const isRTL = isRTLMode(target);
    const isBooklet = isBookletMode(target);

    if (isThumb) {
      const thumb = target.container.find("#df-thumb" + idx);
      thumb.css({ backgroundImage: `url(${data})` });
    } else {
      const page = target.getPageByNumber(idx);
      if (page) {
        const isBack = (idx % 2 != 0 && !isRTL) || (idx % 2 != 1 && isRTL && !isBooklet) || (isBooklet && !isRTL);
        if (isBack) {
          page.backImage(data, (img, tex) => {
            page.backTextureLoaded = true;
            self.setLoading(idx, false);
            if (self.requiresImageTextureScaling && tex && idx != 1 && idx != self.pageCount) {
              tex.repeat.x = 0.5;
              tex.offset.x = 0.5;
            }
            if (callback) callback();
          });
        } else {
          page.frontImage(data, (img, tex) => {
            page.frontTextureLoaded = true;
            self.setLoading(idx, false);
            if (self.requiresImageTextureScaling && tex && idx != 1 && idx != self.pageCount) {
              tex.repeat.x = 0.5;
            }
            if (callback) callback();
          });
        }
      }
    }
  }

  setupAnnotations(page, viewport, layer, idx) {
    const self = this;
    const $ = jQuery;
    return page.getAnnotations().then((annotations) => {
      const vp = viewport.clone({ dontFlip: true });
      const $layer = $(layer);
      let annDiv = $layer.find(".annotationDiv");
      if (annDiv.length == 0) {
        annDiv = $("<div class='annotationDiv'>");
        $layer.append(annDiv);
      }
      annDiv.empty();

      if (self.options.pageSize == PAGE_SIZE.DOUBLEINTERNAL && idx > 2 && idx % 2 == 1) {
        annDiv.css({ left: "-100%" });
      } else if (idx == 1) {
        annDiv.css({ left: "" });
      }

      pdfjsLib.AnnotationLayer.render({
        annotations,
        div: annDiv[0],
        page,
        viewport: vp,
        imageResourcesPath: self.options.imageResourcesPath,
        linkService: self.linkService,
      });

      if (self.options.annotationClass) {
        annDiv.find("> section").addClass(self.options.annotationClass);
      }
    });
  }
}
