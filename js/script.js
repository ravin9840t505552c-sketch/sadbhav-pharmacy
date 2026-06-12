/* ============================================
   SADBHAV PHARMACY — JAVASCRIPT
   File: js/script.js
   Designed & Developed by Ravi Sapkota
   Pipalchowk, Bharatpur-4, Chitwan, Nepal
============================================ */

/* ============================================
   1. Activate Lucide icons
============================================ */
document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();
});

/* ============================================
   2. SCROLL EFFECTS & REVEAL
============================================ */
document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("nav");

  // Add 'scrolled' class on scroll
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    // Reveal elements on scroll
    document.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("visible");
      }
    });
  });

  // Trigger reveal on load
  document.querySelectorAll(".reveal").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add("visible");
    }
  });
});

/* ============================================
   3. MOBILE HAMBURGER MENU TOGGLE
============================================ */
document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector("nav");
  const navLinks = nav.querySelector(".nav-links");
  const hamburger = nav.querySelector(".hamburger");

  if (!hamburger) return;

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
    // Optional: close on link click
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  });

  // Close menu on outside click
  document.addEventListener("click", function (e) {
    if (!nav.contains(e.target)) {
      navLinks.classList.remove("open");
    }
  });
});

/* ============================================
   4. PRESCRIPTION UPLOAD TO CLOUDINARY (FRONTEND ONLY)
   This does NOT send real emails.
============================================ */

// --- Configure Cloudinary (replace with your values) ---
const CLOUDINARY_CLOUD_NAME = "dnjvjxum4"; // ← CHANGE
const CLOUDINARY_UPLOAD_PRESET = "sadbhav-prescription"; // ← CHANGE

// --- Utility: upload file to Cloudinary (unsigned preset) ---
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url;
}

// --- Main event handler block ---
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form");
  if (!contactForm) return;

  const fileInput = contactForm.querySelector("#prescriptionFile");
  const preview = contactForm.querySelector("#prescriptionPreview");
  const cloudinaryUrlInp = contactForm.querySelector("#cloudinaryImageUrl");
  const emailStatus = contactForm.querySelector("#emailStatus");
  const linkPreview = contactForm.querySelector("#linkPreview");
  const urlText = contactForm.querySelector("#urlText");
  const btnCopy = contactForm.querySelector("#btnCopy");
  const copyLinkBtn = contactForm.querySelector("#copyLinkBtn");
  const sendToWhatsAppBtn = contactForm.querySelector("#sendToWhatsAppBtn");

  // Preview prescription image
  fileInput?.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      if (file.type.startsWith("image/")) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Prescription preview">`;
      } else {
        preview.innerHTML = `
          <p><strong>File:</strong> ${file.name}</p>
          <p><em>Only the image URL will be sent.</em></p>`;
      }
    };
    reader.readAsDataURL(file);
  });

  // Upload to Cloudinary and show URL
  copyLinkBtn?.addEventListener("click", async function () {
    const file = fileInput?.files[0];
    if (!file) {
      alert("Please upload a prescription image or PDF.");
      return;
    }

    emailStatus.textContent = "Uploading prescription…";
    emailStatus.style.color = "#1a7a5e";
    emailStatus.style.display = "block";
    linkPreview.style.display = "none";
    contactForm.classList.remove("error");

    try {
      // 1. Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      cloudinaryUrlInp.value = cloudinaryUrl;

      // 2. Show URL to user
      emailStatus.textContent = "Prescription uploaded.";
      emailStatus.style.color = "#25a97a";
      linkPreview.style.display = "block";
      urlText.innerHTML = `<a href="${cloudinaryUrl}" target="_blank">${cloudinaryUrl}</a>`;

      // Copy URL to clipboard when btnCopy is clicked
      btnCopy.addEventListener("click", function () {
        navigator.clipboard
          .writeText(cloudinaryUrl)
          .then(() => {
            btnCopy.textContent = "Copied!";
            setTimeout(() => (btnCopy.textContent = "Copy URL"), 2000);
          })
          .catch((err) => {
            console.error("Copy failed:", err);
            btnCopy.textContent = "Failed to copy";
          });
      });
    } catch (err) {
      console.error(err);
      emailStatus.textContent = "Failed to upload: " + err.message;
      emailStatus.style.color = "#e85555";
      contactForm.classList.add("error");
    }
  });

  // WhatsApp button: include Cloudinary URL if available
  sendToWhatsAppBtn?.addEventListener("click", function () {
    const name = contactForm.querySelector("#name")?.value || "a patient";
    const phone = contactForm.querySelector("#phone")?.value || "not provided";
    const file = fileInput?.files[0];
    const msg = encodeURIComponent(
      `Hi, this is ${name} calling from Sadbhav Pharmacy site. Phone: ${phone}.` +
        (file ? "\nPrescription URL: " + cloudinaryUrlInp.value : ""),
    );
    const url = `https://wa.me/9779856014560?text=${msg}`;
    window.open(url, "_blank");
  });
  // ============================================
  //   REVIEWS — Google Sheets Integration
  // ============================================
  const REVIEWS_URL =
    "https://script.google.com/macros/s/AKfycbxMmN8yOanceBxDHtuiTM1gJ4I1YYAXaPABT1w9G8N_i7Yz_EznLRAqe60cYNwhczeF/exec";

  let selectedRating = 0;

  // Star rating interaction
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("mouseover", function () {
      const val = parseInt(this.dataset.value);
      document.querySelectorAll(".star").forEach((s, i) => {
        s.classList.toggle("active", i < val);
      });
    });

    star.addEventListener("mouseout", function () {
      document.querySelectorAll(".star").forEach((s, i) => {
        s.classList.toggle("active", i < selectedRating);
      });
    });

    star.addEventListener("click", function () {
      selectedRating = parseInt(this.dataset.value);
      const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
      document.getElementById("starLabel").textContent =
        labels[selectedRating] + " (" + selectedRating + "/5)";
    });
  });

  // Submit review
  function submitReview() {
    const name = document.getElementById("reviewName").value.trim();
    const review = document.getElementById("reviewText").value.trim();
    const status = document.getElementById("reviewStatus");

    if (!selectedRating) {
      status.style.color = "#e53e3e";
      status.textContent = "Please select a star rating!";
      return;
    }
    if (!name) {
      status.style.color = "#e53e3e";
      status.textContent = "Please enter your name!";
      return;
    }
    if (!review) {
      status.style.color = "#e53e3e";
      status.textContent = "Please write your review!";
      return;
    }

    const btn = document.getElementById("reviewSubmitBtn");
    btn.textContent = "Submitting...";
    btn.disabled = true;
    status.style.color = "#2d6a4f";
    status.textContent = "";

    fetch(REVIEWS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rating: selectedRating, review }),
    })
      .then(() => {
        status.textContent = "✅ Thank you! Your review has been submitted!";
        document.getElementById("reviewName").value = "";
        document.getElementById("reviewText").value = "";
        selectedRating = 0;
        document
          .querySelectorAll(".star")
          .forEach((s) => s.classList.remove("active"));
        document.getElementById("starLabel").textContent = "Click to rate";
        btn.textContent = "Submit Review";
        btn.disabled = false;
        setTimeout(loadReviews, 2000);
      })
      .catch(() => {
        status.style.color = "#e53e3e";
        status.textContent = "Something went wrong. Please try again!";
        btn.textContent = "Submit Review";
        btn.disabled = false;
      });
  }

  // Load and display reviews
  function loadReviews() {
    fetch(REVIEWS_URL)
      .then((res) => res.json())
      .then((data) => {
        const grid = document.getElementById("reviewsGrid");
        if (!data.length) {
          grid.innerHTML =
            '<p class="reviews-loading">No reviews yet. Be the first to review!</p>';
          return;
        }
        grid.innerHTML = data
          .reverse()
          .map(
            (r) => `
      <div class="review-card">
        <div class="review-card-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <p class="review-card-text">"${r.review}"</p>
        <div class="review-card-name">— ${r.name}</div>
        <div class="review-card-date">${r.timestamp}</div>
      </div>
    `,
          )
          .join("");
      })
      .catch(() => {
        document.getElementById("reviewsGrid").innerHTML =
          '<p class="reviews-loading">Could not load reviews.</p>';
      });
  }

  // Load reviews on page load
  loadReviews();
});
