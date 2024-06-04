
import { GLViewer } from "./GLViewer";
import { GLModel } from "./GLModel";
import { createViewer } from "./GLViewer";

declare var __webpack_exports__: any;

if (window) {
    //this needs to be exported here so the webworker can see it
    window.$3Dmol = __webpack_exports__;
}

// Bundle them into a single object
export const $3Dmol = {
    GLViewer,
    GLModel,
    createViewer
};
