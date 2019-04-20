// tslint:disable:no-console


export interface IHammerInput {
    srcEvent: {
        pageX,
        pageY,
    }
}

import "./styles/main.css"

import * as Hammer from "hammerjs"

import { CanvasShredder } from "./CanvasShredder"

/**
 * Main app.
 *
 * Handles UI events and uses CanvasShredder to handle and adjust image orientation.
 */

//     function selectPosition(x, y) {
//         slicePosition.x = x
//         slicePosition.y = y
//         selectPos.style.left = slicePosition.x + "px"
//         selectPos.style.top = slicePosition.y + "px"
//         selectPos.style.width = slicePosition.size + "px"
//         selectPos.style.height = slicePosition.size + "px"
//         needsUpdate = true
//     }



export function canvasImageTiler(targets: string[], options: object) {
    // configuration object
    const targetProfile = {
        file_input: "file-input",
        fps: "fps",
        image_info: "image-info",
        select_position: "select-position",
        //
        ...options,
    }


    // constants

    // get elements
    const previewArea = document.getElementById(targets[0])!
    previewArea.setAttribute("class", "cit_preview-area")

    // create elements
    const newImage = document.createElement("img")
    const dstCanvas: HTMLCanvasElement = document.createElement("canvas")!
    dstCanvas.setAttribute("class", "cit_dst-canvas")
    previewArea.appendChild(dstCanvas)

    //
    const elSelectPosition = document.createElement("div")
    elSelectPosition.setAttribute("class", "cit_select-position")
    elSelectPosition.style.left = "20px"
    elSelectPosition.style.top = "20px"
    elSelectPosition.style.width = (previewArea.scrollWidth * 0.25).toFixed() + "px"
    elSelectPosition.style.height = (previewArea.scrollWidth * 0.25).toFixed() + "px"

    previewArea.appendChild(elSelectPosition)

    const elButtonsParent = document.createElement("div")
    elButtonsParent.setAttribute("class", "cit_buttons")

    const elButtonRotate = document.createElement("button")
    elButtonRotate.setAttribute("class", "cit_ctrl-btn cit_rotate")
    elButtonRotate.innerHTML = "R"

    const elButtonScale = document.createElement("button")
    elButtonScale.setAttribute("class", "cit_ctrl-btn cit_scale")
    elButtonScale.innerHTML = "S"

    elButtonsParent.appendChild(elButtonScale)
    elButtonsParent.appendChild(elButtonRotate)

    previewArea.appendChild(elButtonsParent)

    const previewArea2 = previewArea.cloneNode(true)
    previewArea2.setAttribute("id", "fuk")
    document.body.appendChild(previewArea2)

    let slicePosition = { x: 0, y: 0, size: 128}

    newImage.src = targetProfile.file_input

    const mc = new Hammer(previewArea)
    mc.get("pinch").set({ enable: true })
    mc.get("rotate").set({ enable: true })

    mc.on("tap", (event: HammerInput & IHammerInput): void => {
        let posX: number
        let posY: number

        if (event.pointerType === "mouse") {
            posX = (event.srcEvent.pageX - previewArea.offsetLeft) - slicePosition.size / 2
            posY = (event.srcEvent.pageY - previewArea.offsetTop) - slicePosition.size / 2
        } else {
            posX = (event.center.x
                    - previewArea.offsetLeft
                    + document.body.scrollLeft) - slicePosition.size / 2
            posY = (event.center.y
                    - previewArea.offsetTop
                    + document.body.scrollTop) - slicePosition.size / 2
        }
        //        selectPosition(posX, posY)
        console.log("Selected grid position", event, posX, posY)
    })

    newImage.onload = function() {
        new CanvasShredder(newImage, previewArea, { }, dstCanvas)
    }
}

/// Expose app context to make debugging easier (currently not used...)
// export function Tilez(options: object) {
//     // configuration object
//     const targetProfile = {
//         dst_canvas: "dst-canvas",
//         file_input: "file-input",
//         fps: "fps",
//         image_info: "image-info",
//         preview_area: "preview-area",
//         select_position: "select-position",
//         //
//         ...options
//     }

//     // constants
//     const needsUpdate = false
//     const slicePosition = { x: 0, y: 0, size: 128}
//     const frameCount = 0

//     // lets
//     let shredder

//     const app = {}

//     // document.getElementById(targetProfile.file_input)
//     // loaded image dimensions
//     const imageInfo = document.getElementById(targetProfile.image_info)!
//     // dst canvas draws per second
//     const fpsCounter = document.getElementById(targetProfile.fps)!
//     // canvas element where result is written
//     const dstCanvas: HTMLCanvasElement = document.getElementById(targetProfile.dst_canvas)!
//     // area where preview canvas is positioned
//     const previewArea = document.getElementById(targetProfile.preview_area)!

//     const newImage = document.createElement("img")
//     newImage.onload = () => {
//         shredder = new CanvasShredder(newImage, previewArea, { storeOriginalInCanvas: false })
//         selectPosition(previewArea.offsetWidth / 2, previewArea.offsetHeight / 2)
//         imageInfo.textContent = shredder.srcCanvas.width + "x" + shredder.srcCanvas.height
//     }
//     newImage.src = targetProfile.file_input
//     // new URL()
//     // URL.createObjectURL(f)
//     //    }
//     //    }
//     // fileInput.addEventListener("change", handleFileSelect, false)

//     /**
//      * Sample tile from source image on every animationFrame.
//      */
//     requestAnimationFrame(function updateOutputIfNeeded() {
//         if (needsUpdate && shredder) {
//             shredder.slice(slicePosition.x, slicePosition.y, slicePosition.size, dstCanvas)
//             needsUpdate = false
//             frameCount++
//         }
//         requestAnimationFrame(updateOutputIfNeeded)
//     })

//     /**
//      * Update fps counter every 2 secs if image data is ready.
//      */
//     let previousFrameCount = 0
//     let previousMilliseconds = new Date().getTime()
//     function updateFps() {
//         const currentMs = new Date().getTime()
//         const framesPassed = frameCount - previousFrameCount
//         const millisecondsPassed = currentMs - previousMilliseconds
//         const fps = framesPassed / (millisecondsPassed / 1000)
//         fpsCounter.textContent = fps
//         previousFrameCount = frameCount
//         previousMilliseconds = currentMs
//     }
//     setInterval(updateFps, 2000)

//     /**
//      * Select bounding box where tile should tile should be read from.
//      */
//     const selectPos = document.getElementById("select-position")
//     function selectPosition(x, y) {
//         slicePosition.x = x
//         slicePosition.y = y
//         selectPos.style.left = slicePosition.x + "px"
//         selectPos.style.top = slicePosition.y + "px"
//         selectPos.style.width = slicePosition.size + "px"
//         selectPos.style.height = slicePosition.size + "px"
//         needsUpdate = true
//     }

//     /**
//      * Adjust image orientation.
//      */
//     const rotationButton = document.querySelector(".ctrl-btn.rotate")
//     const scaleButton = document.querySelector(".ctrl-btn.scale")

//     const moveEl = null
//     const lastPos = null
//     function getPos(event) {
//         return { x: event.screenX, y: event.screenY }
//     }

//     rotationButton.addEventListener("mousedown", startMouseMove, false)
//     scaleButton.addEventListener("mousedown", startMouseMove, false)

//     function startMouseMove(event) {
//         event.stopPropagation()
//         event.preventDefault()
//         moveEl = event.target
//         lastPos = getPos(event)
//     }

//     // stop mouse move if leaving window
//     document.body.addEventListener("mouseout", (event) => {
//         event.preventDefault()
//         if (event.relatedTarget === document.querySelector("html")) {
//             moveEl = null
//         }
//     }, false)

//     // stop mouse move if stopped pressing mouse button
//     document.body.addEventListener("mouseup", (event) => {
//         event.preventDefault()
//         moveEl = null
//     }, false)

//     /**
//      * Convert mousedown and mousemove events to relative mouse events
//      */
//     function mouseMove(event) {
//         // console.log("Button", event.button, "Which", event.which, "Buttons", event.buttons)
//         if (event.buttons === 0) {
//             moveEl = null
//         }
//         if (moveEl !== null) {
//             const currPos = getPos(event)
//             const dx = currPos.x - lastPos.x
//             const dy = currPos.y - lastPos.y
//             const speed = Math.sqrt(dx * dx + dy * dy)
//             speed = (dy > 0) ? speed : -speed
//             moveEl.dispatchEvent(new CustomEvent("relativemouse", { detail: {
//                 dx,
//                 dy,
//                 speed,
//             }}))
//             lastPos = currPos
//         }
//     }
//     document.body.addEventListener("mousemove", mouseMove, false)

//     /**
//      * Adjust image orientation
//      */
//     rotationButton.addEventListener("relativemouse", (event) => {
//         if (shredder) {
//             shredder.updateOrientation({ deltaRotation: event.detail.speed / 100 })
//             needsUpdate = true
//         }
//     }, false)
//     scaleButton.addEventListener("relativemouse", (event) => {
//         if (shredder) {
//             shredder.updateOrientation({deltaScale: event.detail.speed / 100})
//             needsUpdate = true
//         }
//     }, false)

//     /**
//      * Touch events for tablets etc.
//      */

//     const mc = new Hammer(previewArea)
//     mc.get("pinch").set({ enable: true })
//     mc.get("rotate").set({ enable: true })

//     mc.on("tap", (event) => {
//         const posX
//         const posY

//         if (event.pointerType === "mouse") {
//             posX = (event.srcEvent.pageX - previewArea.offsetLeft) - slicePosition.size / 2
//             posY = (event.srcEvent.pageY - previewArea.offsetTop) - slicePosition.size / 2
//         } else {
//             posX = (event.center.x
//                     - previewArea.offsetLeft
//                     + document.body.scrollLeft) - slicePosition.size / 2
//             posY = (event.center.y
//                     - previewArea.offsetTop
//                     + document.body.scrollTop) - slicePosition.size / 2
//         }
//         selectPosition(posX, posY)
//         console.log("Selected grid position", event, posX, posY)
//     })

//     const startPosition = {}
//     mc.on("panstart", (ev) => {
//         startPosition.x = shredder && shredder.position.x || 0
//         startPosition.y = shredder && shredder.position.y || 0
//     })

//     mc.on("panmove", (ev) => {
//         if (shredder) {
//             shredder.updateOrientation({
//                 absPosition: {x: startPosition.x + ev.deltaX, y: startPosition.y + ev.deltaY},
//             })
//             needsUpdate = true
//         }
//     })

//     const startAngle = null
//     mc.on("rotatestart", (ev) => {
//         startAngle = shredder && shredder.rotation || 0
//     })

//     mc.on("rotatemove", (ev) => {
//         if (shredder) {
//             shredder.updateOrientation({
//                 absRotation: startAngle + ev.rotation / Math.PI / 16,
//             })
//             needsUpdate = true
//         }
//     })

//     const startScale = null
//     mc.on("pinchstart", (ev) => {
//         startScale = shredder && shredder.scale || 0
//     })

//     mc.on("pinchmove", (ev) => {
//         if (shredder) {
//             shredder.updateOrientation({
//                 absScale: startScale * ev.scale,
//             })
//             needsUpdate = true
//         }
//     })

//     return app
// }
