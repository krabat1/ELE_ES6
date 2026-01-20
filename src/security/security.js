import { Logging as Dev} from "../logging/log.js";
import { LT } from "../logging/log.js";

const Security = {
  initSecurityListeners() {
    /**
     * 🔒 Globális másolásvédelem
     * */
    // 1. Jobb klikk tiltása képen
    document.addEventListener("contextmenu", (e) => {
      if (e.target.tagName === "IMG" || e.target.classList.contains("protect"))
        e.preventDefault();
    });
    // 2. Kép húzásának (drag) tiltása
    document.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    });
    // 3. Szöveg kijelölés tiltása
    document.addEventListener("selectstart", (e) => {
      e.preventDefault();
    });

    // 4. Másolás tiltása (CTRL+C, mobil copy, stb.)
    document.addEventListener("copy", (e) => {
      e.preventDefault();
    });
    // 5. Mobil hosszan nyomás → képletöltés tiltása
    document.addEventListener("touchstart", (e) => {
      // Ha képre nyom hosszan, tiltjuk
      if (e.target.tagName === "IMG") {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }
    });
    Dev.Log(LT.SEC, 'init security')
  },
};

// 6. Még erősebb védelem: minden IMG fölé átlátszó réteg
// ❗️ Ez rögtön meghívódik, nem akkor amikor kéne...
document.querySelectorAll("img").forEach((img) => {
  const wrapper = document.createElement("div");
  //wrapper.style.position = "relative";
  //wrapper.style.display = "flex";
  wrapper.className = "wrapper";

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "transparent";
  overlay.style.zIndex = "10";

  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  wrapper.appendChild(overlay);
});

export default Security;
