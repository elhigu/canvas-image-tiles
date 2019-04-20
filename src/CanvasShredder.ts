export interface CanvasShredder {
    destroy(): void
    updateOrientation(update?: any): void
    getPreviewCssTransform(): string
    slice(
        x: number,
        y: number,
        sliceSize: number,
        dstCanvas: HTMLCanvasElement,
    ): void
}

/*
 * @param sourceImage Image DOM element where full input data is stored.
 * @param previewAreaEl DOM element where preview canvas is placed with append.
 * @param options {Object} Additional options.
 * @param options.storeOriginalInCanvas {boolean} Set this true to create
 *   internal non attached canvas element where full size input data is stored.
 *   Causes more memory load specially on mobile devices, but may make copying tiles
 *   faster (on some platforms copying from canvas->canvas is lot more efficient than
 *   img->canvas due to place where image is stored).
 * @param options.noCssAutoUpdate {boolean} Default false, if this set CSS is never updated
 *   automatically.
 * @constructor
 */
export class CanvasShredder {
    // properties
    public srcCanvas: HTMLImageElement | HTMLCanvasElement
    public rotation: number
    public previewScale: number
    public scale: number

    public initialOrigoX: number
    public initialOrigoY: number
    public position: {x: number, y: number}
    public previewCanvas: HTMLCanvasElement

    public waitForPreviewCssUpdate: boolean

    constructor(
        public sourceImage: HTMLImageElement,
        public previewAreaEl: HTMLElement,
        public options = {
            noCssAutoUpdate: false,
            storeOriginalInCanvas: true,
        },
        dstCanvas: HTMLCanvasElement,
    ) {

        // this.options = options
        // initial origo is in the center of preview area
        //    this.initialOrigoX = previewAreaEl.offsetWidth / 2
        //         this.initialOrigoY = previewAreaEl.offsetHeight / 2

        //         // TODO: calculate from viewWidth / viewHeight
        //         this.scale = 0.2
        //         this.position = {x: 0, y: 0}
        //         this.rotation = 0
        //         this.waitForPreviewCssUpdate = false

        const ctx: CanvasRenderingContext2D = dstCanvas.getContext("2d", { alpha: false })

        sourceImage.onload = function() {
            //   dstCanvas.width = sourceImage.width
            // dstCanvas.height = sourceImage.height
            //  ctx.drawImage(sourceImage, 0, 0)
        }
    }
}
//         let srcCanvas
//         if (options && options.storeOriginalInCanvas) {
//             // full size canvas where from to copy data to tile
//             srcCanvas = document.createElement("canvas")
//             srcCanvas.width = sourceImage.naturalWidth
//             srcCanvas.height = sourceImage.naturalHeight
//             const sourceCtx: CanvasRenderingContext2D = srcCanvas.getContext("2d")!
//             sourceCtx.drawImage(sourceImage, 0, 0)
//         } else {
//             // use original image tag to store full size image
//             srcCanvas = sourceImage
//             srcCanvas.width = sourceImage.naturalWidth
//             srcCanvas.height = sourceImage.naturalHeight
//         }

//         this.srcCanvas = srcCanvas

//         // createselec smaller preview canvas
//         const previewCanvas = document.createElement("canvas")
//         const aspectRatio = srcCanvas.width / srcCanvas.height
//         const isHeightBigger = aspectRatio < 1
//         if (isHeightBigger) {
//             previewCanvas.height = 2048
//             previewCanvas.width = aspectRatio * previewCanvas.height
//         } else {
//             previewCanvas.width = 2048
//             previewCanvas.height = previewCanvas.width / aspectRatio
//         }
//         const previewCtx = previewCanvas.getContext("2d")!
//         previewCtx.drawImage(srcCanvas,
//                              0, 0, srcCanvas.width, srcCanvas.height,
//                              0, 0, previewCanvas.width, previewCanvas.height,
//                             )
//         previewAreaEl.appendChild(previewCanvas)
//         this.previewCanvas = previewCanvas
//         this.previewScale = previewCanvas.width / srcCanvas.width

//     }

//     /**
//      * Remove preview canvas from DOM and clean up events.
//      */
//     public destroy = (): void => {
//         this.previewCanvas.remove()
//         //    this.previewCanvas = null
//     }

//     /**
//      * Change src image orientation and schedule preview canvas to be updated on next draw.
//      *
//      * @param update {Object=} Orientation change describer.
//      * @param update.deltaRotation {Number} Rotation change in radians.
//      * @param update.deltaPosition {{ x: Number, y: Number }} Position change.
//      * @param update.deltaScale {Number} Scale change. 1.0 means that preview image is
//      *        shown 1:1 scale on preview area. so its width or height is 2048px.
//      */
//     public updateOrientation = (update?: any): void => {
//         if (update) {
//             if (update.deltaRotation) {
//                 this.rotation += update.deltaRotation
//             }
//             if (update.deltaScale) {
//                 this.scale += update.deltaScale
//             }
//             if (update.deltaPosition) {
//                 this.position.x += update.deltaPosition.x
//                 this.position.y += update.deltaPosition.y
//             }
//             if (update.absRotation) {
//                 this.rotation = update.absRotation
//             }
//             if (update.absScale) {
//                 this.scale = update.absScale
//             }
//             if (update.absPosition) {
//                 this.position.x = update.absPosition.x
//                 this.position.y = update.absPosition.y
//             }
//         }

//         // update preview CSS before next paint if autoupdate enabled
//         const autoUpdateEnabled = !this.options.noCssAutoUpdate
//         const _this = this
//         if (autoUpdateEnabled && !this.waitForPreviewCssUpdate) {
//             _this.waitForPreviewCssUpdate = true
//             requestAnimationFrame(() => {
//                 if (_this.previewCanvas) {
//                     const transformCss = _this.getPreviewCssTransform()
//                     _this.previewCanvas.style.transform = transformCss
//                     _this.previewCanvas.style.webkitTransform = transformCss
//                     //                    _this.previewCanvas.style.MozTransform = transformCss
//                     _this.waitForPreviewCssUpdate = false
//                 }
//             })
//         }
//     }

//     /**
//      * Returns transformation for positioning preview canvas relative to preview area.
//      * @returns {string} CSS transform string.
//      */
//     public getPreviewCssTransform = (): string => {
//         const posOffsetX = -this.previewCanvas.width / 2 + this.initialOrigoX
//         const posOffsetY = -this.previewCanvas.height / 2 + this.initialOrigoY
//         const transform = [
//             "translateX(" + (this.position.x + posOffsetX) + "px)",
//             "translateY(" + (this.position.y + posOffsetY) + "px)",
//             "scale(" + this.scale + ")",
//             "rotate(" + this.rotation + "rad)",
//         ].join(" ")
//         return transform
//     }

//     /**
//      * Read piece of source canvas to destination according to src orientation and
//      * given coordinates of preview area.
//      *
//      * @param x {Number} Pixel coordinate where from preview area slice should be read.
//      * @param y {Number} Pixel coordinate where from preview area slice should be read.
//      * @param sliceSize {Number} Pixel size in preview area how big square is read.
//      * @param dstCanvas Canvas where to write slice. Must be square.
//      */
//     public slice = (
//         x: number,
//         y: number,
//         sliceSize: number,
//         dstCanvas: HTMLCanvasElement,
//     ): void => {
//         if (dstCanvas.width !== dstCanvas.height) {
//             throw new Error("Destination canvas should be square")
//         }
//         const tileSizePerSliceSize = dstCanvas.width / sliceSize

//         dstCanvas.width = dstCanvas.width // clear canvas trick

//         const context: CanvasRenderingContext2D = dstCanvas.getContext("2d")!
//         context.save()

//         // offset position according to how image is moved from center point and which grid position was selected
//         const srcX = this.position.x - (x - this.initialOrigoX)
//         const srcY = this.position.y - (y - this.initialOrigoY)
//         context.translate(srcX * tileSizePerSliceSize,
//                           srcY * tileSizePerSliceSize)

//         // scale, rotate, position for receiving canvas
//         const scale = this.scale
//             * this.previewScale
//             * tileSizePerSliceSize
//         context.scale(scale, scale)
//         context.rotate(this.rotation)
//         // origo for scaling and rotate to center of the image
//         context.translate(-this.srcCanvas.width / 2,
//                           -this.srcCanvas.height / 2)
//         context.drawImage(this.srcCanvas, 0, 0)
//         context.restore()
//     }
// }
