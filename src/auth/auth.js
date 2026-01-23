import { Logging as Dev } from "../logging/log.js";
import { LT } from "../logging/log.js";
import API from "../api/api.js";

const Auth = {
  TOKEN_KEY: "ele_cards_token",
  TOKEN_EXP_KEY: "ele_cards_token_exp",

  async checkLogin(email, password, timeZone) {
    try {
      Dev.log(LT.AUTH, "accessAPI/login");
      const res = await fetch(
        `${API.accessAPI}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&clientTimeZone=${encodeURIComponent(timeZone)}`,
      );

      const json = await res.json();
      //console.log(json)

      if (!json.success) {
        Dev.log(
          LT.API,
          new Error(`accessAPI/login (${json.error}) sikertelen`),
        );
        //console.warn('login failed:', json.error);
        switch (json.error) {
          case "Subscription expired":
            document.getElementById("loginError").textContent =
              "\u274C Sajnáljuk, az előfizetésed lejárt.";
            break;
          case "Invalid expire date":
            document.getElementById("loginError").textContent =
              "\u274C Adatbázis hiba történt a dátummal. Már értesítettük a rendszergazdát!";
            break;
          case "Invalid email or password":
            document.getElementById("loginError").textContent =
              "\u274C Helytelen e-mail cím vagy jelszó.";
            break;
          case "Missing email or password":
            document.getElementById("loginError").textContent =
              "\u274C Hiányzó e-mail cím vagy jelszó.";
            break;
          default:
            showNotification("Ismeretlen hiba történt: " + json.error);
        }

        return false;
      }

      const { token, expiredAt } = json.data || {};
      if (!token) return false;

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXP_KEY, String(expiredAt));

      return true;
    } catch (err) {
      Dev.log(LT.API, new Error(`accessAPI/login (${err}) sikertelen`));
      //console.error("login error", err);
      return false;
    }
  },

  async tryAutoLogin() {
    Dev.log(LT.AUTH, "tryAutoLogin() fut");
    const token = localStorage.getItem(this.TOKEN_KEY);
    const exp = Number(localStorage.getItem(this.TOKEN_EXP_KEY) || 0);
    const now = Date.now();

    if (!token || !exp || now > exp) {
      // nincs vagy lejárt token → marad a login UI
      loginError.textContent = "\u2757 Bejelentkezés szükséges";
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return false;
    }

    try {
      Dev.log(LT.AUTH, "accessAPI/verifyToken");
      const res = await fetch(
        `${API.accessAPI}?action=verifyToken&token=${encodeURIComponent(token)}`,
      );

      const json = await res.json();
      if (json.success && json.data && json.data.valid) {
        // token érvényes → user be van lépve
        Dev.log(LT.AUTH, "Login success, token verified");
        loginError.textContent = "\u2714\uFE0F Bejelentkezve";
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      } else {
        // invalid/expired → töröljük
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXP_KEY);
        Dev.log(LT.AUTH, "Login fail, token expired", json.data.error);
        loginError.textContent = "\u2757 Bejelentkezés szükséges";
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return false;
      }
    } catch (err) {
      Dev.log(LT.AUTH, new Error("Login fail, API fetch error", err));
      loginError.textContent = "\u2757 Bejelentkezés szükséges";
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return false;
    }
  },
};

export default Auth;
