import API from "../api/api.js";

const Auth = {
      TOKEN_KEY: 'ele_cards_token',
      TOKEN_EXP_KEY: 'ele_cards_token_exp',

      async  checkLogin(email, password, timeZone) {
        
        try {
          const res = await fetch(
            `${API.accessAPI}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&clientTimeZone=${encodeURIComponent(timeZone)}`
          );

          const json = await res.json();
          console.log(json)

          if (!json.success) {
            console.warn('login failed:', json.error);
            switch(json.error) {
            case "Subscription expired":
                document.getElementById("loginError").textContent = "\u274C Sajnáljuk, az előfizetésed lejárt.";
              break;
            case "Invalid expire date":
                document.getElementById("loginError").textContent = "\u274C Adatbázis hiba történt a dátummal. Már értesítettük a rendszergazdát!";
              break;
            case "Invalid email or password": 
                document.getElementById("loginError").textContent = "\u274C Helytelen e-mail cím vagy jelszó.";
              break;
            case "Missing email or password": 
                document.getElementById("loginError").textContent = "\u274C Hiányzó e-mail cím vagy jelszó.";
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
          console.error('login error', err);
          return false;
        }
      },


  async tryAutoLogin() {
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
      const res = await fetch(
        `${API.accessAPI}?action=verifyToken&token=${encodeURIComponent(token)}`
      );

      const json = await res.json();
      if (json.success && json.data && json.data.valid) {
        // token érvényes → user be van lépve
        loginError.textContent = "\u2714\uFE0F Bejelentkezve";
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      } else {
        // invalid/expired → töröljük
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXP_KEY);
        console.log(json.data.error);
        loginError.textContent = "\u2757 Bejelentkezés szükséges";
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return false;
      }
    } catch (e) {
      console.error("verifyToken error", e);
      loginError.textContent = "\u2757 Bejelentkezés szükséges";
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return false;
    }
  },
};

export default Auth;