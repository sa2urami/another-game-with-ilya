import {debug, isMouseLocked} from "./util.js";
document.addEventListener("pointerlockchange", () => {
  if (isMouseLocked()) {
    debug("Lock captured");
  } else {
    debug("Lock released");
  }
});
if (document.documentElement.requestPointerLock) {
  document.addEventListener("click", () => {
    const usingRawInput = !!document.documentElement.requestPointerLock({
      unadjustedMovement: true
    });
    console.log(usingRawInput ? "Using raw input" : "Not using raw input");
  });
}
