/*
==============================================================
CST3144 FULL-STACK COURSEWORK — FRONTEND LOGIC (Vue.js SPA)
==============================================================
*/

// Vue 2 style: new Vue({...})
const app = new Vue({
  el: '#app',

  data: {
    // ----- LESSON DATA (now fetched from backend API) -----
    lessons: [],

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

  // Fetch lessons from backend when app is created
  created() {
    fetch('http://localhost:4000/lessons')
      .then(response => response.json())
      .then(data => {
        this.lessons = data;
      })
      .catch(error => {
        console.error('Error loading lessons:', error);
      });
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
      return this.cart.reduce(function (total, item) {
        return total + item.quantity;
      }, 0);
    },

    // Total price of cart
    cartTotalPrice: function () {
      return this.cart.reduce(function (total, item) {
        return total + item.price * item.quantity;
      }, 0);
    },

    // Feedback message under the lesson list
    feedbackMessage: function () {
      if (this.sortedAndFilteredLessons.length === 0) {
        if (this.searchTerm.trim()) {
          return "No lessons match your search. Try a different keyword.";
        }
        return "No lessons available.";
      }
      return "";
    }
  },

  methods: {
    // Click the header logo/title to go "home" (show lesson list)
    goHome: function () {
      this.showCart = false;
    },

    // Toggle between lesson list and cart view
    toggleCart: function () {
      if (this.cartItemCount === 0) return;
      this.showCart = !this.showCart;
    },

    // Change sorting field
    changeSort: function (field) {
      this.sortBy = field;
    },

    // Change sort order
    changeSortOrder: function (order) {
      this.sortOrder = order;
    },

    // Add a lesson to the cart
    addToCart: function (lesson) {
      if (lesson.spaces <= 0) return;

      var existing = this.cart.find(function (item) {
        return item.id === lesson.id;
      });

      if (existing) {
        existing.quantity += 1;
      } else {
        this.cart.push({
          id: lesson.id,
          subject: lesson.subject,
          price: lesson.price,
          location: lesson.location,
          quantity: 1,
          image: lesson.image
        });
      }

      // Decrement available spaces
      lesson.spaces -= 1;
    },

    // Increase quantity of an item in the cart
    increaseQuantity: function (cartItem) {
      var lesson = this.lessons.find(function (l) {
        return l.id === cartItem.id;
      });

      if (lesson && lesson.spaces > 0) {
        cartItem.quantity += 1;
        lesson.spaces -= 1;
      }
    },

    // Decrease quantity of an item in the cart
    decreaseQuantity: function (cartItem) {
      var lesson = this.lessons.find(function (l) {
        return l.id === cartItem.id;
      });

      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        if (lesson) {
          lesson.spaces += 1;
        }
      } else {
        // quantity is 1, so removing it entirely
        this.removeFromCart(cartItem);
      }
    },

    // Remove an item from the cart entirely
    removeFromCart: function (cartItem) {
      var index = this.cart.indexOf(cartItem);
      if (index !== -1) {
        // Return all its spaces back to the lesson
        var lesson = this.lessons.find(function (l) {
          return l.id === cartItem.id;
        });
        if (lesson) {
          lesson.spaces += cartItem.quantity;
        }
        this.cart.splice(index, 1);
      }
    },

    // Validate the checkout form
    validateCheckout: function () {
      var valid = true;

      // Reset errors
      this.nameError = "";
      this.phoneError = "";
      this.emailError = "";

      var trimmedName = this.name.trim();
      var trimmedPhone = this.phone.trim();
      var trimmedEmail = this.email.trim();

      // Name validation: not empty, letters & spaces only
      if (!trimmedName) {
        this.nameError = "Name is required.";
        valid = false;
      } else if (!/^[A-Za-z ]+$/.test(trimmedName)) {
        this.nameError = "Name must contain letters and spaces only.";
        valid = false;
      }

      // Phone validation: not empty, digits only, at least 7 digits
      if (!trimmedPhone) {
        this.phoneError = "Phone number is required.";
        valid = false;
      } else if (!/^[0-9]+$/.test(trimmedPhone)) {
        this.phoneError = "Phone number must contain digits only.";
        valid = false;
      } else if (trimmedPhone.length < 7) {
        this.phoneError = "Phone number seems too short.";
        valid = false;
      }

      // Email validation: optional, but if present check format
      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        this.emailError = "Please enter a valid email address.";
        valid = false;
      }

      // Cart must not be empty
      if (this.cartItemCount === 0) {
        this.orderMessage = "Your cart is empty. Add at least one lesson.";
        valid = false;
      } else {
        this.orderMessage = "";
      }

      return valid;
    },

    // Process the checkout form
    checkout: function () {
      if (!this.validateCheckout()) {
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