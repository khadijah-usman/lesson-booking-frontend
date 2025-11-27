/*
==============================================================
CST3144 FULL-STACK COURSEWORK — FRONTEND LOGIC (Vue.js SPA)
==============================================================
*/

// Vue 2 style: new Vue({...})
const app = new Vue({
  el: '#app',

  data: {
    // ----- LESSON DATA (10 lessons, 5 spaces each) -----
    lessons: [
      {
        id: 1,
        subject: "Mathematics",
        location: "Hendon",
        price: 100,
        spaces: 5,
        icon: "fa-solid fa-calculator",
        image: "https://img.icons8.com/color/240/calculator--v1.png"
      },
      {
        id: 2,
        subject: "English",
        location: "Colindale",
        price: 80,
        spaces: 5,
        icon: "fa-solid fa-book-open",
        image: "https://img.icons8.com/color/240/book-reading.png"
      },
      {
        id: 3,
        subject: "Biology",
        location: "Golders Green",
        price: 90,
        spaces: 5,
        icon: "fa-solid fa-seedling",
        image: "https://img.icons8.com/color/240/dna-helix.png"
      },
      {
        id: 4,
        subject: "Chemistry",
        location: "Brent Cross",
        price: 70,
        spaces: 5,
        icon: "fa-solid fa-flask",
        image: "https://img.icons8.com/color/240/test-tube.png"
      },
      {
        id: 5,
        subject: "History",
        location: "Hendon",
        price: 50,
        spaces: 5,
        icon: "fa-solid fa-landmark",
        image: "https://img.icons8.com/color/240/scroll.png"
      },
      {
        id: 6,
        subject: "Physics",
        location: "Colindale",
        price: 95,
        spaces: 5,
        icon: "fa-solid fa-atom",
        image: "https://img.icons8.com/color/240/physics.png"
      },
      {
        id: 7,
        subject: "Art",
        location: "Brent Cross",
        price: 60,
        spaces: 5,
        icon: "fa-solid fa-palette",
        image: "https://img.icons8.com/color/240/art-prices.png"
      },
      {
        id: 8,
        subject: "Geography",
        location: "Golders Green",
        price: 85,
        spaces: 5,
        icon: "fa-solid fa-earth-europe",
        image: "https://img.icons8.com/color/240/globe--v1.png"
      },
      {
        id: 9,
        subject: "Computer Science",
        location: "Hendon",
        price: 120,
        spaces: 5,
        icon: "fa-solid fa-code",
        image: "https://img.icons8.com/color/240/source-code.png"
      },
      {
        id: 10,
        subject: "Economics",
        location: "Colindale",
        price: 110,
        spaces: 5,
        icon: "fa-solid fa-chart-line",
        image: "https://img.icons8.com/color/240/economic-improvement.png"
      }
    ],

    // ----- UI + CART STATE -----
    cart: [],              // [{ id, subject, price, location, quantity, image }]
    showCart: false,
    searchTerm: "",
    sortBy: "subject",
    sortOrder: "asc",

    // Checkout form fields
    name: "",
    phone: "",
    email: "",

    // Validation + messages
    orderConfirmed: false,
    nameError: "",
    phoneError: "",
    emailError: "",
    orderMessage: "",
    lastOrderName: "",
    lastOrderEmail: ""
  },

  computed: {
    // Filter lessons based on search term
    filteredLessons: function () {
      var term = this.searchTerm.trim().toLowerCase();
      if (!term) return this.lessons;

      return this.lessons.filter(function (l) {
        return (
          l.subject.toLowerCase().includes(term) ||
          l.location.toLowerCase().includes(term) ||
          String(l.price).includes(term) ||
          String(l.spaces).includes(term)
        );
      });
    },

    // Sort filtered lessons
    sortedAndFilteredLessons: function () {
      var factor = this.sortOrder === "asc" ? 1 : -1;

      return this.filteredLessons.slice().sort((a, b) => {
        if (a[this.sortBy] < b[this.sortBy]) return -1 * factor;
        if (a[this.sortBy] > b[this.sortBy]) return 1 * factor;
        return 0;
      });
    },

    // Total items in cart
    cartItemCount: function () {
      return this.cart.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);
    },

    // Total price of cart
    cartTotal: function () {
      return this.cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
      }, 0);
    },

    // Overall form validity (for disabling button)
    isFormValid: function () {
      var nameOk = /^[A-Za-z ]+$/.test(this.name.trim());
      var phoneOk = /^[0-9]{8,15}$/.test(this.phone.trim());
      var emailOk = /^\S+@\S+\.\S+$/.test(this.email.trim());
      return nameOk && phoneOk && emailOk;
    }
  },

  // Live validation: update error messages while typing
  watch: {
    name: function (newVal) {
      var trimmed = newVal.trim();
      if (!trimmed) {
        this.nameError = "";
      } else if (!/^[A-Za-z ]+$/.test(trimmed)) {
        this.nameError = "Name must contain letters and spaces only.";
      } else {
        this.nameError = "";
      }
    },

    phone: function (newVal) {
      var trimmed = newVal.trim();
      if (!trimmed) {
        this.phoneError = "";
      } else if (!/^[0-9]{8,15}$/.test(trimmed)) {
        this.phoneError = "Phone number must contain 8–15 digits.";
      } else {
        this.phoneError = "";
      }
    },

    email: function (newVal) {
      var trimmed = newVal.trim();
      if (!trimmed) {
        this.emailError = "";
      } else if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
        this.emailError = "Please enter a valid email address.";
      } else {
        this.emailError = "";
      }
    }
  },

  methods: {
    // Go back to lesson list from cart view
    goHome: function () {
      this.showCart = false;
    },

    // ----- CART LOGIC -----
    addToCart: function (lesson) {
      if (lesson.spaces <= 0) return; // full

      var existing = this.cart.find(function (i) {
        return i.id === lesson.id;
      });

      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({
          id: lesson.id,
          subject: lesson.subject,
          location: lesson.location,
          price: lesson.price,
          image: lesson.image,
          quantity: 1
        });
      }

      lesson.spaces -= 1;
    },

    increaseQuantity: function (index) {
      var item = this.cart[index];
      var lesson = this.lessons.find(function (l) {
        return l.id === item.id;
      });

      if (lesson && lesson.spaces > 0) {
        item.quantity += 1;
        lesson.spaces -= 1;
      }
    },

    decreaseQuantity: function (index) {
      var item = this.cart[index];
      var lesson = this.lessons.find(function (l) {
        return l.id === item.id;
      });

      if (!lesson) return;

      if (item.quantity > 1) {
        item.quantity -= 1;
        lesson.spaces += 1;
      } else {
        this.removeFromCart(index);
      }
    },

    removeFromCart: function (index) {
      var item = this.cart[index];
      var lesson = this.lessons.find(function (l) {
        return l.id === item.id;
      });

      if (lesson) {
        lesson.spaces += item.quantity;
      }

      this.cart.splice(index, 1);
    },

    // ----- CHECKOUT -----
    checkout: function () {
      // form is already valid if button is enabled
      if (!this.isFormValid || !this.cart.length) {
        return;
      }

      // Save name & email for the thank-you box
      this.lastOrderName = this.name.trim();
      this.lastOrderEmail = this.email.trim();

      // Show confirmation box
      this.orderConfirmed = true;
      this.orderMessage = "Order placed! You will receive an email with further details.";

      // Clear ONLY the form fields (keep cart so thankyou box stays visible)
      this.name = "";
      this.phone = "";
      this.email = "";
    }
  }
});