/* =========================================================================
   کافه معدن — Login / Register UI
   Vanilla JS only. All logic is scoped to elements inside #ma-auth-root
   and the standalone .ma-navbar-btn components — nothing else on a host
   page is touched.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.getElementById("ma-auth-root");
  if (!root) return;

  /* -----------------------------------------------------------------
     Helpers
     ----------------------------------------------------------------- */

  // Convert Persian/Arabic-Indic digits to standard ASCII digits.
  function toEnglishDigits(str) {
    var persian = "۰۱۲۳۴۵۶۷۸۹";
    var arabic = "٠١٢٣٤٥٦٧٨٩";
    return String(str).replace(/[۰-۹٠-٩]/g, function (ch) {
      var pIndex = persian.indexOf(ch);
      if (pIndex > -1) return String(pIndex);
      var aIndex = arabic.indexOf(ch);
      if (aIndex > -1) return String(aIndex);
      return ch;
    });
  }

  // True if string contains only Persian/Arabic letters and spaces (no digits).
  function isPersianOnly(str) {
    if (!str || !str.trim()) return false;
    var hasDigit = /[0-9۰-۹٠-٩]/.test(str);
    if (hasDigit) return false;
    return /^[\u0600-\u06FF\s]+$/.test(str);
  }

  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function isValidPhone(str) {
    var normalized = toEnglishDigits(str).trim();
    return /^09[0-9]{9}$/.test(normalized);
  }

  function setFieldError(fieldEl, errorEl, message) {
    if (message) {
      fieldEl.classList.add("has-error");
      fieldEl.classList.remove("is-valid");
      errorEl.textContent = message;
    } else {
      fieldEl.classList.remove("has-error");
      errorEl.textContent = "";
    }
  }

  function markValid(fieldEl) {
    fieldEl.classList.add("is-valid");
  }

  function closestField(el) {
    return el.closest(".ma-field");
  }

  /* -----------------------------------------------------------------
     Tabs: Login / Register switch
     ----------------------------------------------------------------- */
  var tabsEl = root.querySelector(".ma-tabs");
  var tabLogin = document.getElementById("ma-tab-login");
  var tabRegister = document.getElementById("ma-tab-register");
  var formLogin = document.getElementById("ma-form-login");
  var formRegister = document.getElementById("ma-form-register");

  function activateTab(name) {
    var isLogin = name === "login";

    tabLogin.classList.toggle("is-active", isLogin);
    tabRegister.classList.toggle("is-active", !isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));

    formLogin.hidden = !isLogin;
    formRegister.hidden = isLogin;

    tabsEl.setAttribute("data-active", name);

    var focusTarget = isLogin
      ? document.getElementById("ma-login-id")
      : document.getElementById("ma-reg-fname");
    if (focusTarget) {
      window.setTimeout(function () {
        focusTarget.focus({ preventScroll: true });
      }, 260);
    }
  }

  root.addEventListener("click", function (evt) {
    var trigger = evt.target.closest("[data-ma-tab]");
    if (trigger) {
      activateTab(trigger.getAttribute("data-ma-tab"));
    }
  });

  // Preview-navbar buttons also drive the same tabs.
  document.addEventListener("click", function (evt) {
    var opener = evt.target.closest("[data-ma-open]");
    if (opener) {
      activateTab(opener.getAttribute("data-ma-open"));
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* -----------------------------------------------------------------
     Show / hide password
     ----------------------------------------------------------------- */
  root.addEventListener("click", function (evt) {
    var btn = evt.target.closest(".ma-input-toggle");
    if (!btn) return;

    var targetId = btn.getAttribute("data-ma-toggle");
    var input = document.getElementById(targetId);
    if (!input) return;

    var showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.setAttribute("aria-pressed", String(!showing));
    btn.setAttribute("aria-label", showing ? "نمایش رمز عبور" : "مخفی کردن رمز عبور");

    var openIcon = btn.querySelector(".ma-eye-open");
    var closedIcon = btn.querySelector(".ma-eye-closed");
    if (openIcon && closedIcon) {
      openIcon.style.display = showing ? "block" : "none";
      closedIcon.style.display = showing ? "none" : "block";
    }
  });

  /* -----------------------------------------------------------------
     Login form validation (light — just presence checks)
     ----------------------------------------------------------------- */
  var loginId = document.getElementById("ma-login-id");
  var loginPass = document.getElementById("ma-login-pass");


  document.getElementById("ma-forgot-link").addEventListener("click", function (evt) {
    evt.preventDefault();
    showToast("لینک بازیابی رمز عبور به‌زودی اضافه می‌شود.");
  });






  /* -----------------------------------------------------------------
     Register form: field-by-field validation
     ----------------------------------------------------------------- */
  var fname = document.getElementById("ma-reg-fname");
  var lname = document.getElementById("ma-reg-lname");
  var email = document.getElementById("ma-reg-email");
  var phone = document.getElementById("ma-reg-phone");
  var pass = document.getElementById("ma-reg-pass");
  var pass2 = document.getElementById("ma-reg-pass2");

  function validateName(input, errorId, label) {
    var field = closestField(input);
    var errorEl = document.getElementById(errorId);
    var value = input.value.trim();

    if (!value) {
      setFieldError(field, errorEl, "لطفاً " + label + " خود را وارد کنید.");
      return false;
    }
    if (!isPersianOnly(value)) {
      setFieldError(field, errorEl, "لطفاً " + label + " را به فارسی وارد کنید.");
      return false;
    }
    setFieldError(field, errorEl, "");
    markValid(field);
    return true;
  }

  fname.addEventListener("input", function () {
    validateName(fname, "ma-reg-fname-error", "نام");
  });
  lname.addEventListener("input", function () {
    validateName(lname, "ma-reg-lname-error", "نام خانوادگی");
  });

  function validateEmail() {
    var field = closestField(email);
    var errorEl = document.getElementById("ma-reg-email-error");
    var value = email.value.trim();

    if (!value) {
      setFieldError(field, errorEl, "لطفاً ایمیل خود را وارد کنید.");
      return false;
    }
    if (!isValidEmail(value)) {
      setFieldError(field, errorEl, "ایمیل وارد شده معتبر نیست.");
      return false;
    }
    setFieldError(field, errorEl, "");
    markValid(field);
    return true;
  }
  email.addEventListener("input", validateEmail);
  email.addEventListener("blur", validateEmail);

  function validatePhone() {
    var field = closestField(phone);
    var errorEl = document.getElementById("ma-reg-phone-error");
    var raw = toEnglishDigits(phone.value);

    // Strip anything that isn't a digit as the user types.
    var digitsOnly = raw.replace(/[^0-9]/g, "").slice(0, 11);
    if (digitsOnly !== phone.value) {
      phone.value = digitsOnly;
    }

    var value = digitsOnly;

    if (!value) {
      setFieldError(field, errorEl, "لطفاً شماره تلفن همراه خود را وارد کنید.");
      return false;
    }
    if (!value.startsWith("09")) {
      setFieldError(field, errorEl, "شماره تلفن باید با 09 شروع شود.");
      return false;
    }
    if (value.length !== 11) {
      setFieldError(field, errorEl, "شماره تلفن باید دقیقاً 11 رقم باشد.");
      return false;
    }
    if (!isValidPhone(value)) {
      setFieldError(field, errorEl, "شماره تلفن معتبر نیست.");
      return false;
    }
    setFieldError(field, errorEl, "");
    markValid(field);
    return true;
  }
  phone.addEventListener("input", validatePhone);
  phone.addEventListener("blur", validatePhone);

  /* -----------------------------------------------------------------
     Password strength + rule checklist
     ----------------------------------------------------------------- */
  var strengthWrap = document.getElementById("ma-strength");
  var strengthLabel = document.getElementById("ma-strength-label");
  var rulesList = document.getElementById("ma-pass-rules");

  var STRENGTH_LABELS = ["ضعیف", "ضعیف", "متوسط", "قوی", "بسیار قوی"];

  function evaluatePassword(value) {
    var checks = {
      len: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      num: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };

    var metCount = Object.keys(checks).filter(function (key) {
      return checks[key];
    }).length;

    rulesList.querySelectorAll(".ma-rules__item").forEach(function (item) {
      var rule = item.getAttribute("data-rule");
      item.classList.toggle("is-met", !!checks[rule]);
    });

    var level = 0;
    if (value.length === 0) {
      level = 0;
    } else if (metCount <= 2) {
      level = 1;
    } else if (metCount === 3) {
      level = 2;
    } else if (metCount === 4) {
      level = 3;
    } else if (metCount >= 5) {
      level = 4;
    }

    strengthWrap.setAttribute("data-level", String(level));
    strengthLabel.textContent = level === 0 ? "قدرت رمز عبور" : "قدرت رمز عبور: " + STRENGTH_LABELS[level];

    return { checks: checks, level: level, metCount: metCount };
  }

  function validatePassword() {
    var field = closestField(pass);
    var errorEl = document.getElementById("ma-reg-pass-error");
    var value = pass.value;
    var result = evaluatePassword(value);

    if (!value) {
      setFieldError(field, errorEl, "لطفاً رمز عبور خود را وارد کنید.");
      return false;
    }
    if (result.metCount < 5) {
      setFieldError(field, errorEl, "رمز عبور ضعیف است.");
      return false;
    }
    setFieldError(field, errorEl, "");
    markValid(field);
    return true;
  }

  pass.addEventListener("input", validatePassword);
  pass.addEventListener("blur", validatePassword);

  function validateConfirmPassword() {
    var field = closestField(pass2);
    var errorEl = document.getElementById("ma-reg-pass2-error");

    if (!pass2.value) {
      setFieldError(field, errorEl, "لطفاً تکرار رمز عبور را وارد کنید.");
      return false;
    }
    if (pass2.value !== pass.value) {
      setFieldError(field, errorEl, "رمزهای عبور یکسان نیستند.");
      return false;
    }
    setFieldError(field, errorEl, "");
    markValid(field);
    return true;
  }

  pass2.addEventListener("input", validateConfirmPassword);
  pass2.addEventListener("blur", validateConfirmPassword);
  pass.addEventListener("input", function () {
    if (pass2.value) validateConfirmPassword();
  });

  /* -----------------------------------------------------------------
     Register submit
     ----------------------------------------------------------------- */


  /* -----------------------------------------------------------------
     Toast
     ----------------------------------------------------------------- */
  var toast = document.getElementById("ma-toast");
  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }
})();


document.getElementById("registerbtn").addEventListener("click",async function(e) {
  e.preventDefault()

  const form = document.getElementById("ma-form-register")


 if (!form.checkValidity()) {
    Swal.fire({
      toast:true,
      position:"top-end",
        icon: "warning",
        title: "توجه!",
        text: "لطفاً همه فیلدها را پر کنید",
        confirmButtonText: "باشه"
    });
    return;
}


  const name = form.querySelector("input[name='name']").value
   const lastname = form.querySelector("input[name='lastname']").value
    const email = form.querySelector("input[name='email']").value
     const phone = form.querySelector("input[name='phone']").value
      const password = form.querySelector("input[name='password']").value
       const confirmpassword = form.querySelector("input[name='confirmpassword']").value




       try {
        
        const response = await fetch("/register",{
          method:"POST",
          headers:{"Content-Type" : "application/json"}
          ,body:JSON.stringify({name,lastname,email,phone,password,confirmpassword})
        })


        const data = await response.json()



        

        if (!response.ok) {
         Swal.fire({
          toast:true,
    icon: "error",
        position:"top-end",
    title: "خطا",
    text: data.message || "خطایی رخ داده است",
    position:"top-end",
    confirmButtonText: "باشه"
});
          return
        }


        else{
          localStorage.setItem("accessToken",data.tokens.accessToken)
              localStorage.setItem("register-success", "true");
                localStorage.setItem("profile-name",name)
  localStorage.setItem("profile-LastName",lastname)
          Swal.fire({
            toast:true,
    icon: "success",
    title: "موفق!",
    text: data.message,
    confirmButtonText: "باشه",
        position:"top-end",
    timer: 1500,
    timerProgressBar: true,
    showConfirmButton: false,
}).then(() => {
    window.location.href = "/index.html";
});
        }

       } catch (error) {
        console.log("Error: ",error)
       }


})



document.getElementById("loginbtn").addEventListener("click", async function(e) {

    e.preventDefault();

    const form = document.getElementById("ma-form-login");

    if (!form.checkValidity()) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: "توجه!",
            text: "لطفاً همه فیلدها را پر کنید",
            confirmButtonText: "باشه"
        });
        return;
    }

    const email = form.querySelector("input[name='email']").value;
    const password = form.querySelector("input[name='password']").value;

    
    try {

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "خطا",
                text: data.message || "خطایی رخ داده است",
                confirmButtonText: "باشه"
            });

            return;
        }

        // ذخیره توکن
        localStorage.setItem(
            "accessToken",
            data.tokens.accessToken
        );

        // گرفتن اطلاعات صاحب اکانت
        const profileResponse = await fetch("/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${data.tokens.accessToken}`
            }
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            throw new Error(
                profileData.message || "خطا در دریافت اطلاعات کاربر"
            );
        }

        // ذخیره اطلاعات واقعی کاربر
        localStorage.setItem(
            "profile-name",
            profileData.name
        );

        localStorage.setItem(
            "profile-LastName",
            profileData.lastname
        );

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "موفق!",
            text: data.message,
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false
        }).then(() => {

            window.location.href = "/index.html";

        });

    } catch (error) {

        console.error("Error:", error);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "خطا",
            text: "خطا در ارتباط با سرور",
            confirmButtonText: "باشه"
        });
    }
});


